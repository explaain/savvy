/* global describe it cy */

describe('Booting up', function() {
  it('.should() - load the page', function () {
    cy.visit('http://localhost:8080/#/login')
  })
})

describe('Login Page', function() {
  it('.should() - assert that <title> is correct', function () {
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
  it('click()', function() {
    cy.get('button.login').click()
  })
})

describe('Logged In', function() {
  describe('Header appears', function() {
    it('Logo appears', function() {
      cy.get('.header').find('.savvy-logo')
    })
    it('Search bar appears', function() {
      cy.get('.header').find('input.search')
    })
    it('Buttons appear', function() {
      cy.get('.header').children('button').should('have.length', 2)
    })
  })
  describe('Cards load', function() {
    it('.cards is non-empty', function() {
      cy.get('ul.cards .card').should('not.have.length', 0)
    })
    it('The first card has some content', function() {
      cy.get('ul.cards .card').find('.content').contains('p', /\w/)
    })
  })
  describe('Search works', function() {
    it('types in search bar and presses enter', function() {
      cy.get('input.search').type('purple colour {enter}')
    })
    it('First result should contain "Brand Colours"', function() {
      cy.get('ul.cards .card').find('.content').contains('p', 'Brand colours')
    })
  })
})
