
const openBtn = document.getElementById("openVideo");
const modal = document.getElementById("videoModal");
const closeBtn = document.getElementById("closeVideo");
const video = document.getElementById("popupVideo");

openBtn.onclick = () => {
    modal.style.display = "flex";
    video.play();
};

closeBtn.onclick = () => {
    modal.style.display = "none";
    video.pause();
    video.currentTime = 0;
};

// ✅ Close when clicking outside video
modal.onclick = (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
        video.pause();
        video.currentTime = 0;
    }
};