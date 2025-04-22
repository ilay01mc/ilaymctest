function fetchStatus() {
  fetch("https://ilaymcapi.mooo.com/api/logs")
    .then((response) => response.json())
    .then((data) => {
      const logData = data.data;
      const latestLog = logData[logData.length - 1];
      const statusText = document.getElementById("status-text");
      const playersText = document.getElementById("players-text");
      const disclaimer = document.getElementById("offline-disclaimer");

      if (latestLog.includes("Player connected") || latestLog.includes("Running AutoCompaction")) {
        statusText.textContent = "🟢 Server Online";
        disclaimer.classList.add("hidden");
      } else {
        statusText.textContent = "🔴 Server Offline";
        disclaimer.classList.remove("hidden");
      }
    })
    .catch((error) => {
      console.error("Status fetch error:", error);
      document.getElementById("status-text").textContent = "🔴 Server Offline";
      document.getElementById("offline-disclaimer").classList.remove("hidden");
    });
}

function fetchPlayers() {
  fetch("https://ilaymcapi.mooo.com/api/players")
    .then((response) => response.json())
    .then((data) => {
      const list = document.getElementById('player-list');
      list.innerHTML = '';

      if (!data.players || data.players.length === 0) {
        list.innerHTML = '<li>No players online</li>';
        return;
      }

      data.players.forEach(player => {
        const item = document.createElement('li');
        item.textContent = player;
        list.appendChild(item);
      });
    })
    .catch(error => {
      console.error('Player list fetch error:', error);
      document.getElementById('player-list').innerHTML = '<li>Error loading players</li>';
    });
}

setInterval(fetchStatus, 10000);
setInterval(fetchPlayers, 10000);
fetchStatus();
fetchPlayers();
