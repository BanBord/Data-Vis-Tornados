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

        const groupedByFIPSCode = d3.group(filteredTornadoData, d => d.FIPS);
        // console.log('Grouped by FIPS Code:', groupedByFIPSCode);

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

        // Define the selectedCounty array
        let selectedCounty = [];

        // Draw the counties
        svg.selectAll("path")
            .data(counties)
            .enter().append("path")
            .attr("d", path)
            .attr("fill", d => colorScale(d.properties.tornadoCount))
            .on("mouseover", function(event, d) {
                d3.select(this).attr("fill", "white");
            })
            .on("mouseout", function(event, d) {
                d3.select(this).attr("fill", colorScale(d.properties.tornadoCount));
            })
            .on("click", function(event, d) {
                const selectedFIPS = d.id;
                console.log('Selected FIPS:', selectedFIPS);

                // Debugging: Log the tornado data to ensure it has the expected structure
                console.log('Tornado Data:', tornadoData.tornadoData);

                // Filter the tornado data for the selected FIPS code
                selectedCounty = tornadoData.tornadoData.filter(t => t.FIPS == selectedFIPS);

                // Debugging: Log the filtered data to ensure it is being populated
                console.log('Selected County Data:', selectedCounty);
            });
    }

    // Initial map update for a default year
    updateMap(2020);
});