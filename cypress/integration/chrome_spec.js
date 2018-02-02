/* global describe it cy */

const sidebar = true

describe('Booting up', () => {
  it('.should() - load the page', () => {
    cy.visit('http://localhost:8080/#/login')
  })
})

describe('Login Page', () => {
  it('.should() - assert that <title> is correct', () => {
    cy.title().should('include', 'Savvy')
  })
  it('.should() - assert that h3 contains "sign in"', () => {
    cy.get('h3').should('contain', 'sign in')
  })
  it('.should() - assert that button exists', () => {
    cy.get('button.login').should('contain', 'Sign In')
  })
  it('.should() - assert that button is not disabled to start with', () => {
    cy.get('button.login').should('not.have.attr', 'disabled')
  })
  it('click()', () => {
    cy.get('button.login').click()
  })
})

describe('Logged In', () => {
  describe('Header appears', () => {
    it('Logo appears', () => {
      cy.get('.header').find('img.savvy-logo')
    })
    it('Profile appears', () => {
      cy.get('.header').find('img.profile')
    })
    it('Search bar appears', () => {
      cy.get('.header').find('.search input')
    })
  })
  const query = 'purple colour'
  const correctSnippet = 'Brand colours'
  describe('Search works', () => {
    it(`types "${query}" query into search bar and presses enter`, () => {
      cy.get('.search input').type(`${query} {enter}`)
    })
    it(`Search query has something typed`, () => {
      cy.get('.search input').should('not.have.length', 0)
    })
    it('.cards is non-empty', function() {
      cy.get('.main > ul.cards .card').should('not.have.length', 0)
    })
    it('The first card has some content', function() {
      cy.get('.main > ul.cards .card').find('.content').contains('p', /\w/)
    })
    it(`Search results label appears, containing "${query}"`, () => {
      cy.get('.search-results .results-label').should('contain', query)
    })
    it(`First result should contain "${correctSnippet}"`, () => {
      cy.get('.main > ul.cards .card').find('.content').contains('p', correctSnippet)
    })
    it('It should also contain a file', () => {
      cy.get('.main > ul.cards .card').find('.file').contains('p', 'Brand Guidelines')
    })
  })
  if (sidebar) { // eslint-disable-line no-constant-condition
    describe('Hovering on cards works', () => {
      it(`Hover over first card`, () => {
        cy.get('.main > ul.cards .card').first().trigger('mouseover')
      })
      it('.popup > .cards should have one card', function() {
        cy.get('.popup > .cards > .card').should('have.length', 1)
      })
      it('The popup card has some content', function() {
        cy.get('.popup > .cards .card').find('.content').contains('p', /\w/)
      })
      it(`It should contain "${correctSnippet}"`, () => {
        cy.get('.main > ul.cards .card').find('.content').contains('p', correctSnippet)
      })
      it(`It should contain three quick reply buttons`, () => {
        cy.get('.popup > .cards > .card > footer > .buttons').children('button').should('have.length', 3)
      })
    })
  } else {
    describe('Clicking on cards works', () => {
      it(`Click on first card`, () => {
        cy.get('.main > ul.cards .card').first().click()
      })
      it('.popup > .cards should have one card', function() {
        cy.get('.popup > .cards > .card').should('have.length', 1)
      })
      it('The popup card has some content', function() {
        cy.get('.popup > .cards .card').find('.content').contains('p', /\w/)
      })
      it(`It should contain "${correctSnippet}"`, () => {
        cy.get('.main > ul.cards .card').find('.content').contains('p', correctSnippet)
      })
      it(`It should contain three quick reply buttons`, () => {
        cy.get('.popup > .cards > .card > footer > .buttons').children('button').should('have.length', 3)
      })
      it(`Clicking elsewhere closes popup`, () => {
        // For some reason trigger doesn't work, so click manually!
        cy.get('.popup').trigger('mouseup', 'top').should('not.have.class', 'active')
      })
    })
  }
  describe('Closing search works', () => {
    it(`Click on close button`, () => {
      cy.get('.search .closeSearch').click()
    })
    it(`Removes all cards`, () => {
      cy.get('.main > ul.cards .card').should('have.length', 0)
    })
    it('Removes all popup cards', function() {
      cy.get('.popup > .cards > .card').should('have.length', 0)
    })
    it(`Removes search query`, () => {
      cy.get('.search input').should('have.value.length', 0)
    })
  })
})
