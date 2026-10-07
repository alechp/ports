import { loadConfig, addScanPath, removeScanPath, getConfigPath } from './src/config';

console.log('\n=== Testing Config Module ===\n');

// Test 1: Load config
console.log('1. Loading config...');
const config1 = loadConfig();
console.log('   Scan paths:', config1.scanPaths);
console.log('   Config file location:', getConfigPath());

// Test 2: Add current directory
console.log('\n2. Adding current directory...');
try {
  const config2 = addScanPath(process.cwd());
  console.log('   ✓ Added successfully');
  console.log('   Scan paths:', config2.scanPaths);
} catch (error) {
  console.log('   Note:', error instanceof Error ? error.message : String(error));
}

// Test 3: Try to add duplicate (should fail)
console.log('\n3. Trying to add duplicate path...');
try {
  addScanPath(process.cwd());
  console.log('   ✗ Should have failed');
} catch (error) {
  console.log('   ✓ Correctly rejected:', error instanceof Error ? error.message : String(error));
}

// Test 4: Try to add non-existent path (should fail)
console.log('\n4. Trying to add non-existent path...');
try {
  addScanPath('/this/does/not/exist');
  console.log('   ✗ Should have failed');
} catch (error) {
  console.log('   ✓ Correctly rejected:', error instanceof Error ? error.message : String(error));
}

// Test 5: Load config again to verify persistence
console.log('\n5. Loading config again to verify persistence...');
const config3 = loadConfig();
console.log('   Scan paths:', config3.scanPaths);

// Test 6: Remove a path
console.log('\n6. Removing current directory...');
const config4 = removeScanPath(process.cwd());
console.log('   ✓ Removed');
console.log('   Scan paths:', config4.scanPaths);

console.log('\n=== Tests Complete ===\n');
