// Set up SVG container
const width = window.innerWidth;
const height = window.innerHeight * 0.9; // Adjust height for slider
const svg = d3.select("#map-container").append("svg")
    .attr("width", width)
    .attr("height", height);

// Define a projection and path generator
const projection = d3.geoAlbersUsa().scale(1300).translate([width / 2, height / 2]);
const path = d3.geoPath().projection(projection);

// Load and process TopoJSON and Tornado data
Promise.all([
    d3.json('/data/topojson.json'),
    d3.json('/data/Tornados_short_FIPS.json') // Updated file name
]).then(([topoData, tornadoData]) => {
    const counties = topojson.feature(topoData, topoData.objects.counties).features;

    // Function to update the map based on the selected year
    function updateMap(year) {
        const filteredTornadoData = tornadoData.tornadoData.filter(d => d.yr === year);

        // Group tornado data by FIPS for the specific year
        const groupedByFIPSCode = d3.group(filteredTornadoData, d => d.FIPS);
        // console.log(groupedByFIPSCode);

        // Cumulate tornado data by FIPS for the specific year
        const cumulatedData = gmynd.cumulateData(filteredTornadoData, ['FIPS'], [{ value: 'FIPS', method: 'count', }]);

        // Combine cumulated data with TopoJSON data
        counties.forEach(county => {
            const fips = county.id;
            const tornadoData = cumulatedData.find(d => d.FIPS == fips);
            county.properties.tornadoCount = tornadoData ? tornadoData.count : 0;
        });

        // Extract tornado counts for color mapping
        const maxTornadoCount = d3.max(counties, d => d.properties.tornadoCount);

        console.log('Max tornado count:', maxTornadoCount);

        // Define a color scale
        const colorScale = d3.scaleLinear()
            .domain([0, maxTornadoCount / 4, maxTornadoCount / 2, (3 * maxTornadoCount) / 4, maxTornadoCount])
            .range(["#2A9D8F", "#E9C46A", "#F28833", "#E2502C"]);


        // Update counties with a stroke and fill color based on tornado count
        svg.selectAll("path")
            .data(counties)
            .join("path")
            .attr("d", path)
            .attr("fill", d => {
                const count = d.properties.tornadoCount;
                if (isNaN(count) || count === undefined || count === null) {
                    console.warn(`Invalid tornado count for FIPS: ${d.id}, Name: ${d.properties.name}, year: ${year}, count: ${count}`);
                    return "#00ff00"; // Default to green for invalid counts
                }
                return colorScale(count); // Fill color based on tornado count using color scale
            })
            .attr("stroke", "#000000") // Black stroke for county borders
            .attr("stroke-width", 0.5) // Stroke width
            .attr("name", d => d.properties.name)
            .attr("ID", d => d.id)
            .attr("amount", d => d.properties.tornadoCount);
            
            // Access and log magnitude levels
            groupedByFIPSCode.forEach((tornadoes, fips) => {
                const magnitudes = tornadoes.map(tornado => tornado.mag); // Ensure 'mag' is the correct property name
                console.log(`FIPS: ${fips}, Magnitudes: ${magnitudes}`);
            });
    }

    // Initial map update
    updateMap(1950);

    // Add event listener to the slider
    const slider = document.getElementById("year-slider");
    const yearLabel = document.getElementById("year-label");
    slider.addEventListener("input", function () {
        const year = +this.value;
        yearLabel.textContent = year;
        updateMap(year);
    });

}).catch(error => {
    console.error('Error loading the data:', error);
});