const state = {
  pointsLocal: 0,
  pointsRival: 0,
  scrumLocal: 0,
  scrumLocalLost: 0,
  scrumRival: 0,
  scrumRivalLost: 0,

  lineLocal: 0,
  lineLocalLost: 0,
  lineRival: 0,
  lineRivalLost: 0,

  ruckFavor: 0,
  ruckFavorLost: 0,
  ruckContra: 0,
  ruckRecovered: 0,

  generalTackles: 0,
  generalMissed: 0,

  penalesFavor: 0,
  penalesContra: 0,
  players: Array.from({ length: 20 }, (_, i) => ({
    name: `Jugador ${i + 1}`,
    tackles: 0,
    missed: 0
  }))
};


const STORAGE_KEY = "rugbyStatsCoachMatch_v1";

function getMatchInputs() {
  return {
    teamLocal: document.getElementById("teamLocal")?.value || "",
    teamRival: document.getElementById("teamRival")?.value || "",
    category: document.getElementById("category")?.value || ""
  };
}

function saveMatch() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      state: state,
      inputs: getMatchInputs(),
      savedAt: new Date().toISOString()
    }));
  } catch (error) {
    console.warn("No se pudo guardar el partido:", error);
  }
}

function loadMatch() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const saved = JSON.parse(raw);

    if (saved.state) {
      Object.keys(state).forEach((key) => {
        if (key === "players" && Array.isArray(saved.state.players)) {
          state.players = saved.state.players;
        } else if (typeof saved.state[key] === "number") {
          state[key] = saved.state[key];
        }
      });
    }

    if (saved.inputs) {
      const teamLocal = document.getElementById("teamLocal");
      const teamRival = document.getElementById("teamRival");
      const category = document.getElementById("category");

      if (teamLocal) teamLocal.value = saved.inputs.teamLocal || "";
      if (teamRival) teamRival.value = saved.inputs.teamRival || "";
      if (category && saved.inputs.category) category.value = saved.inputs.category;
    }
  } catch (error) {
    console.warn("No se pudo recuperar el partido guardado:", error);
  }
}

function clearSavedMatch() {
  localStorage.removeItem(STORAGE_KEY);
}

function initAutoSave() {
  ["teamLocal", "teamRival", "category"].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", saveMatch);
    el.addEventListener("change", saveMatch);
  });
}

function pct(a, b) {
  if (!b) return "0.0%";
  return ((a / b) * 100).toFixed(1) + "%";
}

function add(key, value) {
  state[key] = (state[key] || 0) + value;
  render();
}

function subtract(key, value) {
  state[key] = Math.max(0, (state[key] || 0) - value);
  render();
}

function subtractTackle(index) {
  state.players[index].tackles = Math.max(0, state.players[index].tackles - 1);
  render();
}

function subtractMissed(index) {
  state.players[index].missed = Math.max(0, state.players[index].missed - 1);
  render();
}

function addTackle(index) {
  state.players[index].tackles += 1;
  render();
}

function addMissed(index) {
  state.players[index].missed += 1;
  render();
}

function updatePlayerName(index, value) {
  state.players[index].name = value;
  saveMatch();
}

function renderPlayers() {
  const container = document.getElementById("players");
  container.innerHTML = "";

  state.players.forEach((p, index) => {
    const total = p.tackles + p.missed;
    const effectiveness = pct(p.tackles, total);

    const row = document.createElement("div");
    row.className = "player";
    row.innerHTML = `
      <input value="${p.name}" onchange="updatePlayerName(${index}, this.value)" />

      <div class="counter-control">
        <button class="minus" onclick="subtractTackle(${index})">−</button>
        <strong>${p.tackles}</strong>
        <button onclick="addTackle(${index})">+</button>
      </div>

      <div class="counter-control">
        <button class="minus" onclick="subtractMissed(${index})">−</button>
        <strong>${p.missed}</strong>
        <button onclick="addMissed(${index})">+</button>
      </div>

      <div class="eff">${effectiveness}</div>
    `;
    container.appendChild(row);
  });
}

