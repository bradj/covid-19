const CONVERTED_DATES = DATA.dates.map(d3.utcParse("%Y-%m-%d"))
const DATA_WITH_DATES = DATA.series.map(d => {
    return {
        name: d.name,
        values: d.values.map(v => {
            return {
                cases: v.cases,
                date: d3.utcParse("%Y-%m-%d")(v.date)
            };
        })
    }
});

const width = document.body.clientWidth;
const margin = ({top: 20, right: 30, bottom: 30, left: 40});
const height = 800;

const x = d3.scaleUtc()
    .domain(d3.extent(CONVERTED_DATES, d => d))
    .range([margin.left, width - margin.right]);

const xAxis = g => g
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));

const y = d3.scaleLinear()
    .domain([0, d3.max(DATA_WITH_DATES, d => d3.max(d.values, d_sub => d_sub.cases))]).nice()
    .range([height - margin.bottom, margin.top]);

const yAxis = g => g
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    .call(g => g.select(".domain").remove())
    .call(g => g.select(".tick:last-of-type text").clone()
        .attr("x", 3)
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text('Cases'));

const svg = d3.create("svg")
  .attr("viewBox", [0, 0, width, height]);

const line = d3.line()
        .defined(v => !isNaN(v.cases))
        .x((v) => x(v.date))
        .y(v => y(v.cases));

svg.append("g")
  .call(xAxis);

svg.append("g")
  .call(yAxis);

const path = svg.append("g")
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .selectAll("path")
    .data(DATA_WITH_DATES)
    .join("path")
    .style("mix-blend-mode", "multiply")
    .attr("d", d => line(d.values));

const bisectDate = d3.bisector(function(d) {
    return d.date;
}).left;

function hover(svg, path) {

  if ("ontouchstart" in document) svg
      .style("-webkit-tap-highlight-color", "transparent")
      .on("touchmove", moved)
      .on("touchstart", entered)
      .on("touchend", left)
  else svg
      .on("mousemove", moved)
      .on("mouseenter", entered)
      .on("mouseleave", left);

  const dot = svg.append("g")
      .attr("display", "none");

  dot.append("circle")
      .attr("r", 2.5);

  dot.append("text")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "middle")
      .attr("y", -8);

  function moved() {
    d3.event.preventDefault();

    const cases_coord = y.invert(d3.event.layerY);
    const date_coord = x.invert(d3.event.layerX);

    let mouse_line_deltas = [];

    for (let s of DATA_WITH_DATES) {
        let i1 = bisectDate(s.values, date_coord);
        let i0 = i1 - 1;

        if (i0 < 0 || i1 < 0) {
            i0 = 0;
            i1 = 1;
        } else if (i0 >= s.values.length || i1 >= s.values.length) {
            i0 = s.values.length - 2;
            i1 = i0 + 1;
        }

        const i = date_coord - s.values[i0].date > s.values[i1].date - date_coord ? i1 : i0;

        mouse_line_deltas.push({
            country: s,
            diff: Math.abs(s.values[i].cases - cases_coord),
            idx: i
        });
    }

    // Finds the closes country
    const closest = d3.least(mouse_line_deltas, d => d.diff);
    const i = closest.idx;

    path.attr("stroke", d => {
        return d.name === closest.country.name ? null : "#ddd"
    }).filter(d => d.name === closest.country.name).raise();

    dot.attr("transform", `translate(${x(closest.country.values[i].date)},${y(closest.country.values[i].cases)})`);
    dot.select("text").text(closest.country.name);
  }

  function entered() {
    path.style("mix-blend-mode", null).attr("stroke", "#ddd");
    dot.attr("display", null);
  }

  function left() {
    path.style("mix-blend-mode", "multiply").attr("stroke", null);
    dot.attr("display", "none");
  }
}

svg.call(hover, path);

document.body.appendChild(svg.node());
