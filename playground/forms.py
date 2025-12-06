# forms.py
from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from .models import Profile
from django.conf import settings 

class UserEditForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ["username", "first_name", "last_name", "email"]


class ProfileEditForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ["phone", "county", "id_number", "gender"]


class RegisterForm(UserCreationForm):
    # Extra user model fields
    first_name = forms.CharField(max_length=30, required=True)
    last_name = forms.CharField(max_length=30, required=True)
    email = forms.EmailField(required=True)

    # Profile model fields
    phone = forms.CharField(max_length=20)
    county = forms.CharField(max_length=100)
    id_number = forms.CharField(max_length=30)
    gender = forms.ChoiceField(choices=[('M', 'Male'), ('F', 'Female')])

    class Meta:
        model = User
        fields = [
            "username", "first_name", "last_name", "email",
            "password1", "password2",
            "phone", "county", "id_number", "gender"
        ]

    def save(self, commit=True):
        user = super().save(commit=False)

        # Save built-in user fields
        user.first_name = self.cleaned_data["first_name"]
        user.last_name = self.cleaned_data["last_name"]
        user.email = self.cleaned_data["email"]

        if commit:
            user.save()

            # Create profile linked to the user
            Profile.objects.create(
                user=user,
                phone=self.cleaned_data["phone"],
                county=self.cleaned_data["county"],
                id_number=self.cleaned_data["id_number"],
                gender=self.cleaned_data["gender"]
            )

        return user




class MpesaPaymentForm(forms.Form):
    phone = forms.CharField(widget=forms.TextInput(attrs={'readonly': True}))
    amount = forms.IntegerField(min_value=settings.MPESA_MIN_AMOUNT, label='Amount to deposit (KES)')


