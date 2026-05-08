const els = {
  score: document.getElementById("score"),
  questionCount: document.getElementById("questionCount"),
  totalQuestions: document.getElementById("totalQuestions"),
  correctCount: document.getElementById("correctCount"),
  timer: document.getElementById("timer"),
  modeSelect: document.getElementById("modeSelect"),
  startBtn: document.getElementById("startBtn"),
  restartBtn: document.getElementById("restartBtn"),
  questionBox: document.getElementById("questionBox"),
  options: document.getElementById("options"),
  result: document.getElementById("result"),
  history: document.getElementById("history"),
  worldMap: document.getElementById("worldMap"),
  hintBtn: document.getElementById("hintBtn")
};

const game = {
  mode: "country",
  questions: [],
  index: 0,
  score: 0,
  correct: 0,
  timer: 0,
  interval: null,
  current: null,
  lock: false
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function startGame() {
  game.mode = els.modeSelect.value;
  game.questions = shuffle(COUNTRY_DATA).slice(0, 25);
  game.index = 0;
  game.score = 0;
  game.correct = 0;
  game.timer = 0;
  game.lock = false;
  els.history.innerHTML = "";
  els.result.textContent = "";
  els.totalQuestions.textContent = game.questions.length;
  els.startBtn.disabled = true;
  els.restartBtn.disabled = false;
  els.hintBtn.disabled = false;

  clearInterval(game.interval);
  game.interval = setInterval(() => {
    game.timer += 1;
    els.timer.textContent = String(game.timer);
  }, 1000);

  updateStats();
  nextQuestion();
}

function updateStats() {
  els.score.textContent = String(game.score);
  els.questionCount.textContent = String(game.index);
  els.correctCount.textContent = String(game.correct);
}

function nextQuestion() {
  game.lock = false;
  if (game.index >= game.questions.length) return endGame();

  game.current = game.questions[game.index];
  game.index += 1;
  updateStats();

  if (game.mode === "country") {
    els.questionBox.textContent = `${game.current.flag} ${game.current.name} ülkesini haritada tıkla.`;
    renderCountryModeOptions();
  } else {
    els.questionBox.textContent = `${game.current.flag} ${game.current.name} ülkesinin başkenti hangisi?`;
    renderCapitalOptions();
  }
}

function renderCapitalOptions() {
  const wrongs = shuffle(COUNTRY_DATA.filter(c => c.name !== game.current.name))
    .slice(0, 3)
    .map(c => c.capital);
  const opts = shuffle([game.current.capital, ...wrongs]);

  els.options.innerHTML = "";
  opts.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = opt;
    btn.onclick = () => checkAnswer(opt === game.current.capital, `Doğru cevap: ${game.current.capital}`);
    els.options.appendChild(btn);
  });
}

function renderCountryModeOptions() {
  els.options.innerHTML = "";
  const help = document.createElement("div");
  help.textContent = "Haritada tahmini konuma dokun / tıkla.";
  els.options.appendChild(help);
}

function mapClickHandler(e) {
  if (!game.current || game.mode !== "country" || game.lock) return;

  const rect = els.worldMap.getBoundingClientRect();
  const clickX = ((e.clientX - rect.left) / rect.width) * 100;
  const clickY = ((e.clientY - rect.top) / rect.height) * 100;

  const dx = clickX - game.current.x;
  const dy = clickY - game.current.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const isCorrect = distance < 8.5;

  checkAnswer(isCorrect, `${game.current.name} yaklaşık koordinat: %${game.current.x.toFixed(1)}, %${game.current.y.toFixed(1)}`);
}

function checkAnswer(isCorrect, detail) {
  if (game.lock) return;
  game.lock = true;

  if (isCorrect) {
    game.score += 10;
    game.correct += 1;
    els.result.innerHTML = `<span class="ok">✅ Doğru! ${detail}</span>`;
  } else {
    els.result.innerHTML = `<span class="bad">❌ Yanlış! ${detail}</span>`;
  }

  const li = document.createElement("li");
  li.className = isCorrect ? "ok" : "bad";
  li.textContent = `${game.index}. ${game.current.flag} ${game.current.name} - ${isCorrect ? "Doğru" : "Yanlış"}`;
  els.history.prepend(li);

  updateStats();
  setTimeout(nextQuestion, 900);
}

function endGame() {
  clearInterval(game.interval);
  els.questionBox.textContent = `Oyun bitti! Toplam skor: ${game.score} / ${game.questions.length * 10}`;
  els.result.innerHTML = `<strong>Doğruluk:</strong> %${Math.round((game.correct / game.questions.length) * 100)}`;
  els.startBtn.disabled = false;
  els.hintBtn.disabled = true;
}

function showHint() {
  if (!game.current) return;
  const c = game.current;
  if (game.mode === "country") {
    els.result.innerHTML = `<span>💡 İpucu: ${c.name}, ${c.capital} başkentli bir ülkedir.</span>`;
  } else {
    els.result.innerHTML = `<span>💡 İpucu: Başkent, ${c.name} ülkesinin en büyük siyasi merkezidir.</span>`;
  }
}

els.startBtn.addEventListener("click", startGame);
els.restartBtn.addEventListener("click", startGame);
els.hintBtn.addEventListener("click", showHint);
els.worldMap.addEventListener("click", mapClickHandler);
els.worldMap.addEventListener("touchstart", ev => {
  const t = ev.touches[0];
  if (!t) return;
  mapClickHandler({ clientX: t.clientX, clientY: t.clientY });
}, { passive: true });
