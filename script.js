/* =========================================================
   Party Like it's 2024
   Shared by main.html, index.html (login) and south-africa.html.
   Every init function checks for its elements first, so a page
   only runs the parts it actually has.
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {
  initMusicPlayer();
  initLightbox();
  initLogin();
  initTaskbarClock();
  initCalendar();
  initStartMenu();
  initScreensaver();
});

function prefersReducedMotion() {
  return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}

// Today's month and day, but always in 2024 (a leap year, so every day exists).
function dateIn2024(d) {
  return new Date(2024, d.getMonth(), d.getDate());
}

/* ---------- Music player: "Now Playing" deck (main.html) ---------- */
function initMusicPlayer() {
  var playPauseBtn = document.getElementById('playPauseBtn');
  var stopBtn = document.getElementById('stopBtn');
  var scrollingText = document.getElementById('scrollingText');
  var timeEl = document.getElementById('trackTime');
  if (!playPauseBtn || !scrollingText) return;

  var playlist = [
    {
      title: 'Summertime · Sex Bob-Omb',
      src: 'img/Song.mp3'
    },

    {
      title: 'Please Shut Up',
      src: 'music/music-inro.mp3'
    }
  ];
  var currentSongIndex = 0;

  // One audio element for the whole playlist, so "ended" keeps firing
  // for every track, not just the first.
  var audio = new Audio();
  audio.preload = 'metadata';

  function pad(n) { return String(n).padStart(2, '0'); }

  function renderTime() {
    if (!timeEl) return;
    var t = Math.floor(audio.currentTime || 0);
    timeEl.textContent = '[' + pad(currentSongIndex + 1) + '] ' + pad(Math.floor(t / 60)) + ':' + pad(t % 60);
  }

  function setPlaying(isPlaying) {
    playPauseBtn.textContent = isPlaying ? 'Pause' : 'Play';
    scrollingText.classList.toggle('scrolling-animation', isPlaying);
    document.body.classList.toggle('is-playing', isPlaying);
  }

  function loadSong(index) {
    currentSongIndex = index;
    audio.src = playlist[index].src;
    scrollingText.textContent = playlist[index].title;
    scrollingText.setAttribute('data-track', playlist[index].title);
    renderTime();
  }

  function play() {
    setPlaying(true);
    var attempt = audio.play();
    if (attempt && attempt.catch) {
      attempt.catch(function () {
        if (audio.paused) setPlaying(false);
      });
    }
  }

  loadSong(currentSongIndex);

  playPauseBtn.addEventListener('click', function () {
    if (audio.paused) {
      play();
    } else {
      audio.pause();
      setPlaying(false);
    }
  });

  if (stopBtn) {
    stopBtn.addEventListener('click', function () {
      audio.pause();
      audio.currentTime = 0;
      setPlaying(false);
      renderTime();
    });
  }

  audio.addEventListener('timeupdate', renderTime);

  audio.addEventListener('ended', function () {
    loadSong((currentSongIndex + 1) % playlist.length);
    play();
  });

  // If a track can't load (for example a missing file), don't leave the
  // deck stuck on "Pause": stop and cue the first track again.
  audio.addEventListener('error', function () {
    setPlaying(false);
    if (currentSongIndex !== 0) loadSong(0);
  });
}

