"use client";

import { useSyncExternalStore } from "react";
import PrishaApp from "./PrishaApp";

const subscribe = () => () => {};

/**
 * The hub reads everything from this browser's storage, so it renders on the
 * client only; the exported HTML carries just the loading card below.
 */
export default function ClientOnly() {
  const isClient = useSyncExternalStore(subscribe, () => true, () => false);
  if (!isClient) {
    return (
      <div className="ph-screen ph-loading">
        <p className="ph-title">Prisha&apos;s Learning Hub</p>
        <p className="ph-subtitle">Getting ready… 🌈</p>
        <noscript>
          <p className="ph-text">Please turn on JavaScript to use the Learning Hub.</p>
        </noscript>
      </div>
    );
  }
  return <PrishaApp />;
}
