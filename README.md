# Document Management System com GitHub Copilot

<img src="https://octodex.github.com/images/Professortocat_v2.png" align="right" height="200px" />

Hey Oseias-oss!

Mona here. I'm done preparing your exercise. Hope you enjoy! 💚

Remember, it's self-paced so feel free to take a break! ☕️

[![](https://img.shields.io/badge/Go%20to%20Exercise-%E2%86%92-1f883d?style=for-the-badge&logo=github&labelColor=197935)](https://github.com/Oseias-oss/document-management-system-oseias-santos-23-11-26/issues/1)

---

## Backend

Na pasta `backend`, instale as dependências e inicie o servidor:

```sh
npm install
npm start
```

Para executar os testes, use `npm test` na mesma pasta. O servidor usa a porta
3000 por padrão e aceita as seguintes variáveis de ambiente:

| Variável | Padrão | Descrição |
| --- | --- | --- |
| `PORT` | `3000` | Porta HTTP do servidor |
| `DMS_STORAGE_DIR` | `backend/storage` | Diretório local dos arquivos enviados |
| `DMS_MAX_FILE_SIZE` | `10485760` | Tamanho máximo de cada arquivo, em bytes |

As rotas `POST /upload`, `GET /documents` e
`GET /documents/:id/download` exigem o cabeçalho `X-User-Id`. O upload recebe
um arquivo no campo `file` de um formulário `multipart/form-data`. A rota
`GET /health` verifica a disponibilidade do servidor.

Os arquivos permanecem no disco, mas seus metadados são mantidos apenas em
memória e são perdidos ao reiniciar o servidor. O cabeçalho `X-User-Id` não é
autenticação e pode ser falsificado; esta identificação é apenas didática.

---

&copy; 2025 GitHub &bull; [Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/code_of_conduct.md) &bull; [MIT License](https://gh.io/mit)

