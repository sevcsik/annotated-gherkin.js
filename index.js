stream = require('./stream')

const { Parser } = require('gherkin')
const assembler = require('gherkin-assembler')
const { flow, identity, filter, map, get, negate, extendAll, curry, __ } = require('lodash/fp')

const log = x => { console.log(x.feature.children[0].steps); return x }

const parse = content => (new Parser()).parse(content)

const matchAnnotatedStep = step => /\|.+$/.test(step.text)

const filterAnnotatedStepsFromScenario = scenario => extendAll(
	[ {}
	, scenario
	, { steps: filter(negate(matchAnnotatedStep), scenario.steps) }
	])

const filterSteps = ast => extendAll(
	[ {}
	, ast
	, { feature: extendAll([ {}
	                       , ast.feature
	                       , { children: map(filterAnnotatedStepsFromScenario, ast.feature.children) }
	                       ])
	  }
	])

const compile = flow(log, assembler.objectToAST, curry(assembler.format)(__, { compact: true }))

module.exports = flow( parse
                     , filterSteps
                     , compile
                     )

module.exports.stream = stream(module.exports)

