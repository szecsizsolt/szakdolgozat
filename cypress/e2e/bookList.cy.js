describe("Könyvlista E2E teszt", () => {
  it("Betölti a főoldalt és megjeleníti a könyvkártyákat", () => {
    // 1. főoldal megnyitása
    cy.visit("/");

    // 2. könyvkártyák léteznek
    cy.get("[data-testid='book-card']")
      .should("exist")
      .and("have.length.at.least", 1);

    // 3. minden kártyán van könyv cím
    cy.get("[data-testid='book-title']").each(($el) => {
      expect($el.text().trim()).to.have.length.greaterThan(0);
    });
  });
});
