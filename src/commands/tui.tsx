import React from 'react';
import { render } from 'ink';
import { PortsScanner } from '../components/PortsScanner';

export function renderTUI() {
  console.clear();
  const app = render(<PortsScanner />);

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    app.unmount();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    app.unmount();
    process.exit(0);
  });
}
