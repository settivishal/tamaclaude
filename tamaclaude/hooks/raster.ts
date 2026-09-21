// Raster cell packing: [codePoint, fg, bg] triplets → little-endian u32 → base64 (RasterProps.cells).
export const DEFAULT = 0x01000000; // the terminal's own colour

export type Cell = [cp: number, fg: number, bg?: number];

export function pack(cells: Cell[]): string {
  const words = new Uint32Array(cells.length * 3);
  cells.forEach(([cp, fg, bg], i) => { words[i * 3] = cp; words[i * 3 + 1] = fg; words[i * 3 + 2] = bg ?? DEFAULT; });
  return b64(new Uint8Array(words.buffer));
}

// Uint8Array.toBase64 is Node 26+; the plugin runtime has it, CI's Node may not
const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
function b64(bytes: Uint8Array): string {
  const native = (bytes as Uint8Array & { toBase64?: () => string }).toBase64;
  if (native) return native.call(bytes);
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i]!, b = bytes[i + 1], c = bytes[i + 2];
    const n = (a << 16) | ((b ?? 0) << 8) | (c ?? 0);
    out += B64[n >> 18]! + B64[(n >> 12) & 63]! + (b === undefined ? "=" : B64[(n >> 6) & 63]!) + (c === undefined ? "=" : B64[n & 63]!);
  }
  return out;
}
