Feature: Redirect unauthenticated user to login
    As a PO,
    I want users who are not logged in to be redirected to the login/register view,
    Because the app needs the user's personal quiz question data.

Scenario: Logged out user is redirected to login view
    Given I go to the Personal Quiz app
    And I am not a logged in user
    Then I should be redirected to the "login" page
    # Given I am a logged out user
    # When The user tries to navigate
    # Then The user should be redirected to the login view