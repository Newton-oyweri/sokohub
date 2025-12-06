from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('account/', views.account, name='account'),
    path('signup/', views.signup, name='signup'),
      path("login/", views.login_view, name="login"),
      path("logout/", views.logout_view, name="logout"),
       path("cart/", views.cart, name="cart"),
         path("place-order/", views.place_order, name="place_order"),

  

   

]
