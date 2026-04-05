import { Component } from "react";
import * as Sentry from "@sentry/react";
import Button from "./ui/Button";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Unhandled render error:", error, info.componentStack);
    Sentry.captureException(error, { extra: { componentStack: info.componentStack } });
  }

  handleReset() {
    this.setState({ hasError: false });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-app-surface px-6 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-100 text-4xl">
            ⚠️
          </div>

          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-app-text">
              Something went wrong
            </h1>
            <p className="mt-3 text-sm leading-7 text-app-text-soft">
              An unexpected error occurred. Try refreshing the page.
            </p>
          </div>

          <div className="flex gap-3">
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                this.handleReset();
                window.location.href = "/";
              }}
            >
              Go Home
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
