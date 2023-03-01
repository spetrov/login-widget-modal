import "./App.css";

import "@forgerock/login-widget/widget.css";
import Widget, { modal, journey, user } from "@forgerock/login-widget/modal";
import { useEffect, useState } from "react";

function App() {
  const [userInfo, setUserInfo] = useState(null);
  const [count, setCount] = useState(0);
  // const [isAuthorized, setIsAuthorized] = useState(false);

  let url = new URL(window.location.href);
  let codeParam = url.searchParams.get("code");
  let stateParam = url.searchParams.get("state");
  let formPostEntryParam = url.searchParams.get("form_post_entry");

  let suspendedId = url.searchParams.get("suspendedId");

  console.log("suspendedId: " + suspendedId);

  useEffect(() => {
    journey.onSuccess((data) => {
      setCount(count + 1);
      setUserInfo(data.user.response);
    });
  }, [count, setCount, setUserInfo]);

  useEffect(() => {
    journey.onFailure((data) => {
      console.log("Journey failed: " + data.journey.error);
    });
  }, [setUserInfo]);

  useEffect(() => {
    new Widget({
      target: document.getElementById("widget-root"),
      props: {
        config: {
          serverConfig: {
            baseUrl:
              "https://openam-forgerrock-sdksteanant.forgeblocks.com/am/",
            timeout: 5000,
          },
          clientId: "widget-client",
          redirectUri: "https://sdkapp.example.com:8443/",
          realmPath: "alpha",
          scope: "openid profile email address phone",
          // tree: "WebAuthn",
          // tokenStore: "indexedDB",
        },
        links: {
          termsAndConditions: "terms",
          // termsAndConditionsLinkText: "Gu-gu gaa",
        },
        style: {
          checksAndRadios: "animated", // OPTIONAL; choices are 'animated' or 'standard'
          labels: "stacked", // OPTIONAL; choices are 'floating' or 'stacked'
        },
      },
    });

    modal.onMount((dialogElement, formElement) => {
      console.log("modal.onMount...: " + dialogElement);
      console.log("modal.onMount...: " + formElement);
    });

    modal.onClose(({ reason }) => {
      console.log("modal.onClose...: " + reason);
    });
  }, []);

  useEffect(() => {
    async function fetchData() {
      const authorized = await user.authorized();
      console.log(
        "user.authorized(): " + JSON.stringify(authorized, null, " ")
      );
    }
    fetchData();
  }, [userInfo, setUserInfo]);

  useEffect(() => {
    /**
     * Anything that results in a "side-effect", like calling a server
     * or interacting with something outside of React, it's important
     * to put it in this `useEffect`.
     */
    if (formPostEntryParam || (codeParam && stateParam)) {
      modal.open({ resumeUrl: window.location.href });
    }

    if (suspendedId) {
      modal.open({
        resumeUrl: window.location.href,
      });
    }

    return () => {
      if (formPostEntryParam || (codeParam && stateParam)) {
        url = null;
        codeParam = null;
        stateParam = null;
        formPostEntryParam = null;
        window.history.replaceState(null, "", "/");
      }
      if (suspendedId) {
        suspendedId = null;
        window.history.replaceState(null, "", "/");
      }
    };
  }, []); // <-- An empty array here means the above effect runs only once

  return (
    <div className="App">
      <div id="widget-root"></div>
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
                // modal.open({ journey: "SocialLogin-web" });
                // modal.open({ journey: "SocialLogin-web" });

                modal.open({ journey: "ResetPassword" });
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