/* ---------- Photo lightbox (main.html, south-africa.html) ---------- */
function initLightbox() {
  var modal = document.getElementById('myModal');
  var modalImg = document.getElementById('modalImg');
  var caption = document.getElementById('modalCaption');
  var count = document.getElementById('modalCount');
  var closeBtn = document.getElementById('modalClose');
  var prevBtn = document.getElementById('prevBtn');
  var nextBtn = document.getElementById('nextBtn');
  if (!modal || !modalImg || !closeBtn) return;

  // One entry per photo on the page, in page order.
  var photos = Array.prototype.slice.call(document.querySelectorAll('.gallery-item img'));
  if (!photos.length) return;
  var currentIndex = 0;
  var lastFocused = null;

  function captionFor(img) {
    var figure = img.closest('figure');
    var figcaption = figure && figure.querySelector('figcaption');
    if (figcaption) return figcaption.textContent.trim();
    var win = img.closest('.window');
    var title = win && win.querySelector('.title-bar__title');
    return title ? title.textContent.trim() : 'Photo';
  }

  function show(index) {
    currentIndex = (index + photos.length) % photos.length;
    var img = photos[currentIndex];
    modalImg.src = img.currentSrc || img.src;
    modalImg.alt = img.alt;
    if (caption) caption.textContent = captionFor(img);
    if (count) count.textContent = (currentIndex + 1) + ' / ' + photos.length;
  }

  function isOpen() {
    return modal.style.display === 'flex';
  }

  function open(index) {
    lastFocused = document.activeElement;
    show(index);
    modal.style.display = 'flex';
    document.body.classList.add('modal-open');
    closeBtn.focus();
  }

  function close() {
    modal.style.display = 'none';
    document.body.classList.remove('modal-open');
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  photos.forEach(function (img, index) {
    img.setAttribute('tabindex', '0');
    img.setAttribute('role', 'button');
    if (!img.getAttribute('aria-label')) {
      img.setAttribute('aria-label', 'Open photo: ' + captionFor(img));
    }
    img.addEventListener('click', function (e) {
      e.preventDefault();
      open(index);
    });
    img.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open(index);
      }
    });
  });

  if (prevBtn) prevBtn.addEventListener('click', function () { show(currentIndex - 1); });
  if (nextBtn) nextBtn.addEventListener('click', function () { show(currentIndex + 1); });
  closeBtn.addEventListener('click', close);

  modal.addEventListener('click', function (e) {
    if (e.target === modal) close();
  });

  document.addEventListener('keydown', function (e) {
    if (!isOpen()) return;
    if (e.key === 'Escape') {
      close();
    } else if (e.key === 'ArrowLeft') {
      show(currentIndex - 1);
    } else if (e.key === 'ArrowRight') {
      show(currentIndex + 1);
    } else if (e.key === 'Tab') {
      // keep keyboard focus inside the dialog
      var focusables = [closeBtn, prevBtn, nextBtn].filter(Boolean);
      var i = focusables.indexOf(document.activeElement);
      e.preventDefault();
      var next = e.shiftKey ? i - 1 : i + 1;
      focusables[(next + focusables.length) % focusables.length].focus();
    }
  });
}

/* ---------- Password page (index.html) ---------- */
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

// Wires the login dialog to checkPassword() above without changing it.
function initLogin() {
  var form = document.getElementById('loginForm');
  var modal = document.getElementById('customModal');
  if (!form || !modal) return;
  var input = document.getElementById('password');
  var errorImg = document.getElementById('modalImage');

  // The game-over GIF only shows if it actually loads; otherwise the
  // dialog falls back to its pixel error icon.
  if (errorImg) {
    errorImg.addEventListener('load', function () { errorImg.hidden = false; });
    errorImg.addEventListener('error', function () { errorImg.hidden = true; });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    checkPassword();
    if (modal.style.display === 'block') {
      var ok = modal.querySelector('.error-dialog__actions [data-close-modal]');
      if (ok) ok.focus();
    }
  });

  function closeError() {
    modal.style.display = 'none';
    if (input) {
      input.focus();
      input.select();
    }
  }

  Array.prototype.forEach.call(modal.querySelectorAll('[data-close-modal]'), function (btn) {
    btn.addEventListener('click', closeError);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.style.display === 'block') closeError();
  });
}

/* ---------- Taskbar clock: today's time, but it's always 2024 ---------- */
function initTaskbarClock() {
  var timeEl = document.getElementById('taskbarTime');
  var dateEl = document.getElementById('taskbarDate');
  var tray = document.getElementById('tray');
  if (!timeEl) return;

  function tick() {
    var now = new Date();
    var day = dateIn2024(now);
    timeEl.textContent = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    if (dateEl) dateEl.textContent = (day.getMonth() + 1) + '/' + day.getDate() + '/2024';
    if (tray) {
      tray.title = day.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
  }

  tick();
  setInterval(tick, 15000);
}

/* ---------- Calendar widget: this month, in 2024 ---------- */
function initCalendar() {
  var body = document.getElementById('calBody');
  var table = document.getElementById('calTable');
  var monthEl = document.getElementById('calMonth');
  if (!body) return;

  var today = dateIn2024(new Date());
  var month = today.getMonth();
  var firstWeekday = new Date(2024, month, 1).getDay();
  var daysInMonth = new Date(2024, month + 1, 0).getDate();
  var monthName = today.toLocaleDateString([], { month: 'long' });

  if (monthEl) monthEl.textContent = monthName;
  if (table) table.setAttribute('aria-label', monthName + ' 2024');

  body.innerHTML = '';
  var row = document.createElement('tr');
  for (var blank = 0; blank < firstWeekday; blank++) {
    row.appendChild(document.createElement('td'));
  }
  for (var d = 1; d <= daysInMonth; d++) {
    if (row.children.length === 7) {
      body.appendChild(row);
      row = document.createElement('tr');
    }
    var cell = document.createElement('td');
    cell.textContent = d;
    if (d === today.getDate()) {
      cell.className = 'is-today';
      cell.setAttribute('aria-current', 'date');
    }
    row.appendChild(cell);
  }
  while (row.children.length < 7) row.appendChild(document.createElement('td'));
  body.appendChild(row);
}

/* ---------- Start menu ---------- */
function initStartMenu() {
  var btn = document.getElementById('startBtn');
  var menu = document.getElementById('startMenu');
  if (!btn || !menu) return;

  function items() {
    return Array.prototype.filter.call(menu.querySelectorAll('a, button'), function (el) {
      return el.offsetParent !== null;
    });
  }

  function open() {
    menu.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    var first = items()[0];
    if (first) first.focus();
  }

  function close(returnFocus) {
    menu.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    if (returnFocus) btn.focus();
  }

  btn.addEventListener('click', function () {
    if (menu.hidden) open();
    else close(false);
  });

  menu.addEventListener('click', function (e) {
    if (e.target.closest('a, button')) close(false);
  });

  document.addEventListener('click', function (e) {
    if (!menu.hidden && !menu.contains(e.target) && !btn.contains(e.target)) close(false);
  });

  menu.addEventListener('keydown', function (e) {
    var list = items();
    var i = list.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      list[(i + 1) % list.length].focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      list[(i - 1 + list.length) % list.length].focus();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !menu.hidden) close(true);
  });
}

