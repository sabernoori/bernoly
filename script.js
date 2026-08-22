(function () {
  const navbar = document.querySelector(".navbar_component");
  if (!navbar) return;

  const mobileMq = window.matchMedia("(max-width: 991px)");
  const hiddenClass = "is-nav-hidden";
  const scrolledClass = "is-nav-scrolled";
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
    const y = window.scrollY;

    if (!mobileMq.matches) {
      showNav();
      navbar.classList.toggle(scrolledClass, y > 16);
      lastY = y;
      return;
    }

    navbar.classList.remove(scrolledClass);

    if (menuIsOpen()) {
      showNav();
      lastY = y;
      return;
    }

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

  mobileMq.addEventListener("change", function () {
    if (!mobileMq.matches) showNav();
    updateNav();
  });

  updateNav();
})();
