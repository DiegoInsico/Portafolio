const fs = require('fs');
const path = require('path');

// Directorio donde están tus fuentes
const fontsDir = path.resolve(__dirname, 'src/fonts');

// Nombres de los archivos de fuentes
const fontFiles = {
  'Roboto-Regular.ttf': 'Roboto-Regular.ttf',
  'Roboto-Medium.ttf': 'Roboto-Medium.ttf',
  'Roboto-Italic.ttf': 'Roboto-Italic.ttf',
  'Roboto-MediumItalic.ttf': 'Roboto-MediumItalic.ttf',
  // Añade más fuentes si es necesario
};

const vfs = {};

Object.keys(fontFiles).forEach((key) => {
  const filePath = path.join(fontsDir, fontFiles[key]);
  const fileData = fs.readFileSync(filePath).toString('base64');
  vfs[key] = fileData;
});

const vfsContent = `export const vfs = ${JSON.stringify(vfs)};`;

fs.writeFileSync(path.resolve(__dirname, 'src/fonts/vfs_fonts_custom.js'), vfsContent);

console.log('vfs_fonts_custom.js generado correctamente.');
