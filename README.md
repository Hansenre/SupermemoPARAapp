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
- Gestao completa no Explorador PARA:
  - criar subpasta
  - adicionar novo arquivo na pasta atual
  - substituir arquivo existente (mesmo nome)
  - excluir arquivo
  - excluir pasta vazia
- Seletor de pastas salvas no Explorador:
  - ao trocar categoria PARA, o app lista automaticamente as pastas ja criadas
  - permite abrir rapidamente uma pasta existente sem digitar caminho manual
- Interface renovada com layout moderno e foco em usabilidade
- Fluxo de revisao com tecnicas de memorizacao:
  - Active Recall (recordar antes de abrir o material)
  - Metacognicao (registrar nivel de confianca)
  - Feedback imediato (comparar e classificar)
  - Flashcards dentro do pop-up de revisao
  - Loci (Palacio da Memoria) por resumo, com cue no momento da revisao
- Algoritmo adaptativo de espacamento:
  - Ajusta o proximo intervalo usando historico de desempenho por resumo
  - Considera confianca e calibracao metacognitiva
- Deteccao de ilusao de competencia:
  - Quando ha confianca alta + erro, gera alerta metacognitivo
  - Alerta aparece no painel e pode ser resolvido
- Meta semanal automatica por carga cognitiva:
  - Calcula alvo semanal e diario considerando backlog, taxa de erro e esforco de recall
  - Exibe status no dashboard (progresso e nivel de carga)
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

## App Windows (Tauri)

### Pre-requisitos

- Node.js instalado
- Rust (cargo) instalado
- Ferramentas de build do Tauri para Windows

### Rodar em modo desktop (dev)

1. Instale dependencias npm:
   - `npm install`
2. Inicie o app desktop:
   - `npm run tauri:dev`

### Gerar instalador Windows

1. Execute:
   - `npm run tauri:build`

Observacoes:
- O launcher Tauri inicia o `server.js` internamente.
- Dados do app (banco/vault) sao gravados na pasta de dados do usuario no Windows.
- O runtime Node precisa estar instalado na maquina para o launcher executar o servidor local.
