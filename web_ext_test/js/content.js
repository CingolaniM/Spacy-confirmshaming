const endpoint = "http:/127.0.0.1:5000/";

function scrape() {
  // website has already been analyzed
  /*
  if (document.getElementById("insite_count")) {
    return;
  }
  */

  // aggregate all DOM elements on the page
  let elements = segments(document.body);
  let filtered_elements = [];

  for (let i = 0; i < elements.length; i++) {
    if (elements[i].innerText === undefined) {
      continue;
    }
    let text = elements[i].innerText.trim().replace(/\t/g, " ");
    if (text.length == 0) {
      continue;
    }
    filtered_elements.push(text);
  }
//     // contador
//     let g = document.createElement("div");
//     g.id = "insite_count";
//     g.value = false;
//     g.style.opacity = 0;
//     g.style.position = "fixed";
//     document.body.appendChild(g);
//     // lista
//     let list = document.createElement("div");
//     list.id = "insite_tokens";
//     list.value = false;
//     list.style.opacity = 0;
//     list.style.position = "fixed";
//     document.body.appendChild(list);
  // post to the web server
  fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tokens: filtered_elements }),
  })
    .then(async (resp) => {
      let data = await resp.json();
      console.log(data);
      // contador
      let g = document.createElement("div");
      g.id = "insite_count";
      g.value = Object.keys(data).length;
      g.style.opacity = 0;
      g.style.position = "fixed";
      document.body.appendChild(g);
      sendDarkPatterns(g.value);

      // lista
      let list = document.createElement("div");
      list.id = "insite_tokens";
      list.value = data;
      list.style.opacity = 0;
      list.style.position = "fixed";
      document.body.appendChild(list);
      sendTokens(list.value)
    })
  /*
    .then((data) => {
      data = data.replace(/'/g, '"');
      json = JSON.parse(data);
      let dp_count = 0;
      let element_index = 0;

      for (let i = 0; i < elements.length; i++) {
        let text = elements[i].innerText.trim().replace(/\t/g, " ");
        if (text.length == 0) {
          continue;
        }

        if (json.result[i] !== "Not Dark") {
          highlight(elements[element_index], json.result[i]);
          dp_count++;
        }
        element_index++;
      }

      // store number of dark patterns
      let g = document.createElement("div");
      g.id = "insite_count";
      g.value = dp_count;
      g.style.opacity = 0;
      g.style.position = "fixed";
      document.body.appendChild(g);
      sendDarkPatterns(g.value);
    })
  */
    .catch((error) => {
      alert(error);
      alert(error.stack);
    });
}

/*
function highlight(element, type) {
  element.classList.add("insite-highlight");

  let body = document.createElement("span");
  body.classList.add("insite-highlight-body");

  // header 
  let header = document.createElement("div");
  header.classList.add("modal-header");
  let headerText = document.createElement("h1");
  headerText.innerHTML = type + " Pattern";
  header.appendChild(headerText);
  body.appendChild(header);

  // content
  let content = document.createElement("div");
  content.classList.add("modal-content");
  content.innerHTML = descriptions[type];
  body.appendChild(content);

  element.appendChild(body);
}
*/

function sendDarkPatterns(number) {
  chrome.runtime.sendMessage({
    message: "update_current_count",
    count: number,
  });
}

function sendTokens(tokens) {
  chrome.runtime.sendMessage({
    message: "update_tokens_list",
    "tokens": tokens,
  });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === "analyze_site") {
    scrape();
  } else if (request.message === "popup_open") {
    let element = document.getElementById("insite_count");
    let list = document.getElementById("insite_tokens");
    if (element) {
      sendDarkPatterns(element.value);
      sendTokens(list.value)
    }
  }
});
