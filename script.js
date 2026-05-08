const CONTINENTS = ["Asya", "Avrupa", "Afrika", "Kuzey Amerika", "Güney Amerika", "Okyanusya", "Antarktika"];
const MAPS = {
  "Asya": "https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg",
  "Avrupa": "https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg",
  "Afrika": "https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg",
  "Kuzey Amerika": "https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg",
  "Güney Amerika": "https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg",
  "Okyanusya": "https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg",
  "Antarktika": "https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg"
};

const els = {
  startScreen: document.getElementById("startScreen"),
  continentScreen: document.getElementById("continentScreen"),
  gameScreen: document.getElementById("gameScreen"),
  enterBtn: document.getElementById("enterBtn"),
  continentList: document.getElementById("continentList"),
  gameTitle: document.getElementById("gameTitle"),
  timer: document.getElementById("timer"),
  remaining: document.getElementById("remaining"),
  correct: document.getElementById("correct"),
  question: document.getElementById("question"),
  mapImage: document.getElementById("mapImage"),
  countryLayer: document.getElementById("countryLayer"),
  hintBtn: document.getElementById("hintBtn"),
  backBtn: document.getElementById("backBtn"),
  message: document.getElementById("message")
};

const game = { continent: null, countries: [], remaining: [], current: null, correct: 0, time: 0, timer: null };

const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);

function switchScreen(name) {
  [els.startScreen, els.continentScreen, els.gameScreen].forEach(el => el.classList.add("hidden"));
  els[name].classList.remove("hidden");
}

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

function startGame(continent) {
  clearInterval(game.timer);
  game.continent = continent;
  game.countries = COUNTRY_DATA.filter(c => c.continent === continent);
  game.remaining = shuffle(game.countries);
  game.current = null;
  game.correct = 0;
  game.time = 0;
  els.timer.textContent = "0";
  els.mapImage.src = MAPS[continent];
  els.gameTitle.textContent = `${continent} Quiz`;
  els.message.textContent = "";
  drawCountryDots();
  nextQuestion();
  game.timer = setInterval(() => {
    game.time += 1;
    els.timer.textContent = String(game.time);
  }, 1000);
  switchScreen("gameScreen");
}

function drawCountryDots() {
  els.countryLayer.innerHTML = "";
  game.countries.forEach(c => {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", `${c.x}%`);
    circle.setAttribute("cy", `${c.y}%`);
    circle.setAttribute("r", "7");
    circle.classList.add("country-dot");
    circle.dataset.code = c.code;
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
  const isCorrect = code === game.current.code;
  if (!isCorrect) {
    els.message.innerHTML = `<span class='bad'>Yanlış seçim. Hedef: ${game.current.name}</span>`;
    return;
  }

  const dot = [...els.countryLayer.querySelectorAll(".country-dot")].find(x => x.dataset.code === code);
  if (dot) dot.classList.add("removed");
  game.correct += 1;
  game.remaining = game.remaining.filter(c => c.code !== code);
  els.message.innerHTML = `<span class='ok'>Doğru! ${game.current.name} (${game.current.capital}) haritadan kaldırıldı.</span>`;
  nextQuestion();
}

function finishGame() {
  clearInterval(game.timer);
  els.question.textContent = "Bölüm tamamlandı! 🎉";
  els.remaining.textContent = "0";
  els.message.innerHTML = `<span class='ok'>Tüm ülkeleri ${game.time} saniyede tamamladın.</span>`;
}

els.enterBtn.addEventListener("click", () => switchScreen("continentScreen"));
els.backBtn.addEventListener("click", () => {
  clearInterval(game.timer);
  switchScreen("continentScreen");
});
els.hintBtn.addEventListener("click", () => {
  if (!game.current) return;
  els.message.textContent = `İpucu: Başkent ${game.current.capital}`;
});

buildContinentButtons();
switchScreen("startScreen");
