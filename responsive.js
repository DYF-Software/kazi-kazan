/****************************************************
 *  RESPONSIVE İŞLEMLER (responsive.js)
 *  - Canvas boyutlandırma
 *  - Yeniden boyutlanınca kaplamayı yeniden çizme
 ****************************************************/

/**
 * Ekran boyutlandığında çağrılacak fonksiyon.
 */
function handleResize() {
    // Tüm canvasları seç
    const covers = document.querySelectorAll(".cover");
    covers.forEach(cover => {
      // Her cover'ın ebeveyni (scratch-card) boyutunu al
      const parentCard = cover.parentElement;
      if (!parentCard) return;
  
      const cardRect = parentCard.getBoundingClientRect();
      // Genişlik-yükseklik = ebeveynin alanı
      cover.width = Math.floor(cardRect.width);
      cover.height = Math.floor(cardRect.height);
  
      // Canvas'ı yeniden kaplamak (cover.png)
      const ctx = cover.getContext("2d");
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, cover.width, cover.height);
  
      const img = new Image();
      img.src = "./assets/cover.png";
      img.onload = () => {
        ctx.drawImage(img, 0, 0, cover.width, cover.height);
      };
    });
  }
  
  // Pencere boyutlandığında handleResize'i çağır
  window.addEventListener("resize", () => {
    handleResize();
  });
  