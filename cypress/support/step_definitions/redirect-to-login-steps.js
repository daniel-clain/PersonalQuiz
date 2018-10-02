

/* navigateToPage = function(){
    if(!this.isUserLoggedIn){
        return 'redirect the user to login page';
    }
}
 */
given('I go to the Personal Quiz app', () => {
    cy.visit('');
});

given('I am not a logged in user', () => {
    expect(localStorage.getItem('personal-quiz-login-token')).to.eq(null)
})

then('I should be redirected to the {string} page', (pageRoute) => {
    cy.location().should((loc) => {
        expect(loc.href).to.include(`/${pageRoute}`)
    })
})

/* When('The user tries to navigate', function () {
    this.resultOfUserNavigating = navigateToPage()
});

Then('The user should be redirected to the login view', function () {
    assert.equal(this.resultOfUserNavigating, 'redirect user to login page');
});
 */