import csv
from pattern.web import URL, DOM, plaintext, strip_between
from pattern.web import NODE, TEXT, COMMENT, ELEMENT, DOCUMENT

url = URL("http://www.imdb.com/search/title?num_votes=5000,&sort=user_rating,desc&start=1&title_type=tv_series")
dom = DOM(url.download(cached=True))

#print len(dom.by_class("title"))


print dom.by_class("title")[0].by_tag("a")[0].content
print dom.by_class("value")[0].content
print dom.by_class("runtime")[0].content
print dom.by_class("genre")[0].by_tag("a")[0].content
print dom.by_class("credit")[0].by_tag("a")[0].content



#for title in dom.by_class("title"):
#    print title.by_tag("a")[0].content



