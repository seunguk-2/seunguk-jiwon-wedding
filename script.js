const invitationContent = window.INVITATION_CONTENT;
const KOREA_STANDARD_TIME_OFFSET = "+09:00";
const weddingDate = new Date(invitationContent.weddingDateTime);
const header = document.querySelector("[data-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const siteNav = document.querySelector("[data-site-nav]");
const countdownDays = document.querySelector("[data-countdown-days]");
const languageOptions = document.querySelectorAll("[data-language-option]");
const contactEmail = document.querySelector("[data-contact-email]");
const heroImage = document.querySelector("[data-hero-image]");
const bouquetImage = document.querySelector("[data-bouquet-image]");
const photoGrid = document.querySelector("[data-photo-grid]");
const lightbox = document.querySelector("[data-lightbox]");
const lightboxImage = document.querySelector("[data-lightbox-image]");
const lightboxStatus = document.querySelector("[data-lightbox-status]");
const lightboxCloseButtons = document.querySelectorAll("[data-lightbox-close]");
const lightboxPrev = document.querySelector("[data-lightbox-prev]");
const lightboxNext = document.querySelector("[data-lightbox-next]");
const supportedLanguages = Object.keys(invitationContent.languages);
const savedLanguage = getSavedLanguage();
let currentLanguage = supportedLanguages.includes(savedLanguage) ? savedLanguage : invitationContent.defaultLanguage;
let currentGalleryIndex = 0;
let lastFocusedElement = null;
let lastTouchEnd = 0;

function preventPageZoom(event) {
  event.preventDefault();
}

document.addEventListener("gesturestart", preventPageZoom, { passive: false });
document.addEventListener("gesturechange", preventPageZoom, { passive: false });
document.addEventListener("gestureend", preventPageZoom, { passive: false });
document.addEventListener(
  "touchmove",
  (event) => {
    if (event.touches.length > 1) {
      event.preventDefault();
    }
  },
  { passive: false },
);
document.addEventListener(
  "touchend",
  (event) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  },
  { passive: false },
);

function getSavedLanguage() {
  try {
    return localStorage.getItem("invitation-language");
  } catch {
    return null;
  }
}

function saveLanguage(language) {
  try {
    localStorage.setItem("invitation-language", language);
  } catch {
    // The switch still works for this visit if browser storage is unavailable.
  }
}

function getContent(path) {
  return path.split(".").reduce((value, key) => value?.[key], invitationContent.languages[currentLanguage]);
}

function updateHeader() {
  header.classList.toggle("is-scrolled", window.scrollY > 24);
}

function getNavToggleLabel() {
  const isOpen = navToggle.getAttribute("aria-expanded") === "true";
  return getContent(isOpen ? "nav.close" : "nav.open");
}

function updateCountdown() {
  if (!invitationContent.weddingDateTime.endsWith(KOREA_STANDARD_TIME_OFFSET)) {
    throw new Error("weddingDateTime must include +09:00 for Korea Standard Time.");
  }

  const now = new Date();
  const msRemaining = weddingDate - now;
  const daysRemaining = Math.max(0, Math.ceil(msRemaining / 86400000));
  countdownDays.textContent = String(daysRemaining);
}

function renderGallery() {
  if (!photoGrid) {
    return;
  }

  const galleryAlt = getContent("images.galleryAlt") || "";
  photoGrid.textContent = "";

  invitationContent.assets.galleryImages.forEach((src, index) => {
    const figure = document.createElement("figure");
    figure.className = index % 5 === 0 ? "photo-tile photo-tile-wide" : "photo-tile";

    const button = document.createElement("button");
    button.className = "photo-button";
    button.type = "button";
    button.setAttribute("aria-label", getLightboxStatus(index));
    button.addEventListener("click", () => openLightbox(index));

    const image = document.createElement("img");
    image.src = src;
    image.alt = `${galleryAlt} ${index + 1}`.trim();
    image.loading = "lazy";
    image.decoding = "async";
    image.fetchPriority = "low";
    image.width = 1066;
    image.height = 1600;
    image.sizes = "(min-width: 768px) 34vw, calc(100vw - 2rem)";

    button.append(image);
    figure.append(button);
    photoGrid.append(figure);
  });
}

function getLightboxStatus(index) {
  const template = getContent("lightbox.status") || "Photo {current} of {total}";
  return template
    .replace("{current}", String(index + 1))
    .replace("{total}", String(invitationContent.assets.galleryImages.length));
}

