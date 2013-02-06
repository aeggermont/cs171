import csv
import re
from pattern.web import URL, DOM, plaintext, strip_between
from pattern.web import NODE, TEXT, COMMENT, ELEMENT, DOCUMENT



# Globals

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
        #print theTitle
        #titleCatalog.append(Title(title.by_tag("a")[0].content))
        titleCatalog.append(Title(theTitle))
    
        try:
            # print dom.by_class("runtime")[domIndex].content
            titleCatalog[domIndex].addRunTime( str(dom.by_class("runtime")[domIndex].content).encode('ascii', 'replace'))
        except:
            pass

        try:
            # print dom.by_class("value")[domIndex].content
            titleCatalog[domIndex].addRank( str(dom.by_class("value")[domIndex].content).encode('ascii', 'replace'))
        except:
            pass

        try:
            for genre in dom.by_class("genre")[domIndex].by_tag("a"):
                # print genre.content
                titleCatalog[domIndex].addGenre( str(genre.content).encode('ascii', 'replace'))
        except:
            pass

        try:
            for credit in dom.by_class("credit")[domIndex].by_tag("a"):
                # print credit.content
                titleCatalog[domIndex].addActors( str(credit.content).encode('ascii', 'replace'))
        except:
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





if __name__ == "__main__":

    process_page()
    generate_csv_log()
    print len(titleCatalog)

