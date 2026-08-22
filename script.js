(function () {
  const navbar = document.querySelector(".navbar_component");
  if (!navbar) return;

  const mq = window.matchMedia("(max-width: 991px)");
  const hiddenClass = "is-nav-hidden";
  let lastY = window.scrollY;
  let ticking = false;

  function menuIsOpen() {
    return Boolean(
      navbar.querySelector(".w-nav-button.w--open") ||
        navbar.querySelector(".navbar_menu.w--open")
    );
  }

  function showNav() {
    navbar.classList.remove(hiddenClass);
  }

  function updateNav() {
    if (!mq.matches || menuIsOpen()) {
      showNav();
      lastY = window.scrollY;
      return;
    }

    const y = window.scrollY;
    if (y > lastY && y > 16) {
      navbar.classList.add(hiddenClass);
    } else if (y < lastY) {
      showNav();
    }

    lastY = y;
  }

  window.addEventListener(
    "scroll",
    function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        updateNav();
        ticking = false;
      });
    },
    { passive: true }
  );

  mq.addEventListener("change", function () {
    if (!mq.matches) showNav();
  });
})();
