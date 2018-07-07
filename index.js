stream = require('./stream')

module.exports = gherkinFileContent => gherkinFileContent

module.exports.stream = stream(module.exports)

