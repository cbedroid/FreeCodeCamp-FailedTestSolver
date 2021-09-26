/**
 * @title: FreeCodeCamp SuiteMod
 * @summary: FreeCodeCamp javascript injection script that finds and display
 *               all failed test suites and display all failed tests inside the
 *               project web page.
 *
 * @author: Cornelius Brooks - cbedroid1614@gmail.com
 *
 * @date: Sept 26, 2021
 */

// inject FreeCode Script if not loaded
(function injectFCCScript() {
  const last_script = document.querySelectorAll("script");
  const fcc_is_loaded = document.querySelector(
    "script[src='https://cdn.freecodecamp.org/testable-projects-fcc/v1/bundle.js']"
  );
  console.log({ fcc_is_loaded });
  if (!fcc_is_loaded) {
    console.log("Loading FCC Suite Test Script");
    const fcc_script = document.createElement("script");
    fcc_script.src =
      "https://cdn.freecodecamp.org/testable-projects-fcc/v1/bundle.js";
    document
      .getElementsByTagName("body")[0]
      .insertBefore(fcc_script, last_script[last_script.length || 0]);
  }
})();

// inject css style
var style = document.createElement("style");
style.type = "text/css";
style.innerHTML = `
  #freecodecamp_result{ 
      position: fixed;
      top: 2px;
      right: 5px;
      z-index: 50000;
      width: 300px;
      height: 280px;
      paddiing: 10px;
      margin: 10px;
      color: #000;
      background: #d0d0d5;
      box-shadow: 2px 2px 8px rgba(0,0,0,.4);
      border: 1px solid rgba(0,0,0,.4);
      border-radius: 8px;
      transition: .3s ease-in-out;
      overflow: auto;
   }
    #freecodecamp_result.hidden{
      dispay: grid;
      place-items: center;
      width: 32px;
      height: 32px;
      font-size: 1.15em;
      background: transparent;
      border-radius: 2px;      
      overflow: hidden;
    } 

   #freecodecamp_result.hidden *:not(.content-wrapper,.btn-wrapper, .btn){
    display: none;
  } 

  #freecodecamp_result #content-wrapper{ 
    position: relative;
  }

  #freecodecamp_result .btn-wrapper{ 
    position: absolute;
    top: 2px;
    left: 2px;
  }
  #freecodecamp_result.hidden .btn-wrapper{ 
    position: absolute;
    top: -2px;
    left:0;
    display: block;
    height: 100%;
    margin: auto;
  }

  #freecodecamp_result .btn{
      display: none;
      opacity: 1;
      width: fit-content;
      max-height: 20px;
      padding: 3px;
      font-size: 1.25em;
      font-weight: 700;
      color: #fff;
      background: transparent;
      border: none;
      outline: none;
      text-shadow: 2px 2px 2px rgba(0,0,0,.5);
      transition: .2s ease-in-out;
  }
  #freecodecamp_result .btn.active{
    display: block;
  }
  #freecodecamp_result #close_btn::before {
      content: '\\2613';
  }

  #freecodecamp_result .btn-wrapper #open_btn::before{
    content: '\\2630';
  }
 
  #freecodecamp_result .title{ 
    font-weight: 700;
    text-align: center;
    padding: 5px;
    color: #fff;
    background: #0a0a23;
    border-bottom: 2px solid #000;
  }
  #freecodecamp_result #test_runner{
    font-weight: 700;
    margin-left: 3px;
    color: #fff;
    background:#0a0a3a;
    border-radius: 4px;
    box-shadow: 2px 2px 8px rgba(0,0,0,.4);
  } 
  #freecodecamp_result #test_runner:hover{
    background:#0a3a82;
  }
  #freecodecamp_result #failure_list{
   display: block;
   min-height: 145px;
   height: 100%;
   padding: 5px 0px 4px;
  }
  #freecodecamp_result .result-item{
    list-style: none;
    color: #000;
    font-weight: 500;
    line-height: 1em;
    padding: 12px 8px;
    border-bottom: 1px solid #000;
  }
  #freecodecamp_result .result-item:nth-child(even){
    background: #fff;
  }
  #freecodecamp_result #suite_footer{
    width:100%;
    text-align:center;
    background: #e9eabc;
    padding: 4px;
   }
   
  #freecodecamp_result #suite_footer small {
    color:333;
    font-size: .75em;
    font-weight:400;
    margin: 2px 6px;
    padding: 6px;
  }
  #freecodecamp_result #suite_footer small a{
    transition: .2s ease-in;
    font-weight: 700;
    color: #0a0a23;
  }
  #freecodecamp_result #suite_footer small a:hover{
    color: #00f;
  }

#freecodecamp_result .loader-wrapper {
  display: none;
}
#freecodecamp_result .loader-wrapper.active {

    position: absolute;
    top: 0;
    left: 0;
    display: grid;
    place-items:center;
    width: 100%;
    height: 100%;
}
#freecodecamp_result .loader {
  border: 8px solid #f3f3f3; /* Light grey */
  border-top: 8px solid #3498db; /* Blue */
  border-radius: 50%;
  display: block;
  width: 100px;
  height: 100px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
  `;
