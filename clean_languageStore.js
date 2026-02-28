// Run this script with: node clean_languageStore.js
// It will overwrite languageStore.ts with all duplicate keys removed (keeping the last occurrence for each key in each language object)

const fs = require("fs");
const path = require("path");

const FILE = path.join(
  __dirname,
  "frontend",
  "src",
  "store",
  "languageStore.ts",
);

let code = fs.readFileSync(FILE, "utf8");

function cleanLanguageObject(objText) {
  // Find all key-value pairs ("key": value,)
  const regex = /([ \t]*)([a-zA-Z0-9_]+):/g;
  let matches = [];
  let match;
  while ((match = regex.exec(objText))) {
    matches.push({
      key: match[2],
      index: match.index,
    });
  }
  // Find last occurrence of each key
  const lastIndex = {};
  matches.forEach((m, i) => {
    lastIndex[m.key] = i;
  });
  // Remove all but last occurrence
  let keep = new Set(Object.values(lastIndex));
  let result = "";
  let last = 0;
  matches.forEach((m, i) => {
    if (keep.has(i)) {
      // Keep this key-value pair
      // Find the end of this value (comma after value)
      let next = i + 1 < matches.length ? matches[i + 1].index : objText.length;
      result += objText.slice(last, next);
      last = next;
    }
  });
  result += objText.slice(last);
  return result;
}

// Replace each language object
code = code.replace(/(lv: {)([\s\S]*?)(},\s*en: {)/, (m, start, lv, end) => {
  return start + cleanLanguageObject(lv) + end;
});
code = code.replace(/(en: {)([\s\S]*?)(},\s*ru: {)/, (m, start, en, end) => {
  return start + cleanLanguageObject(en) + end;
});
code = code.replace(/(ru: {)([\s\S]*?)(}\s*},?\s*;)/, (m, start, ru, end) => {
  return start + cleanLanguageObject(ru) + end;
});

fs.writeFileSync(FILE, code, "utf8");
console.log("languageStore.ts cleaned of duplicate keys!");
