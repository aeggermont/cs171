#!/usr/bin/env python

"""
Requirements:

    Date (in format of 01/25/2013)
    Time (in format of 00:25:29)
"""



import os, sys; sys.path.insert(0, os.path.join("..", ".."))
import time

from pattern.web import Twitter, hashtags
from pattern.db  import Datasheet, pprint

engine = Twitter(language="en")

print "About to start talking with tweeter API ... "

"""
Twiter time date responses in ctime
    Wed, 13 Feb 2013 02:01:55 +0000

"""


for tweet in engine.search("visualization", count=100, cached=False):

    # Get a unique ID
    id = str(hash(tweet.author + tweet.text))

    # Parse time string to convert it to a struct_time
    theTime = time.strptime(tweet.date, "%a, %d %b %Y %H:%M:%S +0000")

    print "Text: ",   tweet.text
    print "Author: ", tweet.author
    print "Date: ",   time.strftime("%m/%d/%Y", theTime)
    print "Time: ",   time.strftime("%H:%M:%S", theTime)
    print "Full Date: ",     tweet.date             # In format of 01/25/2013
    #print "The Time Date", theTime

    print "ID: ", id
    #sys.exit(0)


sys.exit(0)

# This example retrieves tweets containing given keywords from Twitter (http://twitter.com).
try:
    # We store tweets in a Datasheet that can be saved as a text file (comma-separated).
    # In the first column, we'll store a unique ID for each tweet.
    # We only want to add the latest tweets, i.e., those we haven't previously encountered.
    # With an index on the first column we can quickly check if an ID already exists.
    # The index becomes important once more and more rows are added to the table (speed).
    table = Datasheet.load("cool.csv")
    index = dict.fromkeys(table.columns[0], True)
except:
    table = Datasheet()
    index = {}

engine = Twitter(language="en")

# With cached=False, a live request is sent to Twitter,
# so we get the latest results for the query instead of those in the local cache.
for tweet in engine.search("is cooler than", count=25, cached=False):
    print "Tweet text: ", tweet.text
    print "Tweet author: ", tweet.author
    print "Tweet date: ", tweet.date
    print hashtags(tweet.text) # Keywords in tweets start with a #.
    # Create a unique ID based on the tweet content and author.
    id = str(hash(tweet.author + tweet.text))
    # Only add the tweet to the table if it doesn't already contain this ID.
    if len(table) == 0 or id not in index:
        table.append([id, tweet.text])
        index[id] = True

table.save("cool.csv")

print "Total results:", len(table)
print

# Print all the rows in the table.
# Since it is stored as a file it can grow comfortably each time the script runs.
# We can also open the table later on, in other scripts, for further analysis.
#pprint(table)

# Note: you can also search tweets by author:
# Twitter().search("from:tom_de_smedt")

print Twitter().search("from:christiestep527")[0].text
