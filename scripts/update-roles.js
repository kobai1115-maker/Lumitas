const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(srcDir);

const replacements = [
  { search: /'SYSTEM_ADMIN'/g, replace: "'DEVELOPER'" },
  { search: /"SYSTEM_ADMIN"/g, replace: '"DEVELOPER"' },
  { search: /'ADMIN'/g, replace: "'MAIN_ADMIN'" },
  { search: /"ADMIN"/g, replace: '"MAIN_ADMIN"' },
  { search: /'MANAGER'/g, replace: "'SUB_ADMIN'" },
  { search: /"MANAGER"/g, replace: '"SUB_ADMIN"' },
  { search: /'STAFF_CAREGIVER'/g, replace: "'GENERAL'" },
  { search: /"STAFF_CAREGIVER"/g, replace: '"GENERAL"' },
  { search: /'STAFF_NURSE'/g, replace: "'GENERAL'" },
  { search: /"STAFF_NURSE"/g, replace: '"GENERAL"' },
  { search: /'STAFF_OFFICE'/g, replace: "'GENERAL'" },
  { search: /"STAFF_OFFICE"/g, replace: '"GENERAL"' },
  { search: /'STAFF_SOCIAL_WORKER'/g, replace: "'GENERAL'" },
  { search: /"STAFF_SOCIAL_WORKER"/g, replace: '"GENERAL"' },
  { search: /'STAFF_OTHER'/g, replace: "'GENERAL'" },
  { search: /"STAFF_OTHER"/g, replace: '"GENERAL"' },
];

let changedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  replacements.forEach(r => {
    content = content.replace(r.search, r.replace);
  });
  
  // Custom case for types
  content = content.replace(/SYSTEM_ADMIN \| ADMIN/g, 'DEVELOPER | MAIN_ADMIN');
  
  if (original !== content) {
    fs.writeFileSync(file, content, 'utf8');
    changedFiles++;
    console.log(`Updated ${file}`);
  }
});

console.log(`Done. Updated ${changedFiles} files.`);
