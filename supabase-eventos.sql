create table if not exists public.eventos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  tema text default '',
  cliente text not null,
  cliente_documento text default '',
  cliente_telefone text default '',
  cliente_endereco text default '',
  contratada_nome text default '',
  contratada_documento text default '',
  contratada_telefone text default '',
  data date not null,
  horario time,
  local text not null,
  convidados integer not null default 0,
  valor numeric(12, 2) not null default 0,
  sinal numeric(12, 2) not null default 0,
  data_sinal date,
  forma_pagamento text default '',
  chave_pix text default '',
  nome_pix text default '',
  status text not null default 'Pendente' check (status in ('Pendente', 'Confirmado', 'Cancelado')),
  observacoes text default '',
  itens jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.eventos
  add column if not exists tema text default '',
  add column if not exists cliente_documento text default '',
  add column if not exists cliente_telefone text default '',
  add column if not exists cliente_endereco text default '',
  add column if not exists contratada_nome text default '',
  add column if not exists contratada_documento text default '',
  add column if not exists contratada_telefone text default '',
  add column if not exists sinal numeric(12, 2) not null default 0,
  add column if not exists data_sinal date,
  add column if not exists forma_pagamento text default '',
  add column if not exists chave_pix text default '',
  add column if not exists nome_pix text default '',
  add column if not exists itens jsonb not null default '[]'::jsonb;

alter table public.eventos enable row level security;

drop policy if exists "Usuarios podem ver seus eventos" on public.eventos;
drop policy if exists "Usuarios podem criar seus eventos" on public.eventos;
drop policy if exists "Usuarios podem editar seus eventos" on public.eventos;
drop policy if exists "Usuarios podem excluir seus eventos" on public.eventos;

create policy "Usuarios podem ver seus eventos"
on public.eventos
for select
to authenticated
using (auth.uid() = user_id);

create policy "Usuarios podem criar seus eventos"
on public.eventos
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Usuarios podem editar seus eventos"
on public.eventos
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Usuarios podem excluir seus eventos"
on public.eventos
for delete
to authenticated
using (auth.uid() = user_id);

create index if not exists eventos_user_id_data_idx
on public.eventos (user_id, data);

create table if not exists public.itens_catalogo (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  unidade text not null default 'un',
  observacao text default '',
  created_at timestamptz not null default now()
);

alter table public.itens_catalogo enable row level security;

drop policy if exists "Usuarios podem ver seus itens" on public.itens_catalogo;
drop policy if exists "Usuarios podem criar seus itens" on public.itens_catalogo;
drop policy if exists "Usuarios podem editar seus itens" on public.itens_catalogo;
drop policy if exists "Usuarios podem excluir seus itens" on public.itens_catalogo;

create policy "Usuarios podem ver seus itens"
on public.itens_catalogo
for select
to authenticated
using (auth.uid() = user_id);

create policy "Usuarios podem criar seus itens"
on public.itens_catalogo
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Usuarios podem editar seus itens"
on public.itens_catalogo
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Usuarios podem excluir seus itens"
on public.itens_catalogo
for delete
to authenticated
using (auth.uid() = user_id);

create index if not exists itens_catalogo_user_id_nome_idx
on public.itens_catalogo (user_id, nome);

create table if not exists public.custos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  evento_id uuid references public.eventos(id) on delete set null,
  descricao text not null,
  valor numeric(12, 2) not null default 0,
  data date not null default current_date,
  observacao text default '',
  created_at timestamptz not null default now()
);

alter table public.custos enable row level security;

drop policy if exists "Usuarios podem ver seus custos" on public.custos;
drop policy if exists "Usuarios podem criar seus custos" on public.custos;
drop policy if exists "Usuarios podem editar seus custos" on public.custos;
drop policy if exists "Usuarios podem excluir seus custos" on public.custos;

create policy "Usuarios podem ver seus custos"
on public.custos
for select
to authenticated
using (auth.uid() = user_id);

create policy "Usuarios podem criar seus custos"
on public.custos
for insert
to authenticated
with check (
  auth.uid() = user_id
  and (
    evento_id is null
    or exists (
      select 1
      from public.eventos
      where eventos.id = custos.evento_id
        and eventos.user_id = auth.uid()
    )
  )
);

create policy "Usuarios podem editar seus custos"
on public.custos
for update
to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and (
    evento_id is null
    or exists (
      select 1
      from public.eventos
      where eventos.id = custos.evento_id
        and eventos.user_id = auth.uid()
    )
  )
);

create policy "Usuarios podem excluir seus custos"
on public.custos
for delete
to authenticated
using (auth.uid() = user_id);

create index if not exists custos_user_id_data_idx
on public.custos (user_id, data);

create index if not exists custos_user_id_evento_id_idx
on public.custos (user_id, evento_id);

notify pgrst, 'reload schema';
