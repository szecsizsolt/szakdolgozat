describe("Online Bookstore basic test", () => {
  it("megnyitja a főoldalt és ellenőrzi, hogy betölt", () => {
    cy.visit("/");

    // Oldalcím / header ellenőrzése (ha más a szöveg, állítsd át)
    cy.contains(/book|könyv/i);
  });
});
