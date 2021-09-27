/**
 * @title: FreeCodeCamp Test Suite Hack
 * @summary: FreeCodeCamp javascript injection script that finds and display
 *               all failed test suites and display all failed tests inside the
 *               project web page.
 *
 * @author: Cornelius Brooks - cbedroid1614@gmail.com
 * @date: Sept 26, 2021
 */

/* Show FreeCode Camp  Responsive HTML Error*/

// Github Repo File Paths
const REPO_BASE_URL =
  "https://github.com/cbedroid/FreeCodeCamp-FailedTestSolver";
const REPO_GHP_URL = "https://cbedroid.github.io/FreeCodeCamp-FailedTestSolver";
const STYLESHEET = `${REPO_GHP_URL}/styles.css`;
const HTML_FILE = `${REPO_GHP_URL}/content.html`;

/* Injects css style */
(function injectStyle() {
  var link = document.createElement("link");
  link.href = STYLESHEET;
  link.type = "text/css";
  link.rel = "stylesheet";
  document.getElementsByTagName("head")[0].appendChild(link);
})();

/* Inject FreeCode Script if not loaded */
(function injectFCCScript() {
  const last_script = document.querySelectorAll("script");
  const fcc_is_loaded = document.querySelector(
    "script[src='https://cdn.freecodecamp.org/testable-projects-fcc/v1/bundle.js']"
  );
  if (fcc_is_loaded) {
    // if loaded, just run Main script
    runMain();
    return;
  }

  console.log("Loading FCC Suite Test Script");
  const fcc_script = document.createElement("script");
  fcc_script.src =
    "https://cdn.freecodecamp.org/testable-projects-fcc/v1/bundle.js";

  // Give FCC Script time to load its script, then  Run Main script
  fcc_script.on_load = setTimeout(() => runMain(), 1000);

  // Attach FCC Test Suite script before the last body script ( which should be this script)
  document
    .getElementsByTagName("body")[0]
    .insertBefore(fcc_script, last_script[last_script.length || 0]);
})();

function fetchFile(url) {
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.send(null);
  return new Promise(function (resolve, reject) {
    request.onreadystatechange = async function (resp) {
      resp = await request.responseText;
      if (request.readyState === 4 && request.status === 200) {
        resolve(resp);
      }
    };
  });
}

function runMain() {
  buildMarkup();
  let root = document.getElementById("fcc_test_suite_wrapper").shadowRoot;
  let suit_ui = root.querySelector(".fcc_test_ui");
  let fcc_run_button = suit_ui.querySelector(
    "#fcc_test_message-box-rerun-button"
  );
  let runner_container = document.getElementsByClassName("runner-container");

  (function init() {
    let test_runner_btn = document.getElementById("test_runner_btn");
    let loader = document.querySelector(".loader-wrapper");
    const freecodecamp_mod = document.getElementById("freecodecamp_mod");
    const btns = freecodecamp_mod.querySelectorAll(".btn");
    const visible_state = getStorageVisibility();

    handleButtonEvents();
    attachSelector();

    if (!visible_state) {
      freecodecamp_mod.classList.add("hidden");
      btns.forEach((btn) => btn.classList.add("active"));
      document.querySelector("#close_btn").classList.remove("active");
    }

    test_runner_btn.addEventListener("click", () => {
      // Click the FCC Test Run Button
      loader.classList.add("active");
      fcc_run_button.click();
      setTimeout(() => {
        handleFCCResults();
        loader.classList.remove("active");
      }, 1000);
    });
  })();

  /*
   * buildMarkup
   *
   *  Build main container for test results.
   */
  function buildMarkup() {
    const main_element = document.createElement("div");
    fetchFile(HTML_FILE).then((markup) => {
      main_element.id = "freecodecamp_mod";
      if (markup) {
        main_element.innerHTML = markup;
      } else {
        main_element.innerHTML = `
        <div class="error" style="text-align:center;">
          <h3 style="font-weight:bold;color:red">FCC_ERROR: HTML content was not found</h3>
          <small>If this issue persists, submit an issue <a href="${REPO_BASE_URL}/issues/">here<a/><small>  
        </div>
        `;
      }
      document.getElementsByTagName("body")[0].appendChild(main_element);
    });
  }

  function attachSelector() {
    // FCC Suite Selector
    const suite_selector = suit_ui.querySelector("#test-suite-selector");
    // Mod Suite Selector
    const mod_fcc_selector = suite_selector.cloneNode(true);
    mod_fcc_selector.classList.add("mod_selector");

    /* Send mod_fcc_selector change event to FCC Suite Selector and Vice-Versa
       incase user uses the real Suite test instead of the mod_fcc_selector
    */

    // Send FCC_Suite Selector change event to mod_fcc_selector
    suite_selector.addEventListener("change", function (e) {
      mod_fcc_selector.value = this.value;
    });
    // Send mod_fcc_selector change event to FCC Suite Selector
    mod_fcc_selector.addEventListener("change", function () {
      const event = new Event("mod_change");
      suite_selector.value = this.value;
      suite_selector.dispatchEvent(event);
    });
    runner_container[0].prepend(mod_fcc_selector);
  }
  /*
   * handleButtonEvents
   *
   * Binds event for Testmods "open" and "close" buttons
   */
  function handleButtonEvents() {
    // Bind Close and open btn events
    const freecodecamp_mod = document.getElementById("freecodecamp_mod");
    const btns = freecodecamp_mod.querySelectorAll(".btn");

    btns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        btns.forEach((e) => e.classList.add("active"));
        btn.classList.remove("active");

        if (this.id == "close_btn") {
          // add hidden class to main container
          freecodecamp_mod.classList.add("hidden");
        } else {
          freecodecamp_mod.classList.remove("hidden");
        }
        // set storage visiblily according to the button clicked
        setStorageVisibilty(this.id != "close_btn");
      });
    });
  }

  /** handleFCCResults
   *
   * Parses FreeCodeCamp Suite Test results and display result
   * to screen.
   */
  function handleFCCResults() {
    let suite_test = root.querySelectorAll(".fcc_test_ui")[1];
    const total_tests = suite_test.querySelectorAll(".test").length;
    const failed_results = suite_test.querySelectorAll(".test.fail");
    const result_list = document.getElementById("failure_list");

    // Verfiy  failed result and show current status
    if (failed_results.length > 0) {
      // Show Test Passed
      result_list.innerHTML = `
      <li style="color:red;text-align:center;font-weight: 700; margin:4px 0px;">
       ${failed_results.length} of ${total_tests} Tests Failed!
      </li>
      `;
    } else {
      // display all tests passed
      result_list.innerHTML = `
       <li style="color:green;text-align:center;font-weight:700;margin:4px 0px;">All ${total_tests} Tests Passed!</li>
       `;
    }
    // append failed results to list
    failed_results.forEach(function (result) {
      const li = document.createElement("li");
      li.classList = "result-item";
      li.innerHTML = result.querySelector("h2").innerHTML;
      result_list.appendChild(li);
    });
  }

  /* getStorageVisibility
   *
   * get FCC visible state from localStorage
   */
  function getStorageVisibility() {
    // lazy parse - convert to boolean
    return (localStorage.FCCMod_visible || "true") == "true";
  }

  /* setStorageVisibilty
   *
   * set FCC visible state from localStorage
   */
  function setStorageVisibilty(state = true) {
    localStorage.FCCMod_visible = state;
  }
}
