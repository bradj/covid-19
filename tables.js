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

  const negative = document.createElement('th');
  negative.innerText = 'negative';
  head_tr.appendChild(negative);

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
    cases.innerText = d.stats.positive;

    let deaths = document.createElement('td');
    deaths.innerText = d.stats.death;

    let negative = document.createElement('td');
    negative.innerText = d.stats.negative;

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
    tr.appendChild(negative);
    tr.appendChild(deaths);
    tr.appendChild(largest_increase);

    tbody.appendChild(tr);

    table.appendChild(thead);
    table.appendChild(tfoot);
    table.appendChild(tbody);
  }
}
