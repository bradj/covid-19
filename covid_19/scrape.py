from datetime import datetime
import json
import re


def date_format(date):
    d = date.split('/')

    year = f'20{d[2]}'
    month = d[0] if len(d[0]) == 2 else f'0{d[0]}'
    day = d[1]

    return f'{year}-{month}-{day}'


def remove_countries(countries):
    del_idx = []
    for idx, country in enumerate(countries['series']):
        # remove countries without data
        if len(country['values']) <= 0:
            del_idx.append(idx)
            continue

        # sort values by date
        country['values'] = sorted(country['values'], key=lambda value: value['date'])

        stats = country['values'][-1]

        # remove countries with less than 1000 cases
        if stats['cases'] < 1000:
            del_idx.append(idx)
            continue

        country['stats'] = {
            'cases': stats['cases'],
            'deaths': stats['deaths'],
            'recovered': stats['recovered'],
            'largest_increase': country['stats']['largest_increase']}

    for idx in sorted(del_idx, reverse=True):
        del countries['series'][idx]

    return countries


def get_largest_increase(values):
    li = {
        'date': None,
        'increase': 0
    }

    prev = 0
    for value in values:
        increase = value['cases'] - prev

        if increase > li['increase']:
            li['increase'] = increase
            li['date'] = value['date']

        prev = value['cases']

    return li


def get_country_data():
    countries = {
        'dates': [],
        'series': []
    }

    dates = []

    with open('lookup.json', 'r') as f:
        lookup = json.loads(f.read())

    with open('countries.json', 'r') as f:
        data = json.loads(f.read())['data']

    for d_country in data:
        if d_country['countrycode'] not in lookup:
            continue

        d_country['name'] = lookup[d_country['countrycode']]
        d_country['date'] = date_format(d_country['date'])
        dates.append(d_country['date'])

        found = False
        for country in countries['series']:
            if d_country['name'] != country['name']:
                continue

            found = True
            country['values'].append({
                'cases': int(d_country['cases']),
                'deaths': int(d_country['deaths']),
                'recovered': int(d_country['recovered']),
                'date': d_country['date'],
            })

        if not found:
            countries['series'].append({
                'name': d_country['name'],
                'stats': {
                    'cases': 0,
                    'deaths': 0,
                    'recovered': 0,
                    'largest_increase': {
                        'prev': 0,
                        'date': None,
                        'increase': 0
                    }
                },
                'values': []
            })

    countries = remove_countries(countries)

    for country in countries['series']:
        country['stats']['largest_increase'] = get_largest_increase(country['values'])

    countries['dates'] = sorted(list(set(dates)))
    countries['series'] = sorted(countries['series'], key=lambda country: country['stats']['cases'], reverse=True)

    return countries


def str_to_int(s):
    s = re.sub(r'[\D]', '', s)
    return int(s.encode('ascii', 'ignore'))


def get_states():
    states = {
        'dates': [],
        'series': []
    }

    with open('states.json', 'r') as f:
        response = json.loads(f.read())

    dates = []

    for idx, i in enumerate(response):
        date = str(i['date'])
        response[idx]['date'] = f'{date[:4]}-{date[4:6]}-{date[-2:]}'

        dates.append(i['date'])

        if 'positive' not in i or i['positive'] is None:
            i['positive'] = 0

        found = False
        for state in states['series']:
            if state['name'] != i['state']:
                continue

            found = True
            state['values'].insert(0, i)

            if 'positiveIncrease' not in i or i['positiveIncrease'] is None:
                continue

            if state['stats']['largest_increase']['increase'] < i['positiveIncrease']:
                state['stats']['largest_increase']['increase'] = i['positiveIncrease']
                state['stats']['largest_increase']['date'] = i['date']

        if not found:
            states['series'].append({
                'name': i['state'],
                'stats': {**i,
                          'largest_increase': {
                              'increase': i['positiveIncrease'],
                              'date': i['date']
                          }
                          },
                'values': [i]
            })

    states['dates'] = sorted(list(set(dates)))
    states['series'] = sorted(states['series'], key=lambda state: state['stats']['positive'], reverse=True)

    return states


print('const UPDATED = "%s";' % str(datetime.utcnow()))
print('const DATA = %s;' % json.dumps(get_country_data()).replace('", "', '","'))
print('const STATES = %s;' % json.dumps(get_states()).replace('", "', '","'))
