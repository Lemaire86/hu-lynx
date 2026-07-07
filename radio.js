// Playlist IPTV-ORG kategori mizik
const radioPlaylist = "https://iptv-org.github.io/iptv/categories/music.m3u";

let radioStations = [];
let currentIndex = -1;

// Chaje playlist la
async function loadRadioPlaylist() {
  try {
    console.log("LOAD PLAYLIST...");
    const res = await fetch(radioPlaylist);
    console.log("FETCH STATUS:", res.status);
    const text = await res.text();
    console.log("FETCH LENGTH:", text.length);

    parseRadioM3U(text);
    renderRadioList();
  } catch (e) {
    console.log("Erreur radio playlist:", e);
  }
}

// Parse M3U IPTV-ORG (EXTINF + URL)
function parseRadioM3U(text) {
  const lines = text.split("\n");
  let name = "";

  lines.forEach(line => {
    line = line.trim();

    if (line.startsWith("#EXTINF")) {
      // pran non chanèl la apre dènye vigil
      const parts = line.split(",");
      name = parts[parts.length - 1].trim();
    }

    if (line.startsWith("http")) {
      radioStations.push({
        name,
        logo: "assets/radio/default.png",
        stream: line.trim()
      });
    }
  });

  console.log("STATIONS LOADED:", radioStations.length, radioStations);
}

// Rann lis + grid
function renderRadioList() {
  const list = document.getElementById("station-list");
  const grid = document.getElementById("station-grid");

  list.innerHTML = "";
  grid.innerHTML = "";

  radioStations.forEach((st, index) => {
    const item = document.createElement("div");
    item.className = "station-item";
    item.textContent = st.name;
    item.onclick = () => playRadio(index);
    list.appendChild(item);

    const tile = document.createElement("div");
    tile.className = "station-tile";
    tile.innerHTML = `
      <img src="${st.logo}">
      <p>${st.name}</p>
    `;
    tile.onclick = () => playRadio(index);
    grid.appendChild(tile);
  });
}

/* -------- UNIVERSAL PLAYER (audio + video HLS) -------- */
function playRadio(index) {
  currentIndex = index;
  const st = radioStations[index];

  console.log("PLAYING:", st);

  const title = document.getElementById("bottom-title");
  const audio = document.getElementById("bottom-player");

  title.textContent = st.name;

  const url = st.stream;
  const isHLS = url.includes(".m3u8");

  // Reset audio
  audio.pause();
  audio.src = "";
  audio.style.display = "none";

  // Retire video ki te la
  const oldVideo = document.getElementById("bottom-video");
  if (oldVideo) oldVideo.remove();

  if (isHLS) {
    // Kreye video pou HLS
    const video = document.createElement("video");
    video.id = "bottom-video";
    video.controls = true;
    video.style.width = "100%";
    video.style.borderRadius = "8px";

    document.querySelector(".radio-bottom-player").appendChild(video);

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
      video.play();
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      video.play();
    } else {
      alert("Navigatè sa a pa ka jwe HLS.");
    }
  } else {
    // Stream klasik (mp3, aac, elatriye)
    audio.src = url;
    audio.style.display = "block";
    audio.play();
  }

  // Update sidebar
  const list = document.getElementById("station-list");
  list.innerHTML = `<div class="station-item">${st.name} (Playing)</div>`;
}

/* -------- NEXT / PREV -------- */
document.getElementById("prev-btn").onclick = () => {
  if (currentIndex > 0) playRadio(currentIndex - 1);
};

document.getElementById("next-btn").onclick = () => {
  if (currentIndex < radioStations.length - 1) playRadio(currentIndex + 1);
};

/* -------- SEARCH -------- */
document.getElementById("search-radio").oninput = function () {
  const q = this.value.toLowerCase();
  const list = document.getElementById("station-list");
  list.innerHTML = "";

  radioStations
    .filter(st => st.name.toLowerCase().includes(q))
    .forEach((st, index) => {
      const item = document.createElement("div");
      item.className = "station-item";
      item.textContent = st.name;
      item.onclick = () => playRadio(index);
      list.appendChild(item);
    });
};

/* -------- INIT -------- */
loadRadioPlaylist();
