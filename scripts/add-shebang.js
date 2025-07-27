#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const files = ['index.js', 'cli.js'];

files.forEach(file => {
    const filePath = join(process.cwd(), 'dist', file);
    try {
        const content = readFileSync(filePath, 'utf8');
        
        // Shebangが既に存在するかチェック
        if (!content.startsWith('#!/usr/bin/env node')) {
            const newContent = '#!/usr/bin/env node\n' + content;
            writeFileSync(filePath, newContent);
            console.log(`✅ Shebang added to dist/${file}`);
        } else {
            console.log(`ℹ️ Shebang already exists in dist/${file}`);
        }
    } catch (error) {
        console.log(`⚠️ Could not process dist/${file}: ${error.message}`);
    }
});