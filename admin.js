const settingsKey = "bdSiteSettings";
const adminPin = "bd-admin-2026";
const login = document.querySelector("[data-login]");
const panel = document.querySelector("[data-panel]");
const loginForm = document.querySelector("[data-login-form]");
const adminForm = document.querySelector("[data-admin-form]");
const eventsContainer = document.querySelector("[data-events]");
const programCardsContainer = document.querySelector("[data-program-cards]");
const linksContainer = document.querySelector("[data-links]");
const statusText = document.querySelector("[data-status]");

const linkLabels = {
  instagram: "Instagram",
  spotify: "Spotify podcast",
  workshop: "Sağlıklı Beslenme Atölyesi",
  book: "Kitap linki",
  postNaturalOzempic: "Doğal ozempic gönderisi",
  postInsulinDrinks: "İnsülin direncine 4 içecek",
  postTartidanOte: "Tartıdan öte / metabolik sağlık",
  postKabizlik: "Kabızlık gönderisi",
  postProtein: "Protein tozu gönderisi",
  postBeliniOlc: "Belini ölç gönderisi",
};

const escapeAttribute = (value) =>
  String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const mergeSettings = (defaults, saved) => ({
  ...defaults,
  ...saved,
  links: {
    ...defaults.links,
    ...(saved?.links || {}),
  },
  calendar: {
    ...defaults.calendar,
    ...(saved?.calendar || {}),
    events: saved?.calendar?.events || defaults.calendar.events,
  },
  programCards: saved?.programCards || defaults.programCards,
});

const loadSettings = () => {
  try {
    return mergeSettings(window.BD_DEFAULT_SETTINGS, JSON.parse(localStorage.getItem(settingsKey)) || {});
  } catch {
    return window.BD_DEFAULT_SETTINGS;
  }
};

let settings = loadSettings();

const showPanel = () => {
  login.hidden = true;
  panel.hidden = false;
  renderForm();
};

const setStatus = (message) => {
  statusText.textContent = message;
  window.setTimeout(() => {
    statusText.textContent = "";
  }, 2400);
};

const eventTemplate = (eventItem = { day: "", note: "" }) => {
  const row = document.createElement("div");
  row.className = "admin-event";
  row.innerHTML = `
    <label>
      <span>Gün</span>
      <input type="number" min="1" max="31" value="${escapeAttribute(eventItem.day)}" data-event-day required />
    </label>
    <label>
      <span>Not</span>
      <input type="text" value="${escapeAttribute(eventItem.note)}" data-event-note required />
    </label>
    <button class="button ghost remove-event" type="button">Sil</button>
  `;

  row.querySelector(".remove-event").addEventListener("click", () => row.remove());
  return row;
};

const programCardTemplate = (card = { label: "", title: "", description: "" }) => {
  const row = document.createElement("div");
  row.className = "admin-program-card";
  row.innerHTML = `
    <label>
      <span>Üst etiket</span>
      <input type="text" value="${escapeAttribute(card.label)}" data-program-label required />
    </label>
    <label>
      <span>Başlık</span>
      <input type="text" value="${escapeAttribute(card.title)}" data-program-title required />
    </label>
    <label class="wide-field">
      <span>Açıklama</span>
      <textarea rows="3" data-program-description required>${escapeAttribute(card.description)}</textarea>
    </label>
    <button class="button ghost remove-program-card" type="button">Sil</button>
  `;

  row.querySelector(".remove-program-card").addEventListener("click", () => row.remove());
  return row;
};

const renderForm = () => {
  adminForm.elements.contactEmail.value = settings.contactEmail;
  adminForm.elements.month.value = settings.calendar.month;
  adminForm.elements.year.value = settings.calendar.year;
  adminForm.elements.daysInMonth.value = settings.calendar.daysInMonth;
  adminForm.elements.startBlankCount.value = settings.calendar.startBlankCount;

  eventsContainer.innerHTML = "";
  settings.calendar.events.forEach((eventItem) => {
    eventsContainer.append(eventTemplate(eventItem));
  });

  programCardsContainer.innerHTML = "";
  settings.programCards.forEach((card) => {
    programCardsContainer.append(programCardTemplate(card));
  });

  linksContainer.innerHTML = "";
  Object.entries(settings.links).forEach(([key, value]) => {
    const label = document.createElement("label");
    label.innerHTML = `
      <span>${linkLabels[key] || key}</span>
      <input type="text" name="${key}" value="${escapeAttribute(value)}" data-managed-link />
    `;
    linksContainer.append(label);
  });
};

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (loginForm.elements.pin.value === adminPin) {
    sessionStorage.setItem("bdAdminUnlocked", "true");
    showPanel();
    return;
  }

  loginForm.elements.pin.setCustomValidity("Admin kodu hatalı.");
  loginForm.elements.pin.reportValidity();
  loginForm.elements.pin.setCustomValidity("");
});

document.querySelector("[data-add-event]").addEventListener("click", () => {
  eventsContainer.append(eventTemplate());
});

document.querySelector("[data-add-program-card]").addEventListener("click", () => {
  programCardsContainer.append(programCardTemplate());
});

adminForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const links = {};
  linksContainer.querySelectorAll("[data-managed-link]").forEach((input) => {
    links[input.name] = input.value.trim();
  });

  const events = [...eventsContainer.querySelectorAll(".admin-event")]
    .map((row) => ({
      day: Number(row.querySelector("[data-event-day]").value),
      note: row.querySelector("[data-event-note]").value.trim(),
    }))
    .filter((eventItem) => eventItem.day && eventItem.note);

  const programCards = [...programCardsContainer.querySelectorAll(".admin-program-card")]
    .map((row) => ({
      label: row.querySelector("[data-program-label]").value.trim(),
      title: row.querySelector("[data-program-title]").value.trim(),
      description: row.querySelector("[data-program-description]").value.trim(),
    }))
    .filter((card) => card.label && card.title && card.description);

  settings = {
    contactEmail: adminForm.elements.contactEmail.value.trim(),
    links,
    programCards,
    calendar: {
      month: adminForm.elements.month.value.trim(),
      year: adminForm.elements.year.value.trim(),
      daysInMonth: Number(adminForm.elements.daysInMonth.value),
      startBlankCount: Number(adminForm.elements.startBlankCount.value),
      events,
    },
  };

  localStorage.setItem(settingsKey, JSON.stringify(settings));
  setStatus("Kaydedildi. Siteye dönüp sayfayı yenileyin.");
});

document.querySelector("[data-reset]").addEventListener("click", () => {
  localStorage.removeItem(settingsKey);
  settings = loadSettings();
  renderForm();
  setStatus("Varsayılan ayarlara dönüldü.");
});

if (sessionStorage.getItem("bdAdminUnlocked") === "true") {
  showPanel();
}
