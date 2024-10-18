let heatmapLevelValue = 'none';
let yearValue = 1950;

function handleModeSelection(e) {
    mode = e.value;
    updateMap(yearValue, magnitudeLevelValue, heatmapLevelValue);
}

function handleMagnitudeSelection(e) {
    magnitudeLevelValue = e.value;
    updateMap(yearValue, magnitudeLevelValue, heatmapLevelValue);
}