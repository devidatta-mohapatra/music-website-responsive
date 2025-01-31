$(document).ready(async function () {
  const cover = document.getElementById("coverImg");
  const disc = document.getElementById("disc");
  const title = document.getElementById("title");
  const artist = document.getElementById("artist");
  const progressContainer = document.getElementById("progress-container");
  const progress = document.getElementById("progress");
  const timer = document.getElementById("timer");
  const duration = document.getElementById("duration");
  const prev = document.getElementById("prev");
  const play = document.getElementById("play");
  const next = document.getElementById("next");
  let songIndex = 0;
  let finalIndex = 0;
  let songSearchName = null;
  let page = 1;
  const noInternet = document.getElementById("no-internet");
  const musicCon = document.getElementById("music-container");
  const searchBtn = document.getElementById("search-btn");
  const search = document.getElementById("search");
  const loader = document.getElementById("loader");
  let songs = [];
  //check online or offline

  setInterval(() => {
    if (!window.navigator.onLine) {
      musicCon.style.display = "none";
      noInternet.style.display = "block";
    } else {
      musicCon.style.display = "block";
      noInternet.style.display = "none";
    }
  }, 1000);

  searchBtn.addEventListener("click", async () => {
    cover.src = "assets/images/loading.gif";
    songs = [];
    loader.style.display = "block";
    if (search.value == "") {
      alert("Please enter a song name");
    } else {
      loader.style.display = "block";
      songSearchName = search.value.trim();
      searchSong(search.value.trim());
      searchBtn.disabled = true;
    }
  });
  const formatDuration = (durationInSeconds) => {
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = durationInSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const formateData = (data) => {
    data.forEach((ele) => {
      songs.push({
        title: ele.song,
        artist: ele.music,
        coverPath: ele.image,
        discPath: ele.media_url,
        duration: formatDuration(ele.duration),
      });
    });

    finalIndex = songs.length;
    loadSong(songs[songIndex]);
  };
  const fetchData = async (query) => {
    const response = await fetch(
      `https://jio-saavn-api-devidatta.vercel.app/song/?query=${query}&page=${page}`
    );
    if (!response.ok) {
      loader.style.display = "none";
      next.style.display = "block";
      return;
    }
    return await response.json();
  };
  const searchSong = async (songName) => {
    songName = songName.toLowerCase();
    songName = songName.replace(" ", "+");
    let songData = await fetchData(songName);
    formateData(songData);
    searchBtn.disabled = false;
    loader.style.display = "none";
    //next.style.display="block";
  };
  songSearchName = "trending hindi song";
  await searchSong("trending hindi song");

  // Load song initially
  loadSong(songs[songIndex]);

  // Load the given song
  function loadSong(song) {
    cover.src = song.coverPath;
    disc.src = song.discPath;
    title.textContent = song.title;
    artist.textContent = song.artist;
    duration.textContent = song.duration;
  }

  // Toggle play and pause
  function playPauseMedia() {
    if (disc.paused) {
      disc.play();
    } else {
      disc.pause();
    }
  }

  // Update icon
  function updatePlayPauseIcon() {
    if (disc.paused) {
      play.classList.remove("fa-pause");
      play.classList.add("fa-play");
    } else {
      play.classList.remove("fa-play");
      play.classList.add("fa-pause");
    }
  }

  // Update progress bar
  function updateProgress() {
    progress.style.width = (disc.currentTime / disc.duration) * 100 + "%";

    let minutes = Math.floor(disc.currentTime / 60);
    let seconds = Math.floor(disc.currentTime % 60);
    if (seconds < 10) {
      seconds = "0" + seconds;
    }
    timer.textContent = `${minutes}:${seconds}`;
  }

  // Reset the progress
  function resetProgress() {
    progress.style.width = 0 + "%";
    timer.textContent = "0:00";
  }

  // Go to previous song
  function gotoPreviousSong() {
    if (songIndex === 0) {
      songIndex = songs.length - 1;
    } else {
      songIndex = songIndex - 1;
    }

    const isDiscPlayingNow = !disc.paused;
    loadSong(songs[songIndex]);
    resetProgress();
    if (isDiscPlayingNow) {
      playPauseMedia();
    }
  }

  // Go to next song
  function gotoNextSong(playImmediately) {
    if (songIndex === songs.length - 3) {
      //console.log("yes")
      page += 1;
      loader.style.display = "block";
      //next.style.display="none"
      searchSong(songSearchName);
    } else {
      songIndex = songIndex + 1;
    }

    const isDiscPlayingNow = !disc.paused;
    loadSong(songs[songIndex]);
    resetProgress();
    if (isDiscPlayingNow || playImmediately) {
      playPauseMedia();
    }
  }

  // Change song progress when clicked on progress bar
  function setProgress(ev) {
    const totalWidth = this.clientWidth;
    const clickWidth = ev.offsetX;
    const clickWidthRatio = clickWidth / totalWidth;
    disc.currentTime = clickWidthRatio * disc.duration;
  }

  // Play/Pause when play button clicked
  play.addEventListener("click", playPauseMedia);

  // Various events on disc
  disc.addEventListener("play", updatePlayPauseIcon);
  disc.addEventListener("pause", updatePlayPauseIcon);
  disc.addEventListener("timeupdate", updateProgress);
  disc.addEventListener("ended", gotoNextSong.bind(null, true));

  // Go to next song when next button clicked
  prev.addEventListener("click", gotoPreviousSong);

  // Go to previous song when previous button clicked
  next.addEventListener("click", gotoNextSong.bind(null, false));

  // Move to different place in the song
  progressContainer.addEventListener("click", setProgress);
});
