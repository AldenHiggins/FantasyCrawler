# HTML parsing
from lxml import html
# Web scraping
import requests
# CSV Parsing
import csv


def main():
	# Information is stored as player: price, opposing team
	runningBackPlayerInformation = {}

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
				runningBackPlayerInformation[row[1]] = [row[2], opposingTeam]

	# Now parse yahoo's website to find the running back's average carries per game
	tree = html.parse('PageData/NFLRunningBackCarryStats1.html').getroot()

	currentDiv = findClassName(tree, 'yom-mod yom-app yom-league-stats')
	# Set the current div to the start of the table with the info we're trying to scrape
	currentDiv = currentDiv[7][0]
	# Iterate through all rows
	for row in currentDiv.getchildren():
		if row == currentDiv.getchildren()[0]:
			continue
		if row == currentDiv.getchildren()[1]:
			continue

		# Extract info from that row
		name = row.getchildren()[0].getchildren()[0].text

		gamesPlayed = row.getchildren()[2].text

		totalRushes = row.getchildren()[4].text

		gamesPlayed = gamesPlayed.replace("/", "")
		totalRushes = totalRushes.replace("/", "")

		if gamesPlayed[0] == 'N':
			continue

		if totalRushes[0] == 'N':
			continue

		averageRushesPerGame = (float(totalRushes) / float(gamesPlayed))

		# Check if this running back is in our list currently
		if name in runningBackPlayerInformation.keys():
			runningBackPlayerInformation[name].append(averageRushesPerGame)

	# Add this data to our running back information
	#print runningBackPlayerInformation[name]

	#print runningBackPlayerInformation

	# Parse yahoo's data to get a defense's average yards given up per carry
	teamAverageYardagePerRush = {}
	secondTree = html.parse('PageData/TeamRushingStats.html').getroot()

	thisDiv = findClassName(secondTree, 'yom-mod yom-app yom-league-statsbyteam')
	# Set the current div to the start of the table with the info we're trying to scrape
	thisDiv = thisDiv[6][0]
	# Iterate through all rows
	for row in thisDiv.getchildren():
		if row == thisDiv.getchildren()[0]:
			continue

		# Extract info from that row
		name = row.getchildren()[0].getchildren()[0].text
		averageYardPerRush = row.getchildren()[8].text

		# Abbreviate the team names
		name = convertTeamNameToAbbreviations(name)

		teamAverageYardagePerRush[name] = float(averageYardPerRush)

	# Add on a projected yards per game statistic to 
	playersWithoutCarriesPerGame = []
	for player in runningBackPlayerInformation:
		# Get rid of the players who we couldn't get carries per game counts for
		if len(runningBackPlayerInformation[player]) == 2:
			playersWithoutCarriesPerGame.append(player)
			continue
		# Multiply this player's average carries by the average yardage per carry of the defense they're facing
		playerCost = runningBackPlayerInformation[player][0]
		opposingDefense = runningBackPlayerInformation[player][1]
		playerCarriesPerGame = runningBackPlayerInformation[player][2]
		thisPlayersProjectedYardage = playerCarriesPerGame * teamAverageYardagePerRush[opposingDefense]

		print thisPlayersProjectedYardage
		runningBackPlayerInformation[player].append(thisPlayersProjectedYardage)
		runningBackPlayerInformation[player].append((thisPlayersProjectedYardage / float(playerCost)))

	# Remove all the players who don't have any carries this season
	for playerToRemove in playersWithoutCarriesPerGame:
		del runningBackPlayerInformation[playerToRemove]

	# Format of player info: cost, opposing defense, carries per game, projected yardage, cost per yard
	print runningBackPlayerInformation

"""
	for row in currentDiv.getchildren():
		print ""
		print row
		print row.keys()
"""
"""
	print ""
	print ""
	print currentDiv.getchildren()
	print currentDiv.keys()
	print currentDiv.get('class')
	print currentDiv.get('id')
	#print dir(currentDiv)
"""
"""
	print ""
	print ""
	print currentDiv
	print ""
	print ""
	print currentDiv.keys()
	print currentDiv.get('class')

"""
	

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

# Convert full length team names into their abbreviations
def convertTeamNameToAbbreviations(name):
	if name == "New Orleans Saints":
		return "NO"
	elif name == "Pittsburgh Steelers":
		return "Pit"
	elif name == "New England Patriots":
		return "NE"
	elif name == "San Diego Chargers":
		return "SD"
	elif name == "Tampa Bay Buccaneers":
		return "TB"
	elif name == "Philadelphia Eagles":
		return "Phi"
	elif name == "St. Louis Rams":
		return "StL"
	elif name == "Atlanta Falcons":
		return "Atl"
	elif name == "Cleveland Browns":
		return "Cle"
	elif name == "Cincinnati Bengals":
		return "Cin"
	elif name == "Oakland Raiders":
		return "Oak"
	elif name == "Buffalo Bills":
		return "Buf"
	elif name == "New York Giants":
		return "NYG"
	elif name == "Detroit Lions":
		return "Det"
	elif name == "Carolina Panthers":
		return "Car"
	elif name == "San Francisco 49ers":
		return "SF"
	elif name == "Washington Redskins":
		return "Was"
	elif name == "Seattle Seahawks":
		return "Sea"
	elif name == "Arizona Cardinals":
		return "Ari"
	elif name == "Houston Texans":
		return "Hou"
	elif name == "Tennessee Titans":
		return "Ten"
	elif name == "Jacksonville Jaguars":
		return "Jax"
	elif name == "Chicago Bears":
		return "Chi"
	elif name == "Indianapolis Colts":
		return "Ind"
	elif name == "Miami Dolphins":
		return "Mia"
	elif name == "New York Jets":
		return "NYJ"
	elif name == "Baltimore Ravens":
		return "Bal"
	elif name == "Kansas City Chiefs":
		return "KC"
	elif name == "Denver Broncos":
		return "Den"
	elif name == "Green Bay Packers":
		return "GB"
	elif name == "Minnesota Vikings":
		return "Min"
	elif name == "Dallas Cowboys":
		return "Dal"
	else:
		print "Couldn't match up this name: " + name
		return ""

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