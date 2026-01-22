let words = [];
let selected = [];
let gameId = getGameIdFromUrl() || generateId();

// ---------- utilities ----------
function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

function getGameIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function saveGameToStorage(id, data) {
  localStorage.setItem("game_" + id, JSON.stringify(data));
}

function loadGameFromStorage(id) {
  const data = localStorage.getItem("game_" + id);
  return data ? JSON.parse(data) : null;
}

// ---------- words ----------
function addWord() {
  const he = document.getElementById("hebrew").value.trim();
  const en = document.getElementById("english").value.trim();
  if (!he || !en) return;

  words.push({ he, en, matched: false });
  document.getElementById("hebrew").value = "";
  document.getElementById("english").value = "";
  renderGame();
}

function renderGame() {
  const gameDiv = document.getElementById("game");
  gameDiv.innerHTML = "";

  const heCol = document.createElement("div");
  const enCol = document.createElement("div");
  heCol.className = enCol.className = "column";

  words.forEach((w, i) => {
    if (!w.matched) {
      const h = document.createElement("div");
      h.className = "word";
      h.textContent = w.he;
      h.onclick = () => selectWord(i, "he", h);
      heCol.appendChild(h);

      const e = document.createElement("div");
      e.className = "word";
      e.textContent = w.en;
      e.onclick = () => selectWord(i, "en", e);
      enCol.appendChild(e);
    }
  });

  gameDiv.appendChild(heCol);
  gameDiv.appendChild(enCol);
}

function selectWord(index, lang, el) {
  if (selected.length === 2) return;

  el.classList.add("selected");
  selected.push({ index, lang, el });

  if (selected.length === 2) {
    const [a, b] = selected;
    if (a.index === b.index && a.lang !== b.lang) {
      words[a.index].matched = true;
    }
    setTimeout(() => {
      selected.forEach(s => s.el.classList.remove("selected"));
      selected = [];
      renderGame();
      autoSave();
    }, 500);
  }
}

// ---------- save / load ----------
function saveGame() {
  saveGameToStorage(gameId, words);
  renderSavedGames();
  alert("המשחק נשמר ✅");
}

function autoSave() {
  saveGameToStorage(gameId, words);
}

function renderSavedGames() {
  const ul = document.getElementById("savedGames");
  ul.innerHTML = "";

  Object.keys(localStorage)
    .filter(k => k.startsWith("game_"))
    .forEach(k => {
      const id = k.replace("game_", "");
      const li = document.createElement("li");

      li.innerHTML = `
        משחק ${id}
        <button onclick="openGame('${id}')">▶ פתח</button>
        <button onclick="deleteGame('${id}')">🗑 מחק</button>
      `;
      ul.appendChild(li);
    });
}

function openGame(id) {
  const data = loadGameFromStorage(id);
  if (!data) return;
  gameId = id;
  words = data;
  history.replaceState({}, "", "?id=" + id);
  renderGame();
}

function deleteGame(id) {
  localStorage.removeItem("game_" + id);
  renderSavedGames();
}

// ---------- share ----------
function shareGame() {
  saveGame(); // מוודא שהכול שמור
  const url = `${location.origin}${location.pathname}?id=${gameId}`;
  navigator.clipboard.writeText(url).then(() => {
    alert("הקישור הועתק 📋");
  });
}

// ---------- init ----------
(function init() {
  const fromUrl = getGameIdFromUrl();
  if (fromUrl) {
    const data = loadGameFromStorage(fromUrl);
    if (data) {
      gameId = fromUrl;
      words = data;
      saveGameToStorage(gameId, words); // שומר אוטומטית מקומית
    }
  }
  renderGame();
  renderSavedGames();
})();
