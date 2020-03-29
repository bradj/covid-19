function create_graph() {
  const CONVERTED_DATES = STATES.dates.slice(STATES.dates.indexOf('2020-03-04')).map(d3.utcParse("%Y-%m-%d"))
  const DATA_WITH_DATES = STATES.series.map(d => {
      return {
          name: d.name,
          values: d.values.map(v => {
              return {
                  cases: v.total,
                  date: d3.utcParse("%Y-%m-%d")(v.date)
              };
          })
      }
  });

  const width = document.body.clientWidth;
  const margin = ({top: 30, right: 40, bottom: 30, left: 40});
  const height = 600;

  const x = d3.scaleUtc()
      .domain(d3.extent(CONVERTED_DATES, d => d))
      .range([margin.left, width - margin.right]);

  const xAxis = g => g
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(width / 70).tickSizeOuter(0));

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

  function hover(svg, path) {

      const bisectDate = d3.bisector(function(d) {
          return d.date;
      }).left;

      if ("ontouchstart" in document) {
        svg
          .on("touchmove", moved)
          .on("touchstart", entered)
          .on("touchend", left);
      }
      else {
        svg
          .on("mousemove", moved)
          .on("mouseenter", entered)
          .on("mouseleave", left);
      }

      const dot = svg.append("g")
          .attr("display", "none");

      dot.append("circle")
          .attr("r", 2.5);

      dot.append("text")
          .attr("font-family", "sans-serif")
          .attr("font-size", 10)
          .attr("text-anchor", "middle")
          .attr("y", -15);

      function moved() {
        d3.event.preventDefault();

        const evt = d3.event;
        let cases_coord, date_coord;

        if (evt.type === 'touchmove') {
          cases_coord = y.invert(evt.touches[0].clientY);
          date_coord = x.invert(evt.touches[0].clientX);
        } else {
          cases_coord = y.invert(evt.layerY);
          date_coord = x.invert(evt.layerX);
        }

        let mouse_line_deltas = [];

        for (let s of DATA_WITH_DATES) {
          console.log(s);
          if (!s.values.length) {
            continue
          }

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
              data: s,
              diff: Math.abs(s.values[i].cases - cases_coord),
              cases: Math.round(s.values[i].cases),
              idx: i
          });
        }

        // Finds the closes path
        const closest = d3.least(mouse_line_deltas, d => d.diff);
        const i = closest.idx;

        console.log(closest);

        path.attr("stroke", d => {
            return d.name === closest.data.name ? null : "#ddd"
        }).filter(d => d.name === closest.data.name).raise();

        dot.attr("transform", `translate(${x(closest.data.values[i].date)},${y(closest.data.values[i].cases)})`);
        dot.select("text").text(`${closest.data.name} / ${closest.cases}`);
      }

      function entered() {
        path.style("mix-blend-mode", null).attr("stroke", "#ddd");
        dot.attr("display", null);
      }

      function left() {
        path.attr("stroke", null);
        dot.attr("display", "none");
      }
    }

    hover(svg, path);

  return svg;
}

function show_states() {
  let el_svg = document.getElementById('svg');
  const svg = create_graph();
  el_svg.appendChild(svg.node());
}
