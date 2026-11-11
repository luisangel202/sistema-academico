import { Component } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary capturó:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 p-6 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "#fff1f2" }}>
            <AlertTriangle size={28} style={{ color: "#ef4444" }} />
          </div>
          <div>
            <h2 className="text-lg font-bold mb-1" style={{ color: "#1e293b" }}>
              Algo salió mal
            </h2>
            <p className="text-sm mb-1" style={{ color: "#64748b" }}>
              Este módulo tuvo un error inesperado.
            </p>
            {this.state.error && (
              <p className="text-xs font-mono px-3 py-1.5 rounded-lg mt-2 inline-block"
                style={{ background: "#f8fafc", color: "#94a3b8", border: "1px solid #e8edf5" }}>
                {this.state.error.message}
              </p>
            )}
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white border-0 cursor-pointer"
            style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)", boxShadow: "0 4px 14px rgba(37,99,235,0.25)" }}>
            <RefreshCw size={14} /> Intentar de nuevo
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
