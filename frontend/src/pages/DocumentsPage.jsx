import { useEffect, useState } from 'react';
import DocumentList from '../components/DocumentList';
import UploadComponent from '../components/UploadComponent';
import { downloadDocument, listDocuments } from '../services/documentApi';

const DEFAULT_USER_ID = 'usuario-1';

export default function DocumentsPage() {
  const [userId, setUserId] = useState(DEFAULT_USER_ID);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [listState, setListState] = useState({ userId: null, documents: [], isLoading: true, errorMessage: '' });
  const [downloadError, setDownloadError] = useState(null);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    if (!userId.trim()) {
      setListState({ userId, documents: [], isLoading: false, errorMessage: 'Informe o usuário para listar documentos.' });
      return () => {
        active = false;
        controller.abort();
      };
    }

    setListState({ userId, documents: [], isLoading: true, errorMessage: '' });
    const timeoutId = setTimeout(() => {
      listDocuments(userId, { signal: controller.signal }).then(
        (documents) => {
          if (active) setListState({ userId, documents, isLoading: false, errorMessage: '' });
        },
        (error) => {
          if (active) setListState({ userId, documents: [], isLoading: false, errorMessage: error.message });
        },
      );
    }, 250);

    return () => {
      active = false;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [userId, refreshVersion]);

  async function handleDownload(item) {
    setDownloadError(null);
    try {
      await downloadDocument(item, userId);
    } catch (error) {
      setDownloadError({ userId, message: error.message });
    }
  }

  const isLoading = listState.userId !== userId || listState.isLoading;

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
      <h1>Document Management System</h1>

      <label>
        Usuário:{' '}
        <input value={userId} onChange={(event) => setUserId(event.target.value)} />
      </label>

      <section>
        <h2>Enviar documento</h2>
        <UploadComponent
          key={userId}
          userId={userId}
          onUploaded={() => setRefreshVersion((version) => version + 1)}
        />
      </section>

      <section>
        <h2>Meus documentos</h2>
        {downloadError?.userId === userId && <p role="alert">{downloadError.message}</p>}
        {isLoading ? (
          <p>Carregando documentos...</p>
        ) : listState.errorMessage ? (
          <p role="alert">{listState.errorMessage}</p>
        ) : (
          <DocumentList documents={listState.documents} onDownload={handleDownload} />
        )}
      </section>
    </main>
  );
}
