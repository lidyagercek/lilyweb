import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import "./lib/cursor.css"
import App from "./App.tsx"
import { preloadImageDirectories } from "./lib/imageCache"

// Preload images during boot sequence

// Initialize app and image cache
const initApp = async () => {
  try {
    // Try to preload all images
    await preloadImageDirectories()
    
    // Debug output of cache content
  } catch (error) {
    console.error("[App] Error preloading images:", error)
  }
  
  // Render the app regardless of cache success
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
}

// Start initialization
initApp()
