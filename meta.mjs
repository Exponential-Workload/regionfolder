import { processPackage } from '@3xpo/pkgmetatool';
import fs from 'fs';

const pkgPath = './package.json';
const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
fs.writeFileSync(
  pkgPath,
  JSON.stringify(
    processPackage(
      // the inputted package.json object:
      pkgJson,
      // the above options object would go here, with `path` omitted
      {},
    ),
    null,
    2,
  ) + '\n',
);
