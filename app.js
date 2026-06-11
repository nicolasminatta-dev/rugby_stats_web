const state = {
  pointsLocal: 0,
  pointsRival: 0,
  scrumLocal: 0,
  scrumRival: 0,
  lineLocal: 0,
  lineRival: 0,
  ruckFavor: 0,
  ruckContra: 0,
  penalesFavor: 0,
  penalesContra: 0,
  players: Array.from({ length: 20 }, (_, i) => ({
    name: `Jugador ${i + 1}`,
    tackles: 0,
    missed: 0
  }))
};

function pct(a, b) {
  if (!b) return "0.0%";
  return ((a / b) * 100).toFixed(1) + "%";
}

function add(key, value) {
  state[key] += value;
  render();
}

function subtract(key, value) {
  state[key] = Math.max(0, state[key] - value);
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
Local: ${state.scrumLocal}
Rival: ${state.scrumRival}
Efectividad: ${pct(state.scrumLocal, state.scrumLocal + state.scrumRival)}

LINE
Local: ${state.lineLocal}
Rival: ${state.lineRival}
Efectividad: ${pct(state.lineLocal, state.lineLocal + state.lineRival)}

RUCK
A favor: ${state.ruckFavor}
En contra: ${state.ruckContra}
Efectividad ruck: ${pct(state.ruckFavor, state.ruckFavor + state.ruckContra)}

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

  document.getElementById("scrumLocalCount").textContent = state.scrumLocal;
  document.getElementById("scrumRivalCount").textContent = state.scrumRival;
  document.getElementById("lineLocalCount").textContent = state.lineLocal;
  document.getElementById("lineRivalCount").textContent = state.lineRival;
  document.getElementById("ruckFavorCount").textContent = state.ruckFavor;
  document.getElementById("ruckContraCount").textContent = state.ruckContra;
  document.getElementById("penalesFavorCount").textContent = state.penalesFavor;
  document.getElementById("penalesContraCount").textContent = state.penalesContra;

  document.getElementById("scrumPct").textContent = `Efectividad scrum: ${pct(state.scrumLocal, state.scrumLocal + state.scrumRival)}`;
  document.getElementById("linePct").textContent = `Efectividad line: ${pct(state.lineLocal, state.lineLocal + state.lineRival)}`;
  document.getElementById("ruckPct").textContent = `Efectividad ruck: ${pct(state.ruckFavor, state.ruckFavor + state.ruckContra)}`;
  document.getElementById("penalesPct").textContent = `Relación penales favorable: ${pct(state.penalesFavor, state.penalesFavor + state.penalesContra)}`;
}

function render() {
  renderPlayers();
  renderStats();
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
  csv += ["SCRUM", local, state.scrumLocal, rival, state.scrumRival, pct(state.scrumLocal, state.scrumLocal + state.scrumRival)].join(sep) + "\n";
  csv += ["LINE", local, state.lineLocal, rival, state.lineRival, pct(state.lineLocal, state.lineLocal + state.lineRival)].join(sep) + "\n";
  csv += ["RUCK", "A favor", state.ruckFavor, "En contra", state.ruckContra, pct(state.ruckFavor, state.ruckFavor + state.ruckContra)].join(sep) + "\n";
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

function resetMatch() {
  if (!confirm("¿Reiniciar partido?")) return;

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

render();
