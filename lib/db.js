import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'assets.json');

export function readAssets() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, '[]', 'utf8');
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function writeAssets(assets) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(assets, null, 2), 'utf8');
}

export function generateAssetId(type, existingAssets) {
  const prefixMap = {
    PC: 'PC',
    Printer: 'PR',
    UPS: 'UPS',
    Antivirus: 'AV',
  };
  const prefix = prefixMap[type] || 'ASSET';
  const same = existingAssets.filter((a) => a.assetType === type);
  const next = same.length + 1;
  return `${prefix}-${String(next).padStart(3, '0')}`;
}

//Demands Store
const DEMANDS_FILE = path.join(process.cwd(), 'data', 'demands.json');

export function readDemands() {
  try {
    if (!fs.existsSync(DEMANDS_FILE)) {
      fs.writeFileSync(DEMANDS_FILE, '{}', 'utf8');
    }
    const raw = fs.readFileSync(DEMANDS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function writeDemands(demands) {
  fs.writeFileSync(DEMANDS_FILE, JSON.stringify(demands, null, 2), 'utf8');
}
