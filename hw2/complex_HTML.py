#!/usr/bin/env python

"""

    Antonio A Eggermont
    Homework 2

    Problem 2


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
        self.actors.append(actor)

    def addWriters(self, writer):
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

    index = 0

    for link in dom.by_tag('table')[1]:
        print "==================  TITLE ================== "
        for a in link.by_tag('a'):
            print "Getting attriburtes ... "
            movieTitleCollection.append(get_title_attributes( a.content, "http://" + str(url.parts['domain']) + a.href))

        #if index == 1:
        #   break

        index =+ 1



def get_title_attributes(title, titleLink):

    url = URL(titleLink)
    dom = DOM(url.download(cached=True))

    titleObj = Title(title)


    print "Movie: ", title

    # Get Directors
    print "-> About to print directors... "

    directors = dom.by_attribute(itemprop="director")[0]
    directorNames =  directors.by_tag("a")


    for director in directorNames:
        #print director.content
        titleObj.addDirectors(director.content)

    # Get writers
    print "-> About to print writers... "

    try:
        writers = dom.by_attribute(itemprop="writer")
        for writer in writers:
            # print writer[1][1].content
            titleObj.addWriters(writer[1][1].content)
    except:
        pass



    print "--> About to get actors... "
    try:
        actors = dom.by_attribute(itemprop="actors" )
        for actor in actors:
            # print actor[1][1].content
            titleObj.addActors(actor[1][1].content)
    except:
        pass


    print "--> Aboutb to get rating information... "


    try:
        ratingsInfo = dom.by_class("star-box-giga-star")

        for rating in ratingsInfo:
            # print rating.content
            titleObj.addRating(rating.content)
    except:
        pass


    print "--> About to print other stuff...  "



    for item in dom.by_class("infobar"):

        try:
            objMatch = re.search("(\d+)", item.by_tag("time")[0].content )

            if objMatch:
                # print objMatch.group(1)
                titleObj.addRunTime(objMatch.group(1))
        except:
            pass



        for genreItem in item.by_tag("a"):

            try:
                objMatch = re.search("genre", genreItem.attributes['href'] )

                if objMatch:
                    titleObj.addGenre(genreItem.content)
                    # print genreItem.attributes['href']
                    # print genreItem.content
            except:
                pass







    """
    objMatch = re.search("(\d+)", str(dom.by_tag("time")[0].content) )

    if objMatch:
        print objMatch.group(1)


    # Get genre
    for element in dom.by_tag("a"):
        # if re.search("genre", element.attributes['href']):

        try:
            if re.search("genre", element.attributes['href']):
                print element.attributes['href']
                print element.content
        except:
            pass

        #print element.href
        #print dom.by_tag("a")[0].content

    """

    return  titleObj



def generate_csv_log():

    # Creating the csv output file for writing into as well as defining the writer

    try:
        output = open("my_output.csv", "wb")
        writer = csv.writer(output)
        writer.writerow(["Title", "Ranking", "Genre", "Actors", "Runtime"])

        for title in titleCatalog:
            writer.writerow([ title.titleName, title.rank, "%s" % (','.join( title.genres )) , "%s" % (','.join( title.actors )), title.runTime ])


    except IOError as e:
        print "I/O error({0}): {1}".format(e.errno, e.strerror)
        raise

    finally:
        output.close()




if __name__ == "__main__":

    htmlSrc = "http://www.imdb.com/chart/top"
    process_page(htmlSrc)

    print "======================================================"

    for movie in movieTitleCollection:
        print movie.movieTitle
        print movie.runTime
        print movie.genres
        print movie.directors
        print movie.writers
        print movie.actors
        print movie.rating
        print movie.numRatings

