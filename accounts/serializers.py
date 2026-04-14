from rest_framework import serializers
from .models import CustomUser


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    student_id = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = CustomUser
        fields = [
            'username',
            'email',
            'password',
            'role',
            'phone_number',
            'student_id',
        ]

    def validate(self, attrs):
        role = attrs.get('role')
        email = attrs.get('email', '').strip()
        student_id = attrs.get('student_id', '').strip()

        if role == 'student':
            if not email:
                raise serializers.ValidationError({
                    'email': 'Email is required for student registration.'
                })

            if not student_id:
                raise serializers.ValidationError({
                    'student_id': 'Student ID is required for student registration.'
                })

            if CustomUser.objects.filter(verified_student_id=student_id).exists():
                raise serializers.ValidationError({
                    'student_id': (
                        'This student ID is already registered for industrial attachment.'
                    )
                })

            attrs['student_id'] = student_id
        else:
            attrs.pop('student_id', None)

        return attrs

    def create(self, validated_data):
        student_id = validated_data.pop('student_id', None)
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data['role'],
            phone_number=validated_data.get('phone_number', ''),
            first_name='',
            last_name='',
            verified_student_id=student_id if validated_data['role'] == 'student' else None,
            is_school_verified=False,
        )
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            'id',
            'username',
            'email',
            'role',
            'phone_number',
            'first_name',
            'last_name',
            'verified_student_id',
            'is_school_verified',
            'created_at',
            'updated_at',
        ]
