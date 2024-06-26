from django.urls import path, include
from django.urls import re_path as url
from data_api.views import (
    CustomUserAPIView,
    RoleAPIView,
    StatusAPIView,
    ProjectAPIView,
    PriorityAPIView,
    TaskAPIView,
    TeamAPIView,
    UserTeamAPIView,
    TaskCommentAPIView,
    TaskHistoryAPIView,
    TagAPIView,
    TaskTagAPIView,
    UserInvitationAPIView,
    ProjectColumnAPIView,
    ColumnTaskAPIView,
    ColumnAPIView,
    UpdateColumnOrder,
    UpdateTaskOrder,
    ProjectTasksView,
    ReportDataView,
    LearningMaterialAPIView,
    ExportTasksView,
    TaskFilterView,
    TeamMemberAPIView
    
)


urlpatterns = [
    path("users/", CustomUserAPIView.as_view(), name="Users"),
    path("users/<int:user_id>/", CustomUserAPIView.as_view(), name="Users"),
    path("roles/", RoleAPIView.as_view(), name="Roles"),
    path("statuses/", StatusAPIView.as_view(), name="Statuses"),
    path("projects/<int:project_id>/", ProjectAPIView.as_view(), name="Projects-Id"),
    path("projects/", ProjectAPIView.as_view(), name="Projects"),
    path("priorities/", PriorityAPIView.as_view(), name="Priorities"),
    path("tasks/", TaskAPIView.as_view(), name="Tasks"),
    path("tasks/<int:task_id>/", TaskAPIView.as_view(), name="Tasks-Id"),
    path("columns/", ColumnAPIView.as_view(), name="Columns"),
    path("users-teams/", UserTeamAPIView.as_view(), name="UsersTeams"),
    path("task-comments/", TaskCommentAPIView.as_view(), name="TaskComments"),
    path("task-history/", TaskHistoryAPIView.as_view(), name="TaskHistory"),
    path("tags/", TagAPIView.as_view(), name="tags"),
    path("task-tag/", TaskTagAPIView.as_view(), name="TaskTag"),
    path("teams/", TeamAPIView.as_view(), name="Teams"),
    path("teams/<int:team_id>/", TeamAPIView.as_view(), name="Teams-Id"),


    path("user-invitations/", UserInvitationAPIView.as_view(), name="user-invitations"),
    path("user-invitations/<int:userinvitation_id>/", UserInvitationAPIView.as_view(), name="user-invitations"),
    path("user-invitations/<int:userinvitation_id>/accept/", UserInvitationAPIView.as_view(), name="user-invitations"),
    path("user-invitations/<int:userinvitation_id>/decline/", UserInvitationAPIView.as_view(), name="user-invitations"),
     path('projects/<int:project_id>/columns/update-order/', UpdateColumnOrder.as_view(), name='update-column-order'),
    path('projects/<int:project_id>/tasks/update-order/', UpdateTaskOrder.as_view(), name='update-task-order'),
    path(
        "projects/<int:project_id>/columns",
        ProjectColumnAPIView.as_view(),
        name="project-columns",
    ),
    path(
        "projects/<int:project_id>/columns/<int:column_id>", ProjectColumnAPIView.as_view()
    ),
    path(
        "projects/<int:project_id>/columns/<int:column_id>/tasks/",
        ColumnTaskAPIView.as_view(),
        name="columns-tasks",
    ),
    path(
        "projects/<int:project_id>/columns/<int:column_id>/tasks/<int:task_id>",
        ColumnTaskAPIView.as_view(),
        name="columns-tasks-id",
    ),
    path('projects/<int:project_id>/tasks/', ProjectTasksView.as_view(), name='project-tasks'),
    path('api/projects/<int:project_id>/columns/update-order/', UpdateColumnOrder.as_view(), name='update-column-order'),
    path('api/projects/<int:project_id>/tasks/update-order/', UpdateTaskOrder.as_view(), name='update-task-order'),
    
    path('reports/', ReportDataView.as_view(), name='reports'),
    path('learning-materials/', LearningMaterialAPIView.as_view(), name='learning-materials'),

    path('reports/', ReportDataView.as_view(), name='report-data'),
    path('filter-tasks/', TaskFilterView.as_view(), name='filter-tasks'),
    path('export-tasks/', ExportTasksView.as_view(), name='export-tasks'),
     path('teams/<int:team_id>/members/<int:member_id>/', TeamMemberAPIView.as_view(), name='team-member-detail'),
    
]
