// Rebuilds a WebP file keeping only the image data.
// Drops every other RIFF chunk: ICCP, EXIF, XMP, C2PA/JUMBF manifests and anything unknown.
// When no alpha chunk is needed, the extended header (VP8X) is dropped too, giving the
// smallest valid "simple" WebP.

const fourcc = (u8, o) => String.fromCharCode(u8[o], u8[o + 1], u8[o + 2], u8[o + 3]);

export function cleanWebp(input) {
  const u8 = input instanceof Uint8Array ? input : new Uint8Array(input);
  if (u8.length < 20 || fourcc(u8, 0) !== 'RIFF' || fourcc(u8, 8) !== 'WEBP') throw new Error('Non è un file WebP valido');
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  const end = Math.min(u8.length, 8 + dv.getUint32(4, true));

  const chunks = [];
  for (let o = 12; o + 8 <= end;) {
    const id = fourcc(u8, o), size = dv.getUint32(o + 4, true);
    if (o + 8 + size > end) break;
    chunks.push({ id, data: u8.subarray(o + 8, o + 8 + size) });
    o += 8 + size + (size & 1);
  }

  const vp8x = chunks.find((c) => c.id === 'VP8X');
  const alph = chunks.find((c) => c.id === 'ALPH');
  const image = chunks.find((c) => c.id === 'VP8 ' || c.id === 'VP8L');
  if (!image || chunks.some((c) => c.id === 'ANIM')) return u8; // animated or unexpected: leave untouched

  const keep = [];
  if (alph && vp8x) {
    const x = vp8x.data.slice();
    x[0] = 0x10; // alpha flag only: no ICC, EXIF, XMP, animation
    keep.push({ id: 'VP8X', data: x }, alph);
  }
  keep.push(image);

  const total = 12 + keep.reduce((s, c) => s + 8 + c.data.length + (c.data.length & 1), 0);
  const out = new Uint8Array(total);
  const ov = new DataView(out.buffer);
  const put = (o, s) => { for (let i = 0; i < 4; i++) out[o + i] = s.charCodeAt(i); };
  put(0, 'RIFF'); ov.setUint32(4, total - 8, true); put(8, 'WEBP');
  let o = 12;
  for (const c of keep) {
    put(o, c.id); ov.setUint32(o + 4, c.data.length, true);
    out.set(c.data, o + 8);
    o += 8 + c.data.length + (c.data.length & 1);
  }
  return out;
}
