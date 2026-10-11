import React, { Component } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/index.css'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) { return { hasError: true }; }
  componentDidCatch(error, info) { console.error("Error Boundary Caught:", error, info); }
  render() {
    if (this.state.hasError) return <div className="p-8 text-red-500">Something went wrong. Check console.</div>;
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
