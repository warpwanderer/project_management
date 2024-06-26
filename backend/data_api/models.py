from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.hashers import make_password
from django.utils import timezone

# Create your models here.


class Role(models.Model):
    name = models.CharField(max_length=50, unique=True, db_index=True)

    class Meta:
        verbose_name = "Role"
        verbose_name_plural = "Roles"


class CustomUser(AbstractUser):
    created_at = models.DateTimeField(auto_now_add=True)
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True)
    is_superuser = models.BooleanField(default=False)


class Status(models.Model):
    name = models.CharField(max_length=20, unique=True)
    color = models.CharField(max_length=20)

    def __str__(self):
        return self.name


class Priority(models.Model):
    name = models.CharField(max_length=20, unique=True)
    color = models.CharField(max_length=20)

    def __str__(self):
        return self.name


class Project(models.Model):
    name = models.CharField(max_length=100, db_index=True)
    description = models.TextField(null=True, blank=True)
    created_by = models.ForeignKey(
        CustomUser, on_delete=models.SET_NULL, null=True, related_name="created_project"
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)
    status = models.ForeignKey(Status, on_delete=models.SET_NULL, null=True)
    team = models.ForeignKey(
        "Team",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="projects",
    )

    def __str__(self):
        return self.name


class Column(models.Model):
    name = models.CharField(max_length=100, db_index=True)
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="column"
    )
    created_by = models.ForeignKey(
        CustomUser, on_delete=models.SET_NULL, null=True, related_name="created_column"
    )
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.name


class Task(models.Model):
    name = models.CharField(max_length=100, db_index=True)
    description = models.TextField(null=True, blank=True)
    column = models.ForeignKey(
        Column, on_delete=models.CASCADE, null=True, blank=True, related_name="columns"
    )
    created_by = models.ForeignKey(
        CustomUser, on_delete=models.SET_NULL, null=True, related_name="created_tasks"
    )
    priority = models.ForeignKey(Priority, on_delete=models.SET_NULL, null=True)
    due_date = models.DateTimeField(null=True, blank=True, db_index=True)
    status = models.ForeignKey(Status, on_delete=models.SET_NULL, null=True)
    assigned_to = models.ForeignKey(
        CustomUser, on_delete=models.SET_NULL, null=True, related_name="assigned_tasks"
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)
    order = models.PositiveIntegerField(default=0)

    # Поле для подзадач и статус выполнения
    parent_task = models.ForeignKey(
        "self", on_delete=models.CASCADE, null=True, blank=True, related_name="subtasks"
    )
    is_completed = models.BooleanField(default=False)

    def is_user_task(self, user):
        return self.assigned_to == user or self.created_by == user

    @property
    def is_overdue(self):
        # Проверка, установлена ли дата выполнения и прошла ли она
        return self.due_date and self.due_date < timezone.now()

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["name", "column"], name="unique_task_name_column"
            )
        ]
        ordering = ["order"]

    def __str__(self):
        return self.name


class Team(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(null=True, blank=True)
    created_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class UserTeam(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    team = models.ForeignKey(Team, on_delete=models.CASCADE)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "team"], name="unique_user_team")
        ]


class UserInvitation(models.Model):
    email = models.EmailField()
    team = models.ForeignKey(Team, on_delete=models.CASCADE)
    invited_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    accepted = models.BooleanField(default=False)
    accepted_by = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="accepted_invitations",
    )
    declined_by = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="declined_invitations",
    )

    def __str__(self):
        return f"Invitation to {self.email} by {self.invited_by.username}"


class LearningMaterial(models.Model):
    title = models.CharField(max_length=100)
    content = models.TextField()
    author = models.ForeignKey(CustomUser, on_delete=models.CASCADE, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class TaskComment(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="comments")
    user = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True)
    comment_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)


class TaskHistory(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="history")
    status = models.ForeignKey(Status, on_delete=models.SET_NULL, null=True)
    changed_at = models.DateTimeField(auto_now_add=True)
    changed_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"History for {self.task.name} by {self.changed_by.username}"


class Tag(models.Model):
    name = models.CharField(max_length=30)

    class Meta:
        verbose_name = "Tag"
        verbose_name_plural = "Tags"


class TaskTag(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="tags")
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.task.name} - {self.tag.name}"
