import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const DATA_DIRECTORY = path.resolve(process.cwd(), 'src', 'test-data');

/** Reads named JSON files from the framework's test-data directory. */
export class TestDataLoader {
  /** Loads a JSON fixture and validates that its file name stays in the data directory. */
  static load<T>(fileName: string): T {
    if (path.basename(fileName) !== fileName || !fileName.endsWith('.json')) {
      throw new Error(`Test data must be a JSON file name, received "${fileName}".`);
    }

    const filePath = path.resolve(DATA_DIRECTORY, fileName);
    if (!existsSync(filePath)) {
      throw new Error(`Test data file does not exist: ${filePath}`);
    }

    const parsed: unknown = JSON.parse(readFileSync(filePath, 'utf8'));
    return parsed as T;
  }
}
