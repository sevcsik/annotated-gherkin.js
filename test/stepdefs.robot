*** Settings ***

Library  OperatingSystem
Library  String

*** Keywords ***

Given a feature file with content
	[Arguments]  ${content}
	Create file  the given feature file  ${content}

Given a feature file "${file}"
	${content}=  Get file  ${file}
	Create file  the given feature file  ${content}

When I strip every annotation from the given feature file
	Run  node ../cli.js -o "the preprocessed feature file" "the given feature file"

When I strip every annotation except "${annotation}" from the given feature file
	Run  node ../cli.js -o "the preprocessed feature file" -k "${annotation}" "the given feature file"

Then the preprocessed feature file's content equals
	[Arguments]  ${content}
	Create file  the preprocessed feature file, reference  ${content}
	${rc}  ${output}  Run and return rc and output
	...  diff "the preprocessed feature file" "the preprocessed feature file, reference"
	Should be equal as integers  ${rc}  0

