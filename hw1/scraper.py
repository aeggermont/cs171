# This is the introductory exercise to Pattern. We will try
# to guide you along as much as possible, but you should read
# up on documentation and get used to doing that. It's a really
# useful skill and a big part of programming is self-learning! 

# This is also just a skeleton
# so you actually don't have to use this at all. As long as your code 
# runs at the end of the day and produces the write results in a csv file, we're happy.

# Print is probably going to be your best friend for debugging so print often
# especially if something goes wrong.

#################################################################

# We are first importing from the pattern library and csv
import csv

from pattern.web import URL, DOM, plaintext, strip_between
from pattern.web import NODE, TEXT, COMMENT, ELEMENT, DOCUMENT

# Creating the csv output file for writing into as well as defining the writer
output = open("my_output.csv", "wb")
writer = csv.writer(output)

# Get the DOM object. Because this is the first exercise, we will only gather what's on this page.
# More complex example will come in HW2 with navigation of links 

url = URL("http://www.imdb.com/search/title?num_votes=5000,&sort=user_rating,desc&start=1&title_type=tv_series")
dom = DOM(url.download(cached=True))

# At this stage in the process, you should look at the HTML source of this page
# You will get the the following items:
	# TV Title
	# Ranking
	# Genres (if any) separated by commas
	# Actors/actresses (if any) separated by commas
	# Runtime (if any) but you only keep the numbers

# There are many ways to go from here an you can really choose your own method

# To get you started, uncomment the following print line and see the output for the first entry

# print dom.by_class("title")[0].by_tag("a")[0].content

# by_class selects all with class="title" and returns a list. Familiarize yourself with the DOM
# by trying out different combinations. See what each returns.

# NOTE: if you see u' in front of your strings, you can use use encode( 'ascii', 'ignore' ) on your string
# to learn why, you can optionally read up on http://docs.python.org/2/howto/unicode.html 




# You could start with this

# add header row
writer.writerow(["Title", "Ranking", "Genre", "Actors", "Runtime"])
allElements = dom.by_class("title")

for e in allElements:
	
	# WRITE YOUR CODE HERE
	
	
		
output.close()












# For your reference (taken from example in pattern-2.5)

# The DOM object is a tree of Element and Text objects.
# All objects inherit from Node, DOM also inherits from Element.

# Node.type          => NODE, TEXT, COMMENT, ELEMENT, DOM
# Node.parent        => Parent Node object.
# Node.children      => List of child Node objects.
# Node.next          => Next Node in Node.parent.children.
# Node.previous      => Previous Node in Node.parent.children.

# DOM.head      => Element with tag name "head".
# DOM.body      => Element with tag name "body".

# Element.tag        => Element tag name, e.g. "body".
# Element.attributes => Dictionary of tag attribute, e.g. {"class": "header"}
# Element.content    => Element HTML content as a string.
# Element.source     => Element tag + content

# Element.get_element_by_id(value)
# Element.get_elements_by_tagname(value)
# Element.get_elements_by_classname(value)
# Element.get_elements_by_attribute(name=value)

# You can also use short aliases: by_id(), by_tag(), by_class(), by_attribute()
# The tag name passed to Element.by_tag()
# can include a class ("div.message") or an id ("div#header").