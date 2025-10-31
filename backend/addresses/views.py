from django.shortcuts import render
from rest_framework import generics
from .models import Barangay, Street
from .serializers import BarangaySerializer, StreetSerializer

# Get all barangays with their streets
class BarangayListView(generics.ListAPIView):
    queryset = Barangay.objects.prefetch_related("streets").all()
    serializer_class = BarangaySerializer


# Get all streets (optional, if you want a separate endpoint)
class StreetListView(generics.ListAPIView):
    queryset = Street.objects.select_related("barangay").all()
    serializer_class = StreetSerializer
