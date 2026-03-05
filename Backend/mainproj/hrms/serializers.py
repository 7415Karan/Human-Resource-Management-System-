from rest_framework import serializers
from django.core.validators import EmailValidator
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import Employee, Attendance


class EmployeeSerializer(serializers.ModelSerializer):
    employee_id = serializers.CharField(read_only=True)  # Auto-generated, read-only
    
    class Meta:
        model = Employee
        fields = ["id", "employee_id", "full_name", "email", "department", "created_at"]
        read_only_fields = ["employee_id", "id", "created_at"]

    def validate_email(self, value):
        """Validate email format and uniqueness"""
        if not value or not value.strip():
            raise serializers.ValidationError(
                "Email cannot be empty."
            )
        
        # Validate email format
        validator = EmailValidator()
        try:
            validator(value)
        except DjangoValidationError:
            raise serializers.ValidationError(
                "Invalid email format."
            )
        
        # When updating, exclude the current instance from uniqueness check
        queryset = Employee.objects.filter(email=value)
        
        if self.instance:  # Update case
            queryset = queryset.exclude(pk=self.instance.pk)
        
        if queryset.exists():
            raise serializers.ValidationError(
                "Email already exists."
            )
        return value


class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_id = serializers.CharField(source='employee.employee_id', read_only=True)
    
    class Meta:
        model = Attendance
        fields = ["id", "employee", "employee_id", "employee_name", "date", "status"]

    def validate(self, attrs):
        employee = attrs.get("employee")
        date = attrs.get("date")

        # Check for duplicate attendance record (single query)
        queryset = Attendance.objects.filter(employee=employee, date=date)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        
        if queryset.exists():
            raise serializers.ValidationError(
                "Attendance already marked for this date."
            )
        return attrs