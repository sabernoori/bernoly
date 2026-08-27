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
  var heading = list.querySelector(".process_heading.is-list-title");
  var count = items.length;
  if (!count) return;

  var reducedMq = window.matchMedia("(prefers-reduced-motion: reduce)");
  var desktopMq = window.matchMedia("(min-width: 992px)");
  var ticking = false;
  var scaleMin = 0.92;
  var unit = 1 / count;
  var fade = unit * 0.58;

  function setTrackHeight() {
    if (reducedMq.matches) {
      section.style.height = "";
      return;
    }
    section.style.height = "calc(100vh * " + (count + 1.5) + ")";
  }

  function clamp01(t) {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    return t;
  }

  function smootherstep(t) {
    t = clamp01(t);
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  function cardMotion(index, progress) {
    var start = index * unit;
    var shown = start + fade;
    var leave = (index + 1) * unit;
    var gone = leave + fade;
    var from = 1;
    var opacity = 0;
    var scale = scaleMin;

    function enterAt(t) {
      var eased = smootherstep(t);
      from = 1 - eased;
      opacity = eased;
      scale = scaleMin + (1 - scaleMin) * eased;
    }

    function leaveAt(t) {
      var eased = smootherstep(t);
      from = -eased;
      opacity = 1 - eased;
      scale = 1 - (1 - scaleMin) * eased;
    }

    if (index === count - 1) {
      if (progress <= start) enterAt(0);
      else if (progress < shown) enterAt((progress - start) / fade);
      else {
        from = 0;
        opacity = 1;
        scale = 1;
      }
      return { from: from, opacity: opacity, scale: scale };
    }

    if (progress <= start) enterAt(0);
    else if (progress < shown) enterAt((progress - start) / fade);
    else if (progress < leave) {
      from = 0;
      opacity = 1;
      scale = 1;
    } else if (progress < gone) leaveAt((progress - leave) / fade);
    else leaveAt(1);

    return { from: from, opacity: opacity, scale: scale };
  }

  function pinProgress() {
    var rect = section.getBoundingClientRect();
    var view = window.innerHeight;
    var range = section.offsetHeight - view;
    if (range <= 0) return 0;
    return Math.max(0, Math.min(1, -rect.top / range));
  }

  function listGap() {
    var styles = window.getComputedStyle(list);
    var gap = parseFloat(styles.rowGap);
    if (isNaN(gap)) gap = parseFloat(styles.gap);
    return isNaN(gap) ? 0 : gap;
  }

  // On mobile, cards travel up over the title. Keep them solid until the
  // card has cleared the heading, then fade out on the remaining travel.
  function leaveOpacity(el, y, travelY) {
    var up = -y;
    var passY = (heading ? heading.offsetHeight : 0) + listGap() + el.offsetHeight;
    var fadeStart = Math.min(passY, travelY * 0.78);
    if (up <= fadeStart) return 1;
    return 1 - smootherstep((up - fadeStart) / Math.max(travelY - fadeStart, 1));
  }

  function render() {
    ticking = false;
    if (reducedMq.matches) return;

    var progress = pinProgress();
    var desktop = desktopMq.matches;
    var viewW = window.innerWidth;
    var viewH = window.innerHeight;

    for (var i = 0; i < count; i++) {
      var motion = cardMotion(i, progress);
      var el = items[i];
      var travelX = (viewW + el.offsetWidth) / 2;
      var travelY = (viewH + el.offsetHeight) / 2;
      var x = desktop ? motion.from * travelX : 0;
      var y = desktop ? 0 : motion.from * travelY;
      var opacity =
        !desktop && y < 0 ? leaveOpacity(el, y, travelY) : motion.opacity;
      el.style.opacity = String(opacity);
      el.style.transform =
        "translate3d(" + x + "px, " + y + "px, 0) scale(" + motion.scale + ")";
      el.style.pointerEvents = opacity > 0.55 ? "auto" : "none";
    }
  }

  function onScroll() {
    if (ticking || reducedMq.matches) return;
    ticking = true;
    window.requestAnimationFrame(render);
  }

  function onChange() {
    if (reducedMq.matches) {
      setTrackHeight();
      for (var i = 0; i < count; i++) {
        items[i].style.opacity = "";
        items[i].style.transform = "";
        items[i].style.pointerEvents = "";
      }
      return;
    }
    setTrackHeight();
    render();
  }

  setTrackHeight();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  desktopMq.addEventListener("change", onChange);
  reducedMq.addEventListener("change", onChange);
  render();
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

