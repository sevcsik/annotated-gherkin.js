Feature: Keep a single annotation
	As a developer
	I want to keep relevant steps in my gherkin files
	So that I can implement my step definitions for them the same way as unannotated steps

	Scenario: Keep unannotated steps and steps for "web"
		Given a feature file with content
		"""
		Feature: demo feature
			Scenario: demo scenario
				Given a generic step
				And an irrelevant platform-specific step            | rest
				And a relevant platform-specific step               | web
				When I perform an action
				Then I do an irrelevant platform-specific assertion | rest
				And a relevant platform-specific assertion          | web
		"""
		When I strip every annotation except "web" from the given feature file
		Then the preprocessed feature file's content equals
		"""
		Feature: demo feature
		  Scenario: demo scenario
		    Given a generic step
		    Given a relevant platform-specific step
		    When I perform an action
		    Then a relevant platform-specific assertion
		"""

	Scenario: Keep unannotated steps and steps for "web" with multiple annotations
		Given a feature file with content
		"""
		Feature: demo feature
			Scenario: demo scenario
				Given a generic step
				And an irrelevant platform-specific step            | rest
				And a relevant platform-specific step               | rest, web
				When I perform an action
				And a relevant platform-specific assertion          | web, rest
		"""
		When I strip every annotation except "web" from the given feature file
		Then the preprocessed feature file's content equals
		"""
		Feature: demo feature
		  Scenario: demo scenario
		    Given a generic step
		    Given a relevant platform-specific step
		    When I perform an action
		    Then a relevant platform-specific assertion
		"""

