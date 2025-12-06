from django.contrib import admin
from .models import Profile, Order, MpesaCheckout

# Register models safely
for model in [Profile, MpesaCheckout, Order]:
    try:
        admin.site.register(model)
    except admin.sites.AlreadyRegistered:
        pass
