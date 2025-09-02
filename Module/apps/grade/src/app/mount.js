import { createRoot } from "react-dom/client";
import React from "react";
import { App } from "./App.jsx";

let root = null;

// Container-ready check function - ENHANCED DEBUGGING VERSION
const waitForContainer = () => {
  return new Promise((resolve) => {
    const checkStatus = () => {
      const webpackRequire = window.__webpack_require__;
      const sharedScope = webpackRequire && webpackRequire.S && webpackRequire.S.default;

      console.log("DEBUG: waitForContainer check:");
      console.log("  window.__webpack_require__:", !!webpackRequire);
      console.log("  window.__webpack_require__.S:", !!(webpackRequire && webpackRequire.S));
      console.log("  window.__webpack_require__.S.default:", !!sharedScope);

      if (sharedScope) {
        console.log("✅ Container is ready! Shared scope found.");
        return true;
      }
      return false;
    };

    if (checkStatus()) {
      resolve();
    } else {
      const checkInterval = setInterval(() => {
        if (checkStatus()) {
          clearInterval(checkInterval);
          resolve();
        } else {
          console.log("⏳ Still waiting for container to be ready...");
        }
      }, 500); // Increased interval for better visibility
    }
  });
};

export async function mount(container, props) {
  console.log("🚀 MOUNT FUNCTION CALLED with:", { container, props });

  try {
    console.log("🎨 Creating React root and rendering App component...");
    // Create root and render immediately without waiting for shared scope
    if (!root) {
      root = createRoot(container);
      console.log("✅ React root created");
    }

    console.log("🎭 Rendering App component into container...");
    root.render(React.createElement(App, props));
    console.log("🎉 App component rendered successfully!");

    return () => {
      console.log("🧹 Cleanup function called");
      if (root) {
        root.unmount();
        root = null;
        console.log("✅ React root cleaned up");
      }
    };
  } catch (error) {
    console.error("❌ Error in mount function:", error);
    console.log("🔄 Trying fallback rendering...");

    // Fallback: render with local React if container fails
    if (!root) {
      root = createRoot(container);
      console.log("✅ Fallback React root created");
    }
    root.render(React.createElement(App, props));
    console.log("🎉 Fallback App component rendered!");

    return () => {
      if (root) {
        root.unmount();
        root = null;
      }
    };
  }
}


