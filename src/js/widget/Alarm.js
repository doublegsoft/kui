
function Alarm(option) {
    this.iconId = option.iconId;
    this.mp3url = option.mp3url;
}

Alarm.prototype.start = function () {
    this.audio = document.createElement('audio');
    this.audio.setAttribute('autoplay', 'autoplay');
    this.audio.setAttribute('loop', 'loop');
    var source = document.createElement('source');
    source.setAttribute('src', this.mp3url);
    source.setAttribute('type', 'audio/mpeg');
    this.audio.appendChild(source);
    document.body.appendChild(this.audio);

    var icon = document.getElementById(this.iconId);
    icon.classList.add('icon-bell', 'bell');
};

Alarm.prototype.stop = function () {
    this.audio.pause();
    var icon = document.getElementById(this.iconId);
    icon.classList.remove('bell');
    document.body.removeChild(this.audio);
};