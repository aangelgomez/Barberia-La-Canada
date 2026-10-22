// Barbería La Cañada — servicios, horarios y reserva de turnos por WhatsApp

// Número de WhatsApp del local (formato internacional sin "+", ej. 5493511234567).
// Vacío = WhatsApp pide elegir el contacto, útil para la demo.
const WHATSAPP = "";

const SERVICES = [
  { id: "corte", name: "Corte", desc: "Tijera o máquina, lavado y peinado.", min: 30, price: 12000 },
  { id: "fade", name: "Corte fade", desc: "Degradado a navaja con terminación prolija.", min: 45, price: 14000 },
  { id: "barba", name: "Barba", desc: "Perfilado, navaja y toalla caliente.", min: 30, price: 8000 },
  { id: "combo", name: "Corte + barba", desc: "El servicio completo.", min: 60, price: 18500 },
  { id: "cejas", name: "Perfilado de cejas", desc: "Con navaja o pinza.", min: 15, price: 4000 },
  { id: "color", name: "Color / decoloración", desc: "Incluye matizado. Consultá por diseños.", min: 90, price: 26000 },
];
const BARBERS = [
  { id: "any", name: "El primero libre", desc: "Más horarios disponibles" },
  { id: "nico", name: "Nico", desc: "Fades y degradados" },
  { id: "tomas", name: "Tomás", desc: "Barba y navaja" },
  { id: "lucia", name: "Lucía", desc: "Clásicos, tijera y color" },
];
// Horario por día de la semana (0 = domingo). null = cerrado.
const HOURS = { 0: null, 1: null, 2: [10, 20], 3: [10, 20], 4: [10, 20], 5: [10, 20], 6: [9, 18] };
const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const ars = n => "$" + n.toLocaleString("es-AR");
const pad = n => String(n).padStart(2, "0");
const fmt = m => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;

function isOpen(d = new Date()) {
  const h = HOURS[d.getDay()]; if (!h) return false;
  const m = d.getHours() * 60 + d.getMinutes();
  return m >= h[0] * 60 && m < h[1] * 60;
}

// ---------- Inicio ----------
const live = document.getElementById("live");
if (live) {
  const open = isOpen();
  live.dataset.open = open;
  const h = HOURS[new Date().getDay()];
  live.textContent = open ? `Abierto hasta las ${h[1]}:00` : (h ? "Cerrado ahora" : "Hoy cerrado");
}
const priceList = document.getElementById("price-list");
if (priceList) {
  priceList.innerHTML = SERVICES.map(s => `
    <div class="price-row"><h3>${s.name}</h3><span class="amt">${ars(s.price)}</span>
    <p>${s.desc} <span class="dur">· ${s.min} min</span></p></div>`).join("");
}
const hoursTable = document.getElementById("hours");
if (hoursTable) {
  const today = new Date().getDay();
  hoursTable.innerHTML = [2, 3, 4, 5, 6, 0, 1].map(d => `<tr class="${d === today ? "today" : ""}"><td>${DAY_NAMES[d]}</td><td>${HOURS[d] ? `${HOURS[d][0]}:00 – ${HOURS[d][1]}:00` : "Cerrado"}</td></tr>`).join("");
}

