function handleSelectionBox(e) {
    console.log(e.value);

    const magnitudeLevel = this.value;
    const year = +slider.value;
    updateMap(year, magnitudeLevel = 'all', heatmapLevel = 'none')
}