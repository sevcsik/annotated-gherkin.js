stream = require('./stream')

const { Parser } = require('gherkin')
const assembler = require('gherkin-assembler')
const { flow, identity, filter, map, get, negate, extendAll, curry, reduce, __, concat
      , includes, trim, isEmpty, isArray, isNil, split, tail, cond, T, intersection, castArray
      , stubArray } = require('lodash/fp')

const override = curry((fn, original) => extendAll([ {}, original, fn(original) ]))
const parse = content => (new Parser()).parse(content)

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

const filterSteps = annotationsToKeep => override(ast => {
	const keepMe = Symbol()

	const extractAnnotations = flow( step => /\|(.+)$/.exec(step.text)
	                               , get(1)
	                               , cond([ [ isNil, stubArray  ]
	                                      , [ T    , split(',') ]
	                                      ])
	                               , map(trim)
	                               , cond([ [ isEmpty, () => [ keepMe ] ]
	                                      , [ T      , identity         ]
	                                      ])
	                               )

	const filterAnnotatedStepsFromScenario = override(scenario =>
		({ steps: filter( flow( extractAnnotations
		                      , intersection(annotationsToKeep)
		                      , negate(isEmpty)
		                      )
		                , scenario.steps)
		}))

	annotationsToKeep = flow( cond([ [ isArray, identity  ]
	                               , [ isNil  , stubArray ]
	                               , [ T      , castArray ]
	                               ])
	                        , concat(keepMe)
	                        )(annotationsToKeep)

	return { feature: override( feature => ({ children: map(filterAnnotatedStepsFromScenario, feature.children) })
	                          , ast.feature
	                          )
	       }
})

const compile = flow(assembler.objectToAST, curry(assembler.format)(__, { compact: true }))

module.exports = (gherkinFileContent, options) => flow( parse
                                                      , replaceAndsWithRealKeyword
                                                      , filterSteps('platform')
                                                      , compile
                                                      )(gherkinFileContent)

module.exports.stream = stream(module.exports)

