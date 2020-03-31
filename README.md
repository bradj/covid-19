# COVID-19

[View Live Version Here](https://bradj.github.io/covid-19/)

* Python 3.7 (any 3.x should be fine)
* Make

## About

Country data comes from [here](https://thevirustracker.com/timeline/map-data.json).

For United States, I am using [this](https://covidtracking.com/api/states/daily).

All of the data is [here](data.js).

I am using [D3](https://d3js.org/) to render the data. I mostly copied [this](https://observablehq.com/@d3/multi-line-chart).

## Use This Repo

1. `make get-data` creates `countries.json` and `states.json`
1. `make build` generates `data.js` from the above json files
1. `make all` to do both
1. Open `index.html` in a browser to test locally
