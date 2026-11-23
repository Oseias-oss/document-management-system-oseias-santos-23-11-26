# Especificação - Document Management System (DMS)

## 1. Objetivo

Oferecer um sistema web simples para enviar, listar e baixar documentos, com armazenamento local e gestão básica por usuário.

## 2. Escopo

### Dentro do escopo

- Upload de documentos
- Listagem de documentos do usuário
- Download de documentos pelo identificador
- Gestão simples por usuário (cada documento pertence a um dono)

### Fora do escopo

- Armazenamento externo ou em nuvem
- Versionamento de documentos
- Autenticação completa (login, senha, tokens)
- Persistência de metadados em banco de dados
- Edição, exclusão ou compartilhamento de documentos

## 3. Requisitos funcionais

| ID    | Requisito                                                                                    |
| ----- | -------------------------------------------------------------------------------------------- |
| RF-01 | O usuário pode enviar um documento informando o arquivo no campo `file`                      |
| RF-02 | O sistema registra o dono do documento a partir do cabeçalho `X-User-Id`                     |
| RF-03 | O usuário pode listar apenas os documentos de sua propriedade                                |
| RF-04 | O usuário pode baixar um documento pelo identificador, somente se for o dono                 |
| RF-05 | O sistema recusa uploads sem arquivo ou sem `X-User-Id` com mensagem clara em português      |
| RF-06 | O sistema recusa arquivos acima do tamanho máximo configurado                                |
| RF-07 | Ao baixar, o sistema devolve o nome original do arquivo em `Content-Disposition`             |
| RF-08 | O frontend exibe formulário de upload, lista de documentos e ação de download                |

## 4. Requisitos não funcionais

| ID      | Requisito                                                                                          |
| ------- | -------------------------------------------------------------------------------------------------- |
| RNF-01  | Arquivos gravados no filesystem local via `multer` com `diskStorage`, na pasta `backend/storage`   |
| RNF-02  | Metadados mantidos em memória nesta fase (perdidos ao reiniciar o servidor)                        |
| RNF-03  | Configuração via variáveis de ambiente (12-Factor)                                                 |
| RNF-04  | Backend em CommonJS com Express 5 e `node:test` para testes                                        |
| RNF-05  | Frontend em React + Vite (ESM), comunicando-se via `fetch` com prefixo `/api`                      |
| RNF-06  | Nomes de símbolos em inglês; mensagens ao usuário e comentários em português                       |
| RNF-07  | Dependências limitadas às já presentes em `package.json` (`express`, `multer`)                     |
| RNF-08  | Erros tratados nos limites do sistema (entrada HTTP, leitura e escrita de arquivos)                |

## 5. Modelo de dados (metadados do documento)

| Campo        | Tipo   | Descrição                                                         |
| ------------ | ------ | ----------------------------------------------------------------- |
| id           | string | Identificador único do documento (UUID)                           |
| originalName | string | Nome original do arquivo enviado                                  |
| storedName   | string | Nome do arquivo gravado em `storage` (uso interno, não exposto)   |
| mimeType     | string | Tipo MIME informado no upload                                     |
| size         | number | Tamanho em bytes                                                  |
| uploadedAt   | string | Data/hora do upload (ISO 8601)                                    |
| owner        | string | Identificador do usuário dono (valor do cabeçalho `X-User-Id`)    |

Os metadados ficam em um `Map` no repositório, indexado por `id`.

## 6. Contratos de API

Cabeçalho obrigatório em todas as rotas de documentos:

- `X-User-Id: <string não vazia>`

No frontend, as chamadas usam o prefixo `/api` (proxy do Vite remove o prefixo).

### POST /upload

- Entrada: `multipart/form-data` com campo `file`
- Sucesso: `201 Created`

```json
{
  "id": "3f2c9a1e-6b1d-4c7e-9a52-1d0f8e7b2c11",
  "originalName": "contrato.pdf",
  "mimeType": "application/pdf",
  "size": 48213,
  "uploadedAt": "2026-11-23T14:03:21.000Z",
  "owner": "user-42"
}
```

- Erros:
  - `400` - arquivo ausente ou cabeçalho `X-User-Id` ausente
  - `413` - arquivo acima do limite configurado

### GET /documents

- Entrada: cabeçalho `X-User-Id`
- Sucesso: `200 OK` com array de metadados dos documentos do usuário (sem `storedName`); lista vazia retorna `[]`
- Erros: `400` - cabeçalho `X-User-Id` ausente

### GET /documents/:id/download

- Entrada: parâmetro `id`, cabeçalho `X-User-Id`
- Sucesso: `200 OK`, corpo binário, com:
  - `Content-Type` igual ao `mimeType` salvo
  - `Content-Disposition: attachment; filename="<originalName>"`
