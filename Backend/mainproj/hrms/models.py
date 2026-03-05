from django.db import models


def generate_employee_id():
    """Auto-generate unique employee ID"""
    # Get the last employee ID and increment
    last_employee = Employee.objects.all().order_by('-id').first()
    if not last_employee or not last_employee.employee_id:
        return "EMP001"
    
    try:
        # Extract number from last ID (e.g., "EMP001" -> 1)
        last_id = last_employee.employee_id
        if last_id.startswith("EMP"):
            number = int(last_id[3:])
            return f"EMP{number + 1:03d}"
    except (ValueError, IndexError):
        pass
    
    # Fallback: generate EMP{count}
    count = Employee.objects.count() + 1
    return f"EMP{count:03d}"


class Employee(models.Model):
    employee_id = models.CharField(
        max_length=20, 
        unique=True, 
        default=generate_employee_id,
        editable=False  # Read-only after creation
    )
    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    department = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.employee_id} - {self.full_name}"
    
    class Meta:
        ordering = ['-created_at']


class Attendance(models.Model):
    STATUS_CHOICES = (
        ("present", "Present"),
        ("absent", "Absent"),
    )

    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name="attendance_records"
    )
    date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)

    class Meta:
        unique_together = ("employee", "date")
        ordering = ['-date']

    def __str__(self):
        return f"{self.employee.full_name} - {self.date}"