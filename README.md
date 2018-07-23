A Gherkin preprocessor which reads an annotated Gherkin feature file and omits steps which don't include a specific
annotation.

# Motivation

In [behaviour driven development], the functional specification of every feature is a feature file, which can be turned
into an automated test suite using [Cucumber].

According to the [test pyramid], you should cover your product with tests on multiple levels (unit tests, IT, E2E test)
to test every piece of your functionality with the most efficient testing method.

However, maintaining full test suites is expensive to maintain and specifications can diverge over time. Every
implementation of Cucumber knows the same Gherkin format, which makes it possible to drive all your test suites using
the same feature files, solving this problem.

## Annotated Gherkin

Annotated Gherkin is a small extension to the Gherkin language which allows you to specify which step is relevant to a
given testing tool. It looks like this:

```gherkin

Feature: Create a new foo
	As a user
	I want to create a new foo
	So that I can extend the list of foos

Scenario: Create a new foo
	Given I have a session authorised to create foos
	And a foo with the ID foo_1 and name Foo
	And I'm on the Create Foo screen                   | ui
	When I create the given foo
	Then the response code is 201                      | api
	And the response body is a Foo object              | api
	And the Foo Created toast message is visible       | ui
	And the given Foo is a member of the Foo List
```

From the feature file above, we can drive an API test which calls the

  1. `POST /login` endpoint to create a session
  2. `POST /foo` endpoint to create the Foo
  3. `GET /foo/all` endpoint to see if the created Foo has been added to our Foo List.

For our API tests, navigating to the foo creation screen is irrelevant - the HTTP calls will work anytime if we have the
correct session.

We can also drive an end-to-end UI test which opens the browser, and

  1. Opens the login screen and logs in
  2. Opens the Create Foo screen
  3. Submits the Create Foo form
  4. Checks if our toast message is visible
  5. Opens the Foo List screen
  4. Checks the Foo List and see if our new Foo is listed.

For our UI test, checking the HTTP response code and the type is irrelevant.

Instead of writing empty step definitions for the irrelevant steps, or trying to come up with a step text which makes
sense for both mediums, you can preprocess this feature file with `annotated-gherkin`:

```
$ annotated-gherkin -m ui create-foo.feature

Feature: Create a new foo
  As a user
  I want to create a new foo
  So that I can extend the list of foos
  Scenario: Create a new foo
    Given I have a session authorised to create foos
    Given a foo with the ID foo_1 and name Foo
    Given I'm on the Create Foo screen
    When I create the given foo
    Then the Foo Created toast message is visible
    Then the given Foo is a member of the Foo List

$ annotated-gherkin -m api create-foo.feature
Feature: Create a new foo
  As a user
  I want to create a new foo
  So that I can extend the list of foos
  Scenario: Create a new foo
    Given I have a session authorised to create foos
    Given a foo with the ID foo_1 and name Foo
    When I create the given foo
    Then the response code is 201
    Then the response body is a Foo object
    Then the given Foo is a member of the Foo List
```

Then you have two standard feature files which you can pass to Cucumber ([or even Robot Framework](https://github.com/sevcsik/gherkin2robot.js)) and run the suite without any noise from the other tests.

# Usage

## Commandline interface

```
  Usage: annotated-gherkin [options] <FILE>

  Preprocess an annotated gherkin file into a regular gherkin file by stripping
irrelevant steps. If no tags are specified with -m, then all steps which have
an annotation like " | tag" at the end of the step will be dropped from the
output gherkin file. If a tag is specified, staps with the given tag will
remain, with the annotation removed.

  Options:

    -V, --version        output the version number
    -o, --output <FILE>  write the Robot Framework version to the given file. Default is the standard output
    -m, --match <TAG>    specify comma-separated list of annotations which should not be dropped from the output gherkin (by default
, all annotated sentences are dropped)
    -h, --help           output usage information
```

## From Javascript

```typescript
annotatedGherkin: (annotatedFeatureFileContent: String, options?: Object) => String featureFileContent
```

The package exports the `annotatedGherkin` synchronous function, which takes a Gherkin file's content as string and a
configuration object. It returns the content of the decluttered feature file.

Currently there is one option:
 - `match: Array<String>` - A list of annotations which should be preserved. If empty, all annotated steps will be
 omitted.

## From Gulp

```typescript
annotatedGherkin.stream: (options?: Object) => Transform<Vinyl, Vinyl>
```

The package exports a getter NodeJS Transform stream which applies annotatedGherkin to the incoming sources (vinyls).
The getter takes the `options` object as its single parameter.

The following example runs a feature file's UI-specific steps in Robot Framework:

```js
const { stream: annotatedGherkin } = require('annotated-gherkin')
const { stream: gherkin2robot } = require('gherkin2robot')

const { exec } = require('child_process')
const gulp = require('gulp')
const log = require('fancy-log')

gulp.task('prepare-robot', () =>
	gulp.src('test/*.feature')
		.pipe(annotatedGherkin({ match: [ 'ui' ] }))
		.pipe(gherkin2robot({ stepdefsPath: '../test/stepdefs.robot' }))
		.pipe(gulp.dest('temp'))
)

gulp.task('execute-robot', [ 'prepare-robot' ], done => {
	exec('robot -N mySuite *.robot', { cwd: 'temp' }, (err, stdout, stderr) => {
		if (err) {
			log('Robot Framework result:\n' + stdout)
			done('Some tests have failed.')
		} else {
			done()
		}

		log('Test execution completed. See temp/report.html')
	})
})

gulp.task('default', [ 'execute-robot' ])
```

# Running the test suite

To run the tests, robot framework and `diff` needs to be available on `$PATH`. The test suite can be run with `npm test`.

[behaviour driven development]: https://en.wikipedia.org/wiki/Behavior-driven_development
[Cucumber]: https://cucumber.io
[test pyramid]: https://martinfowler.com/bliki/TestPyramid.html
