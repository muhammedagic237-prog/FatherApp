const fs = require('fs');
const path = require('path');

const categories = {};

// Category mappings: menu name -> source folder(s)
const SOURCES = {
  'Mastolovi / Pjeskolovi': [
    'C:/Users/HP/Desktop/BIOLOSKI UREDJAJI I SISTEMI/MASTOLOVIPJESKOLOVI'
  ],
  'Spremnici / Tank': [
    'C:/Users/HP/Desktop/BIOLOSKI UREDJAJI I SISTEMI/SPREMNICI TANKOVI REZERVARI'
  ],
  'Separatori Ulja': [
    'C:/Users/HP/Desktop/BIOLOSKI UREDJAJI I SISTEMI/MASTOLOVIPJESKOLOVI/SEPARATOR ULJA'
  ],
  'Bio Jame': [
    'C:/Users/HP/Desktop/BIOLOSKI UREDJAJI I SISTEMI/MASTOLOVIPJESKOLOVI/SEPARATOR ULJA/SEPTICKE BIO JAME',
    'C:/Users/HP/Desktop/BIOLOSKI UREDJAJI I SISTEMI/MASTOLOVIPJESKOLOVI/SEPARATOR ULJA/SEPTICKE BIO JAME/CRPNE STANICE'
  ],
  'Bio Uredjaji': [
    'C:/Users/HP/Desktop/BIOLOSKI UREDJAJI I SISTEMI'
  ],
  'Aktivni Sklopovi': [] // handled separately below
};

// Individual files for Aktivni Sklopovi
const AKTIVNI_FILES = [
  'C:/Users/HP/Desktop/oie_trnnansparent-DlvCbnTqvCJnX133gi5R6w.png',
  'C:/Users/HP/Desktop/oie_transparent84-bo06tQs4wWxVSs1nwNpLPg.png',
  'C:/Users/HP/Desktop/oie_transparent69-vU-I0SmJ_E8BAH34wENGSg.png',
  'C:/Users/HP/Desktop/coolingtower_crossrflow_crossfluted-fill_overview-690x421-ZcQQD3ScPYfkOEUU7lMW7Q.jpg',
  'C:/Users/HP/Desktop/oie_LAMELNIKOMPREOR-9GE2hBE1NlWgzizay0prkQ.png',
  'C:/Users/HP/Desktop/OIE-humbs-8-AQ1tJp6QbzN3cW9bLgWA.png'
];

function encodeFile(fpath) {
  const fname = path.basename(fpath);
  const ext = fname.split('.').pop().toLowerCase();
  const mime = (ext === 'jpg' || ext === 'jpeg') ? 'image/jpeg' : 'image/png';
  const b64 = fs.readFileSync(fpath).toString('base64');
  return { filename: fname, data: 'data:' + mime + ';base64,' + b64 };
}

// Process folder-based categories
for (const [catName, folders] of Object.entries(SOURCES)) {
  const images = [];
  for (const folder of folders) {
    if (!fs.existsSync(folder)) { console.log('SKIP:', folder); continue; }
    const files = fs.readdirSync(folder)
      .filter(f => /\.(jpg|jpeg|png)$/i.test(f))
      .map(f => path.join(folder, f));
    for (const fpath of files) {
      images.push(encodeFile(fpath));
    }
  }
  if (images.length > 0) categories[catName] = images;
}

// Process Aktivni Sklopovi
const aktivniImages = [];
for (const fpath of AKTIVNI_FILES) {
  if (fs.existsSync(fpath)) {
    aktivniImages.push(encodeFile(fpath));
  } else {
    console.log('MISSING:', fpath);
  }
}
if (aktivniImages.length > 0) categories['Aktivni Sklopovi'] = aktivniImages;

// Encode logo
const logoPath = 'C:/Users/HP/FatherApp/images/logos/000-AGMNOVIKOMBIN.logo-oie.png';
let logoData = '';
if (fs.existsSync(logoPath)) {
  logoData = 'data:image/png;base64,' + fs.readFileSync(logoPath).toString('base64');
}

// Write output
let output = 'const AGM_LOGO_DATA = ' + JSON.stringify(logoData) + ';\n\n';
output += 'const DESKTOP_CATEGORIES = {\n';
for (const [catName, images] of Object.entries(categories)) {
  output += '  ' + JSON.stringify(catName) + ': [\n';
  for (const img of images) {
    output += '    { filename: ' + JSON.stringify(img.filename) + ', data: ' + JSON.stringify(img.data) + ' },\n';
  }
  output += '  ],\n';
}
output += '};\n';

fs.writeFileSync('C:/Users/HP/FatherApp/desktop_imagedata.js', output);
console.log('\nCategories:');
for (const [k,v] of Object.entries(categories)) {
  console.log('  ' + k + ': ' + v.length + ' images');
}
console.log('\nTotal: ' + Object.values(categories).reduce((s,c) => s+c.length, 0) + ' images');
console.log('File: ' + Math.round(fs.statSync('C:/Users/HP/FatherApp/desktop_imagedata.js').size / 1024) + ' KB');
