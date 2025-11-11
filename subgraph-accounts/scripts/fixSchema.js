import fs from 'fs';
import path from 'path';

const schemaPath = path.resolve('./schema.graphql');
let schema = fs.readFileSync(schemaPath, 'utf-8');

// 1️⃣ Find all "type Query" definitions
const queryBlocks = schema.match(/type\s+Query\s*{[^}]*}/g);

// If there's more than one, merge them
if (queryBlocks && queryBlocks.length > 1) {
  console.log(`Found ${queryBlocks.length} "type Query" blocks. Merging...`);

  // Extract fields from all type Query blocks
  const allFields = queryBlocks
    .map(block => block.match(/{([\s\S]*?)}/)[1].trim())
    .join('\n  ');

  // Keep only the first "type Query" definition
  schema = schema.replace(/type\s+Query\s*{[^}]*}/g, '');

  // Create a single base Query and convert others to "extend type Query"
  const mergedQueryBlock = `
type Query {
  _dummy: String
  ${allFields}
}
`;

  // Remove any duplicate "extend type Query"
  schema = schema.replace(/extend\s+type\s+Query\s*{[^}]*}/g, '');

  // Append the merged Query definition
  schema += '\n' + mergedQueryBlock;

  fs.writeFileSync(schemaPath, schema.trim() + '\n', 'utf-8');
  console.log('✅ Successfully merged duplicate Query definitions.');
} else {
  console.log('✅ Schema already has a single type Query definition.');
}
