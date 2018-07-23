Feature: Keep multiple annotations
	As a developer
	I want to keep relevant steps marked by multiple annotations in my gherkin files
	So that I can implement my step definitions for them the same way as unannotated steps

	Scenario: Keep unannotated steps and steps for web or rest
		Given a feature file with content
		"""
		Feature: demo feature
			Scenario: demo scenario
				Given a generic step
				And a relevant platform-specific step               | rest
				And another relevant platform-specific step         | web
				And an irrelevant step                              | other
				When I perform an action
				Then I do an irrelevant platform-specific assertion | other
				And a relevant platform-specific assertion          | web
		"""
		When I strip every annotation except web or rest from the given feature file
		Then the preprocessed feature file's content equals
		"""
		Feature: demo feature
		  Scenario: demo scenario
		    Given a generic step
		    Given a relevant platform-specific step
		    Given another relevant platform-specific step
		    When I perform an action
		    Then a relevant platform-specific assertion
		"""

	Scenario: Keep unannotated steps and steps for web or rest with multiple annotations
		Given a feature file with content
		"""
		Feature: demo feature
			Scenario: demo scenario
				Given a generic step
				And a relevant platform-specific step               | rest
				And another relevant platform-specific step         | other, web
				And an irrelevant step                              | other
				When I perform an action
				Then a relevant platform-specific assertion         | web, rest
		"""
		When I strip every annotation except web or rest from the given feature file
		Then the preprocessed feature file's content equals
		"""
		Feature: demo feature
		  Scenario: demo scenario
		    Given a generic step
		    Given a relevant platform-specific step
		    Given another relevant platform-specific step
		    When I perform an action
		    Then a relevant platform-specific assertion
		"""

