import fs from 'fs';
import path from 'path';
import { Project } from 'ts-morph';

function fileExistsCaseSensitive(filepath: string) {
  const dir = path.dirname(filepath);
  const filename = path.basename(filepath);

  if (!fs.existsSync(dir)) return false;

  const files = fs.readdirSync(dir);
  return files.includes(filename);
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

    const filePathWithExt = fs.existsSync(absPath)
      ? absPath
      : ['.ts', '.js', '.tsx', '.jsx']
          .map((ext) => absPath + ext)
          .find((p) => fs.existsSync(p));

    if (!filePathWithExt) return;

    if (!fileExistsCaseSensitive(filePathWithExt)) {
      console.log(
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
