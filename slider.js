const sliderCollapsible = document.getElementById('yearSlider');
const playPauseButton = document.getElementById('playPauseButton');
let playing = false;

playPauseButton.addEventListener('click', () => {
    playing = !playing;

    if (playing) {
        playPauseButton.textContent = 'II';
        play();
    } else {
        playPauseButton.textContent = '>';
    }
});

function play() {
    if (playing) {
        if (sliderCollapsible.value < sliderCollapsible.max) {
            sliderCollapsible.value++;
            setTimeout(play, 100); // Adjust speed as needed
        } else {
            playing = false; // Stop at the end
            sliderCollapsible.value = 1950; // Reset to the beginning
            playPauseButton.textContent = '>';
        }
        console.log(sliderCollapsible.value);
    }
}

function collapseSlider(isCollapsed) {
    const collapsedLine = document.getElementById('collapsed-line');
    const playPauseButton = document.getElementById('playPauseButton');
    // let isCollapsed = sliderCollapsible.classList.toggle('collapsed-slider');

    if (isCollapsed) {
        sliderCollapsible.style.display = 'none';
        collapsedLine.style.display = 'block';
        playPauseButton.style.display = 'none';

    } else {
        sliderCollapsible.style.display = 'block';
        collapsedLine.style.display = 'none';
        playPauseButton.style.display = 'block';
    }
}