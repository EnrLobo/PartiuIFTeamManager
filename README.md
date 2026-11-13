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
| brand      | `#f27405` | Laranja da logo: faixas, barras, detalhes |
| brand-strong | `#c25100` | Botões (texto branco, contraste 4,7:1) |
| progress   | `#8c8c8c` | Cinza de "em andamento" nos gráficos |
| background | `#fafcfd` | Fundo das páginas             |
| success    | `#359830` | Sucesso (ex.: termo assinado) |
| danger     | `#c90c0f` | Alertas e desligamentos       |
| ink        | `#000000` | Textos                        |

Dica de acessibilidade: o laranja puro da logo é só para detalhes e gráficos. Em botões use `brand-strong` com texto branco. A tela `/graficos` mostra números agregados (sem dados pessoais) e cada gráfico tem versão em tabela.

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

## Login, perfis e aprovação de contas

- Qualquer pessoa pode se cadastrar em `/cadastro`, mas a conta nasce **pendente**: sem acesso a nenhum dado.
- Um **administrador** aprova a conta em `/usuarios`, define o perfil (administrador, coordenador de gestão, coordenador pedagógico, apoio administrativo ou apoio de secretaria) e pode bloquear acessos.
- Só o administrador altera dados; os demais perfis apenas leem informações não sensíveis.
- A segurança tem três camadas: o `proxy.ts` (porta de entrada), as funções de `src/lib/auth.ts` (checagem em cada página e ação) e a RLS do banco (a trava final).

### Primeiro administrador

Como toda conta nasce pendente, o primeiro administrador é promovido uma única vez direto no banco (SQL Editor do Supabase), depois de criar a conta pelo `/cadastro`:

```sql
update public.profiles
set role = 'admin', status = 'ativo'
where email = 'email-do-primeiro-admin@exemplo.com';
```

### Configurar no painel do Supabase

Em **Authentication > URL Configuration**, cadastre em _Redirect URLs_ o endereço do site (`http://localhost:3000/**` para testes e a URL da Vercel em produção). Sem isso, o link do e-mail de confirmação não funciona.