function updateLightboxImage() {
  if (!lightboxImage || !lightboxStatus) {
    return;
  }

  const galleryAlt = getContent("images.galleryAlt") || "";
  lightboxImage.src = invitationContent.assets.galleryImages[currentGalleryIndex];
  lightboxImage.alt = `${galleryAlt} ${currentGalleryIndex + 1}`.trim();
  lightboxStatus.textContent = getLightboxStatus(currentGalleryIndex);
}

function openLightbox(index) {
  if (!lightbox) {
    return;
  }

  lastFocusedElement = document.activeElement;
  currentGalleryIndex = index;
  updateLightboxImage();
  lightbox.hidden = false;
  document.body.classList.add("lightbox-open");
  lightboxCloseButtons[0]?.focus();
}

function closeLightbox() {
  if (!lightbox) {
    return;
  }

  lightbox.hidden = true;
  document.body.classList.remove("lightbox-open");
  lightboxImage?.removeAttribute("src");

  if (lastFocusedElement instanceof HTMLElement) {
    lastFocusedElement.focus();
  }
}

function showAdjacentPhoto(direction) {
  const total = invitationContent.assets.galleryImages.length;
  currentGalleryIndex = (currentGalleryIndex + direction + total) % total;
  updateLightboxImage();
}

function applyContent() {
  document.documentElement.lang = currentLanguage;
  document.title = getContent("meta.title");

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const value = getContent(element.dataset.i18n);
    if (value !== undefined) {
      element.textContent = value;
    }
  });

  document.querySelectorAll("[data-i18n-content]").forEach((element) => {
    const value = getContent(element.dataset.i18nContent);
    if (value !== undefined) {
      element.setAttribute("content", value);
    }
  });

  document.querySelectorAll("[data-i18n-alt]").forEach((element) => {
    const value = getContent(element.dataset.i18nAlt);
    if (value !== undefined) {
      element.setAttribute("alt", value);
    }
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    const value = getContent(element.dataset.i18nAriaLabel);
    if (value !== undefined) {
      element.setAttribute("aria-label", value);
    }
  });

  if (contactEmail) {
    contactEmail.textContent = invitationContent.email;
    contactEmail.href = `mailto:${invitationContent.email}`;
  }

  if (heroImage) {
    heroImage.src = invitationContent.assets.heroImage;
  }

  if (bouquetImage) {
    bouquetImage.src = invitationContent.assets.bouquetImage;
  }

  renderGallery();
  if (lightbox && !lightbox.hidden) {
    updateLightboxImage();
  }

  navToggle.setAttribute("aria-label", getNavToggleLabel());

  languageOptions.forEach((button) => {
    const isActive = button.dataset.languageOption === currentLanguage;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  updateCountdown();
}

navToggle.addEventListener("click", () => {
  const isOpen = navToggle.getAttribute("aria-expanded") === "true";
  navToggle.setAttribute("aria-expanded", String(!isOpen));
  navToggle.setAttribute("aria-label", getNavToggleLabel());
  siteNav.classList.toggle("is-open", !isOpen);
  header.classList.toggle("nav-active", !isOpen);
  document.body.classList.toggle("nav-open", !isOpen);
});

siteNav.addEventListener("click", (event) => {
  if (!(event.target instanceof HTMLAnchorElement)) {
    return;
  }

  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", getNavToggleLabel());
  siteNav.classList.remove("is-open");
  header.classList.remove("nav-active");
  document.body.classList.remove("nav-open");
});

languageOptions.forEach((button) => {
  button.addEventListener("click", () => {
    currentLanguage = button.dataset.languageOption;
    saveLanguage(currentLanguage);
    applyContent();
  });
});

lightboxCloseButtons.forEach((button) => {
  button.addEventListener("click", closeLightbox);
});

lightboxPrev?.addEventListener("click", () => showAdjacentPhoto(-1));
lightboxNext?.addEventListener("click", () => showAdjacentPhoto(1));

document.addEventListener("keydown", (event) => {
  if (!lightbox || lightbox.hidden) {
    return;
  }

  if (event.key === "Escape") {
    event.preventDefault();
    closeLightbox();
  }

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    showAdjacentPhoto(-1);
  }

  if (event.key === "ArrowRight") {
    event.preventDefault();
    showAdjacentPhoto(1);
  }
});

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();
applyContent();
