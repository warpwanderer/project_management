from django.contrib import admin
from data_api.models import (
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

# Register your models here.

# @admin.register(LearningMaterial)
# class LearningMaterialAdmin(admin.ModelAdmin):
#     pass


@admin.register(Column)
class ColumnAdmin(admin.ModelAdmin):
    pass

@admin.register(Status)
class StatusTaskAdmin(admin.ModelAdmin):
    pass


# @admin.register(TaskHistory)
# class TaskHistoryAdmin(admin.ModelAdmin):
#     pass


# @admin.register(Tag)
# class TagAdmin(admin.ModelAdmin):
#     pass


# @admin.register(TaskTag)
# class TaskTagAdmin(admin.ModelAdmin):
#     pass


@admin.register(UserInvitation)
class UserInvitationAdmin(admin.ModelAdmin):
    pass


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    pass


@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ["username"]


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    pass


@admin.register(Priority)
class TaskPriorityAdmin(admin.ModelAdmin):
    pass


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    pass


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    pass


@admin.register(UserTeam)
class UserTeamAdmin(admin.ModelAdmin):
    pass


# @admin.register(TaskComment)
# class TaskCommentAdmin(admin.ModelAdmin):
#     pass
