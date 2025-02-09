/****************************************************
 *  OYUNUN TEMEL KODLARI (game.js)
 *  - Kart oluşturma
 *  - Kazıma mantığı
 *  - Kazanma koşulu
 *  - Splash ekranı geçişi
 ****************************************************/

/* --------------------------
   1) OYUN DEĞİŞKENLERİ
--------------------------- */

const eraserate = 50;
const revealOrder = [
  "./assets/gold.png",
  "./assets/bronz.png",
  "./assets/silver.png",
  "./assets/gold.png",
  "./assets/gold.png"
];
let nextRewardIndex = 0;

const rewardsNames = {
  "./assets/gold.png":   "Gold",
  "./assets/bronz.png":  "Bronz",
  "./assets/silver.png": "Silver",
  // gold.png tekrar tekrar kullanılmış olsa da basit tutuyoruz
};

let gameFinished = false;
let revealedCards = 0;

/* --------------------------
   2) OYUN BAŞLATMA (SPLASH)
--------------------------- */
document.getElementById("startButton").addEventListener("click", function() {
  // Splash ekranını gizle
  document.getElementById("splash").style.display = "none";
  // Oyun ekranını göster
  document.getElementById("gameContainer").style.display = "block";

  // 9 adet (3×3) kart oluştur
  const board = document.getElementById("game-board");
  board.innerHTML = ""; // (yeniden başlatma amaçlı temiz)
  for (let i = 0; i < 9; i++) {
    createScratchCard();
  }

  // Eğer responsive.js'deki handleResize fonksiyonundan 
  // hemen yararlanmak isterseniz:
  if (typeof handleResize === "function") {
    handleResize(); 
  }
});

/* --------------------------
   3) KART OLUŞTURMA
--------------------------- */
function createScratchCard() {
  const card = document.createElement("div");
  card.classList.add("scratch-card");

  // Ödül resmi
  const reward = document.createElement("img");
  reward.classList.add("revealed");
  reward.style.visibility = "hidden";
  card.appendChild(reward);

  // Kaplama (canvas)
  const cover = document.createElement("canvas");
  cover.classList.add("cover");
  // Başlangıçta rasgele bir boyut. (Responsive.js'de güncellenecek.)
  cover.width = 100;
  cover.height = 100;
  card.appendChild(cover);

  // Board'a ekle
  document.getElementById("game-board").appendChild(card);

  // Kaplama resmini çiz
  const ctx = cover.getContext("2d");
  const coverImg = new Image();
  coverImg.src = "./assets/cover.png";
  coverImg.onload = () => {
    console.log("Kaplama resmi yüklendi!");
    ctx.drawImage(coverImg, 0, 0, cover.width, cover.height);
    
  };

  // Kazıma ile ilgili
  let isScratching = false;

  cover.addEventListener("mousedown", startScratching);
  cover.addEventListener("mouseup", stopScratching);
  cover.addEventListener("mouseleave", stopScratching);
  cover.addEventListener("mousemove", (e) => scratch(e, cover, ctx));

  cover.addEventListener("touchstart", startScratching, { passive: false });
  cover.addEventListener("touchend", stopScratching);
  cover.addEventListener("touchmove", (e) => scratch(e, cover, ctx), { passive: false });

  function startScratching(e) {
    e.preventDefault();
    if (gameFinished) return;
    isScratching = true;
  }

  function stopScratching() {
    isScratching = false;
  }

  function scratch(e, canvas, context) {
    if (!isScratching || gameFinished) return;
    e.preventDefault();

    // Koordinatları hesapla
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const pointerX = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const pointerY = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    const x = pointerX * scaleX;
    const y = pointerY * scaleY;

    // Kazıma
    context.globalCompositeOperation = "destination-out";
    context.beginPath();
    context.arc(x, y, 12, 0, Math.PI * 2);
    context.fill();

    // Kazıma oranı hesapla
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentPixels = 0;
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) {
        transparentPixels++;
      }
    }
    const clearedPercentage = (transparentPixels / (pixels.length / 4)) * 100;

    if (clearedPercentage > eraserate) {
      if (!canvas.dataset.revealed) {
        canvas.dataset.revealed = true;
        revealedCards++;
        let currentReward = revealOrder[nextRewardIndex % revealOrder.length];
        nextRewardIndex++;

        reward.src = currentReward;
        reward.style.visibility = "visible";
        canvas.style.display = "none";

        checkWinCondition();
      }
    }
  }
}

/* --------------------------
   4) KAZANMA DURUMU KONTROLÜ
--------------------------- */
function checkWinCondition() {
  if (gameFinished || revealedCards < 3) return;
  
  const revealedImgs = document.querySelectorAll(".revealed");
  const counts = {};
  revealOrder.forEach(r => counts[r] = 0);

  revealedImgs.forEach(img => {
    if (img.style.visibility === "visible") {
      const srcName = img.src.split("/").pop(); // gold.png vs
      const fullPath = "./assets/" + srcName;
      if (counts[fullPath] !== undefined) {
        counts[fullPath]++;
      }
    }
  });

  for (const r in counts) {
    if (counts[r] >= 3) {
      gameFinished = true;
      const rewardName = rewardsNames[r] || "Ödül";
      document.getElementById("message").innerText = `Kazandın! ${rewardName}`;
      setTimeout(() => alert(`Kazandın! ${rewardName}`), 300);
      return;
    }
  }
}
