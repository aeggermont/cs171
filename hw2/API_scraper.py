# Welcome to Twitter data exercise! 
# To help you get started, you should look at the 03-twitter.py example that comes with pattern-2.5.
# Much of the code is written there for you. You just have to understand it!

# INSTRUCTIONS

# 1) Using Pattern stream API for Twitter, write output to twitter_output.csv
# 2) Search for 100 tweets with "visualization" in them 
# 3) Make sure they are unique (HINT: look at 03-twitter.py and the example with index)
# 4) Each row should have:
		# 	Author_of_tweet		
		#   Date (in format of 01/25/2013)
		#	Time (in format of 00:25:29)	
		#	Text_of_tweet (as a string)	
		#	Hashtag1 (if any) with first hashtag word without hashtag symbol in front of it
		#	Hashtag2 (if ang)
		#	….
		
# Output should be in the same style as the following 

	#		christina98		01/25/2013		00:24:59	visualization rocks! #viz #visual #fun			viz		visual		fun
	#		spencer88		01/25/2013		00:25:29	visualization of food. #food					food
	#		george100		01/25/2013		00:23:27	d3.js visualization	struggz			
	
# 5) Make sure we can read your code!