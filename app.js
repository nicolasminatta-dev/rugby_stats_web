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
    const row = document.createElement("div");
    row.className = "player";
    row.innerHTML = `
      <input value="${p.name}" onchange="updatePlayerName(${index}, this.value)" />
      <button onclick="addTackle(${index})">T ${p.tackles}</button>
      <button onclick="addMissed(${index})">E ${p.missed}</button>
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

LINE
Local: ${state.lineLocal}
Rival: ${state.lineRival}

RUCK
A favor: ${state.ruckFavor}
En contra: ${state.ruckContra}
Efectividad ruck: ${pct(state.ruckFavor, state.ruckFavor + state.ruckContra)}

PENALES
A favor: ${state.penalesFavor}
En contra: ${state.penalesContra}

TACKLES
Efectivos: ${totalTackles}
Errados: ${totalMissed}
Efectividad defensiva: ${pct(totalTackles, totalActions)}
`;

  document.getElementById("stats").textContent = stats;
  document.getElementById("pointsLocal").textContent = state.pointsLocal;
  document.getElementById("pointsRival").textContent = state.pointsRival;
}

function render() {
  renderPlayers();
  renderStats();
}

function exportCSV() {
  const local = document.getElementById("teamLocal").value || "Local";
  const rival = document.getElementById("teamRival").value || "Rival";

  let csv = "Categoria,Item,Valor\n";
  csv += `Partido,Local,${local}\n`;
  csv += `Partido,Rival,${rival}\n`;
  csv += `Marcador,Local,${state.pointsLocal}\n`;
  csv += `Marcador,Rival,${state.pointsRival}\n`;
  csv += `Scrum,Local,${state.scrumLocal}\n`;
  csv += `Scrum,Rival,${state.scrumRival}\n`;
  csv += `Line,Local,${state.lineLocal}\n`;
  csv += `Line,Rival,${state.lineRival}\n`;
  csv += `Ruck,A favor,${state.ruckFavor}\n`;
  csv += `Ruck,En contra,${state.ruckContra}\n`;
  csv += `Penales,A favor,${state.penalesFavor}\n`;
  csv += `Penales,En contra,${state.penalesContra}\n`;

  state.players.forEach((p) => {
    csv += `Jugador,${p.name} tackles efectivos,${p.tackles}\n`;
    csv += `Jugador,${p.name} tackles errados,${p.missed}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
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

  render();
}

render();
