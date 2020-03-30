class Graph {
  constructor(date_list, data) {
    this.width = document.body.clientWidth;
    this.margin = ({top: 20, right: 40, bottom: 20, left: 50});
    this.height = 600;

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

    this.line = this.create_line('cases');
    this.path = this.create_path(this.data, this.line);

    this.svg.append("g")
      .call(this.xAxis.bind(this));

    this.svg.append("g")
      .call(this.yAxis.bind(this));

    // we're displaying a single entity
    if (this.data.length === 1 && this.data[0].values[0].deaths !== undefined) {
      this.death_line = this.create_line('deaths');
      this.death_path = this.create_path(this.data, this.death_line, 'red');

      this.hospitalized_line = this.create_line('hospitalized');
      this.hospitalized_path = this.create_path(this.data, this.hospitalized_line, 'green');

      this.svg.call(this.single_hover.bind(this));
    } else {
      this.svg.call(this.hover.bind(this));
    }
  }

  get node() {
    return this.svg.node();
  }

  create_path(data, line, color, prop) {
    return this.svg.append("g")
        .attr("fill", "none")
        .attr("stroke", color || "steelblue")
        .attr("stroke-width", 1.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .selectAll("path")
        .data(data)
        .join("path")
        .style("mix-blend-mode", "multiply")
        .attr("d", d => line(d[prop || 'values']));
  }

  create_line(y_prop) {
    return d3.line()
      .defined(v => !isNaN(v[y_prop]))
      .x((v) => this.x(v.date))
      .y(v => this.y(v[y_prop]));
  }

  create_dot() {
    let dot = this.svg.append("g")
      .attr("display", "none");

    dot.append("circle")
      .attr("r", 2.5);

    dot.append("text")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "middle")
      .attr("y", -15);

    return dot;
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
      cases_coord = this.y.invert(evt.touches[0].clientY - this.margin.top - 170);
      date_coord = this.x.invert(evt.touches[0].clientX + (this.margin.left / 2));
    } else {
      cases_coord = this.y.invert(evt.clientY - this.margin.top - 150);
      date_coord = this.x.invert(evt.clientX);
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
    this.path.attr("stroke", "steelblue");
    this.dot.attr("display", "none");
  }

  single_entered() {
    this.cases_dot.attr("display", null);
    this.death_dot.attr("display", null);
    this.hospitalized_dot.attr("display", null);
  }

  single_left() {
    this.cases_dot.attr("display", "none");
    this.death_dot.attr("display", "none");
    this.hospitalized_dot.attr("display", "none");
  }

  single_moved() {
    d3.event.preventDefault();

    const bisectDate = d3.bisector(function(d) {
      return d.date;
    }).left;

    const item = this.data[0];
    const evt = d3.event;
    let cases_coord, date_coord;

    if (evt.type === 'touchmove') {
      cases_coord = this.y.invert(evt.touches[0].clientY - this.margin.top - 170);
      date_coord = this.x.invert(evt.touches[0].clientX + (this.margin.left / 2));
    } else {
      cases_coord = this.y.invert(evt.clientY - this.margin.top - 150);
      date_coord = this.x.invert(evt.clientX);
    }

    let i1 = bisectDate(item.values, date_coord);
    let i0 = i1 - 1;

    if (i1 >= item.values.length) {
      i1 = item.values.length -1;
      i0 = i1 -1;
    }

    const i = date_coord - item.values[i0].date > item.values[i1].date - date_coord ? i1 : i0;
    const point_in_time = item.values[i];

    this.cases_dot.attr("transform", `translate(${this.x(point_in_time.date)},${this.y(point_in_time.cases)})`);
    this.cases_dot.select("text").text(`Cases: ${point_in_time.cases}`);

    this.death_dot.attr("transform", `translate(${this.x(point_in_time.date)},${this.y(point_in_time.deaths)})`);
    this.death_dot.select("text").text(`Deaths: ${point_in_time.deaths}`);

    this.hospitalized_dot.attr("transform", `translate(${this.x(point_in_time.date)},${this.y(point_in_time.hospitalized)})`);
    this.hospitalized_dot.select("text").text(`Hospitalized: ${point_in_time.hospitalized || 'N/A'}`);
  }

  single_hover() {
    this.cases_dot = this.create_dot();
    this.death_dot = this.create_dot();
    this.hospitalized_dot = this.create_dot();

    if ("ontouchstart" in document) {
      this.svg
        .on("touchmove", this.single_moved.bind(this))
        .on("touchstart", this.single_entered.bind(this))
        .on("touchend", this.single_left.bind(this));
    }
    else {
      this.svg
        .on("mousemove", this.single_moved.bind(this))
        .on("mouseenter", this.single_entered.bind(this))
        .on("mouseleave", this.single_left.bind(this));
    }
  }

  hover() {
    this.dot = this.create_dot();

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
  }
}
