function drawSmallChart(paramData) {
  let chartData = paramData.tornadoData;

  // Set up the SVG canvas dimensions
  const margin = { top: 20, right: 30, bottom: 30, left: 40 };
  const width = 960 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  // filter for counties with FIPS code
  let selectedFIPS = chartData.filter(d => d.FIPS === 8121);

  // loss
  let maxLoss = d3.max(selectedFIPS, d => d.loss);
  let minLoss = d3.min(selectedFIPS, d => d.loss);

  // group data by year
  let dataByYears = d3.group(selectedFIPS, d => d.yr);

  // caluclate the average loss for each year
  let avgLossByYear = [];
  dataByYears.forEach((value, key) => {
    let sum = 0;
    value.forEach(d => {
      sum += d.loss;
    });
    avgLossByYear.push({ yr: key, loss: sum / value.length });
  });

  // calculate the average length for each year
  let avgLengthByYear = calculateAverageByYear(dataByYears, 'len');

  // max length
  let maxLength = d3.max(selectedFIPS, d => d.len);

  // let dataByYears = d3.group(chartData, d => d.yr);

  // Set up the scales and axes
  const x = d3.scaleTime()
    .domain(d3.extent(selectedFIPS, d => new Date(d.yr + "-01-01")))
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([0, 100])
    .range([height, 0]);

  const xAxis = d3.axisBottom(x);
  const yAxis = d3.axisLeft(y);

  // Create line generators for each dataset
  const lineA = d3.line()
    .x(d => x(new Date(d.yr + "-01-01")))
    .y(d => y(d.loss / maxLoss * 100));

  const lineB = d3.line()
    .x(d => x(new Date(d.yr + "-01-01")))
    .y(d => y(d.len / maxLength * 100));

  // Append the SVG element to the DOM
  const svg = d3.select("#small_chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Draw the axes
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(xAxis);

  svg.append("g")
    .call(yAxis);

  // Draw the lines on the SVG canvas
  svg.append("path")
    .datum(selectedFIPS)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("d", lineA);

  svg.append("path")
    .datum(selectedFIPS)
    .attr("fill", "none")
    .attr("stroke", "red")
    .attr("stroke-width", 1.5)
    .attr("d", lineB);

  // Add legend
  const legend = d3.select("#small_chart").append("div")
    .attr("class", "legend")
    .style("display", "flex")
    .style("justify-content", "center")
    .style("margin-top", "10px");

  const legendData = [
    { color: "steelblue", text: "Loss" },
    { color: "red", text: "Length" }
  ];

  legend.selectAll("div")
    .data(legendData)
    .enter()
    .append("div")
    .style("display", "flex")
    .style("align-items", "center")
    .style("margin-right", "20px")
    .html(d => `<span style="background-color:${d.color};width:20px;height:20px;display:inline-block;margin-right:5px;"></span>${d.text}`);
}

function calculateAverageByYear(dataByYears, property) {
  let avgByYear = [];
  dataByYears.forEach((value, key) => {
    let sum = 0;
    let count = 0;
    value.forEach(d => {
      if (!isNaN(d[property])) {
        sum += d[property];
        count++;
      }
    });
    let avg = count > 0 ? sum / count : 0; // Avoid division by zero
    avgByYear.push({ yr: key, [property]: avg });
  });
  return avgByYear;
}