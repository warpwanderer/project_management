from django.shortcuts import render
from django.contrib.auth.hashers import check_password
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.decorators import action
from django.http import HttpResponse
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import (
    Role,
    CustomUser,
    Status,
    Project,
    Priority,
    Task,
    Team,
    UserTeam,
    TaskComment,
    TaskHistory,
    Tag,
    TaskTag,
    UserInvitation,
    Column,
    LearningMaterial
)
from .serializer import (
    RoleSerializer,
    CustomUserSerializer,
    ProjectSerializer,
    StatusSerializer,
    PrioritySerializer,
    TaskSerializer,
    TeamSerializer,
    UserTeamSerializer,
    TaskCommentSerializer,
    TaskHistorySerializer,
    TagSerializer,
    TaskTagSerializer,
    UserInvitationSerializer,
    ColumnSerializer,
    LearningMaterialSerializer
)
import logging
from django.http import JsonResponse
import json
from django.db.models import Count
import csv
from django.db.models import Q

logger = logging.getLogger(__name__)
# Create your views here.


def index(request):
    return render(request, "index.html")


class BaseAPIView(APIView):
    model = None
    serializer_class = None
    

    def get(self, request):
        instances = self.model.objects.all()
        serializer = self.serializer_class(instances, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            instance = serializer.save()  
            if hasattr(instance, 'created_by'):
                instance.created_by = request.user  
                instance.save()  
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        instance = self.model.objects.get(pk=pk)
        serializer = self.serializer_class(instance, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        instance = self.model.objects.get(pk=pk)
        serializer = self.serializer_class(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        instance = self.model.objects.get(pk=pk)
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class LearningMaterialAPIView(BaseAPIView):
    model = LearningMaterial
    serializer_class = LearningMaterialSerializer

class StatusAPIView(BaseAPIView):
    model = Status
    serializer_class = StatusSerializer

class TaskHistoryAPIView(BaseAPIView):
    model = TaskHistory
    serializer_class = TaskHistorySerializer


class ProjectTasksView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, project_id):
        tasks = Task.objects.filter(column__project_id=project_id)
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)

class TagAPIView(BaseAPIView):
    model = Tag
    serializer_class = TagSerializer


class TaskTagAPIView(BaseAPIView):
    model = TaskTag
    serializer_class = TaskTagSerializer

    def patch(self, request, pk):
        return super().patch(request, pk=pk)

class UserInvitationAPIView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserInvitationSerializer

    def get(self, request):
        user_invitations = UserInvitation.objects.filter(email=request.user.email)
        serializer = UserInvitationSerializer(user_invitations, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data
        invited_by = request.user
        email = data.get('email')
        team_id = data.get('team')
        
        try:
            team = Team.objects.get(id=team_id)
        except Team.DoesNotExist:
            return Response({"error": "Team does not exist"}, status=status.HTTP_400_BAD_REQUEST)
        
        user = CustomUser.objects.filter(email=email).first()
        
        if user and team.userteam_set.filter(user=user).exists():
            return Response({"error": "User is already a member of the team"}, status=status.HTTP_400_BAD_REQUEST)

        if user and UserInvitation.objects.filter(email=email, team=team).exists():
            return Response({"error": "Invitation already sent to this user"}, status=status.HTTP_400_BAD_REQUEST)
        
        invitation = UserInvitation.objects.create(
            email=email,
            team=team,
            invited_by=invited_by
        )
        serializer = UserInvitationSerializer(invitation)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def patch(self, request, userinvitation_id):
        try:
            invitation = UserInvitation.objects.get(pk=userinvitation_id)
        except UserInvitation.DoesNotExist:
            return Response({"error": "Invitation not found"}, status=status.HTTP_404_NOT_FOUND)
        
        user = request.user

        try:
            if 'accepted' in request.data and request.data['accepted']:
                invitation.accepted = True
                invitation.accepted_by = user
                invitation.save()

                # Adding user to the team
                UserTeam.objects.create(user=user, team=invitation.team)

                return Response({"message": "Invitation accepted successfully"}, status=status.HTTP_200_OK)
            elif 'declined' in request.data and request.data['declined']:
                invitation.declined_by = user
                invitation.save()
                invitation.delete()
                return Response({"message": "Invitation declined successfully"}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Invalid operation"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": f"Internal server error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                        
class TeamMemberAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, team_id, member_id):
        team = Team.objects.filter(id=team_id, created_by=request.user).first()
        if not team:
            return Response({'detail': 'Team not found or not authorized'}, status=status.HTTP_404_NOT_FOUND)
        user_team = UserTeam.objects.filter(user_id=member_id, team=team).first()
        if not user_team:
            return Response({'detail': 'Member not found'}, status=status.HTTP_404_NOT_FOUND)
        user_team.delete()
        return Response({'detail': 'Member removed'}, status=status.HTTP_204_NO_CONTENT)
    
class RoleAPIView(BaseAPIView):
    model = Role
    serializer_class = RoleSerializer


class CustomUserAPIView(BaseAPIView):
    model = CustomUser
    serializer_class = CustomUserSerializer

    def patch(self, request, user_id):
        instance = self.model.objects.get(pk=user_id)
        serializer = self.serializer_class(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, user_id):
        instance = self.model.objects.get(pk=user_id)
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProjectAPIView(BaseAPIView):
    model = Project
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]
    

    def get(self, request):
        # Фильтрация по текущему пользователю
        user = self.request.user
        projects = self.model.objects.filter(created_by=user)
        serializer = self.serializer_class(projects, many=True)
        return Response(serializer.data)
    
    def put(self, request, project_id):
        return super().put(request, pk=project_id)

    def patch(self, request, project_id):
        return super().patch(request, pk=project_id)

    def delete(self, request, project_id):
        return super().delete(request, pk=project_id)
    # def patch(self, request, project_id):
    #     instance = self.model.objects.get(pk=project_id)
    #     serializer = self.serializer_class(instance, data=request.data, partial=True)
    #     if serializer.is_valid():
    #         serializer.save()
    #         return Response(serializer.data)
    #     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class TaskAPIView(BaseAPIView):
    model = Task
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Фильтрация по текущему пользователю
        user = self.request.user
        tasks = self.model.objects.filter(created_by=user)
        serializer = self.serializer_class(tasks, many=True)
        return Response(serializer.data)

    def patch(self, request, task_id):
        instance = self.model.objects.get(pk=task_id)
        serializer = self.serializer_class(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, task_id):
        instance = self.model.objects.get(pk=task_id)
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
class ColumnTaskAPIView(APIView):
    # permission_classes = [IsAuthenticated]
    def get(self, request, project_id, column_id):
        project = get_object_or_404(Project, pk=project_id)
        column = get_object_or_404(Column, pk=column_id, project=project)
        task = Task.objects.filter(column=column)
        serializer = TaskSerializer(task, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, project_id, column_id):
        project = get_object_or_404(Project, pk=project_id)
        column = get_object_or_404(Column, pk=column_id, project=project)
        data = request.data
        data['column'] = column_id
        serializer = TaskSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(column=column, created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def put(self, request, project_id, column_id, task_id):
        column = get_object_or_404(Column, pk=column_id)
        task = get_object_or_404(Task, pk=task_id, column=column)
        serializer = TaskSerializer(instance=task, data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def patch(self, request, project_id, column_id, task_id):
        column = get_object_or_404(Column, pk=column_id)
        task = get_object_or_404(Task, pk=task_id, column=column)
        serializer = TaskSerializer(instance=task, data=request.data, partial=True) 
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def delete(self, request, project_id, column_id, task_id):
        column = get_object_or_404(Column, pk=column_id)
        task = get_object_or_404(Task, pk=task_id, column=column)
        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    def get_queryset(self):
        return Task.objects.filter(parent_task=None)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class PriorityAPIView(BaseAPIView):
    model = Priority
    serializer_class = PrioritySerializer
    permission_classes = [IsAuthenticated]


class TeamAPIView(BaseAPIView):
    model = Team
    serializer_class = TeamSerializer

    
    def get(self, request, team_id=None):
        if team_id:
            team = Team.objects.filter(id=team_id).annotate(members_count=Count('userteam')).first()
            if not team:
                return Response({'detail': 'Team not found'}, status=status.HTTP_404_NOT_FOUND)
            members = team.userteam_set.all().select_related('user')
            members_data = CustomUserSerializer([ut.user for ut in members], many=True).data
            team_data = TeamSerializer(team).data
            return Response({'team': team_data, 'members': members_data}, status=status.HTTP_200_OK)
        teams = Team.objects.annotate(members_count=Count('userteam'))
        serializer = TeamSerializer(teams, many=True)
        return Response(serializer.data)
    

    def post(self, request):
        data = request.data
        data['created_by'] = request.user.id
        serializer = TeamSerializer(data=data)
        if serializer.is_valid():
            team = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, team_id):
        team = Team.objects.filter(id=team_id, created_by=request.user).first()
        if not team:
            return Response({'detail': 'Team not found or not authorized'}, status=status.HTTP_404_NOT_FOUND)
        team.delete()
        return Response({'detail': 'Team deleted'}, status=status.HTTP_204_NO_CONTENT)

class ColumnAPIView(BaseAPIView):
    model = Column
    serializer_class = ColumnSerializer
    
class UpdateColumnOrder(APIView):
    def post(self, request, project_id):
        order_data = request.data.get('order')
        for item in order_data:
            column = Column.objects.get(id=item['id'])
            column.order = item['order']
            column.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

class UpdateTaskOrder(APIView):
    def post(self, request, project_id):
        order_data = request.data.get('order')
        for item in order_data:
            task = Task.objects.get(id=item['id'])
            task.order = item['order']
            task.column_id = item['column']
            task.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

class UserTeamAPIView(BaseAPIView):
    model = UserTeam
    serializer_class = UserTeamSerializer

    def get(self, request, userteam_id=None):
        current_user = request.user
        username = current_user.username
        return JsonResponse({"username": username})

class TaskCommentAPIView(BaseAPIView):
    model = TaskComment
    serializer_class = TaskCommentSerializer


class LoginAPIView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        # Валидация данных входа
        if not username or not password:
            return Response(
                {"error": "Username and password are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # Получаем пользователя по имени пользователя
            user = CustomUser.objects.get(username=username)
        except CustomUser.DoesNotExist:
            # Если пользователя не существует, возвращаем ошибку
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )

        # Проверяем соответствие хэша пароля
        if not check_password(password, user.password):
            # Если пароль неверный, возвращаем ошибку
            return Response(
                {"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
            )

        # Генерируем токен доступа
        refresh = RefreshToken.for_user(user)
        tokens = {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }
        # Добавляем данные о пользователе в отдельную переменную
        user_data = {
            "username": user.username,  # Имя пользователя
            "userId": user.id,          # Идентификатор пользователя
            # Другие данные о пользователе, если необходимо
        }
        # Возвращаем токены
        return Response({"tokens": tokens, "userData": user_data}, status=status.HTTP_200_OK)
        # return Response(tokens, status=status.HTTP_200_OK)


class SomeProtectedView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Пользователь аутентифицирован, выполните здесь необходимые действия
        return Response({"message": "Authenticated"})


class RegisterAPIView(APIView):
    serializer_class = CustomUserSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            # Создаем нового пользователя
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TokenRefreshView(APIView):
    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'error': 'Refresh token is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            token = RefreshToken(refresh_token)
            access_token = str(token.access_token)
            return Response({'access': access_token}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ProjectColumnAPIView(APIView):
    # permission_classes = [IsAuthenticated]

    def get(self, request, project_id):
        project = get_object_or_404(Project, pk=project_id)
        column = Column.objects.filter(project=project)
        serializer = ColumnSerializer(column, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, project_id):
        project = get_object_or_404(Project, pk=project_id)
        serializer = ColumnSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(project=project, created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def put(self, request, project_id, column_id):
        project = get_object_or_404(Project, pk=project_id)
        column = get_object_or_404(Column, pk=column_id, project=project)
        serializer = ColumnSerializer(instance=column, data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def patch(self, request, project_id, column_id):
        project = get_object_or_404(Project, pk=project_id)
        column = get_object_or_404(Column, pk=column_id, project=project)
        serializer = ColumnSerializer(instance=column, data=request.data, partial=True) # Указываем partial=True, чтобы разрешить частичное обновление
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def delete(self, request, project_id, column_id):
        project = get_object_or_404(Project, pk=project_id)
        column = get_object_or_404(Column, pk=column_id, project=project)
        column.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class ReportDataView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        user = self.request.user
        # Получаем все команды, в которых состоит пользователь
        user_teams = UserTeam.objects.filter(user=user).values_list('team', flat=True)
        # Получаем все проекты, принадлежащие командам пользователя или созданные им лично
        projects = Project.objects.filter(Q(team__in=user_teams) | Q(created_by=user))
        # Получаем все задачи, принадлежащие проектам пользователя, назначенные ему лично, или созданные им лично
        tasks = Task.objects.filter(
            (
                Q(column__project__in=projects) & (Q(column=None) | Q(assigned_to=user) | Q(created_by=user))
            ) | 
            Q(assigned_to=user) | Q(created_by=user)
        ).distinct()
        project_data = ProjectSerializer(projects, many=True).data
        task_data = TaskSerializer(tasks, many=True).data

        return Response({
            "projects": project_data,
            "tasks": task_data,
        })
    
class TaskFilterView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        project_id = request.query_params.get('project')
        status_id = request.query_params.get('status')
        priority_id = request.query_params.get('priority')

        tasks = Task.objects.all()

        if project_id:
            tasks = tasks.filter(column__project__id=project_id)
        if status_id:
            tasks = tasks.filter(status__id=status_id)
        if priority_id:
            tasks = tasks.filter(priority__id=priority_id)
        
        projects = Project.objects.filter(column__tasks__in=tasks).distinct()
        task_data = TaskSerializer(tasks, many=True).data
        project_data = ProjectSerializer(projects, many=True).data

        return Response({
            "tasks": task_data,
            "projects": project_data,
        })

class ExportTasksView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        tasks = Task.objects.all()

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="tasks.csv"'

        writer = csv.writer(response)
        writer.writerow(['ID', 'Name', 'Description', 'Status', 'Priority', 'Due Date'])

        for task in tasks:
            writer.writerow([task.id, task.name, task.description, task.status.name, task.priority.name, task.due_date])

        return response