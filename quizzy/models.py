from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.


class User(AbstractUser):
    id = models.AutoField(primary_key=True, unique=True)


class Quiz(models.Model):
    id = models.AutoField(primary_key=True, unique=True)
    title = models.CharField(max_length=64, blank=False)
    author = models.ForeignKey(User, models.CASCADE, "quizzes")
    visibility = models.CharField(
        max_length=64, blank=False, default="private")
    likes = models.ManyToManyField(
        User, "liked_quizzes", blank=True, default=None, symmetrical=False)
    favourites = models.ManyToManyField(
        User, "favourited_quizzes", blank=True, default=None, symmetrical=False)


class Question(models.Model):
    id = models.AutoField(primary_key=True, unique=True)
    quiz = models.ForeignKey(Quiz, models.CASCADE, "questions")
    type = models.CharField(max_length=64, blank=False)
    question = models.CharField(max_length=64, blank=False)
    answerString = models.CharField(max_length=256, blank=False)

    @property
    def options(self):
        options = []

        if self.type == "prompt":
            options = None
        elif self.type == "multiple_choice" or self.type == "multiple_select":
            for option in self.answerString.split(";"):
                options.append(option.split(",")[0])

        return options

    @property
    def answer(self):
        answer = []

        if self.type == "prompt":
            answer = self.answerString
        elif self.type == "multiple_choice" or self.type == "multiple_select":
            for option in self.answerString.split(";"):
                split = option.split(",")

                if split[1]:
                    answer.append(split[0])

        return answer
