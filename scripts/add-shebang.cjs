#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const cliPath = path.join(__dirname, '..', 'dist', 'cli.js');

if (fs.existsSync(cliPath)) {
    const content = fs.readFileSync(cliPath, 'utf8');
    if (!content.startsWith('#!/usr/bin/env node')) {
        const newContent = '#!/usr/bin/env node\n' + content;
        fs.writeFileSync(cliPath, newContent);
        console.log('Shebang added to cli.js');
    } else {
        console.log('Shebang already exists in cli.js');
    }
} else {
    console.error('cli.js not found at:', cliPath);
    process.exit(1);
}