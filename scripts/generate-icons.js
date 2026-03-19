// Generates 192x192 and 512x512 PNG icons using only Node.js built-ins.
// Colors: Pakistan green (#0b6b3a) background with a white crescent moon shape.
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

function createPNG(size) {
  const width = size;
  const height = size;

  // Build raw RGBA pixel data
  const pixels = Buffer.alloc(width * height * 4);

  const cx = width / 2;
  const cy = height / 2;
  const r = size * 0.38; // outer circle radius for crescent

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      // Pakistan green background
      pixels[idx] = 11;     // R
      pixels[idx + 1] = 107; // G
      pixels[idx + 2] = 58;  // B
      pixels[idx + 3] = 255; // A

      // Draw white crescent: filled outer circle minus offset inner circle
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Crescent: outer circle radius r, inner circle offset slightly left and radius 0.32*size
      const innerOffsetX = size * 0.07;
      const innerR = size * 0.30;
      const dxInner = x - (cx + innerOffsetX);
      const distInner = Math.sqrt(dxInner * dxInner + dy * dy);

      if (dist <= r && distInner > innerR) {
        // White crescent
        pixels[idx] = 255;
        pixels[idx + 1] = 255;
        pixels[idx + 2] = 255;
        pixels[idx + 3] = 255;
      }

      // Small white star (5-pointed approximation as a small filled circle)
      const starX = cx + size * 0.12;
      const starY = cy - size * 0.04;
      const starR = size * 0.06;
      const dxStar = x - starX;
      const dyStar = y - starY;
      if (Math.sqrt(dxStar * dxStar + dyStar * dyStar) <= starR) {
        pixels[idx] = 255;
        pixels[idx + 1] = 255;
        pixels[idx + 2] = 255;
        pixels[idx + 3] = 255;
      }
    }
  }

  // Build PNG file manually
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

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // color type: RGB (we'll use RGB, drop alpha for simplicity)
  ihdr[9] = 6;  // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  // IDAT: raw scan lines with filter byte 0 prepended
  const rawLines = [];
  for (let y = 0; y < height; y++) {
    rawLines.push(0); // filter type None
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      rawLines.push(pixels[idx], pixels[idx + 1], pixels[idx + 2], pixels[idx + 3]);
    }
  }
  const rawBuf = Buffer.from(rawLines);
  const compressed = zlib.deflateSync(rawBuf);

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", compressed),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const outDir = path.join(__dirname, "../public/icons");
fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(path.join(outDir, "icon-192.png"), createPNG(192));
console.log("Created icon-192.png");

fs.writeFileSync(path.join(outDir, "icon-512.png"), createPNG(512));
console.log("Created icon-512.png");
