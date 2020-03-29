class Graph {
  constructor(date_list, data) {
    this.width = document.body.clientWidth;
    this.margin = ({top: 30, right: 40, bottom: 30, left: 40});
    this.height = 600;

    this.hidden_layers = {};

    this.date_list = date_list;
    this.data = data;

    this.x = d3.scaleUtc()
      .domain(d3.extent(this.date_list, d => d))
      .range([this.margin.left, this.width - this.margin.right]);

    this.y = d3.scaleLinear()
      .domain([0, d3.max(this.data, d => d3.max(d.values, d_sub => d_sub.cases))]).nice()
      .range([this.height - this.margin.bottom, this.margin.top]);

    this.svg = d3.create("svg")
      .attr("viewBox", [0, 0, this.width, this.height]);

    this.line = d3.line()
            .defined(v => !isNaN(v.cases))
            .x((v) => this.x(v.date))
            .y(v => this.y(v.cases));

    this.svg.append("g")
      .call(this.xAxis.bind(this));

    this.svg.append("g")
      .call(this.yAxis.bind(this));

    this.path = this.svg.append("g")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .selectAll("path")
        .data(this.data)
        .join("path")
        .style("mix-blend-mode", "multiply")
        .attr("d", d => this.line(d.values));

    this.svg.call(this.hover.bind(this), this.path);
  }

  get svg_node() {
    return this.svg.node();
  }

  xAxis(g) {
    g.attr("transform", `translate(0,${this.height - this.margin.bottom})`)
      .call(d3.axisBottom(this.x).ticks(this.width / 70).tickSizeOuter(0));
  }

  yAxis(g) {
    g.attr("transform", `translate(${this.margin.left},0)`)
      .call(d3.axisLeft(this.y))
      .call(g => g.select(".domain").remove())
      .call(g => g.select(".tick:last-of-type text").clone()
      .attr("x", 3)
      .attr("text-anchor", "start")
      .attr("font-weight", "bold")
      .text('Cases'));
  }

  moved() {
    d3.event.preventDefault();

    const bisectDate = d3.bisector(function(d) {
      return d.date;
    }).left;

    const evt = d3.event;
    let cases_coord, date_coord;

    if (evt.type === 'touchmove') {
      cases_coord = this.y.invert(evt.touches[0].clientY - this.margin.top - 40);
      date_coord = this.x.invert(evt.touches[0].clientX + (this.margin.left / 2));
    } else {
      cases_coord = this.y.invert(evt.layerY - this.margin.top);
      date_coord = this.x.invert(evt.layerX + (this.margin.left / 2));
    }

    let mouse_line_deltas = [];

    for (let s of this.data) {
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
          country: s,
          diff: Math.abs(s.values[i].cases - cases_coord),
          cases: Math.round(s.values[i].cases),
          idx: i
      });
    }

    // Finds the closes path
    const closest = d3.least(mouse_line_deltas, d => d.diff);
    const i = closest.idx;

    this.path.attr("stroke", d => {
        return d.name === closest.country.name ? null : "#ddd"
    }).filter(d => d.name === closest.country.name).raise();

    this.dot.attr("transform", `translate(${this.x(closest.country.values[i].date)},${this.y(closest.country.values[i].cases)})`);
    this.dot.select("text").text(`${closest.country.name} / ${closest.cases}`);
  }

  entered() {
    this.path.style("mix-blend-mode", null).attr("stroke", "#ddd");
    this.dot.attr("display", null);
  }

  left() {
    this.path.attr("stroke", d => d.name in this.hidden_layers ? "#ddd" : "steelblue");
    this.dot.attr("display", "none");
  }

  hover() {
    if ("ontouchstart" in document) {
      this.svg
        .on("touchmove", this.moved.bind(this))
        .on("touchstart", this.entered.bind(this))
        .on("touchend", this.left.bind(this));
    }
    else {
      this.svg
        .on("mousemove", this.moved.bind(this))
        .on("mouseenter", this.entered.bind(this))
        .on("mouseleave", this.left.bind(this));
    }

    this.dot = this.svg.append("g")
      .attr("display", "none");

    this.dot.append("circle")
        .attr("r", 2.5);

    this.dot.append("text")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "middle")
        .attr("y", -15);
  }
}
