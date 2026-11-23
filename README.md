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
| `DMS_MAX_STORAGE_SIZE` | `1073741824` | Tamanho máximo total do diretório de arquivos, em bytes |

As rotas `POST /upload`, `GET /documents` e
`GET /documents/:id/download` exigem o cabeçalho `X-User-Id`. O upload recebe
um arquivo no campo `file` de um formulário `multipart/form-data`. A rota
`GET /health` verifica a disponibilidade do servidor.

O upload aceita somente o arquivo `file`, limita o tamanho individual e aplica
uma quota total ao diretório. Atingir a quota retorna HTTP 507. Os nomes
gravados são UUIDs; o nome enviado pelo usuário é mantido apenas como metadado.
O tipo MIME informado pelo cliente é tratado como declaratório, não como prova
do conteúdo. Downloads são enviados como anexo com o header
`X-Content-Type-Options: nosniff`.

Os arquivos permanecem no disco, mas seus metadados são mantidos apenas em
memória e são perdidos ao reiniciar o servidor. O cabeçalho `X-User-Id` não é
autenticação e pode ser falsificado; qualquer pessoa com acesso ao serviço pode
se passar por outro usuário. Esta identificação é apenas didática, e o sistema
não deve ser exposto como serviço multiusuário real. Arquivos sem metadados após
reinicialização continuam ocupando espaço e contando para a quota; não há
limpeza automática nesta fase.

---

## Frontend

Com o backend em execução, instale as dependências e inicie o frontend:

```sh
cd frontend
npm install
npm run dev
```

Acesse o endereço informado pelo Vite. O proxy encaminha requisições `/api`
para o backend na porta 3000. Em produção, configure proxy equivalente para
remover `/api` antes de encaminhar as chamadas, ou altere o backend para montar
as rotas com esse prefixo. Informe um usuário para enviar, listar e baixar seus
documentos.

---

&copy; 2025 GitHub &bull; [Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/code_of_conduct.md) &bull; [MIT License](https://gh.io/mit)

