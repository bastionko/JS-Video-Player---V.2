let playPauseBtn = document.querySelector(".play-pause-btn");
let miniPlayerBtn = document.querySelector(".mini-player-btn");
let fullScreenBtn = document.querySelector(".full-screen-btn");
let mutedBtn = document.querySelector('.mute-btn');
let captionsBtn = document.querySelector('.captions-btn');
let currentTime = document.querySelector('.current-time');
let totalTime = document.querySelector('.total-time');
let volumeSlider = document.querySelector('.volume-slider');
let videoContainer = document.querySelector('.video-container');
let video = document.querySelector('video');
let audio = document.querySelector('audio');
let videoControls = document.querySelector('.video-controls-container');
let timeline = document.querySelector('.timeline');
let videoWrapper = document.querySelector('.video-wrapper');
let timelineContainer = document.querySelector('.timeline-container');


function handleVideoFile(file) {
    audio.src = "";
    const videoURL = URL.createObjectURL(file);
    const trackElement = document.querySelector('track');
    videoContainer.classList.remove('captions');
    videoContainer.classList.add("paused");
    if (trackElement) {
        video.removeChild(trackElement);
    }
    video.src = videoURL;
    video.load();
}

const handleAudioFile = (file) => {
    audio.src = URL.createObjectURL(file);
    audio.load();
}

function handleSubtitleFile(file) {
    const subtitleURL = URL.createObjectURL(file);
    const oldTrack = document.querySelector('track');
    oldTrack ? oldTrack.remove() : null
    const newTrack = document.createElement('track');
    newTrack.src = subtitleURL;
    newTrack.kind = 'subtitles';
    newTrack.srclang = 'en';
    newTrack.label = 'English';
    newTrack.default = true;
    video.appendChild(newTrack);
    const captions = video.textTracks[0];
    captions.mode = "hidden";
}

let captions = video.textTracks[0];
if (captions) captions.mode = "hidden";

captionsBtn.addEventListener('click', toggleCaptions);

function toggleCaptions(){
    let captions = video.textTracks[0];
    if (captions) {
        let isHidden = captions.mode === "hidden";
        captions.mode = isHidden ? "showing" : "hidden";
        videoContainer.classList.toggle("captions", isHidden);
    }
}

document.addEventListener('keydown', e => {
    let tagName = document.activeElement.tagName.toLowerCase();

    if (tagName === "input") return;
    switch (e.key.toLowerCase()) {
        case " ":
            if (tagName === "button") return;
        case "k":
            togglePlay()
            break
        case "f":
            toggleFullScreenMode()
            break
        case "i":
            toggleMiniPlayerMode()
            break
        case "m":
            toggleMute()
            break
        case "arrowleft":
        case "j":
            skip(-5)
            break
        case "arrowright":
        case "l":
            skip(5)
            break
        case "c":
            toggleCaptions()
            break
    }
})

video.addEventListener("loadeddata", () => {
    const duration = Math.ceil(video.duration);
    totalTime.textContent = formatDuration(duration);
});

video.addEventListener('timeupdate', () => {
    currentTime.textContent = formatDuration(video.currentTime);
    const percent = video.currentTime / video.duration
    timelineContainer.style.setProperty("--progress-position", percent.toString())
})

timelineContainer.addEventListener('mousemove', (event) => {
    const rect = timelineContainer.getBoundingClientRect();
    const xDiff = event.clientX - rect.x;
    const width = rect.width;
    if (isNaN(xDiff) || isNaN(width) || width === 0) {
        return;
    }
    const percent = Math.min(Math.max(0, xDiff), width) / width;
    timelineContainer.style.setProperty("--preview-position", percent.toString());

});

timeline.addEventListener('click', (event) => {
    const timelineRect = timeline.getBoundingClientRect();
    const clickX = event.clientX - timelineRect.left;
    const timelineWidth = timelineRect.width;
    video.currentTime = (clickX / timelineWidth) * video.duration;
    if (audio.src) {
        audio.currentTime = (clickX / timelineWidth) * audio.duration;
    }
});

