import { AMOUNT_OF_IDENTITIES_TO_GENERATE } from 'src/constants';

export {}; // Next.js requires --isolatedModules in tsconfig to be true. Feel free to remove this if you have an import

describe('Registration page', () => {
  it('Should register appropriately', () => {
    cy.visit('/');
    expect(window.crypto).to.have.property('subtle');
    cy.findByTestId('updates-modal').should('exist').and('be.visible');
    cy.findByTestId('updates-modal-confirm').scrollIntoView().should('exist').and('be.visible').click();
    cy.findByTestId('haven-logo').should('exist').and('be.visible');
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
    
    cy.wait(3000);

    let firstElementText: string;
    cy.findByTestId('codename-registration-options')
      .should('exist')
      .and('be.visible')
      .children()
      .should('have.length', AMOUNT_OF_IDENTITIES_TO_GENERATE)
      .first()
      .invoke('text')
      .then((val) => { firstElementText = val });

    cy.findByTestId('discover-more-button').click();

    cy.findByTestId('codename-registration-options').children().first().invoke('text').then((newVal) => expect(newVal).to.not.equal(firstElementText));
    cy.findByTestId('codename-registration-options').children().first().click();
    cy.findByTestId('claim-codename-button').should('exist').and('be.visible').click();
    cy.window().its('performance').invoke('mark', 'registration');
    cy.findByTestId('left-side-bar', { timeout: 240000 }).should('exist').and('be.visible');
    cy.window().its('performance').invoke('measure', 'registration').its('duration').then((duration) => cy.log(`Registration took ${Math.floor(duration / 1000)} seconds`));

    cy.findByTestId('account-sync-modal', { timeout: 5000 }).should('exist').and('be.visible');
    cy.findByTestId('account-sync-buttons').should('exist').and('be.visible');
    cy.findByTestId('account-sync-local-only-button').should('exist').and('be.visible').click();
    cy.findByTestId('right-side-bar').should('exist').and('be.visible');
    cy.findByTestId('create-channel-dropdown-button').should('exist').and('be.visible').click();
    cy.findByTestId('create-channel-button').should('exist').and('be.visible').click();
    cy.findByTestId('create-channel-modal').should('exist').and('be.visible');
    cy.findByTestId('channel-name-input').should('exist').and('be.visible').click().focused().type('NewChannel');
    cy.findByTestId('channel-description-input').should('exist').and('be.visible').click().focused().type('Channel description here');
    cy.findByTestId('channel-dm-toggle').should('exist');
    cy.findByTestId('channel-privacy-private-option').should('exist');
    cy.findByTestId('channel-privacy-public-option').should('exist').click();
    cy.findByTestId('create-new-channel-button').should('exist').and('be.visible').click();
    cy.findByTestId('channel-header').should('exist').and('be.visible');
    cy.findByTestId('channel-privacy-level-badge').should('exist').and('be.visible').should('contain.text', 'Public');
    cy.findByTestId('channel-admin-badge').should('exist').and('be.visible').should('contain.text', 'Admin');
    cy.findByTestId('channel-name').should('exist').and('be.visible').should('contain.text', 'NewChannel');
    cy.get('.ql-editor').type('{selectall}Test message');
    cy.findByTestId('textarea-send-button').should('exist').and('be.visible').click();
    cy.findByTestId('messages-container').should('exist').and('be.visible').findAllByTestId('message-container').should('have.length', 1);
  });
});