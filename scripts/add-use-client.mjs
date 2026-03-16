import fs from 'node:fs';

const clientFiles = [
  'dist/react/index.js',
  'dist/react/index.cjs',
  'dist/next/index.js',
  'dist/next/index.cjs',
];

for (const file of clientFiles) {
  if (!fs.existsSync(file)) continue;
  const content = fs.readFileSync(file, 'utf8');
  if (!content.startsWith('"use client"')) {
    fs.writeFileSync(file, `"use client";\n${content}`);
    console.log(`Added "use client" to ${file}`);
  }
}
