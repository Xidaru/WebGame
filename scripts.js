$(document).ready(function(){

$("#guest_menu").click(function() {
    window.location.href = "home.html";
});
});

function Registerlink(){
    window.location.href = "register.html";
}
function Loginlink(){
    window.location.href = "login.html";
}
var audio = new Audio('Audio/Dungeon Shadows.mp3');
audio.loop = true; 
audio.autoplay = true;
audio.volume = 0.5;
function playMusic() {
    if (audio.paused) {
        audio.play();
    } else {
        audio.pause();
    }
}
