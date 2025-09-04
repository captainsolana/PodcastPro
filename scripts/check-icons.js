#!/usr/bin/env node
/**
 * CI Guard: Ensure all icon usage goes through icon-registry (AppIcon)
 * Fails if any component (except icon-registry itself) imports from 'lucide-react'.
 */
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();
const TARGET_DIR = join(ROOT, 'client', 'src', 'components');
let violations = [];

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (/\.(tsx|ts|jsx|js)$/.test(entry.name)) {
      if (entry.name === 'icon-registry.tsx') continue;
      const content = readFileSync(full, 'utf8');
      if (content.includes("from 'lucide-react'") || content.includes('from "lucide-react"')) {
        violations.push(full.replace(ROOT + '/', ''));
      }
    }
  }
}

try {
  walk(TARGET_DIR);
  if (violations.length) {
    console.error('\nIcon usage violation: direct lucide-react imports found in:');
    for (const v of violations) console.error(' - ' + v);
    console.error('\nAll icons must go through AppIcon in ui/icon-registry.tsx');
    process.exit(1);
  } else {
    console.log('Icon guard passed: no direct lucide-react imports.');
  }
} catch (err) {
  console.error('Icon check failed with error:', err);
  process.exit(1);
}
