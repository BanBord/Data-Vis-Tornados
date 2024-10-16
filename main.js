// Set up SVG container
const width = window.innerWidth;
const height = window.innerHeight * 0.9; // Adjust height for slider
const svg = d3
	.select("#map-container")
	.append("svg")
	.attr("width", width)
	.attr("height", height);

// Define a projection and path generator
const projection = d3
	.geoAlbersUsa()
	.scale(1300)
	.translate([width / 2, height / 2]);
const path = d3.geoPath().projection(projection);

// Load and process TopoJSON and Tornado data
Promise.all([
	d3.json("/data/topojson.json"),
	d3.json("/data/Tornados_short_FIPS.json"), // Updated file name
])
	.then(([topoData, tornadoData]) => {
		const counties = topojson.feature(
			topoData,
			topoData.objects.counties
		).features;

		// Function to update the map based on the selected year and magnitude level
		function updateMap(year, magnitudeLevel = "all") {
			let filteredTornadoData;

			if (magnitudeLevel === "heatmap") {
				// Aggregate tornado data by FIPS code across all years and magnitudes
				filteredTornadoData = tornadoData.tornadoData;
			} else {
				// Filter tornado data based on the selected year and magnitude level
				filteredTornadoData = tornadoData.tornadoData.filter((d) => {
					return (
						d.yr === year &&
						(magnitudeLevel === "all" || d.mag == magnitudeLevel)
					);
				});
			}

			// Check if filtered data is empty and magnitude level is 5
			if (filteredTornadoData.length === 0 && magnitudeLevel == 5) {
				console.warn(
					`No tornadoes found for year ${year} with magnitude level ${magnitudeLevel}. Coloring all counties with #363232.`
				);
				// Color all counties with #363232
				svg.selectAll("path")
					.data(counties)
					.join("path")
					.attr("d", path)
					.attr("fill", "#363232") // Default to dark gray for no data
					.attr("stroke", "#000000") // Black stroke for county borders
					.attr("stroke-width", 0.07) // Stroke width
					.attr("name", (d) => d.properties.name)
					.attr("ID", (d) => d.id)
					.attr("amount", (d) => d.properties.tornadoCount);
				return;
			}

			// Group tornado data by FIPS for the specific year
			const groupedByFIPSCode = gmynd.groupData(filteredTornadoData, [
				"FIPS",
			]);
			// console.log('Grouped by FIPS Code:', groupedByFIPSCode);

			// Cumulate tornado data by FIPS for the specific year
			const cumulatedData = gmynd.cumulateData(
				filteredTornadoData,
				["FIPS"],
				[{ value: "FIPS", method: "count" }]
			);

			// Combine cumulated data with TopoJSON data
			counties.forEach((county) => {
				const fips = county.id;
				const tornadoData = cumulatedData.find((d) => d.FIPS == fips);
				county.properties.tornadoCount = tornadoData
					? tornadoData.count
					: 0;
			});

			// Extract tornado counts for color mapping
			const maxTornadoCount = d3.max(
				counties,
				(d) => d.properties.tornadoCount
			);

			console.log("Max tornado count:", maxTornadoCount);

			// Define color scales for each magnitude level
			const colorScales = {
				all: d3
					.scaleLinear()
					.domain([
						0,
						maxTornadoCount / 3,
						(2 * maxTornadoCount) / 3,
						maxTornadoCount,
					])
					.range(["#363232", "#349ACC", "#8ECAE6", "#F2FBFF"]),
				0: d3
					.scaleLinear()
					.domain([0, maxTornadoCount])
					.range(["#363232", "#D8B94B"]), // Example color range for magnitude 0
				1: d3
					.scaleLinear()
					.domain([0, maxTornadoCount])
					.range(["#363232", "#EE9B00"]), // Example color range for magnitude 1
				2: d3
					.scaleLinear()
					.domain([0, maxTornadoCount])
					.range(["#363232", "#CA6702"]), // Example color range for magnitude 2
				3: d3
					.scaleLinear()
					.domain([0, maxTornadoCount])
					.range(["#363232", "#BB3E03"]), // Example color range for magnitude 3
				4: d3
					.scaleLinear()
					.domain([0, maxTornadoCount])
					.range(["#363232", "#AE2012"]), // Example color range for magnitude 4
				5: d3
					.scaleLinear()
					.domain([0, maxTornadoCount])
					.range(["#363232", "#FF0000"]), // Example color range for magnitude 5

				// Color range for heatmap
				heatmap: d3
					.scaleLinear()
					.domain([
						0,
						maxTornadoCount / 5,
						(2 * maxTornadoCount) / 5,
						(3 * maxTornadoCount) / 5,
						(4 * maxTornadoCount) / 5,
						(5 * maxTornadoCount) / 5,
						maxTornadoCount,
					])
					.range([
						"#363232",
						"#DB00FF",
						"#E64CFF",
						"#EB70FF",
						"#F199FF",
						"#F4B8FF",
					]), // Color range for heatmap
			};

			// Select the appropriate color scale based on the magnitude level
			const colorScale = colorScales[magnitudeLevel] || colorScales.all;

			// Update counties with a stroke and fill color based on tornado count
			svg.selectAll("path")
				.data(counties)
				.join("path")
				.attr("d", path)
				.attr("fill", (d) => {
					const count = d.properties.tornadoCount;
					if (isNaN(count) || count === undefined || count === null) {
						console.warn(
							`Invalid tornado count for FIPS: ${d.id}, Name: ${d.properties.name}, year: ${year}, count: ${count}`
						);
						return "#363232"; // Default to dark gray for invalid counts
					}
					return colorScale(count); // Fill color based on tornado count using color scale
				})
				.attr("stroke", "#000000") // Black stroke for county borders
				.attr("stroke-width", 0.07) // Stroke width
				.attr("name", (d) => d.properties.name)
				.attr("ID", (d) => d.id)
				.attr("amount", (d) => d.properties.tornadoCount);
		}

		// Initial map update
		updateMap(1950);

		// Add event listener to the slider
		const slider = document.getElementById("year-slider");
		const yearLabel = document.getElementById("year-label");
		slider.addEventListener("input", function () {
			const year = +this.value;
			yearLabel.textContent = year;
			const magnitudeLevel =
				document.getElementById("magnitude-select").value;
			updateMap(year, magnitudeLevel);
		});

		// Add event listener to the magnitude select menu
		const magnitudeSelect = document.getElementById("magnitude-select");
		magnitudeSelect.addEventListener("change", function () {
			const magnitudeLevel = this.value;
			const year = +slider.value;
			updateMap(year, magnitudeLevel);
		});
	})
	.catch((error) => {
		console.error("Error loading the data:", error);
	});
