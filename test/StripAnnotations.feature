Feature:
	As a developer
	I want to strip irrelevant steps from my gherkin files
	So that I don't have to write empty step definitions for the sentences I don't implement

	Scenario: Annotated steps after "And"
		Given a feature file with content
		"""
		Scenario:
			Given a generic step
			And a platform-specific step | platform
			When I do an action
			Then an assertion is met
			And a platform-specific assertion is met | platform
		"""
		When I strip every annotation from the given feature file
		Then the preprocessed feature file's content equals
		"""
		Scenario:
			Given a generic step
			When I do an action
			Then an assertion is met
		"""

	Scenario: Annotated steps after "Given" and "Then"
		Given a feature file with content
		"""
		Scenario:
			Given a platform-specific step | platform
			And a generic step
			When I do an action
			Then a platform-specific assertion is met | platform
			And an assertion is met
		"""
		When I strip every annotation from the given feature file
		Then the preprocessed feature file's content equals
		"""
		Scenario:
			Given a generic step
			When I do an action
			Then an assertion is met
		"""
