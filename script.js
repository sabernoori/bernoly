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
  var ticking = false;
  var rem = 16;

  function readRem() {
    rem = parseFloat(window.getComputedStyle(document.documentElement).fontSize) || 16;
  }

  function travelY(el) {
    return el.offsetHeight + 5 * rem;
  }

  function slotY(el) {
    return items[0].offsetTop - el.offsetTop;
  }

  function setTrackHeight() {
    if (reducedMq.matches) {
      section.style.height = "";
      return;
    }
    section.style.height = "calc(100vh * " + (1 + count * 0.5) + ")";
  }

  function pinProgress() {
    var rect = section.getBoundingClientRect();
    var view = window.innerHeight;
    var range = section.offsetHeight - view;
    if (range <= 0) return 0;
    return Math.max(0, Math.min(1, -rect.top / range));
  }

  function cardState(index, progress) {
    var start = index / count;
    var leave = (index + 1) / count;
    if (index === count - 1) return progress >= start ? "in" : "waiting";
    if (progress < start) return "waiting";
    if (progress < leave) return "in";
    return "out";
  }

  function applyState(el, state, instant) {
    var slot = slotY(el);
    var y = travelY(el);
    el.style.transition = instant
      ? "none"
      : "transform 900ms ease-out, opacity 900ms ease-out";
    if (state === "in") {
      el.style.opacity = "1";
      el.style.transform = "translate3d(0, " + slot + "px, 0)";
      el.style.pointerEvents = "auto";
      el.style.zIndex = "3";
    } else if (state === "out") {
      el.style.opacity = "0";
      el.style.transform = "translate3d(0, " + (slot - y) + "px, 0)";
      el.style.pointerEvents = "none";
      el.style.zIndex = "1";
    } else {
      el.style.opacity = "0";
      el.style.transform = "translate3d(0, " + (slot + y) + "px, 0)";
      el.style.pointerEvents = "none";
      el.style.zIndex = "2";
    }
    el.classList.toggle("is-in", state === "in");
    el.classList.toggle("is-out", state === "out");
    if (instant) el.offsetHeight;
  }

  function render(instant) {
    ticking = false;
    if (reducedMq.matches) return;
    readRem();
    var progress = pinProgress();
    for (var i = 0; i < count; i++) {
      applyState(items[i], cardState(i, progress), instant);
    }
  }

  function onScroll() {
    if (ticking || reducedMq.matches) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      render(false);
    });
  }

  function clearInline(el) {
    el.classList.remove("is-in", "is-out");
    el.style.transition = "";
    el.style.opacity = "";
    el.style.transform = "";
    el.style.pointerEvents = "";
    el.style.zIndex = "";
  }

  function onChange() {
    if (reducedMq.matches) {
      setTrackHeight();
      for (var i = 0; i < count; i++) clearInline(items[i]);
      return;
    }
    setTrackHeight();
    render(true);
  }

  readRem();
  setTrackHeight();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onChange, { passive: true });
  reducedMq.addEventListener("change", onChange);

  items.forEach(function (el) {
    applyState(el, "waiting", true);
  });
  window.requestAnimationFrame(function () {
    window.requestAnimationFrame(function () {
      render(false);
    });
  });
})();

(function () {
  var root = document.querySelector(".product_header-wrapper");
  if (!root) return;

  var desktop = root.querySelector(".product_header-video_el.is-desktop");
  var mobile = root.querySelector(".product_header-video_el.is-mobile");
  if (!desktop || !mobile) return;

  var mq = window.matchMedia("(max-width: 767px)");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function apply() {
    var useMobile = mq.matches;
    var show = useMobile ? mobile : desktop;
    var hide = useMobile ? desktop : mobile;

    hide.pause();

    if (reduce.matches) {
      show.pause();
      return;
    }

    var play = show.play();
    if (play && typeof play.catch === "function") play.catch(function () {});
  }

  if (mq.addEventListener) mq.addEventListener("change", apply);
  else mq.addListener(apply);
  if (reduce.addEventListener) reduce.addEventListener("change", apply);
  else reduce.addListener(apply);

  apply();
})();

(function () {
  var lists = document.querySelectorAll(".blog-box_list");
  if (!lists.length) return;

  var DRAG_THRESHOLD = 6;
  var desktopMq = window.matchMedia("(hover: hover) and (pointer: fine)");

  function canScroll(el) {
    return el.scrollWidth - el.clientWidth > 1;
  }

  function isDesktopPointer(e) {
    return e.pointerType === "mouse" || e.pointerType === "pen";
  }

  lists.forEach(function (el) {
    el.addEventListener(
      "wheel",
      function (e) {
        if (!desktopMq.matches) return;
        e.preventDefault();
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          var dy = e.deltaY;
          if (e.deltaMode === 1) dy *= 16;
          else if (e.deltaMode === 2) dy *= window.innerHeight;
          window.scrollBy(0, dy);
        }
      },
      { passive: false }
    );

    var pointerId = null;
    var startX = 0;
    var startScroll = 0;
    var dragged = false;

    function endDrag(e) {
      if (pointerId === null || (e && e.pointerId !== pointerId)) return;
      el.classList.remove("is-dragging");
      try {
        el.releasePointerCapture(pointerId);
      } catch (err) {}
      pointerId = null;
    }

    el.addEventListener("pointerdown", function (e) {
      if (!isDesktopPointer(e)) return;
      if (e.button !== 0) return;
      if (!canScroll(el)) return;
      pointerId = e.pointerId;
      startX = e.clientX;
      startScroll = el.scrollLeft;
      dragged = false;
      el.classList.add("is-dragging");
      el.setPointerCapture(e.pointerId);
    });

    el.addEventListener("pointermove", function (e) {
      if (e.pointerId !== pointerId) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > DRAG_THRESHOLD) dragged = true;
      el.scrollLeft = startScroll - dx;
    });

    el.addEventListener("pointerup", endDrag);
    el.addEventListener("pointercancel", endDrag);
    el.addEventListener("lostpointercapture", function () {
      el.classList.remove("is-dragging");
      pointerId = null;
    });

    el.addEventListener(
      "click",
      function (e) {
        if (!dragged) return;
        e.preventDefault();
        e.stopPropagation();
        dragged = false;
      },
      true
    );
  });
})();

