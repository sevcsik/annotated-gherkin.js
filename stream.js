const { Transform: TransformStream } = require('stream')
const Vinyl = require('vinyl')

module.exports = annotatedGherkin => options =>
	new TransformStream({
		objectMode: true,
		transform(vinyl, encoding, callback) {
			const path = vinyl.path.replace(/\.[^.]+$/, '.robot')

			try {
				const contents = new Buffer(annotatedGherkin(vinyl.contents.toString('utf8'), options))
				const transformedVinyl = new Vinyl({ cwd: vinyl.cwd
				                                   , base: vinyl.base
				                                   , path
				                                   , contents
				                                   })
				callback(null, transformedVinyl)
			} catch (error) {
				callback(error)
			}
		}
	})
