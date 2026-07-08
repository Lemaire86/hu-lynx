fetch("./assets/data/radio.m3u")
  .then(r => {
    console.log("TEST FETCH STATUS:", r.status);
    return r.text();
  })
  .then(t => console.log("TEST FETCH CONTENT:", t))
  .catch(e => console.log("TEST FETCH ERROR:", e));

const radioPlaylist = "./assets/data/radio.m3u";

let radioStations = [];
let currentIndex = -1;

async function loadRadioPlaylist() {
  try {
    const res = await fetch(radioPlaylist);
    const text = await res.text();
    parseRadioM3U(text);
    renderRadioList();
  } catch (e) {
    console.log("Erreur radio playlist:", e);
  }
}

function parseRadioM3U(text) {
  const lines = text.split("\n");
  let name = "";

  lines.forEach(line => {
    line = line.trim();

    if (line.startsWith("#EXTINF")) {
      const info = line.split(",");
      name = info[1] || "Unknown Station";
    }

    if (line.startsWith("http")) {
      radioStations.push({
        name,
        logo: "assets/radio/default.png",
        stream: line.trim()
      });
    }
  });

  console.log("STATIONS LOADED:", radioStations);
}
