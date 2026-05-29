import { Resvg } from "@resvg/resvg-js";
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const svgRegular = readFileSync(join(root, "public/logo.svg"), "utf8");
const svgMaskable = readFileSync(join(root, "public/logo-maskable.svg"), "utf8");

const icons = [
  { svg: svgRegular,   size: 32,  out: "favicon-32.png" },
  { svg: svgRegular,   size: 180, out: "apple-touch-icon.png" },
  { svg: svgRegular,   size: 192, out: "icon-192.png" },
  { svg: svgRegular,   size: 512, out: "icon-512.png" },
  { svg: svgMaskable,  size: 192, out: "maskable-icon-192.png" },
  { svg: svgMaskable,  size: 512, out: "maskable-icon-512.png" },
];

for (const { svg, size, out } of icons) {
  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: size } });
  const png = resvg.render().asPng();
  writeFileSync(join(root, "public", out), png);
  console.log(`✓ public/${out} (${size}x${size})`);
}
