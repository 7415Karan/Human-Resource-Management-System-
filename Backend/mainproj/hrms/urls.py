from django.urls import path
from .views import (
    EmployeeListCreateView,
    EmployeeDetailView,
    AttendanceCreateView,
    AttendanceListView,
    employee_statistics,
    all_employees_statistics
)

urlpatterns = [
    path("employees/", EmployeeListCreateView.as_view()),
    path("employees/<int:pk>/", EmployeeDetailView.as_view()),
    path("employees/<int:pk>/statistics/", employee_statistics),
    path("statistics/all/", all_employees_statistics),
    path("attendance/", AttendanceCreateView.as_view()),
    path("attendance/list/", AttendanceListView.as_view()),
]