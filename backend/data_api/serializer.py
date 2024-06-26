from rest_framework import serializers
from .models import (Role, CustomUser,
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
    LearningMaterial,
   
)



class LearningMaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningMaterial
        fields = "__all__"

class ColumnSerializer(serializers.ModelSerializer):
    class Meta:
        model = Column
        fields = "__all__"

class UserInvitationSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserInvitation
        fields = "__all__"


class TaskTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskTag
        fields = "__all__"


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = "__all__"


class TaskHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskHistory
        fields = "__all__"


class StatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Status
        fields = "__all__"


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = "__all__"


class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            "id",
            "username",
            "password",
            "email",
            "first_name",
            "last_name",
            "is_staff",
            "is_active",
            "role",
            "date_joined",
            "created_at",
        ]
        extra_kwargs = {
            "is_staff": {"read_only": True},
            "date_joined": {"read_only": True},
        }

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = CustomUser.objects.create_user(**validated_data, password=password)
        return user


class ProjectSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    team_name = serializers.CharField(source='team.name', read_only=True)
    class Meta:
        model = Project
        fields = "__all__"


class PrioritySerializer(serializers.ModelSerializer):
    class Meta:
        model = Priority
        fields = "__all__"


class TaskSerializer(serializers.ModelSerializer):
    # created_by = CustomUserSerializer().get_field_names()
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    
    assigned_to_name = serializers.CharField(source='assigned_to.username', read_only=True)
    status_name = serializers.CharField(source='status.name', read_only=True)
    priority_name = serializers.CharField(source='priority.name', read_only=True)
    project_name = serializers.CharField(source='column.project.name', read_only=True)
    column_name = serializers.CharField(source='column.name', read_only=True)

    
    # assigned_to = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all(), allow_null=True)

    class Meta:
        model = Task
        fields = "__all__"


class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = "__all__"

    def get_members(self, obj):
        user_teams = UserTeam.objects.filter(team=obj)
        users = [user_team.user for user_team in user_teams]
        return CustomUserSerializer(users, many=True).data


class UserTeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserTeam
        fields = "__all__"


class TaskCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskComment
        fields = "__all__"
