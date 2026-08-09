const fs = require('fs');
let content = fs.readFileSync('src/app/page.tsx', 'utf8');

const idEndIndex = content.indexOf('  es: {');
if (idEndIndex > -1) {
    const endOfTranslations = content.indexOf('};', idEndIndex);
    content = content.substring(0, idEndIndex) + content.substring(endOfTranslations);
}

content = content.replace(/const languages = \[[\s\S]*?\];/, 'const languages = [{ code: "id", label: "Indonesia", flag: "🇮🇩" }, { code: "en", label: "English", flag: "🇺🇸" }];');

fs.writeFileSync('src/app/page.tsx', content);