function renderStats() {
  const totalTackles = state.players.reduce((s, p) => s + p.tackles, 0);
  const totalMissed = state.players.reduce((s, p) => s + p.missed, 0);
  const totalActions = totalTackles + totalMissed;

  const stats = `
MARCADOR
Local: ${state.pointsLocal}
Rival: ${state.pointsRival}

SCRUM
Local ganado: ${state.scrumLocal}
Local perdido: ${state.scrumLocalLost}
Rival ganado: ${state.scrumRival}
Rival perdido / recuperado: ${state.scrumRivalLost}
Efectividad scrum local: ${pct(state.scrumLocal, state.scrumLocal + state.scrumLocalLost)}
Recuperación scrum rival: ${pct(state.scrumRivalLost, state.scrumRival + state.scrumRivalLost)}

LINE
Local ganada: ${state.lineLocal}
Local perdida: ${state.lineLocalLost}
Rival ganada: ${state.lineRival}
Rival perdida / recuperada: ${state.lineRivalLost}
Efectividad line local: ${pct(state.lineLocal, state.lineLocal + state.lineLocalLost)}
Recuperación line rival: ${pct(state.lineRivalLost, state.lineRival + state.lineRivalLost)}

RUCK
A favor ganado: ${state.ruckFavor}
A favor perdido: ${state.ruckFavorLost}
En contra: ${state.ruckContra}
Recuperados: ${state.ruckRecovered}
Efectividad ruck propio: ${pct(state.ruckFavor, state.ruckFavor + state.ruckFavorLost)}
Recuperación ruck rival: ${pct(state.ruckRecovered, state.ruckContra + state.ruckRecovered)}

TACKLES GENERALES
Conseguidos: ${state.generalTackles}
Errados: ${state.generalMissed}
Efectividad tackles general: ${pct(state.generalTackles, state.generalTackles + state.generalMissed)}

PENALES
A favor: ${state.penalesFavor}
En contra: ${state.penalesContra}
Relación favorable: ${pct(state.penalesFavor, state.penalesFavor + state.penalesContra)}

TACKLES
Efectivos: ${totalTackles}
Errados: ${totalMissed}
Efectividad defensiva: ${pct(totalTackles, totalActions)}
`;

  document.getElementById("stats").textContent = stats;

  document.getElementById("pointsLocal").textContent = state.pointsLocal;
  document.getElementById("pointsRival").textContent = state.pointsRival;

  const counters = [
    "scrumLocal",
    "scrumLocalLost",
    "scrumRival",
    "scrumRivalLost",
    "lineLocal",
    "lineLocalLost",
    "lineRival",
    "lineRivalLost",
    "ruckFavor",
    "ruckFavorLost",
    "ruckContra",
    "ruckRecovered",
    "generalTackles",
    "generalMissed",
    "penalesFavor",
    "penalesContra"
  ];

  counters.forEach((key) => {
    const el = document.getElementById(`${key}Count`);
    if (el) {
      el.textContent = state[key] || 0;
    }
  });

  document.getElementById("scrumPct").textContent =
    `Scrum local: ${pct(state.scrumLocal, state.scrumLocal + state.scrumLocalLost)} | Recuperación rival: ${pct(state.scrumRivalLost, state.scrumRival + state.scrumRivalLost)}`;

  document.getElementById("linePct").textContent =
    `Line local: ${pct(state.lineLocal, state.lineLocal + state.lineLocalLost)} | Recuperación rival: ${pct(state.lineRivalLost, state.lineRival + state.lineRivalLost)}`;

  document.getElementById("ruckPct").textContent =
    `Ruck propio: ${pct(state.ruckFavor, state.ruckFavor + state.ruckFavorLost)} | Recuperación rival: ${pct(state.ruckRecovered, state.ruckContra + state.ruckRecovered)}`;

  const generalTacklesCountEl = document.getElementById("generalTacklesCount");
  if (generalTacklesCountEl) generalTacklesCountEl.textContent = state.generalTackles;

  const generalMissedCountEl = document.getElementById("generalMissedCount");
  if (generalMissedCountEl) generalMissedCountEl.textContent = state.generalMissed;

  document.getElementById("generalTacklesPct").textContent =
    `Efectividad tackles general: ${pct(state.generalTackles, state.generalTackles + state.generalMissed)}`;
  document.getElementById("penalesPct").textContent = `Relación penales favorable: ${pct(state.penalesFavor, state.penalesFavor + state.penalesContra)}`;
}

