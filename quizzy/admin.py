from django.contrib import admin
from .models import User, Quiz, Question


class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "username")


class QuizAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "author", "visibility")


class QuestionAdmin(admin.ModelAdmin):
    list_display = ("id", "question", "answer")


# Register your models here.
admin.site.register(User, UserAdmin)
admin.site.register(Quiz, QuizAdmin)
admin.site.register(Question, QuestionAdmin)
