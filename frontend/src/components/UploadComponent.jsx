import { useState } from 'react';
import { uploadDocument } from '../services/documentApi';

export default function UploadComponent({ userId, onUploaded }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;

    if (!selectedFile) {
      setErrorMessage('Selecione um arquivo antes de enviar.');
      return;
    }

    if (!userId.trim()) {
      setErrorMessage('Informe o usuário antes de enviar.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await uploadDocument(selectedFile, userId);
      setSelectedFile(null);
      form.reset();
      onUploaded();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Arquivo:{' '}
        <input
          type="file"
          disabled={isSubmitting}
          onChange={(event) => setSelectedFile(event.target.files[0] ?? null)}
        />
      </label>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Enviando...' : 'Enviar documento'}
      </button>
      {errorMessage && <p role="alert">{errorMessage}</p>}
    </form>
  );
}