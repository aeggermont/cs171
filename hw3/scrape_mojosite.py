#!/usr/bin/env python

"""
     Antonio A Eggermont
     Homework 3 - Problem 4

"""


import os
import sys
import re
import csv
import unicodedata
from pattern.web import URL, DOM, plaintext, strip_between
from pattern.web import NODE, TEXT, COMMENT, ELEMENT, DOCUMENT


source_links = ['http://www.boxofficemojo.com/alltime/weekends/?pagenum=m50&sort=opengross&p=.htm&order=DESC',
                'http://www.boxofficemojo.com/alltime/weekends/?pagenum=m3040&sort=opengross&p=.htm&order=DESC',
                'http://www.boxofficemojo.com/alltime/weekends/?pagenum=m2530&sort=opengross&p=.htm&order=DESC',
                'http://www.boxofficemojo.com/alltime/weekends/?pagenum=m2025&sort=opengross&p=.htm&order=DESC',
                'http://www.boxofficemojo.com/alltime/weekends/?pagenum=m1520&sort=opengross&p=.htm&order=DESC',
                'http://www.boxofficemojo.com/alltime/weekends/?pagenum=m1015&sort=opengross&p=.htm&order=DESC'
                ]


# source_links = ['http://www.boxofficemojo.com/alltime/weekends/?pagenum=m50&sort=opengross&p=.htm&order=DESC']

movie_records = {}
index = 0

def process_page(page):

    global index

    try:
        url = URL(page)
        dom = DOM(url.download(cached=False))
    except Exception, e:
        print "I/O error({0}): {1}".format(e.errno, e.strerror)
        raise


    print url.parts['domain']
    print "Number of tables in the page: ", len (dom.by_tag('table'))
    print "Number of movie records: ", len (dom.by_tag('table')[4])


    for data in dom.by_tag('table')[4]:

        studio      = ""
        title       = ""
        opening     = ""
        weekendDate = ""

        try:

            if re.search("^.*click to view.*$", data.by_tag('a')[1].content):
                continue

            if data.by_tag('a')[1].content != "":
                studio = str(data.by_tag('a')[1].content).encode('ascii', 'replace')
            else:
                continue

            for a in data.by_tag('a'):
                if re.search("^\d+/\d+/\d+", a.content):
                    weekendDate = str(a.content).encode('ascii', 'replace')

        except:
            pass
            continue


        try:
            for a in data.by_tag('b'):
                if re.search("^\$\d+.*", a.content):
                    opening = a.content
                else:
                    title = str(a.content).encode('ascii', 'replace')

        except:
            pass
            continue

        # Get a unique ID
        id = str(hash(opening + studio + title))
        #print id
        #print " Title: %s - Studio: %s - Weekend date: %s - Opening: %s " % ( title, studio, weekendDate, opening )

        index += 1
        movie_records[id] = dict([('title', title),
                                  ('studio', studio),
                                  ('weekend', weekendDate),
                                  ('opening', opening)])



def generate_csv_log():
    # Creating the csv output file for writing into as well as defining the writer

    try:
        output = open("movie_weekends.csv", "wb")
        writer = csv.writer(output)
        writer.writerow(["Movie Title", "Studio", "Weekend Date", "Opening Revenue"])

        for key, value in movie_records.iteritems():
            print key, value['title'], value['studio'], value['weekend'], value['opening']
            writer.writerow([ value['title'], value['studio'], value['weekend'], value['opening']])

    except IOError as e:
        print "I/O error({0}): {1}".format(e.errno, e.strerror)
        raise
    finally:
        output.close()




if __name__ =="__main__":

    for src_link in source_links:
        process_page(src_link)


    generate_csv_log()
    print "Number of records  processed: " , index
    print "NUmber of archived records: ", len(movie_records)


