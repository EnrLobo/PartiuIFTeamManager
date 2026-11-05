# Partiu IF - Gestão de Equipe

Sistema web para gerir a equipe de bolsistas do projeto **Partiu IF**, substituindo o controle manual feito em planilhas do Google Sheets.

## Tecnologias

| Parte                         | Ferramenta                                       |
| ----------------------------- | ------------------------------------------------ |
| Front-end                     | Next.js (App Router) + TypeScript + Tailwind CSS |
| Banco de dados e login        | Supabase (PostgreSQL com Row Level Security)     |
| Hospedagem                    | Vercel                                           |
| Relatórios e dados auxiliares | Google Sheets                                    |

## Como rodar no seu computador

Pré-requisito: Node.js 20 ou superior.

```bash
# 1. Instalar as dependências
npm install

# 2. Criar seu arquivo de variáveis de ambiente
cp .env.example .env.local
# (preencha o .env.local com os valores do Supabase quando o projeto existir)

# 3. Iniciar o servidor de desenvolvimento
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Comandos úteis

- `npm run dev`: servidor de desenvolvimento
- `npm run build`: gera a versão de produção (também serve para achar erros)
- `npm run lint`: verifica problemas no código
- `npm run format`: formata o código automaticamente (Prettier)

## Organização das pastas

```
src/
  app/          Páginas e rotas (Next.js App Router)
  components/   Componentes visuais reutilizáveis
  lib/          Funções de apoio (ex.: conexão com o Supabase)
supabase/
  migrations/   Migrações SQL versionadas do banco de dados
```

## Cores do projeto

Definidas em `src/app/globals.css` e usadas no Tailwind (`bg-brand`, `bg-success`, `bg-danger`, `text-ink`):

| Nome       | Cor       | Uso                           |
| ---------- | --------- | ----------------------------- |
| brand      | `#f27405` | Cor principal, botões         |
| background | `#fafcfd` | Fundo das páginas             |
| success    | `#359830` | Sucesso (ex.: termo assinado) |
| danger     | `#c90c0f` | Alertas e desligamentos       |
| ink        | `#000000` | Textos                        |

Dica de acessibilidade: sobre o laranja use texto preto, pois o branco não tem contraste suficiente.

## Padrão de commits

Mensagens no formato `tipo: descrição`, por exemplo:

- `feat: adiciona tela de login`
- `fix: corrige filtro por campus`
- `docs: atualiza README`
- `chore: atualiza dependências`

A branch principal é a `main`.

## Segurança e LGPD

- Nunca versionar chaves ou senhas. Use `.env.local` (ignorado pelo Git); o modelo fica em `.env.example`.
- Dados pessoais dos bolsistas (CPF, contatos, dados bancários) ficam protegidos por perfil de acesso, com RLS no banco.
