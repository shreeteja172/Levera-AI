export default function App() {
  async function analyze() {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab?.id) return;

    const problem = await chrome.tabs.sendMessage(tab.id, {
      type: "GET_PROBLEM",
    });

    console.log(problem);
  }

  return (
    <div style={{ padding: 20 }}>
      <button onClick={analyze}>Analyze</button>
    </div>
  );
}