// ---------- Turnos ----------
const form = document.getElementById("form");
if (form) {
  const state = { service: null, barber: "any", day: null, time: null };

  const radio = (group, item, extra = "") => `
    <div class="opt"><input type="radio" name="${group}" id="${group}-${item.id}" value="${item.id}"${group === "barber" && item.id === "any" ? " checked" : ""}>
    <label for="${group}-${item.id}"><b>${item.name}</b>${extra}<small>${item.desc}</small></label></div>`;
  document.getElementById("services").innerHTML = SERVICES.map(s => radio("service", s, `<span class="amt">${ars(s.price)}</span>`)).join("");
  document.getElementById("barbers").innerHTML = BARBERS.map(b => radio("barber", b)).join("");

  // Próximos 10 días con atención
  const days = [];
  for (let i = 0, d = new Date(); days.length < 10 && i < 20; i++) {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i);
    if (HOURS[x.getDay()]) days.push(x);
  }
  const daysEl = document.getElementById("days");
  daysEl.innerHTML = days.map((x, i) => `<button type="button" class="day" data-i="${i}" aria-pressed="false">
    <small>${DAY_NAMES[x.getDay()].slice(0, 3)}</small><b>${x.getDate()}</b></button>`).join("");

  // Turnos ocupados simulados (siempre los mismos para un mismo día y barbero)
  function taken(date, minute, barber) {
    const seed = date.getDate() * 31 + date.getMonth() * 7 + minute + barber.length * 13;
    const r = Math.abs(Math.sin(seed) * 10000) % 1;
    return r < (barber === "any" ? 0.22 : 0.45);
  }

  function renderSlots() {
    const slotsEl = document.getElementById("slots");
    const hint = document.getElementById("slot-hint");
    if (state.day === null) { slotsEl.innerHTML = ""; hint.hidden = false; return; }
    hint.hidden = true;
    const date = days[state.day];
    const [open, close] = HOURS[date.getDay()];
    const dur = state.service ? SERVICES.find(s => s.id === state.service).min : 30;
    const now = new Date();
    const out = [];
    for (let m = open * 60; m + dur <= close * 60; m += 30) {
      const past = date.toDateString() === now.toDateString() && m <= now.getHours() * 60 + now.getMinutes();
      const busy = past || taken(date, m, state.barber);
      if (state.time === m && busy) state.time = null;
      out.push(`<button type="button" class="slot" data-m="${m}" ${busy ? "disabled" : ""} aria-pressed="${state.time === m}">${fmt(m)}</button>`);
    }
    slotsEl.innerHTML = out.join("") || `<p class="hint">No quedan horarios este día.</p>`;
  }

  function renderSummary() {
    const s = SERVICES.find(x => x.id === state.service);
    const b = BARBERS.find(x => x.id === state.barber);
    const d = state.day !== null ? days[state.day] : null;
    const set = (id, v) => document.getElementById(id).textContent = v;
    set("r-service", s ? s.name : "—");
    set("r-dur", s ? `${s.min} min` : "—");
    set("r-barber", b.name);
    set("r-day", d ? `${DAY_NAMES[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}` : "—");
    set("r-time", state.time !== null ? `${fmt(state.time)} hs` : "—");
    set("r-price", s ? ars(s.price) : "$0");
    const missing = [!s && "servicio", !d && "día", state.time === null && "horario"].filter(Boolean);
    set("missing", missing.length ? `Falta elegir: ${missing.join(", ")}.` : "Se abre WhatsApp con el turno escrito. Te respondemos para confirmarlo.");
    const send = document.getElementById("send");
    send.setAttribute("aria-disabled", missing.length ? "true" : "false");
    if (!missing.length) {
      const name = document.getElementById("name").value.trim();
      const text = `Hola La Cañada! Quiero reservar un turno:\n• Servicio: ${s.name} (${ars(s.price)})\n• Barbero: ${b.name}\n• Día: ${DAY_NAMES[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}\n• Hora: ${fmt(state.time)} hs` + (name ? `\nA nombre de: ${name}` : "");
      send.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
    }
  }

  form.addEventListener("change", e => {
    if (e.target.name === "service") state.service = e.target.value;
    if (e.target.name === "barber") state.barber = e.target.value;
    renderSlots(); renderSummary();
  });
  form.addEventListener("input", e => { if (e.target.id === "name") renderSummary(); });
  daysEl.addEventListener("click", e => {
    const b = e.target.closest(".day"); if (!b) return;
    state.day = +b.dataset.i;
    daysEl.querySelectorAll(".day").forEach(x => x.setAttribute("aria-pressed", x === b));
    renderSlots(); renderSummary();
  });
  document.getElementById("slots").addEventListener("click", e => {
    const b = e.target.closest(".slot"); if (!b || b.disabled) return;
    state.time = +b.dataset.m; renderSlots(); renderSummary();
  });
  form.addEventListener("submit", e => e.preventDefault());

  // Servicio preseleccionado desde el enlace (#combo, #fade, etc.)
  const pre = location.hash.slice(1);
  const preInput = document.getElementById("service-" + pre);
  if (preInput) { preInput.checked = true; state.service = pre; }
  renderSlots(); renderSummary();
}
