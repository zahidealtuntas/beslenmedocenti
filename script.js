const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const toggle = document.querySelector("[data-menu-toggle]");
const menuClose = document.querySelector("[data-menu-close]");
const questionPanel = document.querySelector("[data-question-panel]");
const questionOpen = document.querySelector("[data-question-open]");
const questionClose = document.querySelector("[data-question-close]");
const questionForm = document.querySelector("[data-question-form]");
const editableCalendar = document.querySelector("[data-editable-calendar]");
const programList = document.querySelector("[data-program-list]");
const settingsKey = "bdSiteSettings";
const settingsPath = "data/settings.json";
const blockedEmailParts = [
  "example",
  "fake",
  "mailinator",
  "test",
  "trashmail",
  "yopmail",
];

const mergeSettings = (defaults, saved) => ({
  ...defaults,
  ...saved,
  links: {
    ...defaults.links,
    ...(saved?.links || {}),
  },
  book: {
    ...defaults.book,
    ...(saved?.book || {}),
  },
  calendar: {
    ...defaults.calendar,
    ...(saved?.calendar || {}),
    events: saved?.calendar?.events || defaults.calendar.events,
  },
  programCards: saved?.programCards || defaults.programCards,
});

const loadLocalSettings = () => {
  try {
    const savedSettings = JSON.parse(localStorage.getItem(settingsKey));
    return mergeSettings(window.BD_DEFAULT_SETTINGS, savedSettings || {});
  } catch {
    return window.BD_DEFAULT_SETTINGS;
  }
};

const loadSiteSettings = async () => {
  try {
    const response = await fetch(`${settingsPath}?v=${Date.now()}`, { cache: "no-store" });

    if (!response.ok) {
      throw new Error("Settings file could not be loaded.");
    }

    const fileSettings = await response.json();
    return mergeSettings(window.BD_DEFAULT_SETTINGS, fileSettings);
  } catch {
    return loadLocalSettings();
  }
};

let siteSettings = window.BD_DEFAULT_SETTINGS;

const applyManagedLinks = () => {
  document.querySelectorAll("[data-link]").forEach((link) => {
    const linkName = link.dataset.link;
    const url = siteSettings.links[linkName];

    if (url) {
      link.href = url;
    }
  });

  document.querySelectorAll("[data-contact-email]").forEach((link) => {
    link.href = `mailto:${siteSettings.contactEmail}`;
    link.textContent = siteSettings.contactEmail;
  });

  document.querySelectorAll("[data-contact-mail]").forEach((link) => {
    link.href = `mailto:${siteSettings.contactEmail}?subject=${encodeURIComponent("Görüşlerinizi iletin")}`;
  });
};

const renderProgramCards = () => {
  if (!programList) {
    return;
  }

  programList.innerHTML = "";

  siteSettings.programCards.forEach((card) => {
    const article = document.createElement("article");
    const label = document.createElement("span");
    const title = document.createElement("strong");
    const description = document.createElement("p");

    label.textContent = card.label;
    title.textContent = card.title;
    description.textContent = card.description;

    article.append(label, title, description);
    programList.append(article);
  });
};

const renderBookCard = () => {
  const bookCard = document.querySelector("[data-book-card]");

  if (!bookCard || !siteSettings.book) {
    return;
  }

  const bookImage = bookCard.querySelector("[data-book-image]");
  const bookLabel = bookCard.querySelector("[data-book-label]");
  const bookTitle = bookCard.querySelector("[data-book-title]");
  const bookDescription = bookCard.querySelector("[data-book-description]");

  if (bookImage && siteSettings.book.image) {
    bookImage.src = siteSettings.book.image;
    bookImage.alt = siteSettings.book.imageAlt || "";
  }

  if (bookLabel) {
    bookLabel.textContent = siteSettings.book.label || "";
  }

  if (bookTitle) {
    bookTitle.textContent = siteSettings.book.title || "";
  }

  if (bookDescription) {
    bookDescription.textContent = siteSettings.book.description || "";
  }
};

