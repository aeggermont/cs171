import csv
from pattern.web import URL, DOM, plaintext, strip_between
from pattern.web import NODE, TEXT, COMMENT, ELEMENT, DOCUMENT


"""
print len(dom.by_class("title"))
print dom.by_class("title")[0].by_tag("a")[0].content
print dom.by_class("runtime")[0].content

print dom.by_class("value")[0].content
print dom.by_class("genre")[0].by_tag("a")[0].content
print dom.by_class("credit")[0].by_tag("a")[0].content

print " --> "

print dom.by_class("title")[1].by_tag("a")[0].content
print dom.by_class("runtime")[1].content

print dom.by_class("value")[1].content
print dom.by_class("genre")[1].by_tag("a")[0].content
print dom.by_class("credit")[1].by_tag("a")[0].content

"""


# Globals

titleCatalog = []    # Global container to hold movie titles and their attriburtes


class Title:

    def __init__(self, titleName ):

        self.titleName = titleName
        self.rank    = None
        self.runTime = None
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
        #print " -------------> ", domIndex
        #print title.by_tag("a")[0].content

        titleCatalog.append(Title(title.by_tag("a")[0].content))
    
        try:
            # print dom.by_class("runtime")[domIndex].content
            titleCatalog[domIndex].addRunTime(dom.by_class("runtime")[domIndex].content)
        except:
            pass

        try:
            # print dom.by_class("value")[domIndex].content
            titleCatalog[domIndex].addRank(dom.by_class("value")[domIndex].content)
        except:
            pass

        try:
            for genre in dom.by_class("genre")[domIndex].by_tag("a"):
                # print genre.content
                titleCatalog[domIndex].addGenre(genre.content)
        except:
            pass

        try:
            for credit in dom.by_class("credit")[domIndex].by_tag("a"):
                # print credit.content
                titleCatalog[domIndex].addActors(credit.content)
        except:
            pass

        domIndex += 1


def generate_csv_log():

    for title in titleCatalog:
        print "-----------------------" 
        print title.titleName
        print title.rank
        if title.runTime is not None: 
            print title.runTime 
        print "\"%s\"" % (','.join( title.genres ))
        print "\"%s\"" % (','.join( title.actors ))


if __name__ == "__main__":

    process_page()
    generate_csv_log()

    print len(titleCatalog)

