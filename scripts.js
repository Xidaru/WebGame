$(document).ready(function(){

$("#guest_menu").click(function() {
    window.location.href = "home.html";
});

});
var audio = new Audio('Audio/Dungeon Shadows.mp3');
audio.loop = true; 
function playMusic() {
    if (audio.paused) {
        audio.play();
    } else {
        audio.pause();
    }
}

