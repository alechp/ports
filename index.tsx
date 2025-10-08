#!/usr/bin/env bun
import React from 'react';
import { render } from 'ink';
import { PortsScanner } from './src/components/PortsScanner';

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
