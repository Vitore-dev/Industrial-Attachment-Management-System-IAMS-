from django.shortcuts import render

# Create your views here.
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .models import StudentProfile
from .serializers import StudentProfileSerializer


# Create Student Profile (US04 & US05)
class CreateStudentProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Make sure user is a student
        if request.user.role != 'student':
            return Response(
                {'error': 'Only student accounts can create a student profile'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Check if profile already exists
        if StudentProfile.objects.filter(user=request.user).exists():
            return Response(
                {'error': 'Student profile already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )

        payload = request.data.copy()
        verified_student_id = getattr(request.user, 'verified_student_id', None)
        if verified_student_id:
            provided_student_id = payload.get('student_id')
            if provided_student_id and provided_student_id != verified_student_id:
                return Response(
                    {
                        'student_id': [
                            'Student ID must match the verified school registration record.'
                        ]
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            payload['student_id'] = verified_student_id

        serializer = StudentProfileSerializer(data=payload)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response({
                'message': 'Student profile created successfully',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Get Student Profile
class GetStudentProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = StudentProfile.objects.get(user=request.user)
            serializer = StudentProfileSerializer(profile)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except StudentProfile.DoesNotExist:
            return Response(
                {'error': 'Student profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )


# Update Student Profile (US06)
class UpdateStudentProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        try:
            profile = StudentProfile.objects.get(user=request.user)
            serializer = StudentProfileSerializer(
                profile,
                data=request.data,
                partial=True
            )
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'message': 'Student profile updated successfully',
                    'data': serializer.data
                }, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except StudentProfile.DoesNotExist:
            return Response(
                {'error': 'Student profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )


# List All Students (for coordinator)
class ListStudentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'coordinator':
            return Response(
                {'error': 'Only coordinators can view all students'},
                status=status.HTTP_403_FORBIDDEN
            )
        students = StudentProfile.objects.all()
        serializer = StudentProfileSerializer(students, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# Get Single Student (for coordinator)
class GetSingleStudentView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        if request.user.role != 'coordinator':
            return Response(
                {'error': 'Only coordinators can view student details'},
                status=status.HTTP_403_FORBIDDEN
            )
        try:
            student = StudentProfile.objects.get(pk=pk)
            serializer = StudentProfileSerializer(student)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except StudentProfile.DoesNotExist:
            return Response(
                {'error': 'Student not found'},
                status=status.HTTP_404_NOT_FOUND
            )
