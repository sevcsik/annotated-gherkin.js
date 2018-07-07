#!/usr/bin/env node
const cmd = require('commander')
const annotatedGherkin = require('.')
const { readFile, writeFile } = require('fs')
const { promisify } = require('util')

const package = require('./package.json')

cmd
	.description(
`Preprocess an annotated gherkin file into a regular gherkin file by stripping
irrelevant steps. If no tags are specified with -m, then all steps which have
an annotation like " | tag" at the end of the step will be dropped from the
output gherkin file. If a tag is specified, staps with the given tag will
remain, with the annotation removed.`)
	.version(package.version)
	.usage('[options] <FILE>')
	.option( '-o, --output <FILE>'
	       , 'write the Robot Framework version to the given file. Default is the standard output')
	.option( '-m, --match <TAG>'
	       , 'specify a tag which should not be dropped from the output gherkin (by default, all annotated sentences are dropped)')
	.parse(process.argv)

const inputFile = cmd.args[0]
const stepdefsPath = cmd.stepdefsPath || './stepdefs.robot'
const outputFile = cmd.output || '-'

if (!inputFile) {
	console.error('No input file given')
	process.exit(1)
}

const readFileP = promisify(readFile)
const writeFileP = promisify(writeFile)

readFileP(inputFile, { encoding: 'utf-8' })
	.then(gherkin => annotatedGherkin(gherkin, stepdefsPath))
	.then(output => outputFile === '-' ? console.log(output) : writeFileP( outputFile
	                                                                     , output
	                                                                     , { encoding: 'utf-8' }
	                                                                     )
	     )
	.catch(error => {
		console.error(error.message);
		process.exit(1)
	})
