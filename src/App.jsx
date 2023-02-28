import "./App.css";

import "@forgerock/login-widget/widget.css";
import Widget, { modal, journey, user } from "@forgerock/login-widget/modal";
// import { redirect } from "react-router-dom";
import { useEffect, useState } from "react";

new Widget({
  target: document.getElementById("widget-root"),
  props: {
    config: {
      serverConfig: {
        baseUrl: "https://openam-forgerrock-sdksteanant.forgeblocks.com/am/",
        timeout: 5000,
      },
      clientId: "widget-client",
      redirectUri: "https://sdkapp.example.com:8443/",
      realmPath: "alpha",
      scope: "openid profile email address phone",
      tree: "WebAuthn",
      // tokenStore: "indexedDB",
    },
    links: {
      termsAndConditions: "terms",
      // termsAndConditionsLinkText: "Gu-gu gaa",
    },
    style: {
      checksAndRadios: "standard", // OPTIONAL; choices are 'animated' or 'standard'
      labels: "floating", // OPTIONAL; choices are 'floating' or 'stacked'
    },
  },
});

function App() {
  const [userInfo, setUserInfo] = useState(null);

  const url = new URL(window.location.href);
  const codeParam = url.searchParams.get("code");
  const stateParam = url.searchParams.get("state");
  const formPostEntryParam = url.searchParams.get("form_post_entry");

  journey.onSuccess((data) => {
    setUserInfo(data.user.response);
  });

  journey.onFailure((data) => {
    console.log("Journey failed: " + data);
  });

  useEffect(() => {
    /**
     * Anything that results in a "side-effect", like calling a server
     * or interacting with something outside of React, it's important
     * to put it in this `useEffect`.
     */
    if (formPostEntryParam || (codeParam && stateParam)) {
      modal.open({ resumeUrl: window.location.href });
    }
  }, []); // <-- An empty array here means the above effect runs only once

  return (
    <div className="App">
      <header className="App-main">
        <h4>ForgeRock Login Widget :: Modal Demo</h4>
        <hr />
        <div className="card">
          {userInfo ? (
            <>
              <pre>{JSON.stringify(userInfo, null, " ")}</pre>
              <button
                onClick={() => {
                  user.logout();
                  setUserInfo(null);
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                modal.open({ journey: "SocialLogin-web" });
              }}
            >
              Login
            </button>
          )}
        </div>
        <hr />
      </header>
    </div>
  );
}

export default App;
