/* global describe it cy context */
//
// **** Kitchen Sink Tests ****
//
// This app was developed to demonstrate
// how to write tests in Cypress utilizing
// all of the available commands
//
// Feel free to modify this spec in your
// own application as a jumping off point

// Please read our "Introduction to Cypress"
// https://on.cypress.io/introduction-to-cypress

describe('Main Page', function () {
  it('.should() - assert that <title> is correct', function () {
    cy.visit('http://localhost:8080/#/login')
    cy.title().should('include', 'Savvy')
  })
  it('.should() - assert that h1 contains "Google Drive"', function () {
    cy.get('h1').should('contain', 'Google Drive')
  })

  context('Sidebar', function () {
    it('.should() - have 4 options', function () {
      cy.get('#navigation-sidebar').find('.option')
      .should('have.length', 4)
    })
    it('.should() - have all options as "Coming Soon"', function () {
      cy.get('#navigation-sidebar').find('.option')
      .should('contain', 'Coming Soon')
    })
  })

  context('Google Drive Button', function () {
    it('.should() - say "Google Drive"', function () {
      cy.get('button.connect').should('contain', 'Google Drive')
    })
    it('.should() - open popup when clicked', function () {
      cy.get('.connect').click()
    })
  })
})
