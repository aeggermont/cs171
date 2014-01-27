# Harvard CS171/CSCI E-64 Spring 2013
# Solution for HW5 Problem 2
# By a CS171 Student

#!/usr/bin/env python
import sys

from csv import DictReader, writer
import json
import time

def extract(row):
    t = time.strptime(row['date'], '%Y/%m/%d')
    return {'time': int(time.mktime(t)), 'price': row['close']}

def to_json(rows):
    print json.dumps(rows, sort_keys=True, indent=2)

def to_csv(rows):
    w = writer(sys.stdout)
    header = sorted(rows[0].keys())
    w.writerow(header)
    w.writerows(map(lambda x: r[x], header) for r in rows)

if __name__ == '__main__':
    try:
        mode = {
            'json': to_json,
            'csv': to_csv
        }.get(sys.argv[1], to_json)
    except:
        mode = to_json

    r = DictReader(sys.stdin)
    rows = map(extract, r)
    mode(rows)
