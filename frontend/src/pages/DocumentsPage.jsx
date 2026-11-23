import { useCallback, useEffect, useState } from 'react';
import DocumentList from '../components/DocumentList';
import UploadForm from '../components/UploadForm';
import { downloadDocument, listDocuments } from '../services/documentApi';

const DEFAULT_USER_ID = 'usuario-1';

export default function DocumentsPage() {
  const [userId, setUserId] = useState(DEFAULT_USER_ID);
  const [documents, setDocuments] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const loadDocuments = useCallback(async () => {
    try {
      setDocuments(await listDocuments(userId));
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.message);
    }
  }, [userId]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  async function handleDownload(item) {
    try {
      await downloadDocument(item, userId);
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
      <h1>Document Management System</h1>

      <label>
        Usuário:{' '}
        <input value={userId} onChange={(event) => setUserId(event.target.value)} />
      </label>

      <section>
        <h2>Enviar documento</h2>
        <UploadForm userId={userId} onUploaded={loadDocuments} />
      </section>

      <section>
        <h2>Meus documentos</h2>
        {errorMessage && <p role="alert">{errorMessage}</p>}
        <DocumentList documents={documents} onDownload={handleDownload} />
      </section>
    </main>
  );
}
