# Generated by Django 5.0.4 on 2024-06-01 13:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('data_api', '0011_delete_customreport'),
    ]

    operations = [
        migrations.AddField(
            model_name='priority',
            name='color',
            field=models.CharField(default=1, max_length=20),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='status',
            name='color',
            field=models.CharField(default=1, max_length=20),
            preserve_default=False,
        ),
    ]
