function print_world_table(table) {
  let thead = document.createElement('thead');
  let head_tr = document.createElement('tr');
  let tfoot = document.createElement('tfoot');
  let tbody = document.createElement('tbody');

  const country = document.createElement('th');
  country.innerText = 'country';
  head_tr.appendChild(country);

  const cases = document.createElement('th');
  cases.innerText = 'cases';
  head_tr.appendChild(cases);

  const recovered = document.createElement('th');
  recovered.innerText = 'recovered';
  head_tr.appendChild(recovered);

  const deaths = document.createElement('th');
  deaths.innerText = 'deaths';
  head_tr.appendChild(deaths);

  const largest_increase = document.createElement('th');
  largest_increase.innerText = 'largest increase';
  head_tr.appendChild(largest_increase);

  thead.appendChild(head_tr);
  tfoot.innerHTML = thead.innerHTML;

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
      let days = Math.round(((now - then) / 1000 / 60 / 60 / 24) - 1);

      increase = `<strong>${li.increase}</strong> cases <strong>${days}</strong> day${days > 1 || days === 0 ? 's' : ''} ago`
    }

    largest_increase.innerHTML = increase;

    tr.appendChild(country);
    tr.appendChild(cases);
    tr.appendChild(recovered);
    tr.appendChild(deaths);
    tr.appendChild(largest_increase);

    tbody.appendChild(tr);

    table.appendChild(thead);
    table.appendChild(tfoot);
    table.appendChild(tbody);
  }
}

function print_states_table(table) {
  let thead = document.createElement('thead');
  let head_tr = document.createElement('tr');
  let tfoot = document.createElement('tfoot');
  let tbody = document.createElement('tbody');

  const state = document.createElement('th');
  state.innerText = 'state';
  head_tr.appendChild(state);

  const cases = document.createElement('th');
  cases.innerText = 'cases';
  head_tr.appendChild(cases);

  const hospitalized = document.createElement('th');
  hospitalized.innerText = 'hospitalized';
  head_tr.appendChild(hospitalized);

  const deaths = document.createElement('th');
  deaths.innerText = 'deaths';
  head_tr.appendChild(deaths);

  const largest_increase = document.createElement('th');
  largest_increase.innerText = 'largest increase';
  head_tr.appendChild(largest_increase);

  thead.appendChild(head_tr);
  tfoot.innerHTML = thead.innerHTML;

  for (let d of STATES.series) {
    let tr = document.createElement('tr');

    let state = document.createElement('td');
    state.innerText = d.name;

    let cases = document.createElement('td');
    cases.innerText = d.stats.positive || '-';

    let deaths = document.createElement('td');
    deaths.innerText = d.stats.death || '-';

    let hospitalized = document.createElement('td');
    hospitalized.innerText = d.stats.hospitalized || '-';

    let largest_increase = document.createElement('td');
    let increase = '-';

    if (d.stats.largest_increase && d.stats.largest_increase.increase) {
      let li = d.stats.largest_increase;
      let then = new Date(li.date);
      let now = new Date();

      // ms to days
      let days = Math.round(((now - then) / 1000 / 60 / 60 / 24) - 1);

      increase = `<strong>${li.increase}</strong> cases <strong>${days}</strong> day${days > 1 || days === 0 ? 's' : ''} ago`
    }

    largest_increase.innerHTML = increase;

    tr.appendChild(state);
    tr.appendChild(cases);
    tr.appendChild(hospitalized);
    tr.appendChild(deaths);
    tr.appendChild(largest_increase);

    tbody.appendChild(tr);

    table.appendChild(thead);
    table.appendChild(tfoot);
    table.appendChild(tbody);
  }
}

function print_layer_toggle(dates, series, ALL_NODE, container, svg_el) {
  const btn_list = document.createElement('div');
  btn_list.classList.add('buttons', 'has-addons', 'are-small', 'is-centered');

  const toggler = document.createElement('div');
  toggler.classList.add('buttons', 'are-small', 'is-centered');

  const show_all_btn = document.createElement('button');
  show_all_btn.classList.add('button', 'is-info');
  show_all_btn.innerText = 'Show All';
  toggler.appendChild(show_all_btn);

  let buttons = [];

  series.forEach((item, idx) => {
    if (!item.values) {
      return;
    }

    let btn = document.createElement('button');
    btn.classList.add('button', 'is-info', 'is-light');
    btn.dataset.idx = idx;
    btn.innerText = item.name;

    btn.addEventListener('click', (evt) => {
      if (!evt.target.classList.contains('is-light')) {
        return;
      }

      show_all_btn.classList.add('is-light');

      // set all other buttons to is-light
      for (let b of buttons) {
        b.classList.add('is-light');
      }

      btn.classList.remove('is-light');

      // create svg
      const svg = new Graph(dates, [series[parseInt(btn.dataset.idx)]]);
      // set SVG
      svg_el.innerHTML = '';
      svg_el.appendChild(svg.node);
    });

    btn_list.appendChild(btn);
    buttons.push(btn);
  });

  show_all_btn.addEventListener('click', (evt) => {
    if (!show_all_btn.classList.contains('is-light')) {
      return;
    }

    // show all
    show_all_btn.classList.remove('is-light');

    for (let btn of buttons) {
      btn.classList.add('is-light');
    }

    svg_el.innerHTML = '';
    svg_el.appendChild(ALL_NODE);
  });

  container.appendChild(btn_list);
  container.appendChild(toggler);
}
