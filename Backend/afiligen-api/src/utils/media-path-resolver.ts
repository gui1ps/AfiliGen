import * as fs from 'fs';
import * as fsp from 'fs/promises';
import * as path from 'path';

const DEFAULT_MEDIA_DIR = path.resolve(
  process.cwd(),
  'src/modules/integrations/media',
);

type Source = 'whatsapp' | 'instagram';
type FileType = 'img' | 'video';

export interface ResolveOptions {
  createDirs?: boolean;
  sanitize?: boolean;
  returnRelative?: boolean;
}

export interface MediaPathResult {
  absPath: string;
  relPath: string;
  dirPath: string;
  exists: boolean;
}

function sanitizeFileName(fileName: string): string {
  const base = path.basename(fileName);
  return base.replace(/[^a-zA-Z0-9._-]/g, '-');
}

function safeJoin(baseDir: string, ...segments: string[]): string {
  const target = path.resolve(baseDir, ...segments);
  if (!target.startsWith(baseDir + path.sep)) {
    throw new Error('Resolved path escapes base directory');
  }
  return target;
}

export async function resolveMediaPath(
  fileName: string,
  source: Source,
  fileType: FileType,
  opts: ResolveOptions = {},
): Promise<MediaPathResult> {
  const { createDirs = false, sanitize = true } = opts;

  const cleanFileName = sanitize
    ? sanitizeFileName(fileName)
    : path.basename(fileName);
  const relPath = path.join(source, fileType, cleanFileName);
  const dirPath = safeJoin(DEFAULT_MEDIA_DIR, source, fileType);
  const absPath = safeJoin(DEFAULT_MEDIA_DIR, relPath);

  if (createDirs) {
    await fsp.mkdir(dirPath, { recursive: true });
  }

  let exists = false;
  try {
    await fsp.access(absPath, fs.constants.F_OK);
    exists = true;
  } catch {
    exists = false;
  }

  return { absPath, relPath, dirPath, exists };
}
