var audio2 = new Audio('Audio/Dungeon Skulls and Wizard Spells.mp3  ');
audio2.loop = true;
audio2.autoplay = true;
audio2.volume = 0.5;

function playLobbyMusic() {
    if (audio2.paused) {
        audio2.play();
    } else {
        audio2.pause();
    }
}