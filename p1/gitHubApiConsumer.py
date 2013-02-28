#!/usr/bin/env python

"""
     Antonio A Eggermont
     Homework 3 - Problem 4

"""

import unicodedata
import json
import sys
import os
import csv
import re
import time

import urllib2
from StringIO import StringIO
import base64


from pattern.web import URL, extension


listContributors = []

csvDataContainer = {}


class Contributor():

    def __init__(self, login,
                        url,
                        html_url,
                        type):

        self.login     = login
        self.url       = url
        self.html_url  = html_url
        self.type      = type
        self.name      = ""
        self.id        = ""
        self.company   = ""
        self.location  = ""


    def contribInfo(self, name, id, company, location):

        self.name     = name
        self.id       = id
        self.company  = company
        self.location = location






def getContributorsManually():

    username = "aeggermont"
    password = "Gilgamesh102812#"

    req = urllib2.Request("https://api.github.com/repos/facebook/tornado/contributors")
    req.add_header("Authorization", "Basic " + base64.urlsafe_b64encode("%s:%s" % (username, password)))
    req.add_header("Content-Type", "application/json")
    req.add_header("Accept", "application/json")
    res = urllib2.urlopen(req)
    data = res.read()

    return (json.load(StringIO(data)))



def getContributorInforManually(url):

    username = "aeggermont"
    password = "Gilgamesh102812#"

    req = urllib2.Request(url)
    req.add_header("Authorization", "Basic " + base64.urlsafe_b64encode("%s:%s" % (username, password)))
    req.add_header("Content-Type", "application/json")
    req.add_header("Accept", "application/json")
    res = urllib2.urlopen(req)
    data = res.read()

    return (json.load(StringIO(data)))




def getContributors():

    contributors = "https://api.github.com/repos/facebook/tornado/contributors"
    url          = URL(contributors)

    contribList  = json.loads(url.download())

    return contribList;






def getContributorInfo(devUrl):

    url          = URL(devUrl)
    contribInfo  = json.loads(url.download())


    """
    return json.dumps( contribInfo['name'],
                       contribInfo['id'],
                       contribInfo['company'],
                       contribInfo['location'])

    """



def generate_csv_log(listContributors):
    # Creating the csv output file for writing into as well as defining the writer

    try:
        output = open("tornade-contributors.csv", "wb")
        writer = csv.writer(output)
        writer.writerow(["name", "id", "company", "location", "login"])

        for developer in listContributors:
            writer.writerow([ developer.name,
                              developer.id,
                              developer.company,
                              developer.location,
                              developer.login])

    except IOError as e:
        print "I/O error({0}): {1}".format(e.errno, e.strerror)
        raise
    finally:
        output.close()


def getContributorsinRepo():

    for developer in getContributorsManually():

        devObj = Contributor(str(developer['login']).encode('ascii', 'ignore'),
            str(developer['url']).encode('ascii', 'ignore'),
            str(developer['html_url']).encode('ascii', 'ignore'),
            str(developer['type']).encode('ascii', 'replace'))

        developerInfo = getContributorInforManually(developer['url'])


        try:
            devObj.name = str(developerInfo['name']).encode('ascii', 'ignore')
        except:
            devObj.name = ""
            pass

        try:
            devObj.id =  str(developerInfo['id']).encode('ascii', 'ignore')
        except:
            devObj.id = ""
            pass

        try:
            devObj.company = str(developerInfo['company']).encode('ascii', 'ignore')
        except:
            devObj.company = ""
            pass


        try:
            devObj.location = str(developerInfo['location']).encode('ascii', 'ignore')
        except:
            devObj.location = ""
            pass

        listContributors.append(devObj)

    print "Total number of contributors: ", len(listContributors)

    generate_csv_log(listContributors)



def getCommitsInComponent(component, logFile, writer):

    print "-----------------------------"
    print component , logFile
    print "-----------------------------"

    # Compile REGEX for patterm matching
    commitSearch     = re.compile("commit\s+(\S+)")
    authorSearch     = re.compile("Author:\s+(.*)\s+<(.*)>.*")
    dateCommitSearch = re.compile("Date:\s+(.*)\s-.*")



    record = {'sha' :  "", 'name' : "", 'email': "", 'date' : ""}
    nameFound  = False
    dateFound  = False
    shaFound   = False

    try:
        fh = open(logFile)

        for line in fh:
            matchobj1 = commitSearch.search(line)
            matchobj2 = authorSearch.search(line)
            matchobj3 = dateCommitSearch.search(line)

            if matchobj1:
                #print "------------------------------------> "
                #print matchobj1.group(1)
                record['sha']= matchobj1.group(1)
                shaFound = True

            if matchobj2:
                #print line.strip()
                record['name']  = matchobj2.group(1)
                record['email'] = matchobj2.group(2)
                nameFound = True
                #print matchobj2.group(1)
                #print matchobj2.group(2)

            if matchobj3:
                #print line
                #print time.strftime( "%b %d %Y", time.strptime(matchobj3.group(1),"%a %b %d %H:%M:%S %Y"))
                record['date'] = time.strftime( "%b/%d/%Y", time.strptime(matchobj3.group(1),"%a %b %d %H:%M:%S %Y"))
                dateFound = True


            # Write row ... (["sha", "component", "author", "email", "date"])
            if nameFound is True and shaFound is True and dateFound is True:
                print record['sha'], component, record['name'], record['email'], record['date']
                writer.writerow([record['sha'], component, record['name'], record['email'], record['date']])
                nameFound = False
                shaFound  = False
                dateFound = False
                record = {'sha' :  "", 'name' : "", 'email': "", 'date' : ""}


    except IOError as e:
        print e





def parseCommitLogsPerComponent(logs):

    logsLocation = "/Users/alberttsoi/dev/tornado/tornado/tornado"


    # First, lets try to crean a csv file to collect all the commits, contribitor names and
    # dates per Web service framework

    try:
        output = open("tornado-commits-contributors.csv", "wb")
        writer = csv.writer(output)
        writer.writerow(["sha", "component", "author", "email", "date"])

        for file in logs:
            getCommitsInComponent (file.split('.')[0], '/'.join([logsLocation,file]), writer)

    except IOError as e:
        print "I/O error({0}): {1}".format(e.errno, e.strerror)
        raise
    finally:
        output.close()




def getCommitLogFiles():

    logsLocation = "/Users/alberttsoi/dev/tornado/tornado/tornado"
    collectedLogs = []

    for file in os.listdir(logsLocation):
        if re.search("^[a-zA-Z].*py.commit.log", file):
            collectedLogs.append(file)

    return collectedLogs




if __name__ == "__main__":

    parseCommitLogsPerComponent(getCommitLogFiles())


    # for file in getCommitLogFiles():
    #    print file

    # generate_csv_log()
    # parseCommitLogsPerComponent()