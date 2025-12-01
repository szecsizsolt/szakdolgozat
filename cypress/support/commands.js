Cypress.Commands.add("loginWithFirebase", (email, password) => {
  cy.request({
    method: "POST",
    url: "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyA0ltAS6Y-33u5bgyOUcRPG0n28QkjeG-w",
    body: {
      email,
      password,
      returnSecureToken: true
    }
  }).then(({ body }) => {
    const { idToken, refreshToken, localId, expiresIn } = body;
    const expirationTime = Date.now() + Number(expiresIn) * 1000;

    const authUser = {
      uid: localId,
      email: email,
      emailVerified: false,
      displayName: null,
      isAnonymous: false,
      providerData: [],
      stsTokenManager: {
        accessToken: idToken,
        refreshToken,
        expirationTime
      },
      apiKey: "AIzaSyA0ltAS6Y-33u5bgyOUcRPG0n28QkjeG-w",
      appName: "[DEFAULT]"
    };

    // 🔥 LÉNYEG: ide kell rakni, nem window.localStorage-be!
    cy.window().then((win) => {
      win.localStorage.setItem(
        "firebase:authUser:AIzaSyA0ltAS6Y-33u5bgyOUcRPG0n28QkjeG-w:[DEFAULT]",
        JSON.stringify(authUser)
      );
    });
  });
});
