# Generated by Django 5.0.4 on 2024-05-28 17:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('data_api', '0005_remove_userinvitation_project_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='team',
            name='description',
            field=models.TextField(blank=True, null=True),
        ),
    ]