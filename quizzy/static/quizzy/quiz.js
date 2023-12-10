function quizCode() {
  const quizForm = document.querySelector("#quizForm");
  
  quizForm.addEventListener("submit", (event) => {
    event.preventDefault();

    let answers = {};

    quizForm.querySelectorAll(".quizQuestion").forEach((question) => {
      const questionType = question.dataset.questionType;
      let answer;

      if (questionType === "prompt") {
        answer = question.querySelector(".answer").value;
      } else if (questionType === "multiple_choice" || questionType === "multiple_select") {
        answer = [];

        question.querySelectorAll(".option").forEach((option) => {
          option.checked && answer.push(option.value);
        });
      }

      answers[question.dataset.questionId] = answer;
    });

    //Sends a request to the server to submit the quiz
    fetch(`/quiz/${quizForm.dataset.quizId}/submit`, {
      method: "POST",
      body: JSON.stringify({
        answers: answers
      }),
      headers: {"X-CSRFToken": getCookie('csrftoken')}
    })
    .then(response => response.json())
    .then((data) => {
  
      quizForm.querySelectorAll(".quizQuestion").forEach((question) => {
        question.querySelector(".feedback").innerHTML = data["feedback"][question.dataset.questionId] || "Not found";
      });
    });
  });
}

quizCode();

//Returns a cookie for the json fetch headers
function getCookie(name) {
  var cookieValue = null;
  if (document.cookie && document.cookie !== '') {
      var cookies = document.cookie.split(';');
      for (var i = 0; i < cookies.length; i++) {
          var cookie = cookies[i].trim();
          if (cookie.substring(0, name.length + 1) === (name + '=')) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
              break;
          }
      }
  }
  return cookieValue;
}