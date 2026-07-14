from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Faculty
from .serializers import FacultySerializer

class FacultyViewSet(viewsets.ModelViewSet):
    """
    A viewset that provides default `create()`, `retrieve()`, `update()`,
    `partial_update()`, `destroy()` and `list()` actions for Faculty.
    """
    queryset = Faculty.objects.all().select_related('user').order_by('-joining_date')
    serializer_class = FacultySerializer
    
    # Enable filtering and searching
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    # Fields that can be filtered using exact/lookup matches
    filterset_fields = ['designation', 'joining_date']
    
    # Fields that can be searched with query parameter ?search=...
    search_fields = ['employee_id', 'user__first_name', 'user__last_name', 'user__email']
    
    # Fields that can be used for ordering with ?ordering=...
    ordering_fields = ['joining_date', 'employee_id']

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_questions(request):
    """
    Mock endpoint for AI Question Generator.
    Expected payload: {"topic": "Photosynthesis", "count": 5}
    """
    topic = request.data.get('topic', 'General Knowledge')
    count = int(request.data.get('count', 5))
    
    # Placeholder logic - this is where you'd call OpenAI/Gemini
    questions = []
    for i in range(count):
        questions.append({
            "id": i + 1,
            "question": f"Explain the core concepts of {topic} (Question {i+1}).",
            "type": "short_answer"
        })
        
    return Response({
        "topic": topic,
        "count": count,
        "generated_questions": questions
    })

