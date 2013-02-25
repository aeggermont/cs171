#!/usr/bin/env python

import os, sys; sys.path.insert(0, os.path.join("..", ".."))
import time

from pattern.web import Twitter
from pattern.db  import Datasheet, pprint

engine1 = Twitter(language="en")
engine2 = Twitter(language="en")


print "-------------------------------------"
print "Tweets in Boston, MA ... "


bosCount=0
sfoCount=0 

keyword = " "

for tweet in engine1.search(keyword , geocode="42.3583333,-71.0602778,25mi" , count=400, cached=True):
    print "-> BOSTON "
    print tweet.author
    print tweet.text
    print tweet.date
    bosCount += 1



print "-------------------------------------"
print "Tweets in San Francisco, CA ... "

for tweet in engine2.search(keyword, geocode="37.781157,-122.398720,25mi", count=400, cached=True):
    print "-> SAN FRANCISCO "
    print tweet.author
    print tweet.text
    print tweet.date
    sfoCount += 1


print "------------------------------"
print "Total Number of hits in Boston: ", bosCount
print "Total Number of hits in San Francisco ", sfoCount


