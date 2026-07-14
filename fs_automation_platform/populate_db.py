import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fs_automation_platform.settings')
django.setup()

from django.contrib.auth import get_user_model
from faculty.models import Faculty
from students.models import Student

User = get_user_model()

def run():
    # 1. Faculty
    if not User.objects.filter(username='sarah').exists():
        user = User.objects.create_user(
            username='sarah',
            password='password',
            email='sarah.jenkins@facultyflow.edu',
            first_name='Sarah',
            last_name='Jenkins',
            role=User.Role.FACULTY,
            avatar='https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
        )
        Faculty.objects.create(
            user=user,
            employee_id='FAC001',
            designation='Professor',
            joining_date='2020-01-01'
        )
        print("Created Faculty: sarah")

    # 2. Student 1
    if not User.objects.filter(username='ayushi').exists():
        user = User.objects.create_user(
            username='ayushi',
            password='password',
            email='ayushi.s@student.edu',
            first_name='Ayushi',
            last_name='Sharma',
            role=User.Role.STUDENT,
            avatar='https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'
        )
        Student.objects.create(
            user=user,
            enrollment_number='STU101',
            batch='2023-2027',
            course='B.Tech Computer Science'
        )
        print("Created Student: ayushi")

    # 3. Student 2
    if not User.objects.filter(username='karena').exists():
        user = User.objects.create_user(
            username='karena',
            password='password',
            email='karena.r@student.edu',
            first_name='Karena',
            last_name='Roy',
            role=User.Role.STUDENT,
            avatar='https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
        )
        Student.objects.create(
            user=user,
            enrollment_number='STU102',
            batch='2023-2027',
            course='B.Tech Computer Science'
        )
        print("Created Student: karena")
        
    # 4. Parent
    if not User.objects.filter(username='parent_sharma').exists():
        user = User.objects.create_user(
            username='parent_sharma',
            password='password',
            email='rakesh.sharma@gmail.com',
            first_name='Rakesh',
            last_name='Sharma',
            role=User.Role.PARENT,
            avatar='https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
        )
        print("Created Parent: parent_sharma")

if __name__ == '__main__':
    run()
