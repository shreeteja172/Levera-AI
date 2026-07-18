chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== "SCRAPE_PROBLEM") return;

  chrome.tabs.query(
    {
      active: true,
      currentWindow: true,
    },
    ([tab]) => {
      if (!tab?.id) return;

      chrome.tabs.sendMessage(
        tab.id,
        {
          type: "GET_PROBLEM",
        },
        (response) => {
          sendResponse(response);
        }
      );
    }
  );

  return true;
});