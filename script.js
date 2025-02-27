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
};

let gameFinished = false;
let revealedCards = 0;
let activeCardId = null; // Yalnızca kazınan kartı takip eder
let isScratching = false; // Kazıma devam ederken başka karta izin vermez

/* --------------------------
   2) OYUN BAŞLATMA (SPLASH)
--------------------------- */
document.getElementById("startButton").addEventListener("click", function() {
  document.getElementById("splash").style.display = "none";
  document.getElementById("gameContainer").style.display = "block";

  const board = document.getElementById("game-board");
  board.innerHTML = ""; // Yeniden başlatma için temizle
  for (let i = 0; i < 9; i++) {
    createScratchCard(i); // Her karta benzersiz bir kimlik atanıyor
  }

  if (typeof handleResize === "function") {
    handleResize();
  }
});

/* --------------------------
   3) KART OLUŞTURMA
--------------------------- */
function createScratchCard(index) {
  const card = document.createElement("div");
  card.classList.add("scratch-card");

  const reward = document.createElement("img");
  reward.classList.add("revealed");
  reward.style.visibility = "hidden";
  card.appendChild(reward);

  const cover = document.createElement("canvas");
  cover.classList.add("cover");
  cover.width = 100;
  cover.height = 100;
  cover.dataset.cardId = index; // **Her karta benzersiz ID ekleniyor**
  card.appendChild(cover);

  document.getElementById("game-board").appendChild(card);

  const ctx = cover.getContext("2d");
  const coverImg = new Image();
  coverImg.src = "./assets/cover.png";
  coverImg.onload = () => {
    ctx.drawImage(coverImg, 0, 0, cover.width, cover.height);
  };

  cover.addEventListener("mousedown", (e) => startScratching(e, cover));
  cover.addEventListener("mouseup", stopScratching);
  cover.addEventListener("mouseleave", stopScratching);
  cover.addEventListener("mousemove", (e) => scratch(e, cover, ctx));

  cover.addEventListener("touchstart", (e) => startScratching(e, cover), { passive: false });
  cover.addEventListener("touchend", stopScratching);
  cover.addEventListener("touchmove", (e) => scratch(e, cover, ctx), { passive: false });

  function startScratching(e, canvas) {
    e.preventDefault();
    if (gameFinished) return;

    let cardId = canvas.dataset.cardId;
    
    // **Eğer başka bir kart kazınıyorsa ve henüz tamamlanmadıysa yeni kart kazınamaz**
    if (isScratching && activeCardId !== cardId) {
      console.log(`Kazıma devam ediyor! Yeni karta geçilemez. Aktif kart: ${activeCardId}`);
      return;
    }

    if (!isScratching && (activeCardId == cardId || activeCardId == null)) {
      console.log(`Kazımaya başlandı! Kart ID: ${cardId}` + activeCardId);
      activeCardId = cardId;
      isScratching = true;
    }
  }

  function stopScratching() {
    isScratching = false;
  }

  function scratch(e, canvas, context) {
    if (!isScratching || gameFinished) return;
    if (canvas.dataset.cardId !== activeCardId) return; // **Sadece aktif kart kazınabilir!**

    e.preventDefault();

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const pointerX = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const pointerY = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    const x = pointerX * scaleX;
    const y = pointerY * scaleY;

    context.globalCompositeOperation = "destination-out";
    context.beginPath();
    context.arc(x, y, 12, 0, Math.PI * 2);
    context.fill();

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
        console.log(`Kazıma bitti! Kart ID: ${activeCardId}`);
        isScratching = false;
        activeCardId = null; // Kazıma bittiğinde yeni bir kart kazınabilir
        reward.src = currentReward;
        reward.style.visibility = "visible";
        canvas.style.display = "none";

        checkWinCondition();
        stopScratching(); // Kart tamamen kazınınca başka kart kazınabilir!
      }
    }
  }
}

/* --------------------------
   4) KAZANMA DURUMU KONTROLÜ
--------------------------- */
/* --------------------------
   5) KAZANMA DURUMU KONTROLÜ (Kupon Pop-up Eklenmiş)
--------------------------- */
function checkWinCondition() {
  if (gameFinished || revealedCards < 3) return;

  const revealedImgs = document.querySelectorAll(".revealed");
  const counts = {};
  revealOrder.forEach(r => counts[r] = 0);

  revealedImgs.forEach(img => {
    if (img.style.visibility === "visible") {
      const srcName = img.src.split("/").pop();
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

      // Kupon Pop-up'ını Göster
      setTimeout(() => {
        document.getElementById("couponPopup").style.display = "flex";
      }, 300);
      return;
    }
  }
}
function copyCoupon() {
  var couponText = document.getElementById("couponCode").innerText;
  navigator.clipboard.writeText(couponText).then(function() {
      document.getElementById("copyMessage").style.display = "block";
  });
}
