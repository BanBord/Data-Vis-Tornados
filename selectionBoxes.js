let heatmapLevelValue = 'none';
let magnitudeLevelValue = 'all';
let isWholePeriod = false;

function handleSelectionBox(e) {
    console.log(e.value);

    switch (e.value) {
        case "singleYear":
            heatmapLevelValue = 'none';
            isWholePeriod = false;
            break;
        case "wholePeriod":
            // heatmapLevelValue = 'all';
            isWholePeriod = true;
            break;
        case "all":
            magnitudeLevelValue = 'all';

            break;
        default:
            magnitudeLevelValue = e.value;
            break;
    }

    if(isWholePeriod){

        heatmapLevelValue = e.value;
        if(magnitudeLevelValue === 'all'){
            heatmapLevelValue = 'all';
        } else {
            heatmapLevelValue = magnitudeLevelValue;
        }
    }
    const magnitudeLevel = this.value;
    const year = slider.value;
    updateMap(year, magnitudeLevelValue, heatmapLevelValue)
}