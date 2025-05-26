import { promises as fs } from 'fs';
import path from 'path';

export async function readJsonFile(filename: string) {
  const filePath = path.join(process.cwd(), 'src/data', filename);
  const data = await fs.readFile(filePath, 'utf8');
  return JSON.parse(data);
}

export async function writeJsonFile(filename: string, data: any) {
  const filePath = path.join(process.cwd(), 'src/data', filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}
