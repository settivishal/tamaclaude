import { pack } from "../hooks/raster.ts";
const eq = (got: unknown, want: unknown, what: string) => {
  if (JSON.stringify(got) !== JSON.stringify(want)) throw new Error(`${what}\n got  ${JSON.stringify(got)}\n want ${JSON.stringify(want)}`);
};
const b64len = (cells: number) => Math.ceil((cells * 12) / 3) * 4;
eq(pack([[0x2588, 0xff8800]]).length, b64len(1), "one cell is 12 bytes");
eq(pack(Array.from({ length: 64 }, () => [0x20, 0x01000000])).length, b64len(64), "16×4 packs to 64 cells");
eq(pack([[0x2588, 0xff8800]]), "iCUAAACI/wAAAAAB", "little-endian triplet, default bg");
// fallback encoder must match the native one byte for byte
{
  const words = Uint32Array.of(0x2588, 0xff8800, 0x01000000);
  const bytes = new Uint8Array(words.buffer);
  const native = (bytes as Uint8Array & { toBase64?: () => string }).toBase64?.call(bytes);
  if (native !== undefined) eq(pack([[0x2588, 0xff8800]]), native, "fallback matches native");
}
console.log("ok raster");
