// Function to create a line chart for tornado data of a single US county
function createTornadoLineChart(data, fipsCode) {
    // Filter the dataset by FIPS code
    let selectedFIPS = data.tornadoData.filter(d => d.FIPS === fipsCode);
  
    // Group data by year
    let dataByYears = d3.group(selectedFIPS, d => d.yr);
  
    // Calculate the average length and loss for each year
    let avgLengthByYear = calculateAverageByYear(dataByYears, 'len');
    let avgLossByYear = calculateAverageByYear(dataByYears, 'loss');

    // Calulate the total tornado counts for each year
    let totalTornadoCountsByYear = calculateTotalByYear(dataByYears, 'count');
  
    // Set up the SVG canvas dimensions
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const width = 960 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
  
    // Set up the scales and axes
    const x = d3.scaleTime()
      .domain(d3.extent(avgLengthByYear, d => new Date(d.yr, 0, 1)))
      .range([0, width]);
  
    const y = d3.scaleLinear()
      .domain([0, d3.max([...avgLengthByYear, ...avgLossByYear], d => Math.max(d.len || 0, d.loss || 0))])
      .range([height, 0]);
  
    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y);
  
    // Create line generators for average lengths and losses
    const lineAvgLength = d3.line()
      .x(d => x(new Date(d.yr, 0, 1)))
      .y(d => y(d.len));
  
    const lineAvgLoss = d3.line()
      .x(d => x(new Date(d.yr, 0, 1)))
      .y(d => y(d.loss));
  
    // Append the SVG element to the DOM
    const svg = d3.select("body").append("svg")
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
  
    // Draw the lines for average lengths and losses
    svg.append("path")
      .datum(avgLengthByYear)
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("stroke-width", 1.5)
      .attr("d", lineAvgLength);
  
    svg.append("path")
      .datum(avgLossByYear)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", lineAvgLoss);
  
    // Add legend
    const legend = d3.select("body").append("div")
      .attr("class", "legend")
      .style("display", "flex")
      .style("justify-content", "center")
      .style("margin-top", "10px");
  
    const legendData = [
      { color: "red", text: "Average Length" },
      { color: "steelblue", text: "Average Loss" }
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
  
  // Function to calculate the average of a specified property by year
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
  
  // Example usage
  const tornadoData = [
    { FIPS: 1234, yr: 2010, loss: 50000, len: 15.8 },
    { FIPS: 1234, yr: 2011, loss: 30000, len: 10.5 },
    { FIPS: 1234, yr: 2012, loss: 40000, len: 12.3 },
    // more data...
  ];
  
  createTornadoLineChart(tornadoData, 1234);

  function calculateTotalByYear(dataByYears, property) {
    let totalByYear = [];
    dataByYears.forEach((value, key) => {
      let sum = 0;
      value.forEach(d => {
        if (!isNaN(d[property])) {
          sum += 1
        }
      });
      totalByYear.push({ yr: key, [property]: sum });
    });
    return totalByYear;
  }