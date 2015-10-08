# HTML parsing
from lxml import html
# Web scraping
import requests
# CSV Parsing
import csv


def main():
	# Information is stored as player: price, opposing team
	runningBackPlayerInformation = []

	# Parse DraftKings CSV file of salaries and matchups
	with open('PageData/DKSalaries.csv', 'rb') as salaryFile:
		salaryReader = csv.reader(salaryFile, delimiter= ',', quotechar = '|')
		for row in salaryReader:
			# Position, Player Name, price, matchup, pointAverage, team
			if row[0] == '"RB"':
				matchUp = parseTeamsInMatchup(row[3])
				# Set the opposing team to be the first one in the matchup
				opposingTeam = matchUp[0]
				# Check which team the player plays for, switch the opposing team if necessary
				if '"' + opposingTeam + '"' == row[5]:
					opposingTeam = matchUp[1]
				row[1] = row[1].replace('"', "")
				row[2].replace('"', "")
				runningBackPlayerInformation.append([ row[1], [row[2], opposingTeam] ])

	# Now parse nfl.com's website to find the running back's average carries per game

	# NFLRunningBackCarryStats1.html
	tree = html.parse('PageData/NFLRunningBackCarryStats1.html').getroot()

	# Get all of the players and their salary/team/opponent
	currentDiv = findClassName(tree, 'content-div default')

	currentDiv = currentDiv.getparent()

	print ""
	print ""
	print currentDiv
	print ""
	print ""
	print currentDiv.keys()
	print currentDiv.get('class')
	print currentDiv.getchildren()
	print ""
	print ""
	print dir(currentDiv)

#	for backs in runningBackPlayerInformation:
#		print backs

"""
	tree = html.parse('PageData/FantasyLabsRunningBacks.html').getroot()

	# Get all of the players and their salary/team/opponent
	currentDiv = findClassName(tree, 'ag-pinned-cols-container')


	print len(currentDiv.getchildren())

	print ""
	print ""
	print currentDiv
	print ""
	print ""
	print currentDiv.keys()
	print currentDiv.get('class')
	print currentDiv.getchildren()
	print ""
	print ""
	print dir(currentDiv)
"""

# Helper function that takes in a string with two teams separated by an @ and returns them as a tuple
def parseTeamsInMatchup(matchupString):
	atFound = False
	firstTeam = ""
	secondTeam = ""
	for letter in matchupString:
		if letter == '"':
			continue
		if letter == '@':
			atFound = True
			continue
		if letter == ' ':
			break
		if atFound:
			firstTeam += letter
		else:
			secondTeam += letter

	return (firstTeam, secondTeam)

# Start from the top of the html heirarchy and return the first div with the inputted className
def findClassName(tree, className):
	# Get all of the players and their salary/team/opponent
	divs = tree.findall('.//div')

	for div in divs:
		thisClassName = div.get('class')
		if thisClassName != None:
			if thisClassName == className:
				return div

if __name__ == "__main__":main()