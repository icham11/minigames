let userName = "";
let validatedQ1 = false; // false, 'pending', or true
let validatedQ2 = false; // false, 'pending', or true
let validatedQ3 = false; // false or true
let clickedFinalScreen = false;
let attempts = { q1: 0, q2: 0, q3: 0 };

const questions = [
  {
    id: "q1",
    title: "Pertanyaan 1: Siapakah presiden pertama Indonesia?",
    hideOptions: false,
    options: [
      { value: "Soekarno", isCorrect: true },
      { value: "Jokowi", isCorrect: false },
      { value: "Soeharto", isCorrect: false },
      { value: "BJ Habibie", isCorrect: false },
      { value: "Megawati", isCorrect: false },
    ],
  },
  {
    id: "q2",
    title: "Pertanyaan 2: Di manakah letak candi Borobudur?",
    hideOptions: false,
    options: [
      { value: "Jawa Tengah", isCorrect: true },
      { value: "Bali", isCorrect: false },
      { value: "Papua", isCorrect: false },
      { value: "Yogyakarta", isCorrect: false },
      { value: "Jakarta", isCorrect: false },
    ],
  },
  {
    id: "q3",
    title: "Pertanyaan 3 (Lucu): Hewan apa yang paling sering cari bapaknya?",
    hideOptions: true,
    options: [
      {
        value: "Kambing (karena bunyinya Beee... beee... cari bapak/babeh)",
        isCorrect: true,
      },
      { value: "Kucing", isCorrect: false },
      { value: "Ayam", isCorrect: false },
      { value: "Kancil", isCorrect: false },
      { value: "Tikus", isCorrect: false },
    ],
  },
];

// FUNGSI BANTUAN: Memainkan efek suara pendek
function playSound(soundId) {
  const sound = document.getElementById(soundId);
  if (sound) {
    sound.pause();
    sound.currentTime = 0;
    sound
      .play()
      .catch((e) => console.log(`Error playing sound ${soundId}:`, e));
  }
}

// FUNGSI BANTUAN: Mengubah tema background di container
function changeTheme(themeClass, targetContainerId) {
  const targetContainer = document.getElementById(targetContainerId);
  if (targetContainer) {
    targetContainer.classList.remove("theme-q1", "theme-q2", "theme-q3");
    if (themeClass) {
      targetContainer.classList.add(themeClass);
    }
  }
}

// FUNGSI BARU: Efek Mengetik
function typeWriterEffect(element, text, speed, callback) {
  let i = 0;
  element.textContent = "";
  const typingSound = document.getElementById("sound-typing");
  if (typingSound) typingSound.loop = true;
  playSound("sound-typing");

  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    } else {
      if (typingSound) typingSound.pause();
      if (callback) callback();
    }
  }
  type();
}

// --- FUNGSI LOGIN ---
function login() {
  userName = document.getElementById("username").value;
  if (userName.trim() === "") {
    alert("Mohon masukkan nama pengguna.");
    return;
  }
  // Mainkan backsound utama saat login (interaksi pengguna pertama)
  const backsound = document.getElementById("backsound");
  if (backsound) {
    backsound.play().catch((error) => console.log("Autoplay diblokir:", error));
  }

  document.getElementById("auth-container").style.display = "none";
  document.getElementById("login-page").style.display = "block";
  document.getElementById("welcome-message").innerText = `Halo, ${userName}!`;
  initializeQuestions();
  changeTheme("theme-q1", "login-page");
}

