#!/usr/bin/env node

/**
 * Migration Helper Script
 *
 * This script helps identify components that still need to be migrated
 * to use the new organized type and interface structure.
 */

const fs = require("fs");
const path = require("path");

// Patterns to look for that indicate migration needed
const MIGRATION_PATTERNS = [
  /^interface\s+\w+Props\s*{/m, // Local Props interfaces
  /^interface\s+\w+Stats\s*{/m, // Local Stats interfaces
  /^type\s+\w+Props\s*=/m, // Local Props types
  /^interface\s+\w+Config\s*{/m, // Local Config interfaces
  /^interface\s+\w+Data\s*{/m, // Local Data interfaces
];

const EXCLUDE_PATTERNS = [
  /from\s+['"]@\/interfaces/, // Already using organized interfaces
  /from\s+['"]@\/types/, // Already using organized types
];

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");

    // Skip if already migrated
    const alreadyMigrated = EXCLUDE_PATTERNS.some(pattern =>
      pattern.test(content)
    );
    if (alreadyMigrated) return null;

    // Check for migration patterns
    const foundPatterns = [];
    MIGRATION_PATTERNS.forEach((pattern, index) => {
      const matches = content.match(pattern);
      if (matches) {
        foundPatterns.push({
          pattern: pattern.source,
          match: matches[0],
          line: content.substring(0, matches.index).split("\n").length,
        });
      }
    });

    return foundPatterns.length > 0
      ? {
          file: filePath,
          patterns: foundPatterns,
        }
      : null;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return null;
  }
}

function scanDirectory(dirPath, results = []) {
  try {
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // Skip node_modules and .git
        if (!["node_modules", ".git", ".next"].includes(item)) {
          scanDirectory(fullPath, results);
        }
      } else if (item.endsWith(".tsx") || item.endsWith(".ts")) {
        // Skip .d.ts files
        if (!item.endsWith(".d.ts")) {
          const result = scanFile(fullPath);
          if (result) {
            results.push(result);
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error.message);
  }

  return results;
}

// Main execution
console.log(
  "🔍 Scanning for components that need type/interface migration...\n"
);

const srcPath = path.join(__dirname, "src");
const results = scanDirectory(srcPath);

if (results.length === 0) {
  console.log("✅ All components appear to be migrated!");
} else {
  console.log(`📋 Found ${results.length} files that may need migration:\n`);

  results.forEach((result, index) => {
    const relativePath = path.relative(__dirname, result.file);
    console.log(`${index + 1}. ${relativePath}`);

    result.patterns.forEach(pattern => {
      console.log(`   Line ${pattern.line}: ${pattern.match.trim()}`);
    });
    console.log("");
  });

  console.log("\n📖 Next steps:");
  console.log("1. Review each file listed above");
  console.log("2. Extract local interfaces/types to organized files");
  console.log("3. Update imports to use centralized types");
  console.log("4. Test component functionality after migration");
  console.log("\n📚 See TYPE_ORGANIZATION_GUIDE.md for detailed instructions");
}

console.log("\n🎯 Migration priorities:");
console.log("• High: Modal components (many shared patterns)");
console.log("• Medium: Admin components (complex prop interfaces)");
console.log("• Low: Simple utility components");
