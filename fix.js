const fs = require('fs');
let content = fs.readFileSync('src/app/page.tsx', 'utf8');

// hapus "es", "fr", "ar"
content = content.replace(/es: \{[\s\S]*?\},/g, '');
content = content.replace(/fr: \{[\s\S]*?\},/g, '');
content = content.replace(/ar: \{[\s\S]*?\}/g, '');

// hapus object sisa yang mungkin tidak beres regexnya (just in case)
content = content.replace(/const languages = \[[\s\S]*?\];/, 'const languages = [{ code: "id", label: "Indonesia", flag: "🇮🇩" }, { code: "en", label: "English", flag: "🇺🇸" }];');

fs.writeFileSync('src/app/page.tsx', content);