- Erros:
  - `400` - cabeçalho `X-User-Id` ausente
  - `403` - documento pertence a outro usuário
  - `404` - documento inexistente ou arquivo ausente no disco

### Formato de erro

```json
{ "error": "Mensagem em português descrevendo o problema" }
```

### GET /health

- Sucesso: `200 OK` com `{ "status": "ok" }`

## 7. Configuração (variáveis de ambiente)

| Variável          | Padrão            | Descrição                            |
| ----------------- | ----------------- | ------------------------------------ |
| PORT              | 3000              | Porta do servidor HTTP               |
| DMS_STORAGE_DIR   | `backend/storage` | Pasta de gravação dos arquivos       |
| DMS_MAX_FILE_SIZE | 10485760 (10 MB)  | Tamanho máximo do arquivo, em bytes  |

## 8. Decisões arquiteturais

### Estrutura do backend (Clean Architecture simples)

Fluxo de dependência: `routes -> controllers -> services -> repositories`.

| Camada         | Responsabilidade                                                     | Arquivos                                                   |
| -------------- | -------------------------------------------------------------------- | ---------------------------------------------------------- |
| routes/        | Define endpoints e delega aos controllers                            | `routes/documentRoutes.js`                                 |
| controllers/   | Entrada/saída HTTP, validação básica, mapeamento de erros            | `controllers/documentController.js`, `controllers/errorController.js` |
| services/      | Regras de negócio (dono, autorização, montagem de metadados)         | `services/documentService.js`                              |
| repositories/  | Persistência de metadados (`Map`) e caminhos dos arquivos            | `repositories/documentRepository.js`                       |
| config/        | Variáveis de ambiente e configuração do `multer` (`diskStorage`)     | `config/env.js`, `config/upload.js`                        |
| errors/        | Erro HTTP com status                                                 | `errors/HttpError.js`                                      |

### Frontend (componentes)

- `pages/DocumentsPage.jsx` - página principal
- `components/UploadForm.jsx` - formulário de envio
- `components/DocumentList.jsx` - tabela de documentos com botão de download
- `services/documentApi.js` - chamadas `fetch` para `/api/upload`, `/api/documents` e `/api/documents/:id/download`
- `App.jsx` renderiza `DocumentsPage`

### Identificação do usuário

- Nesta fase, o usuário é identificado pelo cabeçalho `X-User-Id`, informado no frontend em um campo de entrada.
- Não há validação de credenciais. Esta escolha é adequada apenas ao escopo didático.

### Armazenamento

- Arquivos em `DMS_STORAGE_DIR`, com nome gerado (UUID + extensão), evitando colisões e path traversal.
- A pasta é criada na inicialização, se não existir.

## 9. Riscos e mitigações

| Risco                                         | Mitigação                                                         |
| --------------------------------------------- | ----------------------------------------------------------------- |
| Perda de metadados ao reiniciar o servidor    | Aceito nesta fase (RNF-02); documentar no README                  |
| Arquivos órfãos no disco após falha           | Remover o arquivo gravado quando a criação do metadado falhar     |
| Upload excessivo consumir disco               | Limite `DMS_MAX_FILE_SIZE` com resposta `413`                     |
| Nome de arquivo malicioso (path traversal)    | Gravar com nome gerado; `originalName` usado apenas como metadado |
| Acesso a documentos de outros usuários        | Checagem de dono no service antes do download (`403`)             |
| Falsificação de `X-User-Id`                   | Aceito nesta fase; autenticação real fica fora do escopo          |

## 10. Plano de execução

Cada etapa deve ser concluída e testada antes da seguinte.

1. **Configuração e esqueleto**: `config/env.js`; `GET /health` continua funcionando.
2. **Repositório de documentos**: `repositories/documentRepository.js` e `config/upload.js` (pasta de storage, `diskStorage`).
3. **Serviço de documentos**: `services/documentService.js` (criação, listagem por dono, verificação de dono no download).
4. **Controller, rotas e tratamento de erros**: `controllers/documentController.js`, `controllers/errorController.js`, `routes/documentRoutes.js`, integração em `app.js`.
5. **Testes de API**: `backend/test/documents.test.js`, executados com `npm test`.
6. **Seed do frontend**: `services/documentApi.js`, `pages/DocumentsPage.jsx`, `App.jsx`.
7. **Componentes de upload e listagem**: `components/UploadForm.jsx`, `components/DocumentList.jsx`.
8. **Integração**: proxy `/api` em `frontend/vite.config.js` e fluxo ponta a ponta.
9. **Documentação de execução**: `README.md` com variáveis de ambiente, comandos e limitações da fase.

## 11. Critérios de aceite gerais

- Requisitos RF-01 a RF-08 e RNF-01 a RNF-08 atendidos.
- Nenhum provedor externo de armazenamento.
- `npm test` no backend passa.
