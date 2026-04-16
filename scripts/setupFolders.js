const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'KnowledgeOSVault');
const folders = ['Inbox', 'Projects', 'Areas', 'Resources', 'Archives'];

if (!fs.existsSync(root)) {
  fs.mkdirSync(root, { recursive: true });
}

for (const folder of folders) {
  const folderPath = path.join(root, folder);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
}

console.log('Estrutura PARA criada em:', root);
