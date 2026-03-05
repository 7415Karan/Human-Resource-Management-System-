from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from datetime import datetime
from django.db.models import Q, Count, Case, When, IntegerField, F
from .models import Employee, Attendance
from .serializers import EmployeeSerializer, AttendanceSerializer


class EmployeeListCreateView(generics.ListCreateAPIView):
    queryset = Employee.objects.all().order_by("-created_at")
    serializer_class = EmployeeSerializer


class EmployeeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer


class AttendanceCreateView(generics.CreateAPIView):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer


class AttendanceListView(generics.ListAPIView):
    serializer_class = AttendanceSerializer

    def get_queryset(self):
        queryset = Attendance.objects.all().order_by("-date")
        
        # Filter by employee id or name if provided
        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(
                Q(employee__employee_id__icontains=search) |
                Q(employee__full_name__icontains=search)
            )
        
        # Filter by employee_id explicit (kept for backwards compatibility)
        employee_id = self.request.query_params.get("employee_id")
        if employee_id:
            queryset = queryset.filter(employee__employee_id=employee_id)
        
        # Filter by date range
        start_date = self.request.query_params.get("start_date")
        end_date = self.request.query_params.get("end_date")
        
        if start_date:
            try:
                start = datetime.strptime(start_date, "%Y-%m-%d").date()
                queryset = queryset.filter(date__gte=start)
            except ValueError:
                pass  # Invalid date format, ignore
        
        if end_date:
            try:
                end = datetime.strptime(end_date, "%Y-%m-%d").date()
                queryset = queryset.filter(date__lte=end)
            except ValueError:
                pass  # Invalid date format, ignore
        
        # Filter by status if provided
        status_filter = self.request.query_params.get("status")
        if status_filter in ["present", "absent"]:
            queryset = queryset.filter(status=status_filter)
        
        return queryset


@api_view(["GET"])
def employee_statistics(request, pk):
    """
    Get statistics for a specific employee including total present days
    """
    try:
        employee = Employee.objects.get(pk=pk)
    except Employee.DoesNotExist:
        return Response(
            {"detail": "Employee not found."},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Get aggregated statistics in single query
    stats = Attendance.objects.filter(employee=employee).aggregate(
        total_records=Count('id'),
        present_days=Count(Case(When(status="present", then=1))),
        absent_days=Count(Case(When(status="absent", then=1)))
    )
    
    total_records = stats['total_records']
    present_days = stats['present_days']
    absent_days = stats['absent_days']
    
    attendance_percentage = 0
    if total_records > 0:
        attendance_percentage = round((present_days / total_records) * 100, 2)
    
    return Response({
        "employee_id": employee.employee_id,
        "full_name": employee.full_name,
        "department": employee.department,
        "email": employee.email,
        "total_attendance_records": total_records,
        "present_days": present_days,
        "absent_days": absent_days,
        "attendance_percentage": attendance_percentage
    })


@api_view(["GET"])
def all_employees_statistics(request):
    """
    Get statistics for all employees - optimized with aggregation
    """
    # Use annotate to get stats in single query instead of N+1
    employees = Employee.objects.annotate(
        total_records=Count('attendance_records'),
        present_days=Count(
            Case(When(attendance_records__status="present", then=1)),
            output_field=IntegerField()
        ),
        absent_days=Count(
            Case(When(attendance_records__status="absent", then=1)),
            output_field=IntegerField()
        )
    ).order_by('-created_at')
    
    stats_list = []
    for employee in employees:
        total_records = employee.total_records
        present_days = employee.present_days
        absent_days = employee.absent_days
        
        attendance_percentage = 0
        if total_records > 0:
            attendance_percentage = round((present_days / total_records) * 100, 2)
        
        stats_list.append({
            "id": employee.id,
            "employee_id": employee.employee_id,
            "full_name": employee.full_name,
            "department": employee.department,
            "total_records": total_records,
            "present_days": present_days,
            "absent_days": absent_days,
            "attendance_percentage": attendance_percentage
        })
    
    return Response({
        "count": len(stats_list),
        "results": stats_list
    })