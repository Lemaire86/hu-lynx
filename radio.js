// URL fichye IPTV Haiti a
const playlistUrl = "https://raw.githubusercontent.com/hello-earth/available_iptv-address_in_china/refs/heads/master/channels/available_iptv_address_Haiti.txt";

// Fonksyon pou li fichye a
async function loadStationsFromCSV(url) {
  const response = await fetch(url);
  const text = await response.text();

  const lines = text.split("\n").filter(line => line.trim() !== "" && !line.startsWith("#"));
  const stations = [];

  lines.forEach(line => {
    const parts = line.split(",");
    if (parts.length >= 2) {
      const name = parts[0].trim();
      const stream = parts[1].trim();
      stations.push({
        name: name,
        logo: "assets/radio/default.png",
        stream: stream
      });
    }
  });

  return stations;
}

// CHARGE STATION YO
loadStationsFromCSV(playlistUrl).then(stations => {
  const list = document.getElementById("station-list");
  const grid = document.getElementById("station-grid");
  const player = document.getElementById("bottom-player");
  const title = document.getElementById("bottom-title");
  const search = document.getElementById("search-radio");

  let currentIndex = -1;

  function loadStations() {
    list.innerHTML = "";
    grid.innerHTML = "";

    stations.forEach((st, index) => {
      const item = document.createElement("div");
      item.className = "station-item";
      item.textContent = st.name;
      item.onclick = () => playStation(index);
      list.appendChild(item);

      const tile = document.createElement("div");
      tile.className = "station-tile";
      tile.innerHTML = `
        <img src="${st.logo}">
        <p>${st.name}</p>
      `;
      tile.onclick = () => playStation(index);
      grid.appendChild(tile);
    });
  }

  function playStation(index) {
    currentIndex = index;
    const st = stations[index];
    title.textContent = st.name;
    player.src = st.stream;
    player.play();

    list.innerHTML = "";
    const playingItem = document.createElement("div");
    playingItem.className = "station-item";
    playingItem.textContent = st.name + " (Playing)";
    list.appendChild(playingItem);
  }

  document.getElementById("prev-btn").onclick = () => {
    if (currentIndex > 0) playStation(currentIndex - 1);
  };

  document.getElementById("next-btn").onclick = () => {
    if (currentIndex < stations.length - 1) playStation(currentIndex + 1);
  };

  search.addEventListener("input", () => {
    const term = search.value.toLowerCase();
    list.innerHTML = "";

    stations
      .filter(st => st.name.toLowerCase().includes(term))
      .forEach((st, index) => {
        const item = document.createElement("div");
        item.className = "station-item";
        item.textContent = st.name;
        item.onclick = () => playStation(index);
        list.appendChild(item);
      });
  });

  document.getElementById("all-stations-btn").onclick = loadStations;

  loadStations();
});
