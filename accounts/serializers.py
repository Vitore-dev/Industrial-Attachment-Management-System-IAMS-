from rest_framework import serializers
from .models import CustomUser
from .services import find_verified_school_student


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
            if not student_id:
                raise serializers.ValidationError({
                    'student_id': 'Student ID is required for student registration.'
                })

            school_record = find_verified_school_student(student_id, email)
            if not school_record:
                raise serializers.ValidationError({
                    'student_id': (
                        'Student registration blocked. The provided student ID and '
                        'email were not found in the school registry.'
                    )
                })

            if CustomUser.objects.filter(verified_student_id=school_record.student_id).exists():
                raise serializers.ValidationError({
                    'student_id': 'This student is already registered in IAMS.'
                })

            attrs['student_id'] = school_record.student_id
            attrs['school_record'] = school_record
        else:
            attrs.pop('student_id', None)

        return attrs

    def create(self, validated_data):
        student_id = validated_data.pop('student_id', None)
        school_record = validated_data.pop('school_record', None)
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data['role'],
            phone_number=validated_data.get('phone_number', ''),
            first_name=school_record.first_name if school_record else '',
            last_name=school_record.last_name if school_record else '',
            verified_student_id=student_id if validated_data['role'] == 'student' else None,
            is_school_verified=validated_data['role'] == 'student',
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
