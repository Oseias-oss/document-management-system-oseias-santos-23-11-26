const API_BASE_URL = '/api';

async function readErrorMessage(response) {
  const body = await response.json().catch(() => null);
  return body?.error || 'Erro inesperado ao comunicar com o servidor.';
}

export async function uploadDocument(file, userId) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    headers: { 'X-User-Id': userId },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response.json();
}

export async function listDocuments(userId) {
  const response = await fetch(`${API_BASE_URL}/documents`, {
    headers: { 'X-User-Id': userId },
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response.json();
}

export async function downloadDocument(item, userId) {
  const response = await fetch(`${API_BASE_URL}/documents/${item.id}/download`, {
    headers: { 'X-User-Id': userId },
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement('a');
  link.href = url;
  link.download = item.originalName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
