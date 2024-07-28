// src/main.ts
var isDownloading = false;
var currentState = 0 /* Main */;
var lastRenderedState = null;
async function downloadZip(url2, retries = 3) {
  if (isDownloading)
    return;
  isDownloading = true;
  currentState = 1 /* Downloading */;
  lastRenderedState = null;
  console.log(`Starting ZIP download from ${url2}...`);
  while (retries > 0) {
    try {
      console.log("Fetching...");
      const response = await fetch(url2);
      console.log("Fetch complete, status:", response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const contentLength = response.headers.get("content-length");
      const total = contentLength ? parseInt(contentLength, 10) : null;
      let loaded = 0;
      const reader = response.body?.getReader();
      const stream = new ReadableStream({
        start(controller) {
          function push() {
            reader?.read().then(({ done, value }) => {
              if (done) {
                controller.close();
                console.log("Download complete!");
                return;
              }
              loaded += value.byteLength;
              if (total) {
                const percent = (loaded / total * 100).toFixed(2);
                console.log(`Progress: ${percent}%`);
              } else {
                console.log(`Downloaded: ${loaded} bytes`);
              }
              controller.enqueue(value);
              push();
            }).catch((error) => {
              console.error("Download failed:", error);
              controller.error(error);
            });
          }
          push();
        }
      });
      const blob = await new Response(stream).blob();
      console.log(`Download complete! File size: ${blob.size} bytes`);
      break;
    } catch (error) {
      retries--;
      console.error(`Download failed: ${error}. Retries left: ${retries}`);
      if (retries === 0) {
        console.log("All retries failed");
        isDownloading = false;
        currentState = 0 /* Main */;
        lastRenderedState = null;
        return;
      }
    }
  }
  console.log("Download process finished");
  isDownloading = false;
  currentState = 0 /* Main */;
  lastRenderedState = null;
}
var url = "https://www.dropbox.com/scl/fi/x17gh2dn9wds8vpnlpjm3/CTGPDX-v1.0.0.zip?rlkey=2edfz92yrwija2oqmvbq42z5w&st=7osk67vu&dl=1";
downloadZip(url);
//# sourceMappingURL=main.js.map
