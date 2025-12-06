import requests
import base64
import json
from datetime import datetime
from django.conf import settings
from django.core.cache import cache  # For token caching

def timestamp():
    """ISO 8601 timestamp for password."""
    return datetime.now().strftime('%Y%m%d%H%M%S')

def generate_password():
    """Base64(Shortcode + Passkey + Timestamp) as per Daraja docs."""
    data = f"{settings.MPESA_SHORTCODE}{settings.MPESA_PASSKEY}{timestamp()}"
    return base64.b64encode(data.encode()).decode()

def get_access_token():
    """Get/caches access token (expires in 1hr)."""
    cache_key = 'mpesa_access_token'
    token = cache.get(cache_key)
    if token:
        return token
    
    url = settings.MPESA_TOKEN_URL
    auth = (settings.MPESA_CONSUMER_KEY, settings.MPESA_CONSUMER_SECRET)
    response = requests.get(url, auth=auth)
    if response.status_code == 200:
        token = response.json()['access_token']
        cache.set(cache_key, token, 3600 - 60)  # Cache 59min
        return token
    raise Exception("Failed to get M-Pesa token")

def normalize_phone(phone):
    """Convert to 2547XXXXXXXX."""
    if phone.startswith('0'):
        phone = '254' + phone[1:]
    elif phone.startswith('7') and len(phone) == 9:
        phone = '254' + phone
    elif not phone.startswith('254'):
        raise ValueError("Invalid Kenyan phone format")
    return phone