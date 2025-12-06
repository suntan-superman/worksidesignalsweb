import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <div className="text-red-600 text-5xl mb-4 text-center">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-4 text-center">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <details className="bg-gray-50 p-4 rounded mb-4 text-sm text-gray-600">
              <summary className="cursor-pointer font-semibold">Error Details</summary>
              <pre className="mt-2 overflow-auto whitespace-pre-wrap break-words">
                {this.state.error?.toString()}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              className="w-full btn-primary py-2"
            >
              Reload Page
            </button>
            <p className="text-xs text-gray-500 mt-4 text-center">
              Check your browser console and Firebase configuration
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

