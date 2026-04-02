const fs = require('fs');
const path = require('path');

const basedir = 'C:/Users/HP/FatherApp/images';
const data = {};

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) { walk(full); continue; }
    if (!/\.(jpg|jpeg|png)$/i.test(e.name)) continue;
    const rel = path.relative(basedir, full).split(path.sep).join('/');
    const ext = e.name.split('.').pop().toLowerCase();
    const mime = (ext === 'jpg' || ext === 'jpeg') ? 'image/jpeg' : 'image/png';
    const b64 = fs.readFileSync(full).toString('base64');
    data[rel] = 'data:' + mime + ';base64,' + b64;
  }
}

walk(basedir);
const out = 'const IMAGE_DATA = ' + JSON.stringify(data) + ';\n';
fs.writeFileSync('C:/Users/HP/FatherApp/imagedata.js', out);
console.log('Encoded ' + Object.keys(data).length + ' images, size: ' + Math.round(out.length / 1024) + ' KB');
