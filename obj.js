        // Set up SVG container
        const width = window.innerWidth;
        const height = window.innerHeight;
        const svg = d3.select("#map-container").append("svg")
            .attr("width", width)
            .attr("height", height);

        // Define a projection and path generator
        const projection = d3.geoAlbersUsa().scale(1300).translate([width / 2, height / 2]);
        const path = d3.geoPath().projection(projection);

        // Load and process TopoJSON data
        d3.json('topojson.json').then(data => {
            const counties = topojson.feature(data, data.objects.counties).features;

            // Draw counties with a stroke
            svg.selectAll("path")
                .data(counties)
                .enter().append("path")
                .attr("d", path)
                .attr("fill", "#cccccc") // Fill color for counties
                .attr("stroke", "#000000") // Black stroke for county borders
                .attr("stroke-width", 0.5) // Stroke width
                .attr("name", function(d) { return d.properties.name; })
                .attr("ID", function(d) { return d.id; });
        });