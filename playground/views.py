# ========================
# Standard library imports
# ========================
import json
import logging
from datetime import datetime
from decimal import Decimal

# ========================
# Third-party imports
# ========================
import requests

# ========================
# Django imports
# ========================
from django.shortcuts import render, redirect , get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.contrib.auth.forms import AuthenticationForm
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from django.views import View
from django.conf import settings
from django.views.decorators.http import require_POST

# ========================
# Local app imports
# ========================
from .forms import RegisterForm, UserEditForm, ProfileEditForm, MpesaPaymentForm
from .models import Order, MpesaCheckout, Profile
from .utils import get_access_token, generate_password, normalize_phone, timestamp




def delete_order(request, order_id):
    if request.method == "POST":
        order = get_object_or_404(Order, id=order_id)
        order.delete()
    return redirect('cart')  # redirect back to the cart page

@login_required
def delete_account(request):
    if request.method == "POST":
        user = request.user
        user.delete()  # This deletes the user and cascades to related models if set
        messages.success(request, "Your account has been deleted successfully.")
        return redirect('index')  # Redirect to homepage or goodbye page
    else:
        return redirect('account') 
# -----------------------------
# LOGIN VIEW
# -----------------------------
def login_view(request):
    # Redirect logged-in users
    if request.user.is_authenticated:
        return redirect('index')

    if request.method == "POST":
        form = AuthenticationForm(request=request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            return redirect("index")
    else:
        form = AuthenticationForm()
    return render(request, "login.html", {"form": form})

# -----------------------------
# SIGNUP VIEW
# -----------------------------
def signup(request):
    # Redirect logged-in users
    if request.user.is_authenticated:
        return redirect('index')

    if request.method == "POST":
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save()     # save the user
            login(request, user)   # auto-login immediately
            return redirect("index")
    else:
        form = RegisterForm()

    return render(request, "signup.html", {"form": form})

# -----------------------------
# HOME PAGE
# -----------------------------
def index(request):
    return render(request, 'home.html')

def market(request):
    return render(request, 'market.html')

# -----------------------------
# PROTECTED VIEWS
# -----------------------------

@login_required(login_url='login')
def cart(request):
    # Only fetch orders for the current user
    orders = Order.objects.filter(user=request.user).order_by('-created_at')
    return render(request, 'cart.html', {'orders': orders})



@login_required(login_url='login')
def account(request):
    user = request.user
    profile = request.user.profile

    if request.method == "POST":
        user_form = UserEditForm(request.POST, instance=user)
        profile_form = ProfileEditForm(request.POST, instance=profile)

        if user_form.is_valid() and profile_form.is_valid():
            user_form.save()
            profile_form.save()
            return redirect("account")  # refresh page
    else:
        user_form = UserEditForm(instance=user)
        profile_form = ProfileEditForm(instance=profile)

    return render(request, "account.html", {
        "user_form": user_form,
        "profile_form": profile_form,
    })


# -----------------------------
# LOGOUT VIEW
# -----------------------------
def logout_view(request):
    logout(request)
    return redirect('login')

@login_required(login_url='login')
@csrf_exempt
def place_order(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            product_name = data.get("product_name")
            quantity = data.get("quantity")
            location = data.get("location")

            if not all([product_name, quantity, location]):
                return JsonResponse({"status": "error", "error": "Missing fields"}, status=400)

            # SAVE ORDER
            Order.objects.create(
                user=request.user,
                product=product_name,
                quantity=quantity,
                delivery_location=location
            )

            return JsonResponse({"status": "ok", "message": "Order placed successfully"})

        except Exception as e:
            return JsonResponse({"status": "error", "error": str(e)}, status=500)

    return JsonResponse({"status": "error", "error": "Invalid method"}, status=405)

logger = logging.getLogger(__name__)

@login_required
def mpesa_payment(request):
    if request.method == 'POST':
        phone = request.POST.get('phone', '').strip()
        raw_amount = request.POST.get('amount', '')
        

        # === 1. Validate input ===
        try:
            phone = normalize_phone(phone)
            amount = int(float(raw_amount))
            if amount < 1:  # Sandbox allows 1 KES
                raise ValueError("Minimum amount is 1 KES in sandbox")
        except ValueError as e:
            messages.error(request, f"Invalid input: {e}")
            return redirect('account')

        # === 2. Create PENDING checkout (this will now stay visible) ===
        checkout = MpesaCheckout.objects.create(
            user=request.user,
            phone=phone,
            amount=amount,
            status='PENDING',
            checkout_id=f"sokohub_{request.user.id}_{int(datetime.now().timestamp())}"
        )

        # === 3. Build payload ===
        payload = {
            "BusinessShortCode": settings.MPESA_SHORTCODE,
            "Password": generate_password(),
            "Timestamp": timestamp(),
            "TransactionType": "CustomerPayBillOnline",
            "Amount": amount,
            "PartyA": phone,
            "PartyB": settings.MPESA_SHORTCODE,
            "PhoneNumber": phone,
            "CallBackURL": settings.MPESA_CALLBACK_URL,
            "AccountReference": f"Deposit_{checkout.id}",
            "TransactionDesc": "Sokohub Wallet Deposit"
        }

        headers = {
            "Authorization": f"Bearer {get_access_token()}",
            "Content-Type": "application/json"
        }

        # === 4. Send STK Push + FULL DEBUG LOGGING ===
        try:
            response = requests.post(settings.MPESA_STK_URL, json=payload, headers=headers, timeout=30)
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            error_msg = f"Network error: {e}"
            checkout.status = 'FAILED'
            checkout.save()
            messages.error(request, "Could not reach Safaricom. Check internet/connection.")
            logger.error(f"STK Push network error: {e}")
            return redirect('account')

        # === 5. Parse response (this is where most people fail) ===
        try:
            res_data = response.json()
        except ValueError:
            res_data = {"raw": response.text}

        # Log everything — this is GOLD for debugging
        logger.info(f"STK PUSH SENT → Amount: {amount} | Phone: {phone}")
        logger.info(f"Payload: {payload}")
        logger.info(f"Response ({response.status_code}): {res_data}")

        # === 6. Success or detailed failure ===
        if response.status_code == 200 and str(res_data.get("ResponseCode")) == "0":
            # SUCCESS → Save Safaricom IDs (critical for callback!)
            checkout.merchant_request_id = res_data.get("MerchantRequestID")
            checkout.checkout_request_id = res_data.get("CheckoutRequestID")
            checkout.save()

            messages.success(request, "STK Push sent! Check your phone and enter PIN.")
            logger.info(f"SUCCESS → CheckoutRequestID: {checkout.checkout_request_id}")

        else:
            # FAILURE → Keep PENDING? No — mark FAILED but show real error
            error_code = res_data.get("errorCode", "Unknown")
            error_msg = res_data.get("errorMessage", res_data.get("requestId", "Unknown error"))
            full_error = f"STK Failed [{error_code}]: {error_msg}"

            checkout.status = 'FAILED'
            checkout.save()

            messages.error(request, f"Payment failed: {full_error}")
            logger.error(f"STK PUSH FAILED → {full_error}")

        return redirect('account')

    # GET request → show form
    return render(request, 'account.html')




logger = logging.getLogger(__name__)

@csrf_exempt
@require_POST
def mpesa_callback(request):
    try:
        data = json.loads(request.body)
        logger.info(f"CALLBACK RECEIVED: {data}")

        body = data.get("Body", {})
        stk_callback = body.get("stkCallback", {})
        
        checkout_request_id = stk_callback.get("CheckoutRequestID")
        result_code = stk_callback.get("ResultCode")
        result_desc = stk_callback.get("ResultDesc", "")

        if not checkout_request_id:
            logger.error("No CheckoutRequestID in callback")
            return JsonResponse({"ResultCode": 1, "ResultDesc": "Invalid callback"})

        # Find the transaction using CheckoutRequestID (this is the correct one!)
        try:
            checkout = MpesaCheckout.objects.get(checkout_request_id=checkout_request_id)
        except MpesaCheckout.DoesNotExist:
            logger.error(f"CheckoutRequestID {checkout_request_id} not found")
            return JsonResponse({"ResultCode": 1, "ResultDesc": "Transaction not found"})

        if result_code == 0:  # SUCCESS
            metadata = stk_callback.get("CallbackMetadata", {}).get("Item", [])
            amount = None
            receipt = None
            
            for item in metadata:
                if item["Name"] == "Amount":
                    amount = Decimal(str(item["Value"]))
                elif item["Name"] == "MpesaReceiptNumber":
                    receipt = item["Value"]

            if amount and receipt:
                # Credit user balance
                profile = checkout.user.profile
                profile.balance += amount
                profile.save()

                # Update checkout
                checkout.status = 'SUCCESS'
                checkout.transaction_id = receipt
                checkout.save()

                logger.info(f"PAYMENT SUCCESS: {receipt} | +{amount} KES to {checkout.user}")
            else:
                checkout.status = 'FAILED'
                checkout.save()

        else:
            # Failed / Cancelled / Timeout
            checkout.status = 'FAILED'
            checkout.save()
            logger.warning(f"Payment failed: {result_desc}")

        return JsonResponse({"ResultCode": 0, "ResultDesc": "Accepted"})

    except Exception as e:
        logger.error(f"Callback error: {str(e)}")
        return JsonResponse({"ResultCode": 1, "ResultDesc": "Error"})