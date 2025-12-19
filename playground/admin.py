from django.contrib import admin
from .models import Profile, Order, MpesaCheckout


# ---- Custom Profile Admin ----
@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone', 'is_trader', 'trader_request_sent')
    list_filter = ('is_trader', 'trader_request_sent')
    search_fields = ('user__username', 'user__email')
    readonly_fields = ('trader_request_sent',)

    def approve_as_trader(self, request, queryset):
        queryset.update(is_trader=True)

    approve_as_trader.short_description = "Approve selected as traders"
    actions = [approve_as_trader]


# ---- Safe registration for other models ----
for model in [MpesaCheckout, Order]:
    try:
        admin.site.register(model)
    except admin.sites.AlreadyRegistered:
        pass
