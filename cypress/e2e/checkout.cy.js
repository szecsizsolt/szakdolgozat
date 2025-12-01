describe("Full Checkout Flow", () => {
  // 🔐 Firebase login helper
  const login = () => {
    cy.loginWithFirebase("teszt@gmail.com", "tesztteszt");

    // 👉 Várjuk meg, amíg Firebase auth beáll a frontendben is
    cy.visit("/");
    cy.window().then((win) => {
      return new Cypress.Promise((resolve) => {
        const waitForAuth = () => {
          const user = win.firebase?.auth().currentUser;
          if (user) resolve();
          else setTimeout(waitForAuth, 200);
        };
        waitForAuth();
      });
    });
  };

  beforeEach(() => {
    login();
  });

  it("Teljes checkout folyamat – kosárba tételtől fizetésig", () => {
    // 👉 Ajánlott könyvek megjelennek
    cy.get("[data-testid='book-card']", { timeout: 10000 })
      .should("have.length.at.least", 1);

    // 👉 Kosárba helyezés (első könyv)
    cy.get("[data-testid='add-to-cart-btn']")
      .first()
      .click({ force: true });

    // 👉 Kosár ikonon a számláló nőtt
    cy.get("[data-testid='cart-count']", { timeout: 10000 })
      .should("be.visible")
      .invoke("text")
      .then((text) => {
        expect(Number(text.trim())).to.be.greaterThan(0);
      });

    // 👉 Menjünk a kosár oldalra
    cy.visit("/cart");

    // 👉 Várjuk meg, hogy a kosár be is töltődjön a backendből
    cy.get("[data-testid='cart-item']", { timeout: 10000 })
      .should("have.length.at.least", 1);

    // 👉 Fizetés gomb megnyomása
    cy.contains("button", /^Fizetés$/)
      .should("be.visible")
      .click();

    // 👉 Mock fizetési oldalra érkeztünk
    cy.url().should("include", "/payment/mock");

    // 👉 A mock fizetési oldalon "Fizetés folyamatban" vagy hasonló elem jelenik meg
    cy.contains(/fizetés/i, { timeout: 5000 }).should("be.visible");
  });
});