document.getElementsByTagName("head")[0].appendChild(style);

// Main
let root = document.getElementById("fcc_test_suite_wrapper").shadowRoot;
let suit_ui = root.querySelector(".fcc_test_ui");

let fcc_run_button = suit_ui.querySelector(
  "#fcc_test_message-box-rerun-button"
);
(function init() {
  createResultElement();
  let test_runner_btn = document.getElementById("test_runner");
  let loader = document.querySelector(".loader-wrapper");

  test_runner_btn.addEventListener("click", () => {
    // Click the FCC Test Run Button
    loader.classList.add("active");
    fcc_run_button.click();
    setTimeout(() => {
      showFailedTests();
      loader.classList.remove("active");
    }, 1000);
  });
})();

function createResultElement() {
  const markup = `
     <div class="content-wrapper">
       <div class="loader-wrapper">
        <div class="loader"></div>
       </div>
      <div class="btn-wrapper">
       <button id="close_btn" class="btn active" type="button"></button>
       <button id="open_btn" class="btn"></button>
      </div>
      <h2 class="title">
      <img src="https://cdn.rawgit.com/Deftwun/e3756a8b518cbb354425/raw/6584db8babd6cbc4ecb35ed36f0d184a506b979e/free-code-camp-logo.svg" width="25" height="25" style="background:#fff;">
      FCC Test Mod
      </h2>
      <button id="test_runner">Run Test</button>
      <ul id="failure_list" class="result-list">     
      </ul>
     </div>

     <div id="suite_footer">
      <small>created by: 
       <a href="https://github.com/cbedroid/" target="_blank">cbedroid</a>
      </small>
      <small>
       <a href="https://github.com/cbedroid/freecodecamp_suite_mod/" target="_blank">
        <svg height="20" aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="20" data-view-component="true" class="octicon octicon-mark-github v-align-middle">
         <path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
        </svg>
        Github Repo
       </a>
      </small>
    </div>
   `;
  const result_element = document.createElement("div");
  result_element.id = "freecodecamp_result";
  result_element.innerHTML = markup;
  document.getElementsByTagName("body")[0].appendChild(result_element);

  // Bind Close and open btn events
  const freecodecamp_result = document.getElementById("freecodecamp_result");
  const btns = freecodecamp_result.querySelectorAll(".btn");
  btns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      btns.forEach((e) => e.classList.add("active"));
      btn.classList.remove("active");

      if (this.id == "close_btn") {
        // add hidden class to main container
        freecodecamp_result.classList.add("hidden");
      } else {
        freecodecamp_result.classList.remove("hidden");
      }
    });
  });
}

function showFailedTests() {
  let suit_test = root.querySelectorAll(".fcc_test_ui")[1];
  const total_tests = suit_test.querySelectorAll(".test").length;
  const failed_results = suit_test.querySelectorAll(".test.fail");
  const result_list = document.getElementById("failure_list");

  // Verfiy  failed result and show current status
  console.log({ failed_results });
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
