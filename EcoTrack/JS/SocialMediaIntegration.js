
export class SocialMediaIntegration {
  constructor() {
    this.initFacebookSDK();
    this.initGoogleAPI();
  }

  initFacebookSDK() {
    window.fbAsyncInit = function () {
      FB.init({
        appId: "YOUR_APP_ID",
        cookie: true,
        xfbml: true,
        version: "v12.0",
      });
      FB.AppEvents.logPageView();
    };

    (function (d, s, id) {
      let js,
        fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {
        return;
      }
      js = d.createElement(s);
      js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    })(document, "script", "facebook-jssdk");

    document
      .querySelector(".facebook-login")
      .addEventListener("click", () => this.handleFacebookLogin());
  }

  handleFacebookLogin() {
    FB.login(
      function (response) {
        if (response.authResponse) {
          console.log("Welcome! Fetching your information....");
          FB.api("/me", function (response) {
            console.log("Good to see you, " + response.name + ".");
          });
        } else {
          console.log("User cancelled login or did not fully authorize.");
        }
      },
      { scope: "public_profile,email" }
    );
  }

  initGoogleAPI() {
    window.onload = function () {
      gapi.load("auth2", function () {
        gapi.auth2.init({
          client_id: "YOUR_CLIENT_ID",
        });
      });
    };
  }

  static onSignIn(googleUser) {
    const profile = googleUser.getBasicProfile();
    console.log("ID: " + profile.getId());
    console.log("Name: " + profile.getName());
    console.log("Image URL: " + profile.getImageUrl());
    console.log("Email: " + profile.getEmail());
  }
}

