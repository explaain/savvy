/* global describe it cy */

import Controller from '../../src/controller'
const sidebar = false

describe('Booting up', () => {
  it('.should() - load the page', () => {
    cy.viewport(800, 800)
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
    // const myController = new Controller({
    //   firebaseInstance: {
    //     apps: [
    //       {
    //         a: true
    //       }
    //     ],
    //     auth: () => {
    //       return {
    //         getRedirectResult: () => new Promise((resolve, reject) => { resolve() }),
    //         onAuthStateChanged: myFunc => {},
    //       }
    //     }
    //   }
    // })
    // cy.stub(myController, 'signIn').resolve({
    //   auth: {
    //     apiKey: 'AIzaSyDbf9kOP-Mb5qroUdCkup00DFya0OP5Dls',
    //     appName: '[DEFAULT]',
    //     authDomain: 'savvy-96d8b.firebaseapp.com',
    //     displayName: 'Jeremy Evans',
    //     email: 'jeremy@explaain.com',
    //     emailVerified: true,
    //     isAnonymous: false,
    //     phoneNumber: null,
    //     photoURL: 'https://lh4.googleusercontent.com/-1K9EhRUQf8c/AAAAAAAAAAI/AAAAAAAAAC0/1fqqBt0FcFw/photo.jpg',
    //     providerData: Array(1),
    //     redirectEventId: null,
    //     stsTokenManager: Object,
    //     uid: 'vZweCaZEWlZPx0gpQn2b1B7DFAZ2',
    //   },
    //   data: {
    //     algoliaApiKey: '88bd0a77faff65d4ace510fbf172a4e1',
    //     email: 'jeremy@heysavvy.com',
    //     firebase: 'vZweCaZEWlZPx0gpQn2b1B7DFAZ2',
    //     first: 'Jeremy',
    //     last: 'Evans',
    //     notify: {
    //       routes: [
    //         {
    //           enabled: 'true',
    //           subscription: 'U04NVHJFD',
    //           type: 'slack',
    //         }
    //       ]
    //     },
    //     objectID: 'vZweCaZEWlZPx0gpQn2b1B7DFAZ2',
    //     organisationID: 'explaain',
    //     slack: 'U04NVHJFD',
    //   },
    //   lastRefreshed: '2018-02-24T13:14:41.234Z',
    //   organisation: {id: 'explaain'},
    //   uid: 'vZweCaZEWlZPx0gpQn2b1B7DFAZ2',
    // })
    // cy.stub(myController, 'getAccessToken').resolve('MY_TOKEN')
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
    it('The first card has an Updated', function() {
      cy.get('.main > ul.cards .card').find('.modified').contains('p', /Updated: \w/)
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
  describe('Popup works', () => {
    if (sidebar) {
      it(`Hover over first card`, () => {
        cy.get('.main > ul.cards .card').first().trigger('mouseover')
      })
    } else {
      it(`Click on first card`, () => {
        cy.get('.main > ul.cards .card').first().click('top')
      })
    }
    it('.popup > .cards should have one card', function() {
      cy.get('.popup > .cards > .card').should('have.length', 1)
    })
    it('The popup card has some content', function() {
      cy.get('.popup > .cards .card').find('.content').contains('p', /\w/)
    })
    it(`It should contain "${correctSnippet}"`, () => {
      cy.get('.popup > ul.cards .card').find('.content').contains('p', correctSnippet)
    })
    it(`It should contain the positive feedback button`, () => {
      cy.get('.popup > .cards > .card > footer > .buttons').children('button').should('have.length', 1)
    })
    if (!sidebar) {
      it(`Clicking elsewhere closes popup`, () => {
        cy.get('.popup').click('top').should('not.have.class', 'active')
      })
    }
  })
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
