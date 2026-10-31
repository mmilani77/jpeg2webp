// Module worker: encodes RGBA pixels to WebP with libwebp (WebAssembly),
// tuned for the smallest file at the requested quality, then strips everything but image data.
import { cleanWebp } from './webp-clean.js';

const SIMD_TEST = new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11]);

// struct WebPConfig (libwebp encode.h)
const BASE = {
  quality: 82,
  target_size: 0,
  target_PSNR: 0,
  method: 6,            // slowest, best compression
  sns_strength: 50,
  filter_strength: 60,
  filter_sharpness: 0,
  filter_type: 1,
  partitions: 0,
  segments: 4,
  pass: 1,
  show_compressed: 0,
  preprocessing: 0,
  autofilter: 1,        // tune the deblocking filter per image: better quality, same size
  partition_limit: 0,
  alpha_compression: 1,
  alpha_filtering: 1,
  alpha_quality: 100,
  lossless: 0,
  exact: 0,             // allow discarding RGB under fully transparent pixels
  image_hint: 0,
  emulate_jpeg_size: 0,
  thread_level: 0,
  low_memory: 0,
  near_lossless: 100,
  use_delta_palette: 0,
  use_sharp_yuv: 0      // sharp YUV costs ~10% more bytes: off unless the user asks for it
};

let modP;
async function load() {
  const simd = WebAssembly.validate(SIMD_TEST);
  const factory = (await import(simd ? './vendor/webp/webp_enc_simd.js' : './vendor/webp/webp_enc.js')).default;
  return factory({ noInitialRun: true });
}

self.onmessage = async ({ data: { id, pixels, width, height, quality, sharp, lossless } }) => {
  try {
    modP = modP || load().catch((e) => { modP = undefined; throw e; });
    const mod = await modP;
    const opts = lossless
      // Lossless: quality = compression effort. q100 + method 5 matched method 6 in tests at ~4x the speed.
      ? { ...BASE, lossless: 1, quality: 100, method: 5, use_sharp_yuv: 0 }
      : { ...BASE, quality, use_sharp_yuv: sharp ? 1 : 0 };
    const raw = mod.encode(pixels, width, height, opts);
    if (!raw) throw new Error('Codifica WebP non riuscita');
    const out = cleanWebp(new Uint8Array(raw)).slice();
    self.postMessage({ id, buffer: out.buffer }, [out.buffer]);
  } catch (e) {
    self.postMessage({ id, error: (e && e.message) || String(e) });
  }
};
