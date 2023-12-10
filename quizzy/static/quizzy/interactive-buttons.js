function interactiveButtonsCode() {
  document.querySelectorAll(".interactive").forEach((span) => {
    const i = span.querySelector("i");
    const innerSpan = span.querySelector("span");
  
    span.querySelector("a").addEventListener("click", (event) => {
      event.preventDefault();

      const innerSpanInnerHTML = innerSpan.innerHTML;
      
      fetch(span.dataset.interactiveLink, {
        method: "PUT",
        headers: {"X-CSRFToken": getCookie('csrftoken')}
      })
      .then(reponse => reponse.json())
      .then((data) => {
        if (span.dataset.interactiveType === "likes") {
          if (data["hasLiked"]) {
            i.classList.replace("bi-hand-thumbs-up-fill", "bi-hand-thumbs-up");
            innerSpan.innerHTML = parseInt(innerSpanInnerHTML) - 1;
          } else {
            i.classList.replace("bi-hand-thumbs-up", "bi-hand-thumbs-up-fill");
            innerSpan.innerHTML = parseInt(innerSpanInnerHTML) + 1;
          }
        } else if (span.dataset.interactiveType === "favourites") {
          if (data["hasFavourited"]) {
            i.classList.replace("bi-star-fill", "bi-star");
            innerSpan.innerHTML = parseInt(innerSpanInnerHTML) - 1;
          } else {
            i.classList.replace("bi-star", "bi-star-fill");
            innerSpan.innerHTML = parseInt(innerSpanInnerHTML) + 1;
          }
        }
      });
    });
  });
}

interactiveButtonsCode();

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