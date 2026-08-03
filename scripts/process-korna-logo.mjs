/**
 * Remove black background from Korna Mall logo and generate brand assets.
 */
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'public');

const SRC =
  process.argv[2] ||
  path.join(
    process.env.USERPROFILE || '',
    '.cursor/projects/c-Users-hp-OneDrive-Desktop-websites-korna/assets',
    'c__Users_hp_AppData_Roaming_Cursor_User_workspaceStorage_004e92b9f7c16a75e8c57963d6b7711e_images_ChatGPT_Image_Aug_3__2026__08_58_42_AM-4dbe7b3d-4338-474c-bfd9-0e88f37ed892.png'
  );

const HARD = 28; // pure black / near-black -> transparent
const SOFT = 70; // fade fringe so edges aren't harsh

async function removeBlackBackground(inputPath) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const max = Math.max(r, g, b);
    const avg = (r + g + b) / 3;

    // Dark, low-chroma pixels are background
    if (max <= HARD && avg <= HARD) {
      data[i + 3] = 0;
    } else if (max <= SOFT && avg <= SOFT) {
      // Soft edge: keep pinks, fade dark fringe
      const t = (avg - HARD) / (SOFT - HARD);
      data[i + 3] = Math.round(Math.max(0, Math.min(1, t)) * 255);
    }
  }

  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .trim({ threshold: 10 })
    .toBuffer({ resolveWithObject: true });
}

async function main() {
  console.log('Source:', SRC);
  const { data: logoBuf, info: logoInfo } = await removeBlackBackground(SRC);
  console.log(`Transparent logo: ${logoInfo.width}x${logoInfo.height}`);

  // Full logo for header / footer / admin
  await sharp(logoBuf).png().toFile(path.join(publicDir, 'logo.png'));

  // Wider transparent master (keep aspect)
  await sharp(logoBuf)
    .resize({ width: 720, height: 240, fit: 'inside', withoutEnlargement: false })
    .png()
    .toFile(path.join(publicDir, 'logo-wide.png'));

  // Brand mark: right-side bag + MALL (approx 38% of width from right works for this layout)
  const markWidth = Math.round(logoInfo.width * 0.38);
  const markLeft = Math.max(0, logoInfo.width - markWidth);
  const markBuf = await sharp(logoBuf)
    .extract({
      left: markLeft,
      top: 0,
      width: markWidth,
      height: logoInfo.height,
    })
    .trim({ threshold: 8 })
    .png()
    .toBuffer();

  await sharp(markBuf).png().toFile(path.join(publicDir, 'brand-mark.png'));

  // Square icons with transparent padding (favicon / PWA)
  for (const size of [32, 48, 180, 192, 512]) {
    const icon = await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([
        {
          input: await sharp(markBuf)
            .resize({
              width: Math.round(size * 0.82),
              height: Math.round(size * 0.82),
              fit: 'inside',
            })
            .png()
            .toBuffer(),
          gravity: 'centre',
        },
      ])
      .png()
      .toBuffer();

    if (size === 32) await sharp(icon).png().toFile(path.join(publicDir, 'favicon-32.png'));
    if (size === 48) await sharp(icon).png().toFile(path.join(publicDir, 'favicon.png'));
    if (size === 180) await sharp(icon).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));
    if (size === 192) await sharp(icon).png().toFile(path.join(publicDir, 'icon-192.png'));
    if (size === 512) await sharp(icon).png().toFile(path.join(publicDir, 'icon-512.png'));
  }

  // Also write ico-friendly 48 as favicon.ico replacement via png (browsers accept png favicon)
  await sharp(path.join(publicDir, 'favicon.png'))
    .resize(48, 48)
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));

  // OG / social share: 1200x630 warm dark surface + full logo centered
  const ogBg = { r: 28, g: 25, b: 23, alpha: 1 }; // brand ink
  const ogLogo = await sharp(logoBuf)
    .resize({ width: 900, height: 280, fit: 'inside' })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 4,
      background: ogBg,
    },
  })
    .composite([{ input: ogLogo, gravity: 'centre' }])
    .png()
    .toFile(path.join(publicDir, 'og-image.png'));

  console.log('Wrote logo.png, brand-mark.png, favicon*, icon-*, apple-touch-icon.png, og-image.png');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