function render() {
  renderPlayers();
  renderStats();
  saveMatch();
}

function exportCSV() {
  const local = document.getElementById("teamLocal").value || "Local";
  const rival = document.getElementById("teamRival").value || "Rival";
  const category = document.getElementById("category").value || "";

  const totalTackles = state.players.reduce((s, p) => s + p.tackles, 0);
  const totalMissed = state.players.reduce((s, p) => s + p.missed, 0);
  const totalActions = totalTackles + totalMissed;

  const sep = ";";
  let csv = "";

  csv += ["CATEGORIA", category].join(sep) + "\n\n";
  csv += ["ITEM", local, "PUNTOS / A FAVOR", rival, "PUNTOS / EN CONTRA", "EFECTIVIDAD"].join(sep) + "\n";

  csv += ["MARCADOR", local, state.pointsLocal, rival, state.pointsRival, ""].join(sep) + "\n";
  csv += ["SCRUM LOCAL", "Ganado", state.scrumLocal, "Perdido", state.scrumLocalLost, pct(state.scrumLocal, state.scrumLocal + state.scrumLocalLost)].join(sep) + "\n";
  csv += ["SCRUM RIVAL", "Ganado rival", state.scrumRival, "Perdido / recuperado local", state.scrumRivalLost, pct(state.scrumRivalLost, state.scrumRival + state.scrumRivalLost)].join(sep) + "\n";
  csv += ["LINE LOCAL", "Ganada", state.lineLocal, "Perdida", state.lineLocalLost, pct(state.lineLocal, state.lineLocal + state.lineLocalLost)].join(sep) + "\n";
  csv += ["LINE RIVAL", "Ganada rival", state.lineRival, "Perdida / recuperada local", state.lineRivalLost, pct(state.lineRivalLost, state.lineRival + state.lineRivalLost)].join(sep) + "\n";
  csv += ["RUCK PROPIO", "Ganado", state.ruckFavor, "Perdido", state.ruckFavorLost, pct(state.ruckFavor, state.ruckFavor + state.ruckFavorLost)].join(sep) + "\n";
  csv += ["RUCK RIVAL", "En contra", state.ruckContra, "Recuperado", state.ruckRecovered, pct(state.ruckRecovered, state.ruckContra + state.ruckRecovered)].join(sep) + "\n";
  csv += ["TACKLES GENERAL", "Conseguidos", state.generalTackles, "Errados", state.generalMissed, pct(state.generalTackles, state.generalTackles + state.generalMissed)].join(sep) + "\n";
  csv += ["PENALES", "A favor", state.penalesFavor, "En contra", state.penalesContra, pct(state.penalesFavor, state.penalesFavor + state.penalesContra)].join(sep) + "\n";
  csv += ["TACKLES", "Efectivos", totalTackles, "Errados", totalMissed, pct(totalTackles, totalActions)].join(sep) + "\n";

  csv += "\n";
  csv += ["JUGADOR", "TACKLES EFECTIVOS", "TACKLES ERRADOS", "TOTAL ACCIONES", "EFECTIVIDAD"].join(sep) + "\n";

  state.players.forEach((p) => {
    const total = p.tackles + p.missed;
    csv += [p.name, p.tackles, p.missed, total, pct(p.tackles, total)].join(sep) + "\n";
  });

  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "rugby_stats_coach.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function exportPDF() {
  const rows = [];
  const local = document.getElementById("teamLocal").value || "Local";
  const rival = document.getElementById("teamRival").value || "Rival";
  const category = document.getElementById("category").value || "";

  rows.push(["Categoría", category, "", "", "", ""]);
  rows.push(["ITEM", local, "VALOR", rival, "VALOR", "EFECTIVIDAD"]);
  rows.push(["Marcador", local, state.pointsLocal, rival, state.pointsRival, ""]);
  rows.push(["Scrum local", "Ganado", state.scrumLocal, "Perdido", state.scrumLocalLost, pct(state.scrumLocal, state.scrumLocal + state.scrumLocalLost)]);
  rows.push(["Scrum rival", "Ganado rival", state.scrumRival, "Perdido / recuperado", state.scrumRivalLost, pct(state.scrumRivalLost, state.scrumRival + state.scrumRivalLost)]);
  rows.push(["Line local", "Ganada", state.lineLocal, "Perdida", state.lineLocalLost, pct(state.lineLocal, state.lineLocal + state.lineLocalLost)]);
  rows.push(["Line rival", "Ganada rival", state.lineRival, "Perdida / recuperada", state.lineRivalLost, pct(state.lineRivalLost, state.lineRival + state.lineRivalLost)]);
  rows.push(["Ruck propio", "Ganado", state.ruckFavor, "Perdido", state.ruckFavorLost, pct(state.ruckFavor, state.ruckFavor + state.ruckFavorLost)]);
  rows.push(["Ruck rival", "En contra", state.ruckContra, "Recuperado", state.ruckRecovered, pct(state.ruckRecovered, state.ruckContra + state.ruckRecovered)]);
  rows.push(["Tackles general", "Conseguidos", state.generalTackles, "Errados", state.generalMissed, pct(state.generalTackles, state.generalTackles + state.generalMissed)]);
  rows.push(["Penales", "A favor", state.penalesFavor, "En contra", state.penalesContra, pct(state.penalesFavor, state.penalesFavor + state.penalesContra)]);

  rows.push([]);
  rows.push(["Jugador", "Tackles efectivos", "Tackles errados", "Total", "Efectividad"]);

  state.players.forEach((p) => {
    const total = p.tackles + p.missed;
    rows.push([p.name, p.tackles, p.missed, total, pct(p.tackles, total)]);
  });

  let html = `
    <html>
    <head>
      <title>Rugby Stats Coach</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { margin-bottom: 8px; }
        table { width: 100%; border-collapse: collapse; margin-top: 14px; }
        td { border: 1px solid #999; padding: 6px; font-size: 12px; }
      </style>
    </head>
    <body>
      <h1>Rugby Stats Coach</h1>
      <table>
  `;

  rows.forEach(row => {
    if (!row.length) {
      html += `<tr><td colspan="6">&nbsp;</td></tr>`;
    } else {
      html += `<tr>${row.map(cell => `<td>${cell}</td>`).join("")}</tr>`;
    }
  });

  html += `
      </table>
      <script>window.onload = function() { window.print(); }</script>
    </body>
    </html>
  `;

  const win = window.open("", "_blank");
  win.document.open();
  win.document.write(html);
  win.document.close();
}

function resetMatch() {
  if (!confirm("¿Reiniciar partido?")) return;
  clearSavedMatch();

  Object.keys(state).forEach((key) => {
    if (key !== "players") state[key] = 0;
  });

  state.players.forEach((p, i) => {
    p.name = `Jugador ${i + 1}`;
    p.tackles = 0;
    p.missed = 0;
  });

  document.getElementById("category").value = "Plantel Superior";

  render();
}

document.addEventListener("DOMContentLoaded", () => {
  loadMatch();
  initAutoSave();
  render();
});
