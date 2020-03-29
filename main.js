const COUNTRY_DATES = DATA.dates.slice(DATA.dates.indexOf('2020-03-04')).map(d3.utcParse("%Y-%m-%d"))
const COUNTRY_DATA = DATA.series.map(d => {
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

const STATES_DATES = STATES.dates.slice(STATES.dates.indexOf('2020-03-10')).map(d3.utcParse("%Y-%m-%d"))
const STATES_DATA = STATES.series.map(d => {
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

const world = new Graph(COUNTRY_DATES, COUNTRY_DATA);
const states = new Graph(STATES_DATES, STATES_DATA);
const toggle_world = document.getElementById('toggle-world');
const toggle_us = document.getElementById('toggle-us');
const svg_el = document.getElementById('svg');
const layer_toggles = document.getElementById('toggle');
const table = document.querySelector('table');

function clear() {
    svg_el.innerHTML = '';
    layer_toggles.innerHTML = '';
    table.innerHTML = '';
}

function show_world() {
    clear();

    svg_el.appendChild(world.svg_node);
    print_world_table(table);
    world.print_layer_toggle(DATA.series, layer_toggles);
}

function show_us() {
    clear();

    svg_el.appendChild(states.svg_node);
    print_states_table(table);
    states.print_layer_toggle(STATES.series, layer_toggles);
}

toggle_world.addEventListener('click', (evt) => {
    toggle_us.classList.add('is-light');
    toggle_world.classList.remove('is-light');

    show_world();
});

toggle_us.addEventListener('click', (evt) => {
    toggle_world.classList.add('is-light');
    toggle_us.classList.remove('is-light');

    show_us();
});

document.getElementById('updated').innerText = `Updated: ${DATA.updated} UTC`;

show_world();
