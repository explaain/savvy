/* global describe it cy */

// Currently using { "chromeWebSecurity": false } in cypress.json
const randomWords = require('random-words')
const randomCap = () => {
  const word = randomWords()
  return word[0].toUpperCase() + word.substring(1, word.length)
}

// import Controller from '../../src/controller'
const sidebar = false
const sections = {
  reading: true,
  writing: true
}

describe('Booting up', () => {
  it('.should() - load the page', () => {
    cy.viewport(800, 800)
    cy.visit('http://localhost:8080/#/login')
  })
})

describe('Logging In', () => {
  describe('Login Page', () => {
    it('.should() - assert that <title> is correct', () => {
      cy.title().should('include', 'Savvy')
    })
    it('.should() - assert that h3 contains "sign in"', () => {
      cy.get('h3').should(`contain`, 'sign in')
    })
    it('.should() - assert that button exists', () => {
      cy.get('button.login').should(`contain`, 'Sign In')
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
        cy.get('.header', { timeout: 20000 }).find('img.savvy-logo')
      })
      it('Profile appears', () => {
        cy.get('.header').find('img.profile')
      })
      it('Search bar appears', () => {
        cy.get('.header').find('.search input')
      })
    })
  })
})

if (sections.reading) {
  describe('Reading', () => {
    const query = 'purple colour'
    const correctSnippet = 'Brand colours'
    const highlightedPhrase = 'Purple'
    describe('Search works', () => {
      it(`types "${query}" query into search bar and presses enter`, () => {
        cy.get('.search input').type(`${query} {enter}`)
      })
      it(`Search query has something typed`, () => {
        cy.get('.search input').should('not.have.length', 0)
      })
      it('.cards is non-empty', function() {
        cy.get('.main-explorer > ul.cards .card', { timeout: 10000 }).should('not.have.length', 0)
      })
      it('The first card has some content', function() {
        cy.get('.main-explorer > ul.cards .card').find('.content').contains('p', /\w/)
      })
      it('The first card has an "Updated"', function() {
        cy.get('.main-explorer > ul.cards .card').find('.modified').contains('p', /Updated: \w/)
      })
      it(`Search results label appears, containing "${query}"`, () => {
        cy.get('.search-results .results-label').should(`contain`, query)
      })
      it(`First result should contain "${correctSnippet}"`, () => {
        cy.get('.main-explorer > ul.cards .card').find('.content').contains('p', correctSnippet)
      })
      it(`First result should contain the highlighted word "${highlightedPhrase}"`, () => {
        cy.get('.main-explorer > ul.cards .card').find('.content').contains('p strong', highlightedPhrase)
      })
      it('It should also contain a file', () => {
        cy.get('.main-explorer > ul.cards .card').find('.file').contains('p', 'Brand Guidelines')
      })
    })
    describe('Popup works', () => {
      if (sidebar) {
        it(`Hover over first card`, () => {
          cy.get('.main-explorer > ul.cards .card').first().trigger('mouseover')
        })
      } else {
        it(`Click on first card`, () => {
          cy.get('.main-explorer > ul.cards .card').first().click('top')
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
      it('It should also contain a file', () => {
        cy.get('.popup > ul.cards .card').find('.file').contains('p', 'Brand Guidelines')
      })
      it(`It should contain the positive feedback button`, () => {
        cy.get('.popup > .cards > .card > footer > .buttons').children('button').should('have.length', 1)
      })
      if (!sidebar) {
        it(`Clicking elsewhere closes popup`, () => {
          cy.get('.popup').click('top').should('not.have.class', 'active')
        })
      }
      it('The main card should still contain a file', () => {
        cy.get('.main-explorer > ul.cards .card').find('.file').contains('p', 'Brand Guidelines')
      })
    })
    describe('Closing search works', () => {
      it(`Click on close button`, () => {
        cy.get('.search .closeSearch').click()
      })
      it(`Removes all cards`, () => {
        cy.get('.main-explorer > ul.cards .card').should('have.length', 0)
      })
      it('Removes all popup cards', function() {
        cy.get('.popup > .cards > .card').should('have.length', 0)
      })
      it(`Removes search query`, () => {
        cy.get('.search input').should('have.value.length', 0)
      })
    })
    // describe(`Force User to be Admin`, () => {
    //   it(`Make user admin`, () => {
    //     cy.get('body').type('{alt}', {release: false}).get(`.chrome-header img.profile`).click().should('have.class', 'admin')
    //   })
    // })
  })
}

if (sections.writing) {
  describe(`Writing`, () => {
    const newCardTitle = `Cypress Test Title: ` + randomCap() + randomCap()
    const newCardDescription = `Cypress Test Description: ` + randomCap() + randomCap()
    const additionalInfo = `, now here is some more info: ` + randomCap() + randomCap()
    describe(`Create new card`, () => {
      it(`Start with blank card`, () => {
        cy.get(`.main-explorer .create-button`).click()
          .get(`.basic`).click()
        cy.get(`.popup > .cards > .card`).should(`have.length`, 1).should(`have.class`, `editing`)
      })
      it(`Enter Title and Description`, () => {
        cy.get(`.popup > .cards > .card .title`).type(newCardTitle)
        cy.get(`.popup > .cards > .card .description`).type(newCardDescription)
      })
      it(`Save Card`, () => {
        cy.get(`.popup > .cards > .card .save-buttons > .save`).click()
        cy.get(`.popup > .cards > .card`).find(`.spinner`)
        cy.get(`.popup > .cards > .card`).should(`not.have.class`, `editing`)
        cy.get(`.popup > .cards > .card .title`).should(`contain`, newCardTitle)
        cy.get(`.popup > .cards > .card .description`).should(`contain`, newCardDescription)
      })
      if (!sidebar) {
        it(`Close popup`, () => {
          cy.get(`.popup`).click(`top`).should(`not.have.class`, `active`)
        })
      }
    })
    // describe(`Force User to be Member`, () => {
    //   it(`Make user member`, () => {
    //     cy.get('body').type('{shift}', {release: false}).get(`.chrome-header img.profile`).click().should('have.class', 'member')
    //   })
    // })
    describe(`Find new card`, () => {
      it(`Type "${newCardTitle}" and press enter`, () => {
        cy.wait(4000)
        cy.get('.search input').type(`${newCardTitle} {enter}`)
      })
      it(`First card should be it`, () => {
        cy.get('.main-explorer > ul.cards .card .title').should(`contain`, newCardTitle).click({ position: 'topLeft' })
      })
    })
    describe(`Add Marketing topic to card`, () => {
      it(`Lets user edit card`, () => {
        cy.get(`.popup > .cards > .card .edit-buttons > .edit`).should(`be.hidden`).invoke(`show`).should('be.visible').click().invoke(`hide`)
      })
      it(`Lets user add a topic`, () => {
        cy.window().then((win) => {
          cy.stub(win, 'prompt').returns('marketing')
        })
        cy.get(`.popup > .cards > .card`).find(`.topics span.add`).click()
      })
      it(`Saves edit`, () => {
        cy.get(`.popup > .cards > .card`).find(`button.save`).click()
        cy.get(`.popup > .cards > .card`).find(`.spinner`)
        cy.get(`.popup > .cards > .card`).should(`not.have.class`, `editing`)
          .find(`.title`).should(`not.have.class`, `editable`)
          .should(`contain`, newCardTitle)
          .should(`not.have.class`, `pending`)
      })
    })
    describe(`Set card pending delete, then cancel`, () => {
      it(`Allows deletion`, () => {
        cy.wait(4000)
        cy.get(`.popup > .cards > .card .edit-buttons > .delete`).should(`be.hidden`).invoke(`show`).should('be.visible').click().invoke(`hide`)
        cy.get(`.popup > .cards > .card`).find(`.spinner`)
      })
      it(`Shows pending delete`, () => {
        cy.get(`.popup > .cards > .card`).find(`.message-block.warning`).should(`contain`, `pending deletion`)
          .find(`button`).should(`have.length`, 1).should(`contain`, `Cancel`)
      })
    })
    describe(`Update card with pending information`, () => {
      it(`Lets user edit`, () => {
        cy.get(`.popup > .cards > .card .edit-buttons > .edit`).should(`be.hidden`).invoke(`show`).should('be.visible').click().invoke(`hide`)
        cy.get(`.popup > .cards > .card`).should(`have.class`, `editing`)
          .find(`.title.editable`).type(additionalInfo)
      })
      it(`Saves edit`, () => {
        cy.get(`.popup > .cards > .card`).find(`button.save`).click()
        cy.get(`.popup > .cards > .card`).find(`.spinner`)
        cy.get(`.popup > .cards > .card`).should(`not.have.class`, `editing`)
          .find(`.title`).should(`not.have.class`, `editable`)
          .should(`contain`, newCardTitle + additionalInfo)
          .should(`have.class`, `pending`)
      })
    })
    describe(`Cancel pending delete`, () => {
      it(`Removes pending delete`, () => {
        cy.wait(4000)
        cy.get(`.popup > .cards > .card .message-block.warning button`).click()
        cy.get(`.popup > .cards > .card`).find(`.spinner`)
        cy.get(`.popup > .cards > .card .message-block.warning`).should(`have.length`, 0)
      })
    })
    describe(`Force User to be Admin`, () => {
      if (!sidebar) {
        it(`Close popup`, () => {
          cy.get(`.popup`).click(`top`).should(`not.have.class`, `active`)
        })
      }
      it(`User becomes admin`, () => {
        cy.get(`body`).type(`{alt}`, {release: false}).get(`.chrome-header img.profile`).click().should(`have.class`, `admin`)
      })
    })
    describe(`Verify pending changes`, () => {
      // it(`Open card`, () => {
        // cy.get(`.main-explorer > ul.cards .card .title`).should(`contain`, newCardTitle).click({ position: `topLeft` })
      // })
      it(`Approve changes`, () => {
        cy.get(`.main-explorer > ul.cards .card:nth-child(1)`).find(`.title`).should(`contain`, newCardTitle)
        cy.get(`.main-explorer > ul.cards .card:nth-child(1)`).find(`.buttons.verify > button.approve`).should(`be.visible`).click()
        cy.get(`.main-explorer > ul.cards .card:nth-child(1)`).find(`.spinner`)
      })
      it(`Card should be updated`, () => {
        cy.get(`.main-explorer > ul.cards .card:nth-child(1)`).find(`.title`).should(`contain`, newCardTitle + additionalInfo)
          .should(`not.have.class`, `pending`)
      })
    })
    describe(`Delete card for real`, () => {
      it(`Open card`, () => {
        cy.get('.main-explorer > ul.cards .card .title').should(`contain`, newCardTitle).click({ position: `topLeft` })
      })
      it(`Delete card`, () => {
        cy.get(`.popup > .cards > .card .edit-buttons > .delete`).should(`be.hidden`).invoke(`show`).should(`be.visible`).click().invoke(`hide`)
        cy.get(`.popup > .cards > .card`).find(`.spinner`)
      })
      it(`Card should be removed`, () => {
        cy.get(`.popup > .cards > .card`).should(`have.length`, 0)
      })
    })
  })
}
