console.log("Levera Scraper Loaded");
function scrapeProblem() {
  return {
    title: document.title.replace(" - LeetCode", ""),
    slug: location.pathname.split("/")[2],
    description:
      document
        .querySelector('[data-track-load="description_content"]')
        ?.textContent?.trim() ?? "",
    url: location.href,
  };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_PROBLEM") {
    sendResponse(scrapeProblem());
  }
});
