
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  tags text[] default '{}',
  image_url text,
  link_url text,
  position int default 0,
  created_at timestamptz default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz default now()
);

alter table projects enable row level security;
alter table messages enable row level security;

-- Everyone can read projects. Only the owner account can change them.
create policy "public read projects" on projects for select using (true);
create policy "owner insert projects" on projects for insert to authenticated
  with check (auth.jwt() ->> 'email' = 'ankitdev880@gmail.com');
create policy "owner update projects" on projects for update to authenticated
  using (auth.jwt() ->> 'email' = 'ankitdev880@gmail.com');
create policy "owner delete projects" on projects for delete to authenticated
  using (auth.jwt() ->> 'email' = 'ankitdev880@gmail.com');

-- Visitors can send messages. Only the owner account can read them.
create policy "anyone sends message" on messages for insert to anon, authenticated
  with check (true);
create policy "owner reads messages" on messages for select to authenticated
  using (auth.jwt() ->> 'email' = 'ankitdev880@gmail.com');

-- First project
insert into projects (title, description, tags, image_url, link_url, position)
values ('Portfolio Website',
        'My personal portfolio website with smooth animations and modern UI.',
        array['HTML','CSS','JavaScript'],
        'assets/project-portfolio.png',
        'https://ankitdeo.com.np', 1);
