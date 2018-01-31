/* global describe it cy */

describe('Login Page', function() {
  it('.should() - assert that <title> is correct', function () {
    cy.visit('http://localhost:8080/#/login')
    cy.title().should('include', 'Savvy')
  })
  it('.should() - assert that h3 contains "sign in"', function () {
    cy.get('h3').should('contain', 'sign in')
  })
  it('.should() - assert that button exists', function () {
    cy.get('button.login').should('contain', 'Sign In')
  })
  it('.should() - assert that button is not disabled to start with', function () {
    cy.get('button.login').should('not.have.attr', 'disabled')
  })

  describe('Logging In', function() {
    // it('.click() - ', function() {
    //   cy.get('button.login').click()
    // })
  })
})
