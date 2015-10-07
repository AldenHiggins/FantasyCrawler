from lxml import html
import requests

def main():
	tree = html.parse('PageData/FantasyLabsBargain.html').getroot()

	# Get all of the players and their salary/team/opponent
	divs = tree.findall('.//div')

	currentDiv = findClassName(tree, 'ag-body')

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