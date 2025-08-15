import fs from 'fs';
import path from 'path';
import { Project } from 'ts-morph';

function pathExistsCaseSensitive(targetPath: string) {
  const abs = path.resolve(targetPath);
  const { root } = path.parse(abs);
  const rel = path.relative(root, abs);
  const segments = rel.split(path.sep).filter(Boolean);

  let current = root || path.sep;
  for (const segment of segments) {
    if (!fs.existsSync(current)) return false;
    const entries = fs.readdirSync(current);
    if (!entries.includes(segment)) return false; // exact-case match
    current = path.join(current, segment);
  }
  return fs.existsSync(current);
}
const project = new Project({
  tsConfigFilePath: './tsconfig.json',
});

let hasError = false;

project.getSourceFiles().forEach((sourceFile) => {
  sourceFile.getImportDeclarations().forEach((imp) => {
    const modulePath = imp.getModuleSpecifierValue();

    // Перевіряємо тільки відносні імпорти
    if (!modulePath.startsWith('.')) return;

    const absPath = path.resolve(
      path.dirname(sourceFile.getFilePath()),
      modulePath,
    );
    // Resolve an existing target (file or index file) first, then verify case against the typed import path.
    const exts = ['.ts', '.tsx', '.js', '.jsx', '.mts', '.cts', '.mjs', '.cjs'];
    const existingTarget =
      (fs.existsSync(absPath) && fs.statSync(absPath).isFile()
        ? absPath
        : undefined) ??
      exts.map((ext) => absPath + ext).find((p) => fs.existsSync(p)) ??
      exts
        .map((ext) => path.join(absPath, 'index' + ext))
        .find((p) => fs.existsSync(p));

    if (!existingTarget) return;

    // Construct the path exactly as written in the import (preserving casing) for the case check.
    const typedCandidate =
      existingTarget === absPath
        ? absPath
        : existingTarget.startsWith(path.join(absPath, 'index'))
          ? path.join(absPath, path.basename(existingTarget)) // .../dir/index.ext
          : absPath + path.extname(existingTarget); // .../file.ext

    if (!pathExistsCaseSensitive(typedCandidate)) {
      console.error(
        `❌ Case mismatch in import: "${modulePath}" in file "${sourceFile.getFilePath()}"`,
      );
      hasError = true;
    }
  });
});

if (!hasError) {
  console.log('✅ All import paths match the actual file case.');
} else {
  process.exit(1);
}
