import { AMOUNT_OF_IDENTITIES_TO_GENERATE } from 'src/constants';

export {}; // Next.js requires --isolatedModules in tsconfig to be true. Feel free to remove this if you have an import

describe('Registration page', () => {
  it('Should register appropriately', () => {
    cy.visit('/');
    expect(window.crypto).to.have.property('subtle');
    cy.findByTestId('updates-modal').should('exist').and('be.visible');
    cy.findByTestId('updates-modal-confirm').scrollIntoView().should('exist').and('be.visible').click();
    cy.findByTestId('speakeasy-logo').should('exist').and('be.visible');
    cy.findByTestId('close-notification-banner-button').should('exist').and('be.visible').click();
    
    cy.findByTestId('registration-password-input')
      .should('exist')
      .and('be.visible')
      .click()
      .focused()
      .type('password1');
    cy.findByTestId('registration-password-confirmation')
      .should('exist')
      .and('be.visible')
      .click()
      .focused()
      .type('not-matching');
    cy.findByTestId('registration-button')
      .should('exist')
      .and('be.visible')
      .click();

    cy.findByTestId('registration-error').should('exist').and('be.visible').and('contain.text', 'Password doesn\'t match')
    cy.findByTestId('registration-password-confirmation')
      .click()
      .focused()
      .clear()
      .type('password1');
    cy.findByTestId('registration-button')
      .click();

    cy.findByTestId('codename-registration-title')
      .should('exist')
      .and('be.visible');
    
    cy.wait(2000);

    let firstElementText: string;
    const firstElement = cy.findByTestId('codename-registration-options')
      .should('exist')
      .and('be.visible')
      .children()
      .should('have.length', AMOUNT_OF_IDENTITIES_TO_GENERATE)
      .first()
      .invoke('text')
      .then((val) => { firstElementText = val });

    cy.findByTestId('discover-more-button').click();

    cy.findByTestId('codename-registration-options').children().first().invoke('text').then((newVal) => expect(newVal).to.not.equal(firstElementText));
  });
});