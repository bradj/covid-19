const width = 1000;
const margin = ({top: 20, right: 30, bottom: 30, left: 40});
const height = 500;

const x = d3.scaleUtc()
    .domain(d3.extent(ALL, d => d.date))
    .range([margin.left, width - margin.right]);

const xAxis = g => g
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));

const y = d3.scaleLinear()
    .domain([0, d3.max(ALL, d => d.cases)]).nice()
    .range([height - margin.bottom, margin.top]);

const yAxis = g => g
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    .call(g => g.select(".domain").remove())
    .call(g => g.select(".tick:last-of-type text").clone()
        .attr("x", 3)
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text('# Cases'));

const svg = d3.create("svg")
  .attr("viewBox", [0, 0, width, height]);

svg.append("g")
  .call(xAxis);

svg.append("g")
  .call(yAxis);

function newPath(data) {

    const line = d3.line()
        .defined(d => !isNaN(d.cases))
        .x(d => x(d.date))
        .y(d => y(d.cases));

    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("d", line);
}

newPath(Germany);
newPath(Italy);
newPath(Spain);
newPath(Iran);
newPath(France);
newPath(South_Korea);
newPath(United_States);

document.body.appendChild(svg.node());
