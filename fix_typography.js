const fs = require('fs');
const path = require('path');

const directory = 'd:/cyber/citizen-panel/src';

const replacements = [
    [/font-black/g, 'font-bold'],
    [/font-bold/g, 'font-semibold'],
    [/\sitalic(\s|'|")/g, '$1'],
];

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    replacements.forEach(([regex, replacement]) => {
        if (regex.test(content)) {
            content = content.replace(regex, replacement);
            changed = true;
        }
    });

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

function walk(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            processFile(fullPath);
        }
    });
}

walk(directory);
console.log('Cleanup complete.');
