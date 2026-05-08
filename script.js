const CONTINENTS = ["Asya", "Avrupa", "Afrika", "Kuzey Amerika", "Güney Amerika", "Okyanusya", "Antarktika"];
const WORLD_MAP = "https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg";

const CONTINENT_BOUNDS = {
  "Kuzey Amerika": { minX: 8, maxX: 32, minY: 12, maxY: 58 },
  "Güney Amerika": { minX: 24, maxX: 40, minY: 48, maxY: 86 },
  "Avrupa": { minX: 44, maxX: 61, minY: 16, maxY: 38 },
  "Afrika": { minX: 47, maxX: 64, minY: 34, maxY: 86 },
  "Asya": { minX: 56, maxX: 90, minY: 18, maxY: 64 },
  "Okyanusya": { minX: 70, maxX: 98, minY: 50, maxY: 90 },
  "Antarktika": { minX: 0, maxX: 100, minY: 86, maxY: 100 }
};

const els = {
  startScreen: document.getElementById("startScreen"), continentScreen: document.getElementById("continentScreen"), gameScreen: document.getElementById("gameScreen"),
  enterBtn: document.getElementById("enterBtn"), continentList: document.getElementById("continentList"), gameTitle: document.getElementById("gameTitle"),
  timer: document.getElementById("timer"), remaining: document.getElementById("remaining"), correct: document.getElementById("correct"), question: document.getElementById("question"),
  mapImage: document.getElementById("mapImage"), countryLayer: document.getElementById("countryLayer"), hintBtn: document.getElementById("hintBtn"), backBtn: document.getElementById("backBtn"), message: document.getElementById("message"), mapWrap: document.getElementById("mapWrap")
};

const game = { continent: null, countries: [], remaining: [], current: null, correct: 0, time: 0, timer: null };
const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);
const switchScreen = name => [els.startScreen, els.continentScreen, els.gameScreen].forEach(el => el.classList.toggle("hidden", el !== els[name]));

function buildContinentButtons() {
  els.continentList.innerHTML = "";
  CONTINENTS.forEach(cont => {
    const count = COUNTRY_DATA.filter(c => c.continent === cont).length;
    const btn = document.createElement("button");
    btn.textContent = `${cont} (${count})`;
    btn.disabled = count === 0;
    btn.onclick = () => startGame(cont);
    els.continentList.appendChild(btn);
  });
}

function toLocalPercent(country) {
  const b = CONTINENT_BOUNDS[game.continent];
  const x = ((country.x - b.minX) / (b.maxX - b.minX)) * 100;
  const y = ((country.y - b.minY) / (b.maxY - b.minY)) * 100;
  return { x: Math.max(2, Math.min(98, x)), y: Math.max(2, Math.min(98, y)) };
}

function applyContinentCrop(continent) {
  const b = CONTINENT_BOUNDS[continent];
  const w = b.maxX - b.minX;
  const h = b.maxY - b.minY;
  const sx = 100 / w;
  const sy = 100 / h;
  els.mapImage.style.transform = `translate(${-b.minX * sx}%, ${-b.minY * sy}%) scale(${sx}, ${sy})`;
  els.mapImage.style.transformOrigin = "top left";
}

function startGame(continent) {
  clearInterval(game.timer);
  game.continent = continent;
  game.countries = COUNTRY_DATA.filter(c => c.continent === continent);
  game.remaining = shuffle(game.countries);
  game.current = null; game.correct = 0; game.time = 0;
  els.timer.textContent = "0";
  els.mapImage.src = WORLD_MAP;
  applyContinentCrop(continent);
  els.gameTitle.textContent = `${continent} Quiz`;
  els.message.textContent = "";
  drawCountryHits();
  nextQuestion();
  game.timer = setInterval(() => { game.time += 1; els.timer.textContent = String(game.time); }, 1000);
  switchScreen("gameScreen");
}

function drawCountryHits() {
  els.countryLayer.innerHTML = "";
  game.countries.forEach(c => {
    const p = toLocalPercent(c);
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", `${p.x}%`); circle.setAttribute("cy", `${p.y}%`); circle.setAttribute("r", "14");
    circle.classList.add("country-hit"); circle.dataset.code = c.code;
    circle.addEventListener("click", () => handleCountryClick(c.code));
    els.countryLayer.appendChild(circle);
  });
}

function nextQuestion() {
  if (game.remaining.length === 0) return finishGame();
  game.current = game.remaining[0];
  els.question.textContent = `${game.current.flag} ${game.current.name} ülkesini tıkla.`;
  els.remaining.textContent = String(game.remaining.length);
  els.correct.textContent = String(game.correct);
}

function handleCountryClick(code) {
  if (!game.current) return;
  if (code !== game.current.code) { els.message.innerHTML = `<span class='bad'>Yanlış seçim. Hedef: ${game.current.name}</span>`; return; }
  const hit = [...els.countryLayer.querySelectorAll(".country-hit")].find(x => x.dataset.code === code);
  if (hit) hit.classList.add("solved");
  game.correct += 1;
  game.remaining = game.remaining.filter(c => c.code !== code);
  els.message.innerHTML = `<span class='ok'>Doğru! ${game.current.name} silinmedi, tonu düşürüldü.</span>`;
  nextQuestion();
}

function finishGame() {
  clearInterval(game.timer);
  els.question.textContent = "Bölüm tamamlandı! 🎉";
  els.remaining.textContent = "0";
  els.message.innerHTML = `<span class='ok'>Tüm ülkeleri ${game.time} saniyede tamamladın.</span>`;
}

els.enterBtn.addEventListener("click", () => switchScreen("continentScreen"));
els.backBtn.addEventListener("click", () => { clearInterval(game.timer); switchScreen("continentScreen"); });
els.hintBtn.addEventListener("click", () => game.current && (els.message.textContent = `İpucu: Başkent ${game.current.capital}`));

buildContinentButtons();
switchScreen("startScreen");
