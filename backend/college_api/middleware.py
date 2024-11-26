from django.conf import settings
from django.http import JsonResponse

class FileSizeMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.method == 'POST' and request.FILES:
            for uploaded_file in request.FILES.values():
                if uploaded_file.size > settings.MAX_UPLOAD_SIZE:
                    return JsonResponse({
                        'error': f'File too large. Maximum size is {settings.MAX_UPLOAD_SIZE/1024/1024}MB.'
                    }, status=400)
        return self.get_response(request)
