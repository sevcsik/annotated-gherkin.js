const { Transform: TransformStream } = require('stream')
const Vinyl = require('vinyl')

module.exports = annotatedGherkin => options =>
	new TransformStream({
		objectMode: true,
		transform(vinyl, encoding, callback) {
			let contents, error
			try {
				contents = new Buffer(annotatedGherkin(vinyl.contents.toString('utf8'), options))
			} catch (error_) {
				error = error_
			}

			const transformedVinyl = contents && new Vinyl({ cwd: vinyl.cwd
				                                           , base: vinyl.base
				                                           , path: vinyl.path
				                                           , contents
				                                           })
			callback(error, transformedVinyl)
		}
	})
