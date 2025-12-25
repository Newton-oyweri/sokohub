from django.urls import path, include  # Make sure 'include' is imported
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('account/', views.account, name='account'),
    path('market/', views.market, name='market'),
    path('signup/', views.signup, name='signup'),
    path("login/", views.login_view, name="login"),
    path("logout/", views.logout_view, name="logout"),
    path('trader/', views.trader, name='trader'),
    path("cart/", views.cart, name="cart"),
    path("place-order/", views.place_order, name="place_order"),
    path('deposit/', views.mpesa_payment, name='mpesa_payment'),
    path('mpesa/callback/', views.mpesa_callback, name='mpesa_callback'),
    path('delete-order/<int:order_id>/', views.delete_order, name='delete_order'),
    path('delete-account/', views.delete_account, name='delete_account'),
    path('request-trader/', views.request_trader_status, name='request_trader'),

    # === ADD THIS LINE FOR PWA ===
    path('', include('pwa.urls')),  # This serves manifest.json and service-worker.js
]