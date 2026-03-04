const MAX_CARDS = 1;
let selectedCards = [];
let countdownInterval;
let callInterval;

// -------- LOAD CARD NUMBERS --------
fetch("/cards")
  .then(res => res.json())
  .then(cards => {
    const grid = document.getElementById("cardGrid");
    cards.forEach(id => {
      const div = document.createElement("div");
      div.className = "card-number";
      div.innerText = id;
      div.onclick = () => toggleCard(id, div);
      grid.appendChild(div);
    });
  });

// -------- SELECT CARDS --------
function toggleCard(id, element) {
  if (selectedCards.includes(id)) {
    selectedCards = selectedCards.filter(c => c !== id);
    element.classList.remove("selected");
  } else {
    if (selectedCards.length = MAX_CARDS) return;
    selectedCards.push(id);
    element.classList.add("selected");
  }

  showPreview();
  if (selectedCards.length > 0) startCountdown();
}

// -------- SHOW SELECTED CARTELLAS --------
function showPreview() {
  const box = document.getElementById("previewCards");
  box.innerHTML = "";

  selectedCards.forEach(id => {
    fetch(`/card/${id}`)
      .then(res => res.json())
      .then(numbers => box.appendChild(createCartella(numbers)));
  });
}

// -------- CREATE CARTELLA --------
function createCartella(numbers) {
  const card = document.createElement("div");
  card.className = "cartella";
  numbers.forEach(n => {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.innerText = n;
    card.appendChild(cell);
  });
  return card;
}

// -------- COUNTDOWN TO GAME --------
function startCountdown() {
  const box = document.getElementById("countdownBox");
  box.classList.remove("hidden");

  let time = 20;
  document.getElementById("countdown").innerText = time;

  clearInterval(countdownInterval);
  countdownInterval = setInterval(() => {
    time--;
    document.getElementById("countdown").innerText = time;

    if (time <= 0) {
      clearInterval(countdownInterval);
      startGame();
    }
  }, 1000);
}

// -------- START GAME --------
function startGame() {
  fetch("/start-game", { method: "POST" });

  document.getElementById("page1").classList.add("hidden");
  document.getElementById("page2").classList.remove("hidden");

  const box = document.getElementById("playerCards");
  box.innerHTML = "";

  selectedCards.forEach(id => {
    fetch(`/card/${id}`)
      .then(res => res.json())
      .then(numbers => box.appendChild(createCartella(numbers)));
  });

  startCallingNumbers();
}

// -------- CALL NUMBERS LOOP --------
function startCallingNumbers() {
  let count = 0;
  callInterval = setInterval(() => {
    fetch("/call-number", { method: "POST" })
      .then(res => res.json())
      .then(data => {
        if (data.call) {
          count++;
          document.getElementById("callCount").innerText = count;
        }
      });
  }, 3000);
}

// -------- BINGO BUTTON --------
document.getElementById("bingoBtn").onclick = () => {
  const name = prompt("Enter your name");
  const cardId = selectedCards[0];
  fetch(`/declare-winner?name=${name}&card_id=${cardId}`, { method: "POST" })
    .then(() => showWinner());
};

// -------- SHOW WINNER PAGE --------
function showWinner() {
  clearInterval(callInterval);

  fetch("/game-state")
    .then(res => res.json())
    .then(state => {
      document.getElementById("page2").classList.add("hidden");
      document.getElementById("page3").classList.remove("hidden");

      document.getElementById("winnerName").innerText =
        state.winner + " has won!";

      const box = document.getElementById("winningCard");
      box.innerHTML = "";
      box.appendChild(createCartella(state.winning_card));

      restartCountdown();
    });
}

// -------- RESTART GAME --------
function restartCountdown() {
  let time = 10;
  document.getElementById("restartCountdown").innerText = time;

  const interval = setInterval(() => {
    time--;
    document.getElementById("restartCountdown").innerText = time;

    if (time <= 0) {
      clearInterval(interval);
      location.reload();
    }
  }, 1000);
}