// --- FUNGSI UTAMA GAME ---
function initializeQuestions() {
  checkGameStatus("start");
  renderQuestionOptions("q2");
  document
    .querySelector("#q2-options")
    .closest(".question-card").style.display = "none";
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function renderQuestionOptions(questionId) {
  const optionsContainer = document.getElementById(`${questionId}-options`);
  const questionData = questions.find((q) => q.id === questionId);

  let shuffledOptions = shuffleArray([...questionData.options]);
  optionsContainer.innerHTML = "";
  const labels = ["A", "B", "C", "D", "E"];

  shuffledOptions.forEach((optionData, index) => {
    const button = document.createElement("button");
    if (questionData.hideOptions) {
      button.textContent = labels[index];
    } else {
      button.textContent = `${labels[index]}. ${optionData.value}`;
    }
    button.setAttribute("data-correct", optionData.isCorrect);
    button.setAttribute("data-value", optionData.value);
    button.onclick = () => handleAnswer(questionId, button);
    optionsContainer.appendChild(button);
  });
}

function handleAnswer(questionId, clickedButton) {
  // Mainkan sound klik setiap kali tombol jawaban diklik
  playSound("sound-click");

  const status =
    questionId === "q1"
      ? validatedQ1
      : questionId === "q2"
      ? validatedQ2
      : validatedQ3;
  if (status === true) return;

  const isCorrect = clickedButton.getAttribute("data-correct") === "true";

  if (isCorrect) {
    playSound("sound-correct");
    if (questionId === "q1" || questionId === "q2") {
      if (status === false) {
        alert("eits, yakin? coba lagi");
        if (questionId === "q1") validatedQ1 = "pending";
        if (questionId === "q2") validatedQ2 = "pending";
        renderQuestionOptions(questionId);
      } else if (status === "pending") {
        alert("yaudah kalo kamu maksa");
        if (questionId === "q1") validatedQ1 = true;
        if (questionId === "q2") validatedQ2 = true;
        checkGameStatus(questionId);
      }
    } else if (questionId === "q3") {
      displayQ3Answers();
      document
        .querySelectorAll("#q3-options button")
        .forEach((btn) => (btn.disabled = true));
      alert(`yahh ketebak deh, SELAMAT YA!`);
      validatedQ3 = true;
      checkGameStatus(questionId);
    }
  } else {
    playSound("sound-wrong");
    attempts[questionId]++;
    alert(`jangan betjanda deh, ayo serius`);
    renderQuestionOptions(questionId);
  }
}

function checkGameStatus(currentQuestionId) {
  if (currentQuestionId === "start") {
    const q1TitleEl = document
      .querySelector("#q1-options")
      .closest(".question-card")
      .querySelector("h2");
    typeWriterEffect(
      q1TitleEl,
      questions.find((q) => q.id === "q1").title,
      50,
      () => renderQuestionOptions("q1")
    );
  } else if (currentQuestionId === "q1" && validatedQ1 === true) {
    document
      .querySelectorAll("#q1-options button")
      .forEach((btn) => (btn.disabled = true));
    document
      .querySelector("#q1-options")
      .closest(".question-card").style.display = "none";

    const q2Card = document
      .querySelector("#q2-options")
      .closest(".question-card");
    q2Card.style.display = "block";
    const q2TitleEl = q2Card.querySelector("h2");
    typeWriterEffect(
      q2TitleEl,
      questions.find((q) => q.id === "q2").title,
      50,
      () => renderQuestionOptions("q2")
    );
    changeTheme("theme-q2", "login-page");
  } else if (currentQuestionId === "q2" && validatedQ2 === true) {
    document
      .querySelectorAll("#q2-options button")
      .forEach((btn) => (btn.disabled = true));
    showQuestion3();
  } else if (
    validatedQ1 === true &&
    validatedQ2 === true &&
    validatedQ3 === true
  ) {
    setTimeout(triggerWin, 3000); // Jeda 3 detik
  }
}

function showQuestion3() {
  const q3Data = questions.find((q) => q.id === "q3");
  const loginPage = document.getElementById("login-page");

  loginPage.innerHTML = `
        <h1 id="welcome-message">Halo, ${userName}!</h1>
        <p>Pilih jawaban yang benar. Untuk pertanyaan ini, isinya disembunyikan!</p>
        <div class="question-card">
            <h2 id="q3-title-element"></h2>
            <div class="options" id="q3-options"></div>
        </div>
    `;

  const q3TitleEl = document.getElementById("q3-title-element");
  typeWriterEffect(q3TitleEl, q3Data.title, 50, () =>
    renderQuestionOptions("q3")
  );
  changeTheme("theme-q3", "login-page");
}

function displayQ3Answers() {
  const optionsContainer = document.getElementById(`q3-options`);
  if (!optionsContainer) return;

  Array.from(optionsContainer.children).forEach((button) => {
    const value = button.getAttribute("data-value");
    button.textContent = `${button.textContent}. ${value}`;
    if (button.getAttribute("data-correct") === "true") {
      button.style.backgroundColor = "lightgreen";
    }
  });
}
// FUNGSI BARU: Memulai ulang permainan
function restartGame() {
  // Cara termudah untuk me-reset game adalah me-reload halaman
  window.location.reload();
}

function triggerWin() {
  const backsound = document.getElementById("backsound");
  if (backsound) backsound.pause();
  playSound("sound-win"); // Mainkan suara kemenangan/tepuk tangan

  const winScreen = document.getElementById("win-screen");
  document.getElementById("login-page").style.display = "none";
  winScreen.style.display = "flex";
  changeTheme(null, "login-page");

  const winText = document.getElementById("win-text");
  winText.textContent = `Selamat ${userName}! Anda berhak melihat gambar terindah di dunia.`;
  const finalMessage = document.createElement("p");
  finalMessage.id = "final-message";
  finalMessage.textContent =
    "Gambar terindah di dunia adalah senyuman Anda saat berhasil menyelesaikan permainan ini! 😊";
  winScreen.appendChild(finalMessage);
  const instructionP = document.createElement("p");
  instructionP.classList.add("win-instruction");
  instructionP.textContent =
    "Klik di mana saja pada layar ini untuk melihat 'gambar'nya.";
  winScreen.appendChild(instructionP);
  const restartButton = document.getElementById("restart-button");
  winScreen.addEventListener("click", function () {
    if (clickedFinalScreen) return;
    clickedFinalScreen = true;
    winScreen.style.backgroundColor = "#000000";
    finalMessage.style.display = "block";
    instructionP.textContent = "Terima kasih sudah bermain!";
    winScreen.style.cursor = "default";
    playSound(null); // Hentikan sound win setelah diklik
    restartButton.style.display = "block";
  });
}
