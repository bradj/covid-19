# COVID-19

## Getting Started

1. `cd ui && npm install` - Install node deps (there is only 1)
1. `cd ui && npm run serv` - Starts local HTTP server for dev/testing.


## Get Latest Data

1. `pipenv install` - Install python deps
1. `pipenv run scrape > ui/data.js` - Scrapes Wikipedia for country data and writes JSON to `ui/data.js`
