"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { logError } from "@/lib/logger";

type Props = { children: ReactNode; fallback?: ReactNode };
type State = { hasError: boolean };

/**
 * A component-level boundary, for client subtrees that can fail without taking
 * the page with them. Route-level failures belong in `app/error.tsx`; this is
 * for third-party widgets — a blocked analytics script must never blank the
 * marketing page.
 *
 * The default fallback is `null` on purpose: the subtree disappears and the
 * rest of the page keeps working.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logError("client-error-boundary", error, {
      componentStack: info.componentStack,
    });
  }

  render() {
    if (this.state.hasError) return this.props.fallback ?? null;
    return this.props.children;
  }
}