/* ---------- Starfield screensaver (Start menu) ---------- */
function initScreensaver() {
  var btn = document.getElementById('screensaverBtn');
  var canvas = document.getElementById('screensaver');
  if (!btn || !canvas || !canvas.getContext) return;
  if (prefersReducedMotion()) {
    var item = btn.closest('li');
    if (item) item.hidden = true;
    return;
  }

  var ctx = canvas.getContext('2d');
  var colors = ['#ffffff', '#ffffff', '#d8d0f4', '#4ff3ff', '#ff9be8'];
  var stars = [];
  var running = false;
  var frame = 0;
  var startedAt = 0;
  var w = 0;
  var h = 0;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function resetStar(s, far) {
    s.x = (Math.random() - 0.5) * w;
    s.y = (Math.random() - 0.5) * h;
    s.z = far ? w : Math.random() * w;
    s.c = colors[Math.floor(Math.random() * colors.length)];
    return s;
  }

  function draw() {
    if (!running) return;
    ctx.fillStyle = 'rgba(6, 5, 24, 0.35)';
    ctx.fillRect(0, 0, w, h);
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      s.z -= w * 0.006;
      if (s.z <= 1) resetStar(s, true);
      var k = 160 / s.z;
      var px = Math.round(s.x * k + w / 2);
      var py = Math.round(s.y * k + h / 2);
      if (px < 0 || px >= w || py < 0 || py >= h) {
        resetStar(s, true);
        continue;
      }
      var size = Math.max(1, Math.round((1 - s.z / w) * 4));
      ctx.fillStyle = s.c;
      ctx.fillRect(px, py, size, size);
    }
    frame = requestAnimationFrame(draw);
  }

  function stop() {
    if (!running) return;
    running = false;
    cancelAnimationFrame(frame);
    canvas.hidden = true;
    document.removeEventListener('keydown', onKey, true);
    document.removeEventListener('pointerdown', onPointer, true);
    document.removeEventListener('pointermove', onMove, true);
    window.removeEventListener('resize', resize);
    var startBtn = document.getElementById('startBtn');
    if (startBtn) startBtn.focus();
  }

  function onKey(e) { e.preventDefault(); stop(); }
  function onPointer(e) { e.preventDefault(); stop(); }
  function onMove(e) {
    // ignore the tiny jitter right after launching it
    if (performance.now() - startedAt > 800 && (Math.abs(e.movementX) + Math.abs(e.movementY) > 6)) stop();
  }

  btn.addEventListener('click', function () {
    resize();
    stars = [];
    for (var i = 0; i < 260; i++) stars.push(resetStar({}, false));
    ctx.fillStyle = '#060518';
    ctx.fillRect(0, 0, w, h);
    canvas.hidden = false;
    running = true;
    startedAt = performance.now();
    // Listeners are added on the next tick so the launching click doesn't close it.
    setTimeout(function () {
      document.addEventListener('keydown', onKey, true);
      document.addEventListener('pointerdown', onPointer, true);
      document.addEventListener('pointermove', onMove, true);
    }, 0);
    window.addEventListener('resize', resize);
    frame = requestAnimationFrame(draw);
  });
}
