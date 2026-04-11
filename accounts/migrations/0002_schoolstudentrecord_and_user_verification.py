# Generated manually to support school registry verification

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='is_school_verified',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='customuser',
            name='verified_student_id',
            field=models.CharField(blank=True, max_length=20, null=True, unique=True),
        ),
        migrations.CreateModel(
            name='SchoolStudentRecord',
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
                ('student_id', models.CharField(max_length=20, unique=True)),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('first_name', models.CharField(max_length=100)),
                ('last_name', models.CharField(max_length=100)),
                ('department', models.CharField(blank=True, default='', max_length=100)),
                ('year_of_study', models.CharField(blank=True, default='', max_length=1)),
                ('is_active', models.BooleanField(default=True)),
                ('source_system', models.CharField(default='School Registry', max_length=100)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['student_id'],
            },
        ),
    ]