const syncHeader = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 12);
};

syncHeader();
window.addEventListener("scroll", syncHeader, { passive: true });

toggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  document.body.classList.toggle("menu-open", isOpen);
  toggle.setAttribute("aria-expanded", String(isOpen));
  toggle.setAttribute("aria-label", isOpen ? "Menüyü kapat" : "Menüyü aç");
});

const closeMenu = () => {
  nav.classList.remove("is-open");
  document.body.classList.remove("menu-open");
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-label", "Menüyü aç");
};

menuClose.addEventListener("click", closeMenu);

nav.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    closeMenu();
  }

  if (event.target === nav) {
    closeMenu();
  }
});

const openQuestionPanel = () => {
  questionPanel.classList.add("is-open");
  questionPanel.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  questionForm.elements.email.focus();
};

const closeQuestionPanel = () => {
  questionPanel.classList.remove("is-open");
  questionPanel.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  questionOpen.focus();
};

questionOpen.addEventListener("click", openQuestionPanel);
questionClose.addEventListener("click", closeQuestionPanel);

questionPanel.addEventListener("click", (event) => {
  if (event.target === questionPanel) {
    closeQuestionPanel();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && questionPanel.classList.contains("is-open")) {
    closeQuestionPanel();
  }
});

const renderEditableCalendar = () => {
  if (!editableCalendar) {
    return;
  }

  const month = editableCalendar.querySelector("[data-calendar-month]");
  const year = editableCalendar.querySelector("[data-calendar-year]");
  const days = editableCalendar.querySelector("[data-calendar-days]");
  const notes = editableCalendar.querySelector("[data-calendar-notes]");
  const calendarSettings = siteSettings.calendar;
  const eventDays = new Set(calendarSettings.events.map((eventItem) => Number(eventItem.day)));

  month.textContent = calendarSettings.month;
  year.textContent = calendarSettings.year;
  days.innerHTML = "";
  notes.innerHTML = "";

  for (let index = 0; index < calendarSettings.startBlankCount; index += 1) {
    days.append(document.createElement("span"));
  }

  for (let day = 1; day <= calendarSettings.daysInMonth; day += 1) {
    const dayCell = document.createElement("span");
    dayCell.textContent = String(day);

    if (eventDays.has(day)) {
      dayCell.classList.add("is-event");
      dayCell.setAttribute("aria-label", `${day} ${calendarSettings.month} etkinlik var`);
    }

    days.append(dayCell);
  }

  calendarSettings.events.forEach((eventItem) => {
    const note = document.createElement("div");
    note.className = "event-calendar-note";
    note.textContent = `${eventItem.day} ${calendarSettings.month}: ${eventItem.note}`;
    notes.append(note);
  });
};

const initManagedContent = async () => {
  siteSettings = await loadSiteSettings();
  applyManagedLinks();
  renderProgramCards();
  renderBookCard();
  renderEditableCalendar();
};

initManagedContent();

const isLikelyRealEmail = (email) => {
  const normalizedEmail = email.toLowerCase();
  const [localPart, domain = ""] = normalizedEmail.split("@");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizedEmail)) {
    return false;
  }

  if (localPart.length < 2 || domain.length < 5) {
    return false;
  }

  return !blockedEmailParts.some((blockedPart) => normalizedEmail.includes(blockedPart));
};

questionForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(questionForm);
  const senderEmail = formData.get("email").trim();
  const message = formData.get("message").trim();

  if (!isLikelyRealEmail(senderEmail)) {
    questionForm.elements.email.setCustomValidity("Lutfen aktif kullandiginiz gercek bir e-posta adresi yazin.");
    questionForm.elements.email.reportValidity();
    return;
  }

  questionForm.elements.email.setCustomValidity("");

  const subject = "Web sitesinden soru";
  const body = [
    "Merhaba,",
    "",
    message,
    "",
    `Gonderen e-posta: ${senderEmail}`,
  ].join("\n");

  window.location.href = `mailto:${siteSettings.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}
