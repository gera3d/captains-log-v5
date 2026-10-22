import { isMockStaging, isLivePreview } from './runtimeConfig';
import { installStagingFetch } from './stagingMock';
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'
import './privatePreviewBanner.css'
import { privatePreviewUrls } from '../config/privatePreview.mjs'
import { installPrivatePreviewBanner } from './privatePreviewBanner'

// Function to ensure consistent theme across environments
const initializeTheme = () => {
  try {
    // Only set the theme if it hasn't already been set
    // This preserves any existing theme configuration that might be working
    if (!document.documentElement.hasAttribute('data-theme')) {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  } catch (e) {
    console.warn('Theme initialization error:', e);
    // Continue even if theme setting fails
  }
}

if (isMockStaging) installStagingFetch();
if (isMockStaging || isLivePreview) {
  installPrivatePreviewBanner({
    mock: isMockStaging,
    live: isLivePreview,
    urls: { ...privatePreviewUrls(import.meta.env), ...(isMockStaging ? { sample: `${window.location.origin}/` } : {}) },
    document,
  });
}

// Initialize theme before rendering
initializeTheme();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
)
