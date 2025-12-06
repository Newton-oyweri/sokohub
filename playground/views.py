from django.shortcuts import render, redirect
from .forms import RegisterForm
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.contrib.auth.forms import AuthenticationForm
from .models import Order
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

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

# -----------------------------
# PROTECTED VIEWS
# -----------------------------
@login_required(login_url='login')
def cart(request):
    orders = Order.objects.all().order_by('-created_at')   # newest first
    return render(request, 'cart.html', {'orders': orders})


@login_required(login_url='login')
def account(request):
    return render(request, 'account.html')

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
