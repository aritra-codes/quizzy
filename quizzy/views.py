from json import loads
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required

from .models import User, Quiz, Question

ERROR_403_TEMPLATE_LOCATION = "quizzy/error-403.html"
ERROR_404_TEMPLATE_LOCATION = "quizzy/error-404.html"


def render_index(request):
    return render(request, 'quizzy/index.html', {
        "quizzes": Quiz.objects.filter(visibility="public")
    })


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "quizzy/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "quizzy/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register_view(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "quizzy/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "quizzy/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "quizzy/register.html")


def render_quiz(request, quiz_id):
    if not request.method == "GET":
        return render(request, ERROR_403_TEMPLATE_LOCATION)

    try:
        return render(request, "quizzy/quiz.html", {
            "quiz": Quiz.objects.get(pk=quiz_id),
        })
    except Quiz.DoesNotExist:
        return render(request, ERROR_404_TEMPLATE_LOCATION)


@login_required
def render_my_quizzes(request):
    return render(request, 'quizzy/my-quizzes.html', {
        "quizzes": request.user.quizzes.all()
    })


@login_required
def render_favourites(request):
    return render(request, 'quizzy/favourites.html', {
        "quizzes": request.user.favourited_quizzes.filter(visibility="public")
    })


def submit_quiz(request, quiz_id):
    if not request.method == "POST":
        return render(request, ERROR_403_TEMPLATE_LOCATION)

    answers = loads(request.body).get("answers")
    feedback = {}

    for id, answer in answers.items():
        try:
            feedback[id] = "✅" if answer == Question.objects.get(
                pk=id).answer else "❎"
        except Question.DoesNotExist:
            feedback[id] = "Error: Question not found"

    return JsonResponse({"feedback": feedback})


@login_required
def create_quiz(request):
    method = request.method

    if method == "GET":
        return render(request, 'quizzy/create-quiz.html')
    elif method == "POST":
        data = loads(request.body)

        quiz = Quiz(title=data.get("title"), author=request.user,
                    visibility=data.get("visibility"))
        quiz.save()

        for question in data.get("questions"):
            questionModel = Question(quiz=quiz, type=question.get("type"), question=question.get(
                "question"), answerString=question.get("answer"))
            questionModel.save()

        return JsonResponse({"redirect": reverse("quiz", args=[quiz.pk])})
    else:
        return render(request, ERROR_403_TEMPLATE_LOCATION)


@login_required
def delete_quiz(request, quiz_id):
    quiz = Quiz.objects.get(pk=quiz_id)

    if not request.user == quiz.author:
        return render(request, ERROR_403_TEMPLATE_LOCATION)

    quiz.delete()

    return HttpResponseRedirect(reverse("index"))


# Like and favourite functions


@login_required
def like_quiz(request, quiz_id):
    if not request.method == "PUT":
        return render(request, ERROR_403_TEMPLATE_LOCATION)

    quiz = Quiz.objects.get(pk=quiz_id)

    has_liked = request.user in quiz.likes.all()

    if has_liked:
        quiz.likes.remove(request.user)
    else:
        quiz.likes.add(request.user)

    return JsonResponse({"hasLiked": has_liked})


@login_required
def favourite_quiz(request, quiz_id):
    if not request.method == "PUT":
        return render(request, ERROR_403_TEMPLATE_LOCATION)

    quiz = Quiz.objects.get(pk=quiz_id)

    has_favourited = request.user in quiz.favourites.all()

    if has_favourited:
        quiz.favourites.remove(request.user)
    else:
        quiz.favourites.add(request.user)

    return JsonResponse({"hasFavourited": has_favourited})
