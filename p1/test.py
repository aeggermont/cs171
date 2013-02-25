import urllib2
import json
from StringIO import StringIO
import base64

username = "aeggermont"
password = "Gilgamesh102812#"

req = urllib2.Request("https://api.github.com/")
req.add_header("Authorization", "Basic " + base64.urlsafe_b64encode("%s:%s" % (username, password)))
req.add_header("Content-Type", "application/json")
req.add_header("Accept", "application/json")
res = urllib2.urlopen(req)

data = res.read()
repository = json.load(StringIO(data))

print data
