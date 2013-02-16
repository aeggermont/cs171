#!/usr/bin/env python

"""

    Antonio A Eggermont
    Homework 2

    Problem 2 - Instructions


    Look at the HTML source of this page: http://www.imdb.com/chart/top. From this source web page your
    python script should follow all the links to the movies and scrape the information on these linked
    pages to obtain Runtime (min), Genre, Director(s), Writer(s), Actors, Rating, and Number of Ratings.


    Produce a comma-separated text file (use commas to separate the entries) with a header row and
    the fields:

        * Title of movie - DONE
        * Runtime - DONE
        * Genre (separated by semicolons if multiple) - DONE
        * Director(s) (separated by semicolons if multiple) - DONE
        * Writer(s) (separated by semicolons if multiple) - DONE
        * Actors (only the first three actors listed, separated by semicolons) - DONE
        * Ratings
        * Number of Ratings


    Docs:
         http://www.clips.ua.ac.be/pages/pattern-we

"""


import os
import sys
import re
import csv
import unicodedata
from pattern.web import URL, DOM, plaintext, strip_between
from pattern.web import NODE, TEXT, COMMENT, ELEMENT, DOCUMENT


movieTitleCollection = []   # Global container to hold movie titles and their attriburtes


class Title:

    def __init__(self, title):

        self.movieTitle = title
        self.runTime    = ""
        self.genres     = []
        self.directors  = []
        self.writers    = []
        self.actors     = []
        self.rating     = ""
        self.numRatings = ""


    def addGenre(self, genre):
        self.genres.append(genre)

    def addRunTime(self,runTime ):
        self.runTime = runTime

    def addDirectors(self, director):
        self.directors.append(director)

    def addActors(self, actor):

        if len(self.actors) < 3:
            self.actors.append(actor)

    def addWriters(self, writer):

        if len(self.writers) < 3:
            self.writers.append(writer)

    def addRating(self,rating):
        self.rating = rating






def process_page(page):

    try:
        url = URL(page)
        dom = DOM(url.download(cached=True))
    except Exception, e:
        print "I/O error({0}): {1}".format(e.errno, e.strerror)
        raise

    # HTTP request attributes

    """
    print url.string    # URL + URI
    print url.parts     # Dic of attributes such as username, protocol, domain, etc ..
    print url.redirect  # Actual URL after redirection, or None
    print url.headers   # Dic of HTTP response headers
    print url.mimetype  # Document mime type
    """

    # DOM PARSING TABLE

    print url.parts['domain']
    print "Number of tables in the page: ", len (dom.by_tag('table'))
    print "Number of movie records: ", len (dom.by_tag('table')[1])

    for link in dom.by_tag('table')[1]:
        #print "==================  TITLE ================== "
        for a in link.by_tag('a'):
            #print "Getting attriburtes ... "
            movieTitleCollection.append(get_title_attributes( str(a.content), "http://" + str(url.parts['domain']) + a.href))




def get_title_attributes(title, titleLink):

    url = URL(titleLink)
    dom = DOM(url.download(cached=True))
    titleObj = Title(title.encode('ascii','replace'))

    print "Movie: ", title

    # Get Directors
    print "-> About to print directors... "

    directors = dom.by_attribute(itemprop="director")[0]
    directorNames =  directors.by_tag("a")


    for director in directorNames:
        print director.content

        dirName  = unicodedata.normalize('NFD', director.content).encode('ascii','replace')
        #str(director.content).encode("utf-8")
        print "Director ===> ", dirName

        titleObj.addDirectors( dirName )

    # Get writers
    print "-> About to print writers... "

    try:
        writers = dom.by_attribute(itemprop="writer")
        for writer in writers:
            # print writer[1][1].content
            titleObj.addWriters( str(writer[1][1].content).encode('ascii', 'replace'))
    except:
        pass



    print "--> About to get actors... "
    try:
        actors = dom.by_attribute(itemprop="actors" )
        for actor in actors:
            # print actor[1][1].content
            titleObj.addActors( str(actor[1][1].content).encode('ascii', 'replace'))
    except:
        pass


    print "--> Aboutb to get rating information... "


    try:
        ratingsInfo = dom.by_class("star-box-giga-star")

        for rating in ratingsInfo:
            # print rating.content
            titleObj.addRating(str(rating.content).encode('ascii', 'replace'))
    except:
        pass


    print "--> About to print other stuff...  "



    for item in dom.by_class("infobar"):

        try:
            objMatch = re.search("(\d+)", item.by_tag("time")[0].content )

            if objMatch:
                # print objMatch.group(1)
                titleObj.addRunTime( str(objMatch.group(1)).encode('ascii', 'replace'))
        except:
            pass



        for genreItem in item.by_tag("a"):

            try:
                objMatch = re.search("genre", genreItem.attributes['href'] )

                if objMatch:
                    titleObj.addGenre(str(genreItem.content).encode('ascii', 'replace'))
                    # print genreItem.attributes['href']
                    # print genreItem.content
            except:
                pass


    return  titleObj



def generate_csv_log():

    # Creating the csv output file for writing into as well as defining the writer

    try:
        output = open("my_output.csv", "wb")
        writer = csv.writer(output)
        writer.writerow(["Movie Title", "Time", "Genre", "Directors","Writers","Actors","Rating","Number of Ratings"])

        for movie in movieTitleCollection:
            if len(movie.genres) > 1:
                genres =  "%s" % (';'.join( movie.genres))
            else:
                genres = movie.genres[0]

            if len(movie.directors) > 1:
                directors =  "%s" % (';'.join( movie.directors))
            elif len(movie.directors) != 0 :
                directors = movie.directors[0]
            else:
                continue

            if len(movie.writers) > 1:
                writers =  "%s" % (';'.join( movie.writers ))
            elif len(movie.writers) != 0:
                writers = movie.writers[0]
            else:
                continue

            if len(movie.actors) > 1:
                actors =  "%s" % (';'.join(movie.actors ))
            elif len(movie.actors) != 0:
                actors =  movie.actors[0]
            else:
                continue

            writer.writerow([ movie.movieTitle , movie.runTime , genres , directors , writers , actors ,  movie.rating, movie.numRatings ])


    except IOError as e:
        print "I/O error({0}): {1}".format(e.errno, e.strerror)
        raise

    finally:
        output.close()




if __name__ == "__main__":

    htmlSrc = "http://www.imdb.com/chart/top"
    process_page(htmlSrc)
    generate_csv_log()

    sys.exit(0)

    print "======================================================"



    for movie in movieTitleCollection:
        print movie.movieTitle
        print movie.runTime

        if len(movie.genres) > 1:
           print "%s" % (';'.join( movie.genres))
        else:
            print movie.genres[0]

        if len(movie.directors) > 1:
            print "%s" % (';'.join( movie.directors))
        else:
            print movie.directors[0]


        if len(movie.writers) > 1:
            print "%s" % (';'.join( movie.writers ))
        else:
            print movie.writers[0]

        if len(movie.actors) > 1:
            print "%s" % (';'.join(movie.actors ))
        else:
            print movie.actors[0]


        print movie.rating
        print movie.numRatings

