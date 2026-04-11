# Generated manually for Sprint 2 matching support

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('organizations', '0001_initial'),
        ('students', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='MatchSuggestion',
            fields=[
                (
                    'id',
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name='ID',
                    ),
                ),
                ('score', models.PositiveIntegerField(default=0)),
                ('matched_skills', models.JSONField(blank=True, default=list)),
                ('skill_match_points', models.PositiveIntegerField(default=0)),
                ('project_type_points', models.PositiveIntegerField(default=0)),
                ('location_points', models.PositiveIntegerField(default=0)),
                ('rank', models.PositiveSmallIntegerField(default=1)),
                ('is_recommended', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                (
                    'organization',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='match_suggestions',
                        to='organizations.organizationprofile',
                    ),
                ),
                (
                    'student',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='match_suggestions',
                        to='students.studentprofile',
                    ),
                ),
            ],
            options={
                'ordering': ['student', 'rank', '-score'],
                'unique_together': {('student', 'organization')},
            },
        ),
        migrations.CreateModel(
            name='MatchAssignment',
            fields=[
                (
                    'id',
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name='ID',
                    ),
                ),
                (
                    'source',
                    models.CharField(
                        choices=[
                            ('automatic', 'Automatic Confirmation'),
                            ('manual', 'Manual Override'),
                        ],
                        max_length=20,
                    ),
                ),
                ('score', models.PositiveIntegerField(default=0)),
                ('matched_skills', models.JSONField(blank=True, default=list)),
                ('skill_match_points', models.PositiveIntegerField(default=0)),
                ('project_type_points', models.PositiveIntegerField(default=0)),
                ('location_points', models.PositiveIntegerField(default=0)),
                ('notes', models.TextField(blank=True, default='')),
                (
                    'notification_status',
                    models.CharField(
                        choices=[
                            ('pending', 'Pending'),
                            ('sent', 'Sent'),
                            ('skipped', 'Skipped'),
                            ('failed', 'Failed'),
                        ],
                        default='pending',
                        max_length=20,
                    ),
                ),
                (
                    'notification_message',
                    models.CharField(blank=True, default='', max_length=255),
                ),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                (
                    'confirmed_by',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name='confirmed_matches',
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    'organization',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='match_assignments',
                        to='organizations.organizationprofile',
                    ),
                ),
                (
                    'student',
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='match_assignment',
                        to='students.studentprofile',
                    ),
                ),
            ],
            options={
                'ordering': ['student__first_name', 'student__last_name'],
            },
        ),
    ]
