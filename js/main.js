let mode = 'singleYear';
let magnitudeLevelValue = 'all';
let yearValue = 1950;

// Set up SVG container
const width = window.innerWidth;
const height = window.innerHeight * 0.9; // Adjust height for slider
const svg = d3.select("#map-container").append("svg")
    .attr("width", width)
    .attr("height", height);

// Define a projection and path generator
let projection = d3.geoAlbersUsa().scale(width * 0.9).translate([width / 2.5, height / 2]);
const path = d3.geoPath().projection(projection);

// Add event listener to the slider
const slider = document.getElementById("yearSlider");
const yearLabel = document.getElementById("year-label");

let counties = [];
let tornadoData = {};

// calculate the position of the year-label
const yearLabelWidth = yearLabel.offsetWidth;
const sliderLeft = slider.getBoundingClientRect().left + window.scrollX;
const sliderWidth = slider.offsetWidth;
const sliderCenter = sliderLeft + sliderWidth / 2 - yearLabelWidth / 2;
yearLabel.style.left = `${sliderCenter}px`;


// Function to update the map based on the selected year and magnitude level
function updateMap() {
    let filteredTornadoData;

    if (mode === "wholePeriod") {
        collapseSlider(true);
        // Aggregate tornado data by FIPS code across all years and magnitudes
        filteredTornadoData = tornadoData.tornadoData.filter(d => {
            return magnitudeLevelValue == 'all' || d.mag == magnitudeLevelValue;
        });
    } else if(mode === "singleYear") {
        collapseSlider(false);
        // Filter tornado data based on the selected year and magnitude level
        filteredTornadoData = tornadoData.tornadoData.filter(d => {
            return d.yr == yearValue&& (magnitudeLevelValue === 'all' || d.mag == magnitudeLevelValue);
        });
    }

    // Cumulate tornado data by FIPS for the specific year or for heatmap
    const cumulatedData = gmynd.cumulateData(filteredTornadoData, ['FIPS'], [{ value: 'FIPS', method: 'count', }]);

    // Combine cumulated data with TopoJSON data
    counties.forEach(county => {
        const fips = county.id;
        const tornadoData = cumulatedData.find(d => d.FIPS == fips);
        county.properties.tornadoCount = tornadoData ? tornadoData.count : 0;
    });

    // Extract tornado counts for color mapping
    const maxTornadoCount = d3.max(counties, d => d.properties.tornadoCount);

    // Define color scales for each magnitude level
    const colorScales = {
        all: d3.scaleLinear()
            .domain([0, maxTornadoCount / 3, (2 * maxTornadoCount) / 3, maxTornadoCount])
            .range(["#363232", "#349ACC", "#8ECAE6", "#F2FBFF"]),
        0: d3.scaleLinear()
            .domain([0, maxTornadoCount])
            .range(["#363232", "#D8B94B"]), // Example color range for magnitude 0
        1: d3.scaleLinear()
            .domain([0, maxTornadoCount])
            .range(["#363232", "#EE9B00"]), // Example color range for magnitude 1
        2: d3.scaleLinear()
            .domain([0, maxTornadoCount])
            .range(["#363232", "#FFFF00"]), // Example color range for magnitude 2
        3: d3.scaleLinear()
            .domain([0, maxTornadoCount])
            .range(["#363232", "#CA6702"]), // Example color range for magnitude 3
        4: d3.scaleLinear()
            .domain([0, maxTornadoCount])
            .range(["#363232", "#BB3E03"]), // Example color range for magnitude 4
        5: d3.scaleLinear()
            .domain([0, maxTornadoCount])
            .range(["#363232", "#AE2012"]),
        // Example color range for magnitude 5
        wholePeriod: d3.scaleLinear()
            .domain([0, maxTornadoCount / 5, (2 * maxTornadoCount) / 5, (3 * maxTornadoCount) / 5, (4 * maxTornadoCount) / 5, maxTornadoCount])
            .range(["#363232", "#F759CB", "#CA2CA7", "#AA1088", "#720159", "#FFBAEC"])  // Color range for heatmap
    };

    // Select the appropriate color scale based on the magnitude level
    const colorScale = colorScales[mode !== 'singleYear' ? 'wholePeriod' : magnitudeLevelValue] || colorScales.all;

    // Update counties with a stroke and fill color based on tornado count
    svg.selectAll("path")
        .data(counties)
        .join("path")
        .attr("d", path)
        .attr("fill", d => {
            const count = d.properties.tornadoCount;
            if (isNaN(count) || count === undefined || count === null || count === 0) {
                console.warn(`Invalid tornado count for FIPS: ${d.id}, Name: ${d.properties.name}, year: ${yearValue}, count: ${count}`);
                return "#363232"; // Default to dark gray for invalid counts
            }
            return colorScale(count); // Fill color based on tornado count using color scale
        })
        .attr("stroke", "#000000") // Black stroke for county borders
        .attr("stroke-width", 0.07) // Stroke width
        .attr("name", d => d.properties.name)
        .attr("ID", d => d.id)
        .attr("amount", d => d.properties.tornadoCount)
        .on("mouseover", function (event, d) {
            d3.select(this).attr("fill", "white");

            // Show the hover label
            const hoverLabel = d3.select("#hoverLabel");
            hoverLabel.style("display", "block")
                .text(d.properties.name);
        })
        .on("mousemove", function (event) {
            // Position the hover label relative to the mouse pointer
            const hoverLabel = d3.select("#hoverLabel");
            hoverLabel.style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 30) + "px");
        })
        .on("mouseout", function (event, d) {
            d3.select(this).attr("fill", d.properties.tornadoCount > 0 ? colorScale(d.properties.tornadoCount) : "#363232");

            // Hide the hover label
            const hoverLabel = d3.select("#hoverLabel");
            hoverLabel.style("display", "none");
        });
}

// Load and process TopoJSON and Tornado data
Promise.all([
    d3.json('/data/topojson.json'),
    d3.json('/data/Tornados_short_FIPS.json') // Updated file name
]).then(([topoData, tornadoDataOutput]) => {
    tornadoData = tornadoDataOutput;
    counties = topojson.feature(topoData, topoData.objects.counties).features;

    // Initial map update
    updateMap();
}).catch(error => {
    console.error('Error loading the data:', error);
});

slider.addEventListener("input", function () {
    yearValue = this.value;
    yearLabel.textContent = yearValue;
    updateMap();
});

// Event listener for the info icon and info text
const infoIcon = document.getElementById("infoIcon");
const hoverText = document.getElementById("hoverText");

infoIcon.addEventListener("mouseover", function () {
    hoverText.style.display = "block";
});
infoIcon.addEventListener("mouseout", function () {
    hoverText.style.display = "none";
});