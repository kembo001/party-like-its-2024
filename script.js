
document.addEventListener('DOMContentLoaded', function () {
  var audio;
  var playPauseBtn = document.getElementById('playPauseBtn');
  var stopBtn = document.getElementById('stopBtn');
  var scrollingText = document.getElementById('scrollingText');
  var currentSongIndex = 0;

  var playlist = [
    {
      title: 'Black Sheep (Brie Larson Vocal Version)',
      src: 'img/Song.mp3'
    },

    {
      title: 'Please Shut Up',
      src: 'music/music-inro.mp3'
    }
  ];

  function loadSong(index) {
    audio = new Audio(playlist[index].src);
    scrollingText.textContent = playlist[index].title;
  }

  loadSong(currentSongIndex);

  playPauseBtn.addEventListener('click', function () {
    if (audio.paused) {
      audio.play();
      playPauseBtn.textContent = 'Pause';
      scrollingText.classList.add('scrolling-animation');
    } else {
      audio.pause();
      playPauseBtn.textContent = 'Play';
      scrollingText.classList.remove('scrolling-animation');
    }
  });

  stopBtn.addEventListener('click', function () {
    audio.pause();
    audio.currentTime = 0;
    playPauseBtn.textContent = 'Play';
    scrollingText.classList.remove('scrolling-animation');
  });

  audio.addEventListener('ended', function () {
 
    currentSongIndex = (currentSongIndex + 1) % playlist.length;
    loadSong(currentSongIndex);
    audio.play();
  });
});
  


  var modal = document.getElementById("myModal");
  var modalImg = document.getElementById("modalImg");
  var galleryItems = document.querySelectorAll(".gallery-item");
  var prevBtn = document.getElementById("prevBtn");
  var nextBtn = document.getElementById("nextBtn");
  var currentIndex;

  galleryItems.forEach(function(item, index) {
    item.addEventListener("click", function(e) {
      e.preventDefault();
      modal.style.display = "flex";
      modalImg.src = this.querySelector("img").src;
      currentIndex = index;
    });
  });

  prevBtn.addEventListener("click", function() {
    showImage(-1);
  });

  nextBtn.addEventListener("click", function() {
    showImage(1);
  });

  modal.addEventListener("click", function(e) {
    if (e.target === modal || e.target.className === "close") {
      closeModal();
    }
  });

  function showImage(direction) {
    currentIndex += direction;

    if (currentIndex < 0) {
      currentIndex = galleryItems.length - 1;
    } else if (currentIndex >= galleryItems.length) {
      currentIndex = 0;
    }

    modalImg.src = galleryItems[currentIndex].querySelector("img").src;
  }

  function closeModal() {
    modal.style.display = "none";
    currentIndex = undefined;
  }

  function checkPassword() {
    var enteredPassword = document.getElementById("password").value;
    var correctPassword = "NucleicAcids"; 

    if (enteredPassword === correctPassword) {
        
        window.location.href = "main.html";
    } else {
        
        var modal = document.getElementById("customModal");
        modal.style.display = "block";

       
        document.getElementById("modalImage").src = "img/adventure-time-bmo-game-over-aft70vderh10hupg.gif";
    }
}


window.onclick = function (event) {
    var modal = document.getElementById("customModal");
    if (event.target === modal) {
        modal.style.display = "none";
    }
};
