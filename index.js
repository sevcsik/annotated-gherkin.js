stream = require('./stream')

const { Parser } = require('gherkin')
const assembler = require('gherkin-assembler')
const { flow, identity, filter, map, get, negate, extendAll, curry, reduce, __, concat
      , includes } = require('lodash/fp')

const override = curry((fn, original) => extendAll([ {}, original, fn(original) ]))
const parse = content => (new Parser()).parse(content)
const matchAnnotatedStep = step => /\|.+$/.test(step.text)

const replaceAndsWithRealKeyword = override(ast => {
	const reducer = ({ newSteps, lastKeyword }, step, index) => {
		lastKeyword = includes(step.keyword, [ 'Given ', 'When ', 'Then ']) ? step.keyword : lastKeyword
		newSteps = concat(newSteps, override(step => ({ keyword: lastKeyword }), step))
		return { newSteps, lastKeyword }
	}

	const replaceSteps = flow( reduce( reducer
	                                 , { newSteps: [], lastKeyword: null }
	                                 )
	                         , get('newSteps')
	                         )

	const overrideScenarioSteps = scenario => ({ steps: replaceSteps(scenario.steps) })

	return { feature: override( feature => ({ children: map(override(overrideScenarioSteps), feature.children) })
	                          , ast.feature
	                          )
	       }
})

const filterSteps = override(ast => {
	const filterAnnotatedStepsFromScenario = scenario => extendAll(
		[ {}
		, scenario
		, { steps: filter(negate(matchAnnotatedStep), scenario.steps) }
		])

	return { feature: override( feature => ({ children: map(filterAnnotatedStepsFromScenario, feature.children) })
	                          , ast.feature
	                          )
	       }
})

const compile = flow(assembler.objectToAST, curry(assembler.format)(__, { compact: true }))

module.exports = flow( parse
                     , replaceAndsWithRealKeyword
                     , filterSteps
                     , compile
                     )

module.exports.stream = stream(module.exports)

