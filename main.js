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

const STATES_DATES = STATES.dates.slice(STATES.dates.indexOf('2020-03-04')).map(d3.utcParse("%Y-%m-%d"))
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

toggle_world.addEventListener('click', (evt) => {
    toggle_us.classList.add('is-light');
    toggle_world.classList.remove('is-light');

    svg_el.innerHTML = '';
    svg_el.appendChild(world.svg_node);
});

toggle_us.addEventListener('click', (evt) => {
    toggle_world.classList.add('is-light');
    toggle_us.classList.remove('is-light');

    svg_el.innerHTML = '';
    svg_el.appendChild(states.svg_node);
});

document.getElementById('updated').innerText = `Updated: ${DATA.updated} UTC`;
svg_el.appendChild(world.svg_node);
