import { Component } from "react";

// If a page crashes while rendering, show the error instead of an empty screen
export default class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="card" style={{ maxWidth: 560, margin: "80px auto", padding: 24, textAlign: "left" }}>
        <h3>Oops, something broke on this page</h3>
        <pre style={{ whiteSpace: "pre-wrap" }}>{String(this.state.error?.stack || this.state.error)}</pre>
        <a href="/">Back to Home</a>
      </div>
    );
  }
}
