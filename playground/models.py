from django.db import models
from django.contrib.auth.models import User
from decimal import Decimal


class Product(models.Model):

    CATEGORY_CHOICES = [
        ('maize', 'Maize'),
        ('beans', 'Beans'),
        ('rice', 'Rice'),
        ('wheat', 'Wheat'),
        ('sugar', 'Sugar'),
    ]

    trader = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='products'
    )

    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)

    category = models.CharField(
        max_length=50,
        choices=CATEGORY_CHOICES,
        default='maize'
    )

    price_per_unit = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    unit = models.CharField(
        max_length=50,
        default="90kg bag"
    )

    stock = models.PositiveIntegerField(
        default=1,
        help_text="Available units in stock"
    )

    image = models.ImageField(
        upload_to='products/',
        blank=True,
        null=True
    )

    is_active = models.BooleanField(default=True)  # soft delete / hide product

    created_at = models.DateTimeField(
        auto_now_add=True,
        null=True,   # TEMPORARY for migration safety
        blank=True
    )

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.trader.username})"
# ---------------------------
# Profile model: stores extra user info and balance
# ---------------------------
class Profile(models.Model):
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    phone = models.CharField(max_length=20)
    county = models.CharField(max_length=100)
    id_number = models.CharField(max_length=30, blank=True, null=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True, null=True)

    # New fields for trader approval
    is_trader = models.BooleanField(default=False)           # Approved trader?
    trader_request_sent = models.BooleanField(default=False)  # Has requested?

    def __str__(self):
        return self.user.username


# ---------------------------
# Order model: tracks user orders
# ---------------------------
class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.CharField(max_length=255)
    quantity = models.CharField(max_length=50)
    delivery_location = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product} - {self.quantity}"


# ---------------------------
# MpesaCheckout model: tracks STK Push transactions
# ---------------------------
class MpesaCheckout(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('SUCCESS', 'Success'),
        ('FAILED', 'Failed'),
        ('CANCELLED', 'Cancelled'),
        ('TIMEOUT', 'Timeout'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    checkout_id = models.CharField(max_length=50, unique=True)  # M-Pesa's CheckoutRequestID
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    phone = models.CharField(max_length=15)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    transaction_id = models.CharField(max_length=50, blank=True)  # From callback
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    merchant_request_id = models.CharField(max_length=100, blank=True, null=True)
    checkout_request_id = models.CharField(max_length=100, blank=True, null=True, unique=True)

    def __str__(self):
        return f"{self.user.username} - {self.status}"
