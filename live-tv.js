/* ---------------- PLAYLISTS ---------------- */
const playlists = [
  "https://iptv-org.github.io/iptv/index.m3u",
  "https://raw.githubusercontent.com/ipstreet312/freeiptv/master/all.m3u",
  "https://raw.githubusercontent.com/Free-TV/IPTV/master/playlist.m3u8",
  "https://raw.githubusercontent.com/Lemaire86/Le-Maire-TV/refs/heads/main/CODE%20IPTV/lmtv.m3u",
  // Playlist Haiti espesyal
  "https://raw.githubusercontent.com/hello-earth/available_iptv-address_in_china/refs/heads/master/channels/available_iptv_address_Haiti.txt"
];

let channels = [];
let filteredChannels = [];
let currentIndex = 0;

/* ---------------- LOAD PLAYLISTS ---------------- */
async function loadPlaylists() {
  for (const url of playlists) {
    try {
      const res = await fetch(url);
      const text = await res.text();

      // Si fichye a se .txt (Haiti), itilize parseHaiti()
      if (url.endsWith(".txt")) {
        parseHaiti(text);
      } else {
        parseM3U(text);
      }
    } catch (e) {
      console.log("Erreur playlist:", url);
    }
  }

  filteredChannels = channels;
  renderChannelList();
}

/* ---------------- PARSE M3U ---------------- */
function parseM3U(text) {
  const lines = text.split("\n");
  let name = "", logo = "", category = "", country = "";

  lines.forEach(line => {
    if (line.startsWith("#EXTINF")) {
      const info = line.split(",");
      name = info[1] || "Unknown";

      const logoMatch = line.match(/tvg-logo="(.*?)"/);
      logo = logoMatch ? logoMatch[1] : "assets/logo.png";

      const catMatch = line.match(/group-title="(.*?)"/);
      category = catMatch ? catMatch[1] : "General";

      const countryMatch = line.match(/country="(.*?)"/);
      country = countryMatch ? countryMatch[1] : "Unknown";
    }

    if (line.startsWith("http")) {
      channels.push({
        name,
        logo,
        url: line.trim(),
        category,
        country
      });
    }
  });
}

/* ---------------- PARSE HAITI TXT ---------------- */
function parseHaiti(text) {
  const lines = text.split("\n").filter(line => line.trim() !== "" && !line.startsWith("#"));
  lines.forEach(line => {
    const parts = line.split(",");
    if (parts.length >= 2) {
      const name = parts[0].trim();
      const url = parts[1].trim();
      channels.push({
        name,
        logo: "assets/tv/default.png",
        url,
        category: "Haiti",
        country: "Haiti"
      });
    }
  });
}

/* ---------------- RENDER CHANNEL LIST ---------------- */
function renderChannelList() {
  const list = document.getElementById("channel-list");
  list.innerHTML = "";

  filteredChannels.forEach((ch, index) => {
    const item = document.createElement("div");
    item.className = "channel-item";
    item.innerHTML = `
      <img src="${ch.logo}">
      <span>${ch.name}</span>
    `;
    item.onclick = () => playChannel(index);
    list.appendChild(item);
  });
}

/* ---------------- PLAY CHANNEL ---------------- */
function playChannel(index) {
  currentIndex = index;
  const ch = filteredChannels[index];

  document.getElementById("current-logo").src = ch.logo;
  document.getElementById("current-name").textContent = ch.name;
  document.getElementById("current-meta").textContent = `${ch.category} • ${ch.country}`;
  document.getElementById("current-url").textContent = ch.url;

  const player = document.getElementById("tv-player");
  player.src = ch.url;
  player.play();
}

/* ---------------- NEXT / PREVIOUS ---------------- */
document.getElementById("btn-next").onclick = () => {
  currentIndex = (currentIndex + 1) % filteredChannels.length;
  playChannel(currentIndex);
};

document.getElementById("btn-prev").onclick = () => {
  currentIndex = (currentIndex - 1 + filteredChannels.length) % filteredChannels.length;
  playChannel(currentIndex);
};

/* ---------------- SEARCH ---------------- */
document.getElementById("search-input").oninput = function () {
  const q = this.value.toLowerCase();
  filteredChannels = channels.filter(ch => ch.name.toLowerCase().includes(q));
  renderChannelList();
};

/* ---------------- FILTER COUNTRY ---------------- */
document.getElementById("filter-country").onchange = function () {
  const val = this.value;
  filteredChannels = val ? channels.filter(ch => ch.country === val) : channels;
  renderChannelList();
};

/* ---------------- FILTER CATEGORY ---------------- */
document.getElementById("filter-category").onchange = function () {
  const val = this.value;
  filteredChannels = val ? channels.filter(ch => ch.category === val) : channels;
  renderChannelList();
};

/* ---------------- START ---------------- */
loadPlaylists();
