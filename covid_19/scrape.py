from datetime import datetime
import json
import re

import requests
from bs4 import BeautifulSoup

url_prefix = 'https://en.wikipedia.org'


def str_to_int(s):
    s = re.sub(r'[\s|,]', '', s)
    return int(s.encode('ascii', 'ignore'))


def parse_country_stats(html, country):
    soup = BeautifulSoup(html, features='html.parser')

    table = soup.find("div", class_='barbox tright')

    if not table:
        return None

    trs = table.find('tbody').find_all('tr')

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
        cases = cases if cases.find('(') == -1 else cases[:cases.find('(')]
        cases = str_to_int(cases)

        values.append({'date': str(dt.date()), 'cases': cases})

    data['values'] = values

    return data


def get_countries():
    html = requests.get(f'https://en.wikipedia.org/wiki/2019%E2%80%9320_coronavirus_pandemic').text
    soup = BeautifulSoup(html, features='html.parser')

    d = soup.find('div', attrs={'id': 'covid19-container'})

    tbody = d.find('tbody')
    trs = tbody.find_all('tr')

    urls = []

    for tr in trs:
        ths = tr.find_all('th')

        if (len(ths) != 2):
            continue

        a = ths[1].find('a')
        txt = ''
        for child in a.children:
            if child.name == 'span':
                txt = '%s %s' % (txt, child.contents[0])
            else:
                txt = child

        tds = tr.find_all('td')
        data = {
            'cases': str_to_int(tds[0].string) if tds[0].string else '-',
            'deaths': str_to_int(tds[1].string) if tds[1].string else '-',
            'recovered': str_to_int(tds[2].string) if tds[2].string else '-',
        }

        urls.append((a['href'], txt, data))

    return(urls)


countries = get_countries()

# country = '/wiki/2020_coronavirus_pandemic_in_Switzerland'
# countries = [(country, 'Test Country')]

series = []

for url, name, data in countries:
    if data['cases'] < 1000:
        continue

    try:
        result = parse_country_stats(requests.get('%s%s' % (url_prefix, url)).text, name)
    except Exception as ex:
        print(name, ex)

    if result:
        result['stats'] = data
        series.append(result)

dates = []
for s in series:
    for v in s['values']:
        dates.append(v['date'])

output = {'series': series, 'dates': sorted(list(set(dates)))}

print('const DATA = %s;' % json.dumps(output, indent=4, sort_keys=True))
