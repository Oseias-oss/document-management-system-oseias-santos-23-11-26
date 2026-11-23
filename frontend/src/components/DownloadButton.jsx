export default function DownloadButton({ document, onDownload }) {
  return (
    <button type="button" onClick={() => onDownload(document)}>
      Baixar
    </button>
  );
}