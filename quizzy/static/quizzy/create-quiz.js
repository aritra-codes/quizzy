function addQuestionCode() {
  //Functions
  function returnRadioOrCheckboxAnswer(is_radio) {
    let radioNumber = 0;
    let type, formText, extraAttrs;

    if (is_radio) {
      type = "radio";
      formText = "Select the option that is the answer";
      extraAttrs = "required";
    } else {
      type = "checkbox";
      formText = "Select the options that are the answers";
      extraAttrs = "";
    }

    function returnRadioOrCheckboxCol(radioRepeat=2) {
      let html = "";
      const baseId = `answer${questionNumber}Option`;

      for (let i = 0; i < radioRepeat; i++) {
        radioNumber++;
        const id = `${baseId}${radioNumber}`;

        html += 
          `<div class="form-check form-check-inline">
            <input type="${type}" class="option form-check-input" name="answer" id="${id}" ${extraAttrs}>
            <label for="${id}" class="form-check-label">
              <input type="text" class="optionValue" placeholder="Type in an option" required/>
            </label>
          </div>`;
      }

      return (
        `<div class="col">
          ${html}
        </div>`
      );
    }

    return (
      `<div class="row">
        Options:
      </div>

      <div class="message row text-danger fs-6"></div>

      <div class="row row-cols-auto">
        ${returnRadioOrCheckboxCol()}
        ${returnRadioOrCheckboxCol()}
      </div>

      <div class="row">
        <div class="form-text">${formText}</div>
      </div>`
    );
  }
  
  // Variables
  let questionNumber = 0;
  const addQuestionForm = document.querySelector("#addQuestionForm");
  const select = addQuestionForm.querySelector("#questionTypeSelect");


  addQuestionForm.addEventListener("submit", event => {
    event.preventDefault();

    questionNumber++;
    const selectValue = select.value;
    let answer;

    const questionDiv = document.createElement("div");
    questionDiv.className = "border rounded p-3 my-2";

    if (selectValue === "prompt") {
      answer = 
      `<label for="answer${questionNumber}" class="form-label">Answer:</label>
      <input type="text" class="answer form-control" id="answer${questionNumber}" placeholder="Type in your answer" required>`
    } else if (selectValue === "multiple_choice") {
      answer = returnRadioOrCheckboxAnswer(true);
    } else if (selectValue === "multiple_select") {
      answer = returnRadioOrCheckboxAnswer(false);
    }

    questionDiv.innerHTML = 
    `<form action="#" id="questionForm${questionNumber}" data-question-type="${selectValue}">
      <div class="mb-3">
        <div class="d-flex justify-content-between align-items-center">
          <label for="question${questionNumber}" class="form-label">Question:</label>
          <a href="#" class="questionFormEditAnchor" style="display: none;">Edit</a>
        </div>
        <input type="text" class="question form-control" id="question${questionNumber}" placeholder="Type in your question" required>
      </div>

      <div class="mb-3">
        ${answer}
      </div>
      
      <div class="d-flex justify-content-start align-items-center">
        <button type="submit" class="btn btn-primary mb-3 me-1" form="questionForm${questionNumber}">Save</button>
        <button type="button" class="questionFormDeleteButton btn btn-danger mb-3">Delete</button>
      </div>
    </form>`;

    const questionForm = questionDiv.querySelector(`#questionForm${questionNumber}`);
    const questionFormEditAnchor = questionDiv.querySelector(".questionFormEditAnchor");

    // When question form is submitted, saves the question and makes the question uneditable
    questionForm.addEventListener("submit", event => {
      event.preventDefault();

      const questionType = questionForm.dataset.questionType;

      if (questionType === "multiple_choice") {
        questionForm.querySelectorAll(".option").forEach((option) => {
          option.value = option.parentElement.querySelector(".optionValue").value;
        });
      } else if (questionType === "multiple_select") {
        //Validates whether 2 or more are checked
        let checkedOptions = 0;

        questionForm.querySelectorAll(".option").forEach((option) => {
          option.value = option.parentElement.querySelector(".optionValue").value;
          option.checked && checkedOptions++;
        });

        const messageDiv = questionForm.querySelector(".message");

        if (checkedOptions < 2) {
          messageDiv.innerHTML = "Please select two or more options";
          return;
        } else {
          messageDiv.innerHTML = "";
        }
      }

      questionFormEditAnchor.style.display = "block";
      questionForm.querySelectorAll("input").forEach(input => {
        input.disabled = true;
      })
      questionForm.querySelectorAll("button").forEach(button => {
        button.style.display = "none";
      })

      questionForm.classList.add("quizQuestion");
    });
    // When edit anchor is clicked, makes the question editable
    questionFormEditAnchor.addEventListener("click", event => {
      event.preventDefault();

      questionForm.classList.remove("quizQuestion");

      questionFormEditAnchor.style.display = "none";
      questionForm.querySelectorAll("input").forEach(input => {
        input.disabled = false;
      })
      questionForm.querySelectorAll("button").forEach(button => {
        button.style.display = "block";
      })
    });
    // When delete button is clicked, removes the whole div
    questionDiv.querySelector(".questionFormDeleteButton").addEventListener("click", event => {
      questionDiv.remove();
    });

    document.querySelector("#questionsDiv").appendChild(questionDiv);
  });
}


function submitQuizFormCode() {
  const quizForm = document.querySelector("#quizForm");

  //When the quiz form is submitted, sends a request to the server to create the quiz
  quizForm.addEventListener("submit", (event) => {
    event.preventDefault();

    let visibility;

    //Loops through every visibility radio and assigns visibility the correct value
    quizForm.querySelectorAll(".visibilityRadio").forEach((radio) => {
      if (radio.checked) {
        visibility = radio.value;
      }
    });

    let questions = [];

    //Loops through every saved question and adds it to the questions array
    quizForm.querySelectorAll(".quizQuestion").forEach((questionForm) => {
      const questionType = questionForm.dataset.questionType;
      let answer;

      if (questionType === "prompt") {
        answer = questionForm.querySelector(".answer").value;
      } else if (questionType === "multiple_choice" || questionType === "multiple_select") {
        answer = [];

        questionForm.querySelectorAll(".option").forEach((option) => {
          answer.push(`${option.value},${option.checked ? "checked" : ""}`);
        });

        answer = answer.join(";");
      }

      questions.push({type: questionType, question: questionForm.querySelector(".question").value, answer: answer});
    });

    //Sends a request to the server to create the quiz
    fetch("/create-quiz", {
      method: "POST",
      body: JSON.stringify({
        title: quizForm.querySelector("#quizNameInput").value,
        visibility: visibility,
        questions: questions
      }),
      headers: {"X-CSRFToken": getCookie('csrftoken')}
    })
    .then(response => response.json())
    .then((data) => {
      window.location.pathname = data["redirect"];
    });
  });
}


function createQuizCode() {
  addQuestionCode();
  submitQuizFormCode();
}

createQuizCode();

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