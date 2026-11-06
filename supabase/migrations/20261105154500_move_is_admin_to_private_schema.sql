-- =====================================================================
-- Migração 2: move is_admin() para o schema interno "private"
--
-- Motivo: funções em "public" ficam expostas na API REST do Supabase
-- (/rest/v1/rpc/...). O schema "private" não é exposto, então o alerta
-- de segurança some. As políticas de RLS continuam funcionando.
-- =====================================================================

-- Schema interno: não é exposto pela API REST do Supabase (só "public" é).
create schema if not exists private;
grant usage on schema private to authenticated;

create function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
      and status = 'ativo'
  );
$$;

revoke execute on function private.is_admin() from public, anon;
grant  execute on function private.is_admin() to authenticated;

-- Recria as políticas apontando para a nova função.
drop policy "Admin lê todos os perfis" on public.profiles;
drop policy "Admin altera perfis" on public.profiles;

create policy "Admin lê todos os perfis"
  on public.profiles for select
  to authenticated
  using ((select private.is_admin()));

create policy "Admin altera perfis"
  on public.profiles for update
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

-- A função antiga em "public" não é mais usada.
drop function public.is_admin();
