describe("Kosár teszt", () => {
  beforeEach(() => {
    cy.loginWithFirebase("teszt@gmail.com", "tesztteszt").then(() => {
      cy.visit("/");
      cy.reload(); // 🔥 ez kelti életre a Firebase usert
    });
  });

  it("Kosárba helyez egy könyvet és megjelenik", () => {

    cy.get("[data-testid='book-card']", { timeout: 10000 })
      .should("have.length.at.least", 1);

    cy.get("[data-testid='add-to-cart-btn']").first().click();

    cy.on("window:alert", (txt) => {
      expect(txt).to.contain("Kosárba helyezve");
    });

    // Kötelező várni, hogy Navbar újraszámoljon
    cy.get("[data-testid='cart-count']", { timeout: 10000 })
      .should("be.visible")
      .invoke("text")
      .should((txt) => {
        expect(parseInt(txt)).to.be.greaterThan(0);
      });
  });
});
