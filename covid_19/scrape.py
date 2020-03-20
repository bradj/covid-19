from datetime import datetime
import json
import re

import requests
from bs4 import BeautifulSoup


def parse_country_stats(html, country):
    soup = BeautifulSoup(html, features='html.parser')

    trs = soup.find("div", class_='barbox tright').find('tbody').find_all('tr')

    data = {'name': country}
    values = []

    for tr in trs:
        if 'style' in tr:
            continue

        tds = tr.find_all('td')

        if len(tds) == 0:
            continue

        try:
            dt = datetime.strptime(tds[0].text, "%Y-%m-%d")
        except ValueError as ex:
            # not a date
            continue

        cases = tds[2].text.strip()
        cases = cases if cases else tds[3].text.strip()  # Special case to parse China's table
        cases = cases[:cases.find('(')]

        values.append({'date': str(dt.date()), 'cases': int(cases.replace(',', ''))})

    data['values'] = values

    return data


countries = [(f'https://en.wikipedia.org/wiki/2020_coronavirus_pandemic_in_Germany', 'Germany'),
             (f'https://en.wikipedia.org/wiki/2020_coronavirus_pandemic_in_Italy', 'Italy'),
             (f'https://en.wikipedia.org/wiki/2019%E2%80%9320_coronavirus_pandemic_in_mainland_China', 'China'),
             (f'https://en.wikipedia.org/wiki/2020_coronavirus_pandemic_in_Spain', 'Spain'),
             (f'https://en.wikipedia.org/wiki/2020_coronavirus_pandemic_in_Iran', 'Iran'),
             (f'https://en.wikipedia.org/wiki/2020_coronavirus_pandemic_in_France', 'France'),
             (f'https://en.wikipedia.org/wiki/2020_coronavirus_pandemic_in_South_Korea', 'South_Korea'),
             (f'https://en.wikipedia.org/wiki/2020_coronavirus_pandemic_in_the_United_States', 'United_States')]


series = []

for url, name in countries:
    series.append(parse_country_stats(requests.get(url).text, name))

dates = []
for s in series:
    for v in s['values']:
        dates.append(v['date'])

output = {'series': series, 'dates': sorted(list(set(dates)))}

print('const DATA = %s;' % json.dumps(output, indent=4, sort_keys=True))
