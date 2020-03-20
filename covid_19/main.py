from datetime import datetime
import re

import requests
from bs4 import BeautifulSoup


def parse_country_stats(html, country):
    soup = BeautifulSoup(html, features='html.parser')

    trs = soup.find("div", class_='barbox tright').find('tbody').find_all('tr')

    data = {}

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
        paren = cases.find('(')
        total = cases[:paren]

        data[dt.date()] = total.replace(',', '')

    print('const %s = [' % country)

    for key, val in data.items():
        print('{ date: new Date("%s"), cases: %s },' % (key, val))

    print('];')


countries = [(f'https://en.wikipedia.org/wiki/2020_coronavirus_pandemic_in_Germany', 'Germany'),
             (f'https://en.wikipedia.org/wiki/2020_coronavirus_pandemic_in_Italy', 'Italy'),
             # (f'https://en.wikipedia.org/wiki/2019%E2%80%9320_coronavirus_pandemic_in_mainland_China', 'China'),
             (f'https://en.wikipedia.org/wiki/2020_coronavirus_pandemic_in_Spain', 'Spain'),
             (f'https://en.wikipedia.org/wiki/2020_coronavirus_pandemic_in_Iran', 'Iran'),
             (f'https://en.wikipedia.org/wiki/2020_coronavirus_pandemic_in_France', 'France'),
             (f'https://en.wikipedia.org/wiki/2020_coronavirus_pandemic_in_South_Korea', 'South_Korea'),
             (f'https://en.wikipedia.org/wiki/2020_coronavirus_pandemic_in_the_United_States', 'United_States')]

for url, name in countries:
    parse_country_stats(requests.get(url).text, name)

all = '%s.concat(' % countries[0][1]

for country in countries[1:]:
    all = '%s%s).concat(' % (all, country[1])

print('const ALL = %s;' % all[:-8])

if __name__ == '__main__':
    pass
