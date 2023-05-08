export default function register() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((registration) => {
          console.log("Service worker registered:", registration);
        })
        .catch((error) => {
          console.log("Service worker registration failed:", error);
        });
    });
  }
}
