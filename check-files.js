const fs = require('fs');
const path = require('path');

const root = process.cwd();
const appPath = path.join(root, 'app');
const pagesPath = path.join(root, 'pages');

console.log('Current Working Directory:', root);
console.log('App directory path:', appPath);
console.log('App directory exists:', fs.existsSync(appPath));
console.log('Pages directory path:', pagesPath);
console.log('Pages directory exists:', fs.existsSync(pagesPath));

if (fs.existsSync(appPath)) {
    console.log('Contents of app directory:', fs.readdirSync(appPath));
}

console.log('Contents of root directory:', fs.readdirSync(root));
