const CONVERTED_DATES = DATA.dates.slice(DATA.dates.indexOf('2020-03-04')).map(d3.utcParse("%Y-%m-%d"))
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

let hidden_layers = {};
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

const bisectDate = d3.bisector(function(d) {
    return d.date;
}).left;

function hover(svg, path) {

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
      cases_coord = y.invert(evt.touches[0].clientY - margin.top - 40);
      date_coord = x.invert(evt.touches[0].clientX + (margin.left / 2));
    } else {
      cases_coord = y.invert(evt.layerY - margin.top);
      date_coord = x.invert(evt.layerX + (margin.left / 2));
    }

    let mouse_line_deltas = [];

    for (let s of DATA_WITH_DATES) {
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

    // Finds the closes country
    const closest = d3.least(mouse_line_deltas, d => d.diff);
    const i = closest.idx;

    path.attr("stroke", d => {
        return d.name === closest.country.name ? null : "#ddd"
    }).filter(d => d.name === closest.country.name).raise();

    dot.attr("transform", `translate(${x(closest.country.values[i].date)},${y(closest.country.values[i].cases)})`);
    dot.select("text").text(`${closest.country.name} / ${closest.cases}`);
  }

  function entered() {
    path.style("mix-blend-mode", null).attr("stroke", "#ddd");
    dot.attr("display", null);
  }

  function left() {
    path.attr("stroke", d => d.name in hidden_layers ? "#ddd" : "steelblue");
    dot.attr("display", "none");
  }
}

svg.call(hover, path);

function hide_paths() {
  path.style("mix-blend-mode", null)
}

function show_layer(name) {
  delete hidden_layers[name];
  path.attr("stroke", d => d.name in hidden_layers ? "#ddd" : "steelblue");
}

function hide_layer(name) {
  hidden_layers[name] = true;
  path.attr("stroke", d => d.name in hidden_layers ? "#ddd" : "steelblue");
}

function print_layer_toggle() {
  let container = document.getElementById('toggle');
  let buttons = [];

  for (let country of DATA.series) {
    if (!country.values) {
      continue;
    }

    let btn = document.createElement('button');
    btn.classList.add('button');
    btn.classList.add('is-info');
    btn.innerText = country.name;

    btn.addEventListener('click', (evt) => {
      evt.target.classList.toggle('is-light');

      if (evt.target.classList.contains('is-light')) {
        // layer is hidden
        hide_layer(country.name);
      } else {
        // layer is visible
        show_layer(country.name);
      }
    });

    container.appendChild(btn);
    buttons.push(btn);
  }

  let toggle_all = document.getElementById('toggle-all');

  toggle_all.addEventListener('click', (evt) => {
    evt.target.classList.toggle('is-light');

    if (evt.target.classList.contains('is-light')) {
      // all are hidden
      for (let country of DATA.series) {
        hidden_layers[country.name] = true;
      }

      for (let btn of buttons) {
        btn.classList.add('is-light');
      }

      hide_layer(DATA.series[0].name);
    } else {
      // all are visible
      for (let btn of buttons) {
        btn.classList.remove('is-light');
      }

      hidden_layers = {'temp': true};
      show_layer('temp');
    }
  });
}

function print_recovered() {
  let tbody = document.querySelector('tbody');

  for (let d of DATA.series) {
    let tr = document.createElement('tr');

    let country = document.createElement('td');
    country.innerText = d.name;

    let cases = document.createElement('td');
    cases.innerText = d.stats.cases;

    let deaths = document.createElement('td');
    deaths.innerText = d.stats.deaths;

    let recovered = document.createElement('td');
    recovered.innerText = d.stats.recovered;

    let largest_increase = document.createElement('td');
    let increase = '-';

    if (d.stats.largest_increase && d.stats.largest_increase.increase) {
      let li = d.stats.largest_increase;
      let then = new Date(li.date);
      let now = new Date();

      // ms to days
      let days = Math.round((now - then) / 1000 / 60 / 60 / 24);

      increase = `<strong>${li.increase}</strong> cases <strong>${days}</strong> day${days > 1 ? 's' : ''} ago`
    }

    largest_increase.innerHTML = increase;

    tr.appendChild(country);
    tr.appendChild(cases);
    tr.appendChild(recovered);
    tr.appendChild(deaths);
    tr.appendChild(largest_increase);

    tbody.appendChild(tr);
  }
}

function show_states() {
  document.getElementById('svg').appendChild(svg.node());
  document.getElementById('updated').innerText = `Updated: ${DATA.updated} UTC`;

  print_recovered();
  print_layer_toggle();
}
