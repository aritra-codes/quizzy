function navbar() {
  document.querySelectorAll(".nav-link").forEach((navLink) => {
    if (navLink.pathname === window.location.pathname) {
      navLink.classList.add("active");
    }
  });
}

navbar();