function formatDuration(time){
    let seconds = Math.floor(time % 60);
    let minutes = Math.floor(time / 60) % 60;
    let hours = Math.floor(time / 3600);

    seconds = seconds < 10 ? `0${seconds}` : seconds;
    minutes = minutes < 10 ? `0${minutes}` : minutes;
    hours = hours < 10 ? `0${hours}` : hours;

    if (hours === 0){
        return `${minutes}:${seconds}`;
    } else{
        return `${hours}:${minutes}:${seconds}`
    }
}

function skip(duration){
    video.currentTime += duration;
    if (audio.src) {
        audio.currentTime += duration;
    }
}

mutedBtn.addEventListener('click', toggleMute);

volumeSlider.addEventListener('input', e => {
    video.volume = e.target.value;
    video.muted = e.target.value === 0;
    if (audio.src) {
        audio.volume = e.target.value;
        audio.muted = e.target.value === 0;
    }
})

function toggleMute(){
    video.muted = !video.muted;
}

window.onload = () => {
    if (localStorage.getItem("videoPlayerVolume") != null) {
        volumeSlider.value = localStorage.getItem("videoPlayerVolume")
        video.volume = volumeSlider.value
        audio.volume = volumeSlider.value
    }
}

function setVolume() {
        localStorage.setItem("videoPlayerVolume", volumeSlider.value)
}

video.addEventListener('volumechange', () => {
    volumeSlider.value = video.volume;
    let volumeLevel;
    if (video.muted || video.volume === 0){
        volumeSlider.value = 0;
        volumeLevel = "muted";
    } else if(video.volume >= .5){
        volumeLevel = "high";
    } else{
        volumeLevel = "low";
    }

    videoContainer.dataset.volumeLevel = volumeLevel;
})


fullScreenBtn.addEventListener('click', toggleFullScreenMode);
miniPlayerBtn.addEventListener('click', toggleMiniPlayerMode);

function toggleFullScreenMode(){
    if (!document.fullscreenElement){
        videoContainer.requestFullscreen();
        video.style.height = "100vh";
        video.style.width = "100vw";
        video.style.objectFit = "fill";
        video.style.maxHeight = "100%";
        videoWrapper.style.width = "auto";
        videoWrapper.style.height = "auto";

    } else{
        document.exitFullscreen().then();
        video.style.maxHeight = "96vh";
        video.style.objectFit = "contain";
        videoWrapper.style.height = "100%";
        video.style.width = "100%";
    }
}

function toggleMiniPlayerMode(){
    if (videoContainer.classList.contains("mini-player")){
        document.exitPictureInPicture();
    } else{
        video.requestPictureInPicture();
    }
}

document.addEventListener('fullscreenchange', () => {
    videoContainer.classList.toggle("full-screen", document.fullscreenElement);
});

video.addEventListener("enterpictureinpicture", () => {
    videoContainer.classList.add("mini-player")
})

video.addEventListener("leavepictureinpicture", () => {
    videoContainer.classList.remove("mini-player")
})


playPauseBtn.addEventListener('click', togglePlay);
video.addEventListener('click', togglePlay);

let hideControlsTimeout;

function hideControls() {
    clearTimeout(hideControlsTimeout);
    hideControlsTimeout = setTimeout(() => {
        videoControls.style.opacity = "0";
        videoContainer.style.cursor = "none";
    }, 3000);
}

function showControls() {
    videoControls.style.opacity = "1";
    videoContainer.style.cursor = "default";
}

function togglePlay() {
   if (video.paused){
       video.play().then(()=> {})
       videoContainer.addEventListener('mousemove', hideControls);
       videoContainer.addEventListener('mousemove', showControls);
       if (audio && audio.src){
           audio.play().then(() =>{});
       }
   } else{
       video.pause()
       videoContainer.removeEventListener('mousemove', hideControls);
       videoContainer.removeEventListener('mousemove', showControls);
       if (audio && audio.src) {
           audio.pause();
       }
       clearTimeout(hideControlsTimeout)
   }
}

video.addEventListener('play', () => {
    videoContainer.classList.remove("paused");
    hideControls();
})

video.addEventListener('pause', () => {
    videoContainer.classList.add("paused");
    showControls();
})