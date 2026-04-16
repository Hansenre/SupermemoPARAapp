# SuperMemo PARA App

App proprio para revisao espacada (3/10/30/60) com organizacao PARA (Projects, Areas, Resources, Archives).

## O que o app faz

- Cadastro de resumos (upload de arquivo ou texto)
- Definicao de destino no PARA com:
  - categoria (Projects/Areas/Resources/Inbox)
  - subpasta opcional
  - nome do arquivo opcional
- Organizacao automatica no cofre `KnowledgeOSVault` em pastas PARA
- Fila de revisao diaria
- Pop-up de revisao para itens vencidos
- Explorador PARA para navegar nas pastas e editar arquivos `.md/.txt`
- Reagendamento conforme desempenho:
  - `Lembrei bem`: avanca no ciclo
  - `Parcial`: revisa novamente em 2 dias
  - `Esqueci`: reinicia no D+3
- Arquivamento de resumos

## Estrutura gerada

- `KnowledgeOSVault/Inbox`
- `KnowledgeOSVault/Projects`
- `KnowledgeOSVault/Areas`
- `KnowledgeOSVault/Resources`
- `KnowledgeOSVault/Archives`

## Como rodar

1. No terminal, entre na pasta do app:
   - `cd C:\Users\Rafael\OneDrive\Documentos\Playground\SuperMemoPARAApp`
2. Instale dependencias:
   - `npm install`
3. Crie/garanta as pastas PARA:
   - `npm run setup:folders`
4. Inicie o app:
   - `npm start`
5. Abra no navegador:
   - `http://localhost:5050`

## Banco de dados

- SQLite em `data/app.db`
- Tabelas:
  - `summaries`
  - `reviews`

## Observacoes

- O app salva arquivos de resumo dentro de `KnowledgeOSVault`.
- Para uso multi-dispositivo, voce pode sincronizar essa pasta via OneDrive/Dropbox.
