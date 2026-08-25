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
      navbar.classList.remove(hiddenClass);
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

(function () {
  var section = document.querySelector(".section_process");
  var list = section && section.querySelector(".process_cards-list");
  if (!section || !list) return;

  var items = list.querySelectorAll(":scope > .process_card-item");
  var count = items.length;
  if (!count) return;

  var reducedMq = window.matchMedia("(prefers-reduced-motion: reduce)");
  var desktopMq = window.matchMedia("(min-width: 992px)");
  var ticking = false;

  section.style.setProperty("--process-card-count", String(count));

  function cardMotion(index, progress) {
    var unit = 1 / count;
    var fade = unit * 0.28;
    var start = index * unit;
    var shown = start + fade;
    var leave = (index + 1) * unit - fade;
    var gone = (index + 1) * unit;
    var opacity = 0;
    var from = 1;

    if (index === count - 1) {
      if (progress <= start) {
        opacity = 0;
        from = 1;
      } else if (progress < shown) {
        opacity = (progress - start) / fade;
        from = 1 - opacity;
      } else {
        opacity = 1;
        from = 0;
      }
      return { opacity: opacity, from: from };
    }

    if (progress <= start) {
      opacity = 0;
      from = 1;
    } else if (progress < shown) {
      opacity = (progress - start) / fade;
      from = 1 - opacity;
    } else if (progress < leave) {
      opacity = 1;
      from = 0;
    } else if (progress < gone) {
      opacity = 1 - (progress - leave) / fade;
      from = -(1 - opacity);
    } else {
      opacity = 0;
      from = -1;
    }

    return { opacity: opacity, from: from };
  }

  function pinProgress() {
    var rect = section.getBoundingClientRect();
    var view = window.innerHeight;
    var range = section.offsetHeight - view;
    if (range <= 0) return 0;
    return Math.max(0, Math.min(1, -rect.top / range));
  }

  function render() {
    ticking = false;
    if (reducedMq.matches) return;

    var progress = pinProgress();
    var desktop = desktopMq.matches;
    var distance = desktop ? 56 : 40;

    for (var i = 0; i < count; i++) {
      var motion = cardMotion(i, progress);
      var el = items[i];
      var x = desktop ? motion.from * distance : 0;
      var y = desktop ? 0 : motion.from * distance;
      el.style.opacity = String(motion.opacity);
      el.style.transform = "translate3d(" + x + "%, " + y + "%, 0)";
      el.style.pointerEvents = motion.opacity > 0.55 ? "auto" : "none";
    }
  }

  function onScroll() {
    if (ticking || reducedMq.matches) return;
    ticking = true;
    window.requestAnimationFrame(render);
  }

  function onChange() {
    if (reducedMq.matches) {
      for (var i = 0; i < count; i++) {
        items[i].style.opacity = "";
        items[i].style.transform = "";
        items[i].style.pointerEvents = "";
      }
      return;
    }
    render();
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  desktopMq.addEventListener("change", onChange);
  reducedMq.addEventListener("change", onChange);
  render();
})();

