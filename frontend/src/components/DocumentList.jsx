export default function DocumentList({ documents, onDownload }) {
  if (documents.length === 0) {
    return <p>Nenhum documento enviado.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Nome</th>
          <th>Tamanho (bytes)</th>
          <th>Enviado em</th>
          <th>Ação</th>
        </tr>
      </thead>
      <tbody>
        {documents.map((item) => (
          <tr key={item.id}>
            <td>{item.originalName}</td>
            <td>{item.size}</td>
            <td>{new Date(item.uploadedAt).toLocaleString('pt-BR')}</td>
            <td>
              <button type="button" onClick={() => onDownload(item)}>
                Baixar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
