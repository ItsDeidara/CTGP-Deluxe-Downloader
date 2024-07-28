enum MenuState {
    Main,
    Downloading,
}

let isDownloading = false;
let currentState = MenuState.Main;
let lastRenderedState = null;

async function downloadZip(url: string, retries = 3) {
    if (isDownloading) return; // Prevent multiple downloads
    
    isDownloading = true;
    currentState = MenuState.Downloading;
    lastRenderedState = null; // Force re-render
    console.log(`Starting ZIP download from ${url}...`);
    
    while (retries > 0) {
        try {
            console.log("Fetching...");
            const response = await fetch(url);
            console.log("Fetch complete, status:", response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const contentLength = response.headers.get('content-length');
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
                                const percent = ((loaded / total) * 100).toFixed(2);
                                console.log(`Progress: ${percent}%`);
                            } else {
                                console.log(`Downloaded: ${loaded} bytes`);
                            }
                            controller.enqueue(value);
                            push();
                        }).catch(error => {
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
                currentState = MenuState.Main;
                lastRenderedState = null; // Force re-render of main menu
                return;
            }
        }
    }

    console.log("Download process finished");
    isDownloading = false;
    currentState = MenuState.Main;
    lastRenderedState = null; // Force re-render of main menu
}

// Example usage with your URL:
const url = "https://www.dropbox.com/scl/fi/x17gh2dn9wds8vpnlpjm3/CTGPDX-v1.0.0.zip?rlkey=2edfz92yrwija2oqmvbq42z5w&st=7osk67vu&dl=1";
downloadZip(url);
