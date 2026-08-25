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
  if (window.__bernolyProcessStack) return;
  window.__bernolyProcessStack = true;

  var StackCards = function (element) {
    this.element = element;
    this.heading = this.element.querySelector(":scope > .process_heading");
    this.items = this.element.getElementsByClassName("process_card-item");
    this.scrollingFn = false;
    this.scrolling = false;
    initStackCardsEffect(this);
    initStackCardsResize(this);
  };

  function initStackCardsEffect(element) {
    setStackCards(element);
    new IntersectionObserver(stackCardsCallback.bind(element), {
      threshold: [0, 1],
    }).observe(element.element);
  }

  function initStackCardsResize(element) {
    element.element.addEventListener("resize-stack-cards", function () {
      setStackCards(element);
      animateStackCards.call(element);
    });
  }

  function stackCardsCallback(entries) {
    if (entries[0].isIntersecting) {
      if (this.scrollingFn) return;
      stackCardsInitEvent(this);
    } else {
      if (!this.scrollingFn) return;
      window.removeEventListener("scroll", this.scrollingFn);
      this.scrollingFn = false;
    }
  }

  function stackCardsInitEvent(element) {
    element.scrollingFn = stackCardsScrolling.bind(element);
    window.addEventListener("scroll", element.scrollingFn);
  }

  function stackCardsScrolling() {
    if (this.scrolling) return;
    this.scrolling = true;
    window.requestAnimationFrame(animateStackCards.bind(this));
  }

  function setHeadingOffset(element) {
    if (!element.heading) {
      element.element.style.setProperty("--process-heading-height", "0px");
      return;
    }
    var styles = getComputedStyle(element.heading);
    var height =
      element.heading.offsetHeight +
      (parseFloat(styles.marginTop) || 0) +
      (parseFloat(styles.marginBottom) || 0);
    element.element.style.setProperty("--process-heading-height", height + "px");
  }

  function setStackCards(element) {
    if (!element.items.length) return;
    setHeadingOffset(element);
    element.marginY = getComputedStyle(element.element).getPropertyValue(
      "--stack-cards-gap"
    );
    getIntegerFromProperty(element);
    element.elementHeight = element.element.offsetHeight;

    var cardStyle = getComputedStyle(element.items[0]);
    element.cardTop = Math.floor(parseFloat(cardStyle.getPropertyValue("top"))) || 0;
    element.cardHeight = element.items[0].offsetHeight;
    element.windowHeight = window.innerHeight;

    if (isNaN(element.marginY)) {
      element.element.style.paddingBottom = "0px";
    } else {
      element.element.style.paddingBottom =
        element.marginY * (element.items.length - 1) + "px";
    }

    for (var i = 0; i < element.items.length; i++) {
      element.items[i].style.transform = isNaN(element.marginY)
        ? "none"
        : "translateY(" + element.marginY * i + "px)";
    }
  }

  function getIntegerFromProperty(element) {
    var node = document.createElement("div");
    node.setAttribute(
      "style",
      "opacity:0;visibility:hidden;position:absolute;height:" + element.marginY
    );
    element.element.appendChild(node);
    element.marginY = parseInt(getComputedStyle(node).getPropertyValue("height"), 10);
    element.element.removeChild(node);
  }

  function animateStackCards() {
    if (isNaN(this.marginY) || !this.cardHeight) {
      this.scrolling = false;
      return;
    }

    var top = this.element.getBoundingClientRect().top;

    if (
      this.cardTop -
        top +
        this.windowHeight -
        this.elementHeight -
        this.cardHeight +
        this.marginY +
        this.marginY * this.items.length >
      0
    ) {
      this.scrolling = false;
      return;
    }

    for (var i = 0; i < this.items.length; i++) {
      var scrolling = this.cardTop - top - i * (this.cardHeight + this.marginY);
      if (scrolling > 0) {
        var scaling =
          i == this.items.length - 1
            ? 1
            : (this.cardHeight - scrolling * 0.05) / this.cardHeight;
        this.items[i].style.transform =
          "translateY(" + this.marginY * i + "px) scale(" + scaling + ")";
      } else {
        this.items[i].style.transform = "translateY(" + this.marginY * i + "px)";
      }
    }

    this.scrolling = false;
  }

  var stackCards = document.getElementsByClassName("process_cards-list");
  var intersectionObserverSupported =
    "IntersectionObserver" in window &&
    "IntersectionObserverEntry" in window &&
    "intersectionRatio" in window.IntersectionObserverEntry.prototype;
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (stackCards.length > 0 && intersectionObserverSupported && !reducedMotion) {
    var stackCardsArray = [];
    for (var i = 0; i < stackCards.length; i++) {
      stackCardsArray.push(new StackCards(stackCards[i]));
    }

    var resizingId = false;
    var customEvent = new CustomEvent("resize-stack-cards");
    window.addEventListener("resize", function () {
      clearTimeout(resizingId);
      resizingId = setTimeout(function () {
        for (var r = 0; r < stackCardsArray.length; r++) {
          stackCardsArray[r].element.dispatchEvent(customEvent);
        }
      }, 500);
    });
  }
})();
