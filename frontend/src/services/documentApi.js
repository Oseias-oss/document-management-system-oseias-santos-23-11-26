const API_BASE_URL = '/api';

async function request(url, options) {
  let response;
  try {
    response = await fetch(url, options);
  } catch {
    throw new Error('Não foi possível conectar ao servidor.');
  }

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response;
}

async function readErrorMessage(response) {
  const body = await response.json().catch(() => null);
  return body?.error || 'Erro inesperado ao comunicar com o servidor.';
}

export async function uploadDocument(file, userId) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await request(`${API_BASE_URL}/upload`, {
    method: 'POST',
    headers: { 'X-User-Id': userId },
    body: formData,
  });

  return response.json();
}

export async function listDocuments(userId) {
  const response = await request(`${API_BASE_URL}/documents`, {
    headers: { 'X-User-Id': userId },
  });

  return response.json();
}

export async function downloadDocument(item, userId) {
  const response = await request(`${API_BASE_URL}/documents/${encodeURIComponent(item.id)}/download`, {
    headers: { 'X-User-Id': userId },
  });

  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement('a');
  link.href = url;
  link.download = item.originalName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
