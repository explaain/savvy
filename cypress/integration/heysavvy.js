/* global describe it cy */

describe('Booting up', () => {
  it('.should() - load the page', () => {
    cy.visit('https://heysavvy.com')
  })
})

const id = Math.floor(Math.random() * 100000)

describe('Home Page', () => {
  it('Click Request Early Access', () => {
    cy.get('.container-13 > .button-small').click()
  })
})
describe('Three Steps', () => {
  it('Type Domain and press enter', () => {
    cy.get('#domain').type('cypress_testing_' + id + '{enter}')
  })
  it('Type Slack Name and press enter', () => {
    cy.get('#slack').type('cypress_testing_' + id + '{enter}')
  })
  it('Type Work Email and press enter', () => {
    cy.get('#email').type('testing@cypress' + id + '.com{enter}')
  })
})
