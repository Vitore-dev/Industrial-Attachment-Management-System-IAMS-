from django.shortcuts import render

# Create your views here.
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .models import OrganizationProfile
from .serializers import OrganizationProfileSerializer


# Create Organization Profile (US02 & US03)
class CreateOrganizationProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Make sure user is an organization
        if request.user.role != 'organization':
            return Response(
                {'error': 'Only organization accounts can create a profile'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if profile already exists
        if OrganizationProfile.objects.filter(user=request.user).exists():
            return Response(
                {'error': 'Organization profile already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = OrganizationProfileSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response({
                'message': 'Organization profile created successfully',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Get Organization Profile
class GetOrganizationProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = OrganizationProfile.objects.get(user=request.user)
            serializer = OrganizationProfileSerializer(profile)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except OrganizationProfile.DoesNotExist:
            return Response(
                {'error': 'Organization profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )


# Update Organization Profile (US06)
class UpdateOrganizationProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        try:
            profile = OrganizationProfile.objects.get(user=request.user)
            serializer = OrganizationProfileSerializer(
                profile, 
                data=request.data, 
                partial=True
            )
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'message': 'Organization profile updated successfully',
                    'data': serializer.data
                }, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except OrganizationProfile.DoesNotExist:
            return Response(
                {'error': 'Organization profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )


# Get All Organizations (for coordinator)
class ListOrganizationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'coordinator':
            return Response(
                {'error': 'Only coordinators can view all organizations'},
                status=status.HTTP_403_FORBIDDEN
            )
        organizations = OrganizationProfile.objects.all()
        serializer = OrganizationProfileSerializer(organizations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# Approve Organization (for coordinator)
class ApproveOrganizationView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if request.user.role != 'coordinator':
            return Response(
                {'error': 'Only coordinators can approve organizations'},
                status=status.HTTP_403_FORBIDDEN
            )
        try:
            profile = OrganizationProfile.objects.get(pk=pk)
            profile.is_approved = True
            profile.save()
            return Response(
                {'message': 'Organization approved successfully'},
                status=status.HTTP_200_OK
            )
        except OrganizationProfile.DoesNotExist:
            return Response(
                {'error': 'Organization not found'},
                status=status.HTTP_404_NOT_FOUND
            )
