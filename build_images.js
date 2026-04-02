const fs = require('fs');
const path = require('path');

const basedir = 'C:/Users/HP/Desktop/product images';
const categories = {};

// Scan all category folders
const dirs = fs.readdirSync(basedir, { withFileTypes: true })
  .filter(d => d.isDirectory());

for (const dir of dirs) {
  const catName = dir.name;
  const imgDir = path.join(basedir, catName, 'images');
  if (!fs.existsSync(imgDir)) continue;

  const files = fs.readdirSync(imgDir)
    .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));

  const images = [];
  for (const f of files) {
    const fpath = path.join(imgDir, f);
    const ext = f.split('.').pop().toLowerCase();
    const mime = (ext === 'jpg' || ext === 'jpeg') ? 'image/jpeg' : 'image/png';
    const b64 = fs.readFileSync(fpath).toString('base64');
    images.push({ filename: f, data: 'data:' + mime + ';base64,' + b64 });
  }

  if (images.length > 0) {
    categories[catName] = images;
  }
}

// Also encode the AGM logo
const logoPath = 'C:/Users/HP/FatherApp/images/logos/000-AGMNOVIKOMBIN.logo-oie.png';
let logoData = '';
if (fs.existsSync(logoPath)) {
  logoData = 'data:image/png;base64,' + fs.readFileSync(logoPath).toString('base64');
}

// Build output
let output = 'const AGM_LOGO_DATA = ' + JSON.stringify(logoData) + ';\n\n';
output += 'const EMBEDDED_CATEGORIES = {\n';
for (const [catName, images] of Object.entries(categories)) {
  output += '  ' + JSON.stringify(catName) + ': [\n';
  for (const img of images) {
    output += '    { filename: ' + JSON.stringify(img.filename) + ', data: ' + JSON.stringify(img.data) + ' },\n';
  }
  output += '  ],\n';
}
output += '};\n';

fs.writeFileSync('C:/Users/HP/FatherApp/imagedata.js', output);
console.log('Categories: ' + Object.keys(categories).length);
console.log('Total images: ' + Object.values(categories).reduce((s, c) => s + c.length, 0));
console.log('File size: ' + Math.round(fs.statSync('C:/Users/HP/FatherApp/imagedata.js').size / 1024) + ' KB');
