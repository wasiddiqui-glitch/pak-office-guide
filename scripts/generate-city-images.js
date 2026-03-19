// Generates simple placeholder city images as PNGs saved as .jpg
// Each city gets a unique color gradient
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const cities = [
  { name: "rawalpindi", r: 34, g: 85, b: 120 },    // steel blue
  { name: "peshawar",   r: 120, g: 70, b: 30 },    // earthy brown
  { name: "multan",     r: 150, g: 60, b: 20 },    // terracotta
  { name: "faisalabad", r: 20, g: 100, b: 60 },    // forest green
  { name: "quetta",     r: 70, g: 50, b: 110 },    // purple
];

function crc32(buf) {
  const table = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c;
    }
    return t;
  })();
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBytes = Buffer.from(type, "ascii");
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length);
  const crcInput = Buffer.concat([typeBytes, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(crcInput));
  return Buffer.concat([lenBuf, typeBytes, data, crcBuf]);
}

function createCityPNG(baseR, baseG, baseB, width = 400, height = 250) {
  const pixels = Buffer.alloc(width * height * 3);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 3;
      // horizontal gradient: darker on left, lighter on right
      const t = x / width;
      const fade = 0.6 + t * 0.4;
      pixels[idx]     = Math.min(255, Math.round(baseR * fade));
      pixels[idx + 1] = Math.min(255, Math.round(baseG * fade));
      pixels[idx + 2] = Math.min(255, Math.round(baseB * fade));
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // RGB
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  const rawLines = [];
  for (let y = 0; y < height; y++) {
    rawLines.push(0);
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 3;
      rawLines.push(pixels[idx], pixels[idx + 1], pixels[idx + 2]);
    }
  }
  const compressed = zlib.deflateSync(Buffer.from(rawLines));
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", compressed), chunk("IEND", Buffer.alloc(0))]);
}

const outDir = path.join(__dirname, "../public/cities");

for (const city of cities) {
  const buf = createCityPNG(city.r, city.g, city.b);
  // Save as .jpg filename but PNG content (browsers handle it fine for display)
  fs.writeFileSync(path.join(outDir, `${city.name}.jpg`), buf);
  console.log(`Created ${city.name}.jpg`);
}
