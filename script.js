let userName = "";
let attempts = { q1: 0, q2: 0 };
let solved = { q1: false, q2: false };

// Data Pertanyaan diubah untuk memisahkan label dan konten
const questions = [
  {
    id: "q1",
    options: [
      { label: "A", value: "Soekarno", isCorrect: true },
      { label: "B", value: "Jokowi", isCorrect: false },
      { label: "C", value: "Soeharto", isCorrect: false },
    ],
  },
  {
    id: "q2",
    options: [
      { label: "A", value: "Jawa Tengah", isCorrect: true },
      { label: "B", value: "Bali", isCorrect: false },
      { label: "C", value: "Papua", isCorrect: false },
    ],
  },
];

// --- FUNGSI LOGIN (Sama) ---
function login() {
  userName = document.getElementById("username").value;
  if (userName.trim() === "") {
    alert("Mohon masukkan nama pengguna.");
    return;
  }
  document.getElementById("auth-container").style.display = "none";
  document.getElementById("login-page").style.display = "block";
  document.getElementById("welcome-message").innerText = `Halo, ${userName}!`;
  initializeQuestions();
}

// --- FUNGSI UTAMA GAME ---

function initializeQuestions() {
  // Saat inisialisasi, kita acak dulu untuk klik pertama
  questions.forEach((q) => renderQuestionOptions(q.id, true));
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// forceShuffle digunakan untuk inisialisasi dan klik pertama/kedua
function renderQuestionOptions(questionId, forceShuffle = false) {
  const optionsContainer = document.getElementById(`${questionId}-options`);
  const questionData = questions.find((q) => q.id === questionId);

  if (!forceShuffle) return;

  // Acak opsi berdasarkan data value, bukan label A/B/C
  let shuffledOptions = shuffleArray([...questionData.options]);

  optionsContainer.innerHTML = "";

  // Tetapkan label A, B, C secara statis ke opsi yang sudah diacak
  shuffledOptions.forEach((optionData, index) => {
    const button = document.createElement("button");
    // Teks tombol HANYA A, B, atau C
    button.textContent = ["A", "B", "C"][index];

    // Simpan data asli di atribut data HTML
    button.setAttribute("data-value", optionData.value);
    button.setAttribute("data-correct", optionData.isCorrect);

    button.onclick = () => handleAnswer(questionId, button);
    optionsContainer.appendChild(button);
  });
}

function handleAnswer(questionId, clickedButton) {
  if (solved[questionId]) return;

  attempts[questionId]++;

  const isCorrect = clickedButton.getAttribute("data-correct") === "true";
  const answerValue = clickedButton.getAttribute("data-value");

  if (isCorrect) {
    // Jawaban benar pada klik manapun (beruntung)
    alert(`Benar! Isinya adalah: ${answerValue}`);
    markAsSolved(questionId);
  } else {
    // Jawaban salah
    if (attempts[questionId] < 3) {
      alert(
        `Salah! Isinya: ${answerValue}. Masih ada ${
          3 - attempts[questionId]
        } kesempatan acak lagi.`
      );
      // Acak ulang untuk kesempatan berikutnya
      renderQuestionOptions(questionId, true);
    } else {
      alert(
        `Salah! Isinya: ${answerValue}. Opsi tidak akan diacak lagi. Cari jawaban yang benar.`
      );
      // Nonaktifkan tombol yang salah
      clickedButton.disabled = true;
      // Jika sudah 3 kali salah, biarkan user memilih dari opsi yang tersisa
    }
  }
}

function markAsSolved(questionId) {
  solved[questionId] = true;
  const optionsContainer = document.getElementById(`${questionId}-options`);
  Array.from(optionsContainer.children).forEach((button) => {
    button.disabled = true;
    if (button.getAttribute("data-correct") === "true") {
      button.style.backgroundColor = "lightgreen";
      // Update teks tombol yang benar agar menampilkan isi jawabannya
      button.textContent = `${button.textContent}. ${button.getAttribute(
        "data-value"
      )}`;
    }
  });

  if (solved.q1 && solved.q2) {
    triggerWin();
  }
}

let clickedFinalScreen = false;

// --- FUNGSI KEMENANGAN (Diperbarui) ---
function triggerWin() {
  const winScreen = document.getElementById("win-screen");
  const winText = document.getElementById("win-text");

  // Set teks kemenangan awal
  winText.textContent = `Selamat ${userName}! Anda berhak melihat gambar terindah di dunia.`;

  // Tampilkan layar kemenangan
  winScreen.style.display = "flex";

  // Siapkan elemen untuk pesan akhir
  const finalMessage = document.createElement("p");
  finalMessage.id = "final-message";
  // Gunakan pesan dari konsol sebelumnya
  finalMessage.textContent =
    "Gambar terindah di dunia adalah senyuman Anda saat berhasil menyelesaikan codingan ini! 😊";
  winScreen.appendChild(finalMessage);

  const instructionP = document.createElement("p");
  instructionP.classList.add("win-instruction");
  instructionP.textContent =
    "Klik di mana saja pada layar ini untuk melihat 'gambar'nya.";
  winScreen.appendChild(instructionP);

  // Tambahkan event listener untuk klik di mana saja pada layar kemenangan
  winScreen.addEventListener("click", function () {
    if (clickedFinalScreen) return; // Hentikan jika sudah diklik

    clickedFinalScreen = true;

    // 1. Jadikan layar semakin hitam (dari #000 ke #000, jadi efek visualnya minimal tapi logikanya terpenuhi)
    winScreen.style.backgroundColor = "#000000"; // Sudah hitam pekat

    // 2. Munculkan tulisan yang sebelumnya ada di konsol
    finalMessage.style.display = "block";

    // Update instruksi
    instructionP.textContent = "Terima kasih sudah bermain!";
    winScreen.style.cursor = "default"; // Hapus kursor pointer
  });
}
