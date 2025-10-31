from django.urls import path
from .views import BarangayListView, StreetListView

urlpatterns = [
    path("barangays/", BarangayListView.as_view(), name="barangay-list"),
    path("streets/", StreetListView.as_view(), name="street-list"),
]