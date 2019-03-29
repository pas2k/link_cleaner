// Redirect some URLs according to RULES below.
//
// Modified from https://github.com/imurray/redirectify by Iain Murray, March 2018.
//
// Cleans "dirty" links that can be used to track your behavior online.
//

// *://www.google.com/url?q=https://example.com/

function query_replacer(query) {
  return function(request) {
    console.log("Rewriting", request)
    oldUrl = new URL(request.url || request.originUrl || request.initiator || 'http://example.com');
    let search = new URLSearchParams(oldUrl.search)
    let qval = search.get(query)
    if (qval) {
      try {
        new URL(qval)
        console.log("Replaced with", qval)
        return { redirectUrl: qval }
      } catch (e) {
        console.log("Not replacing: wrong url", qval, e)
      }
    } else {
      console.log("Can't find ", query, "in", oldUrl.search)
    }
  }
}

RULES = [
  ["*://www.youtube.com/redirect?*", query_replacer("q")],
  ["*://www.google.com/url?*", query_replacer("q")],
];

var browser = browser || chrome;


RULES.forEach(rule => browser.webRequest.onBeforeRequest.addListener(
  request => {
    return rule[1](request)
  },
  {urls: [rule[0]], types: ["main_frame", "sub_frame"]},
  ["blocking"]));

