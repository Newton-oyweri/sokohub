from django.shortcuts import render , redirect
from .models import Student
from .forms import RegisterForm
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.contrib.auth.forms import AuthenticationForm

def login_view(request):
    if request.method == "POST":
        form = AuthenticationForm(request=request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            return redirect("index")
    else:
        form = AuthenticationForm()
    return render(request, "login.html", {"form": form})


def signup(request):
    if request.method == "POST":
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save()     # save the user
            login(request, user)   # auto-login immediately
            return redirect("index")   # redirect to homepage
    else:
        form = RegisterForm()

    return render(request, "signup.html", {"form": form})




def index(request):
    return render(request, 'home.html')

@login_required(login_url='login')
def cart(request):
    return render(request, 'cart.html')


@login_required(login_url='login')
def messages(request):
    return render(request, 'messages.html')

@login_required(login_url='login')
def store(request):
    return render(request, 'store.html')

def logout_view(request):
    logout(request)
    return redirect('login')


@login_required(login_url='login')
def account(request):
    students = Student.objects.all()
    return render(request, 'account.html' , { 'students': students})


