from django.urls import path
from . import views

urlpatterns = [
    path("", views.render_index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register_view, name="register"),
    path("my-quizzes", views.render_my_quizzes, name="my-quizzes"),
    path("favourites", views.render_favourites, name="favourites"),
    path("quiz/<int:quiz_id>", views.render_quiz, name="quiz"),
    path("quiz/<int:quiz_id>/submit", views.submit_quiz, name="submit-quiz"),
    path("quiz/<int:quiz_id>/like", views.like_quiz, name="like-quiz"),
    path("quiz/<int:quiz_id>/favourite",
         views.favourite_quiz, name="favourite-quiz"),
    path("create-quiz", views.create_quiz, name="create-quiz"),
    path("quiz/<int:quiz_id>/delete",
         views.delete_quiz, name="delete-quiz")
]
