const sliderCollapsible = document.getElementById('yearSlider');
const playPauseButton = document.getElementById('playPauseButton');
let playing = false;

const playArrow = document.getElementById('play-arrow');
const pauseIcon = document.getElementById('pause-icon');

playPauseButton.addEventListener('click', () => {
    playing = !playing;

    if (playing) {
        pauseIcon.style.display = 'block';
        playArrow.style.display = 'none';
        play();
    } else {
        pauseIcon.style.display = 'none';
        playArrow.style.display = 'block';
    }
});

function play() {
    if (playing) {
        if (sliderCollapsible.value < sliderCollapsible.max) {
            sliderCollapsible.value++;
            setTimeout(play, 500); // Adjust speed as needed
            yearValue = sliderCollapsible.value;
            yearLabel.textContent = yearValue;
            updateMap();
        } else {
            playing = false; // Stop at the end
            sliderCollapsible.value = 1950; // Reset to the beginning
            pauseIcon.style.display = 'none';
            playArrow.style.display = 'block';
        }

    }
}

function collapseSlider(isCollapsed) {
    const collapsedLine = document.getElementById('collapsed-line');
    const playPauseButton = document.getElementById('playPauseButton');
    const yearLabel = document.getElementById('year-label');
    const timelineLabels = document.querySelectorAll('.timeline-label');

    // let isCollapsed = sliderCollapsible.classList.toggle('collapsed-slider');

    if (isCollapsed) {
        sliderCollapsible.style.display = 'none';
        collapsedLine.style.display = 'block';
        playPauseButton.style.display = 'none';
        yearLabel.style.display = 'none';
        timelineLabels.forEach(label => {
            label.style.color = '#ffffff';
        });

    } else {
        sliderCollapsible.style.display = 'block';
        collapsedLine.style.display = 'none';
        playPauseButton.style.display = 'block';
        yearLabel.style.display = 'block';
        timelineLabels.forEach(label => {
            label.style.color = '#999999';
        });
    }
}