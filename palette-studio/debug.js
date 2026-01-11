const fs = require('fs');
try {
    fs.writeFileSync('debug.txt', fs.readdirSync('.').join('\n'));
    fs.appendFileSync('debug.txt', '\n--- src ---\n');
    fs.appendFileSync('debug.txt', fs.readdirSync('src').join('\n'));
} catch (e) {
    fs.writeFileSync('debug_error.txt', e.toString());
}
