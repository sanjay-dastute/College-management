from django.apps import AppConfig


class CollegeApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'college_api'

    def ready(self):
        import college_api.signals  # noqa
