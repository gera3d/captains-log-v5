import { isMockStaging, isLivePreview } from './runtimeConfig';
import { installStagingFetch } from './stagingMock';
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'

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

if (isMockStaging) {
  installStagingFetch();
  const banner = document.createElement('div');
  banner.setAttribute('role', 'status');
  banner.dataset.stagingBanner = 'true';
  banner.textContent = 'MOCK STAGING — Synthetic local data. No production backend or real AI. Browser data persists on this origin.';
  banner.style.cssText = 'position:relative;z-index:99999;background:#713f12;color:white;padding:10px 16px;text-align:center;font:14px system-ui';
  document.body.prepend(banner);
  document.title = '[MOCK STAGING] GoodIdea';
}

if (isLivePreview) {
  const banner = document.createElement('div');
  banner.setAttribute('role', 'status');
  banner.dataset.livePreviewBanner = 'true';
  banner.textContent = 'LIVE BACKEND — Mac Pro test website. Saves, deletes, uploads and AI requests affect the real app and may incur costs.';
  banner.style.cssText = 'position:sticky;top:0;z-index:99999;background:#991b1b;color:white;padding:12px 16px;text-align:center;font:600 14px system-ui';
  document.body.prepend(banner);
  document.title = '[LIVE BACKEND TEST] GoodIdea';
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
