import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

function safeExt(filename: string) {
  const ext = path.extname(filename || '').toLowerCase();
  return ext || '.bin';
}

export async function saveDoctorDocument(file: File, doctorId: string, label: 'national_id' | 'graduation_certificate') {
  const uploadsRoot = path.join(process.cwd(), 'uploads', 'doctor-documents', doctorId);
  await mkdir(uploadsRoot, { recursive: true });

  const ext = safeExt(file.name);
  const fileName = `${label}-${Date.now()}-${randomUUID()}${ext}`;
  const absolutePath = path.join(uploadsRoot, fileName);

  const arrayBuffer = await file.arrayBuffer();
  await writeFile(absolutePath, Buffer.from(arrayBuffer));

  return {
    path: path.join('uploads', 'doctor-documents', doctorId, fileName).replace(/\\/g, '/'),
    mimeType: file.type || 'application/octet-stream',
    size: file.size,
    originalName: file.name,
  };
}

