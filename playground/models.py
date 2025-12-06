from django.db import models
from django.contrib.auth.models import User
from decimal import Decimal

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
