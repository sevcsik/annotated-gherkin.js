stream = require('./stream')

const { Parser } = require('gherkin')
const assembler = require('gherkin-assembler')
const { flow, identity } = require('lodash/fp')

const parse = content => (new Parser()).parse(content)

const filterSteps = identity

const compile = flow(assembler.objectToAST, assembler.format)

module.exports = flow(parse, filterSteps, compile)

module.exports.stream = stream(module.exports)

