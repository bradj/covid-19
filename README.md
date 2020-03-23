# COVID-19

[View Live Version Here](https://bradj.github.io/covid-19/)

## About

I am scraping the [2019–20 coronavirus pandemic by country and territory
](https://en.wikipedia.org/wiki/2019%E2%80%9320_coronavirus_pandemic_by_country_and_territory) page to get a list of countries with `> 1000` cases. I use the list of countries to query each country page which gives me timeline data. This process is seen in [scrape.py](covid_19/scrape.py).

All of the data is [here](data.js).

I am using [D3](https://d3js.org/) to render the data. I mostly copied [this](https://observablehq.com/@d3/multi-line-chart).

## Use This Repo

1. `npm install` - Install node deps (there is only 1)
1. `npm run serve` - Starts local HTTP server for dev/testing.


## Get Latest Data

1. `pipenv install` - Install python deps
1. `pipenv run scrape > data.js` - Scrapes Wikipedia for country data and writes JSON to `data.js`
