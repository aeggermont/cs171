

"""

   Antonio A Eggermont
   Homework 1, February 6, 2013


   This is the introductory exercise to Pattern. We will try
   to guide you along as much as possible, but you should read
   up on documentation and get used to doing that. It's a really
   useful skill and a big part of programming is self-learning!

   The following  items will be scrapped from the DOM tree:
        * TV Title
        * Ranking
        * Genres (if any) separated by commas
        * Actors/actresses (if any) separated by commas
        * Runtime (if any) but you only keep the numbers
"""


import csv
import re
from pattern.web import URL, DOM, plaintext, strip_between
from pattern.web import NODE, TEXT, COMMENT, ELEMENT, DOCUMENT


titleCatalog = []    # Global container to hold movie titles and their attriburtes


class Title:

    def __init__(self, titleName ):

        self.titleName = titleName
        self.rank    = ""
        self.runTime = ""
        self.genres = []      
        self.actors = []

    def addRank(self, rank):
        self.rank = rank

    def addRunTime(self, runTime):
        self.runTime = runTime

    def addGenre(self, genre):
        self.genres.append(genre)

    def addActors(self, actor):
        self.actors.append(actor) 
          

def process_page():

    url = URL("http://www.imdb.com/search/title?num_votes=5000,&sort=user_rating,desc&start=1&title_type=tv_series")
    dom = DOM(url.download(cached=True))
    domIndex = 0

    for title in dom.by_class("title"):

        theTitle = str(title.by_tag("a")[0].content).encode('ascii', 'replace')
        titleCatalog.append(Title(theTitle))
    
        try:

            match = re.search("^(\d+).*$", str(dom.by_class("runtime")[domIndex].content).encode('ascii', 'replace'))
            #print match.group(1)
            # titleCatalog[domIndex].addRunTime( str(dom.by_class("runtime")[domIndex].content).encode('ascii', 'replace'))
            titleCatalog[domIndex].addRunTime(match.group(1))

        except Exception, e:
            pass

        try:
            titleCatalog[domIndex].addRank( str(dom.by_class("value")[domIndex].content).encode('ascii', 'replace'))
        except Exception, e:
            pass

        try:
            for genre in dom.by_class("genre")[domIndex].by_tag("a"):
                titleCatalog[domIndex].addGenre( str(genre.content).encode('ascii', 'replace'))
        except Exception, e:
            pass

        try:
            for credit in dom.by_class("credit")[domIndex].by_tag("a"):
                titleCatalog[domIndex].addActors( str(credit.content).encode('ascii', 'replace'))
        except Exception, e:
            pass

        domIndex += 1


def generate_csv_log():

    # Creating the csv output file for writing into as well as defining the writer

    try:
        output = open("my_output.csv", "wb")
        writer = csv.writer(output)
        writer.writerow(["Title", "Ranking", "Genre", "Actors", "Runtime"])

        for title in titleCatalog:
            #print "-----------------------" 
            #print title.titleName
            #print title.rank
            #print title.runTime 
            #print "\"%s\"" % (','.join( title.genres ))
            #print "\"%s\"" % (','.join( title.actors ))
            writer.writerow([ title.titleName, title.rank, "%s" % (','.join( title.genres )) , "%s" % (','.join( title.actors )), title.runTime ])


    except IOError as e:
        print "I/O error({0}): {1}".format(e.errno, e.strerror)
        raise
        
    finally:
        output.close()


# Program starts here

if __name__ == "__main__":

    process_page()
    generate_csv_log()
    print "Total number of titles processed: ", len(titleCatalog)

