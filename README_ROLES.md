Perfecto. Este es el paso correcto — si haces bien esto, todo lo demás se vuelve mucho más fácil y seguro.

Te voy a dejar un **sistema completo de roles (RBAC)** listo para copiar en **Next.js + Supabase**, nivel producción 👇

---

# 🧠 🏗️ Arquitectura que vamos a implementar

* Supabase Auth (login)
* Tabla `profiles` + `roles`
* Row Level Security (RLS)
* Middleware en Next.js
* Helpers para usar roles en frontend

---

# 1️⃣ 🗄️ Base de datos (Supabase)

## 🔹 Tabla `profiles`

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text default 'user', -- user | operator | admin
  created_at timestamp default now()
);
```

---

## 🔹 Trigger automático al crear usuario

```sql
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user');
  return new;
end;
$$ language plpgsql;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
```

---

## 🔹 Promoverte a admin

```sql
update profiles
set role = 'admin'
where email = 'pash.mx@gmail.com';
```

---

# 2️⃣ 🔐 Row Level Security (RLS)

## Activar RLS

```sql
alter table profiles enable row level security;
```

---

## 🔹 Policy: usuario ve su perfil

```sql
create policy "Users can view their own profile"
on profiles
for select
using (auth.uid() = id);
```

---

## 🔹 Policy: admin ve todo

```sql
create policy "Admin can view all profiles"
on profiles
for select
using (
  exists (
    select 1 from profiles
    where id = auth.uid()
    and role = 'admin'
  )
);
```

---

👉 Después puedes replicar este patrón para:

* `claims`
* `documents`
* `logs`

---

# 3️⃣ ⚙️ Cliente Supabase (Next.js)

## `/lib/supabaseClient.ts`

```ts
import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

---

# 4️⃣ 🧠 Helper para obtener rol

## `/lib/getUserRole.ts`

```ts
import { supabase } from './supabaseClient'

export async function getUserRole() {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (error) throw error

  return data.role
}
```

---

# 5️⃣ 🧩 Hook React

## `/hooks/useUserRole.ts`

```ts
import { useEffect, useState } from 'react'
import { getUserRole } from '@/lib/getUserRole'

export function useUserRole() {
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getUserRole()
      .then(setRole)
      .finally(() => setLoading(false))
  }, [])

  return { role, loading }
}
```

---

# 6️⃣ 🧭 Middleware (PROTECCIÓN REAL)

## `/middleware.ts`

```ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (key) => req.cookies.get(key)?.value,
        set: (key, value, options) => {
          res.cookies.set(key, value, options)
        },
        remove: (key, options) => {
          res.cookies.set(key, '', options)
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = req.nextUrl.pathname

  // 🔐 Rutas protegidas
  if (pathname.startsWith('/admin')) {
    if (!user) return NextResponse.redirect(new URL('/login', req.url))

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
  }

  return res
}
```

---

# 7️⃣ 🧠 UI condicional (Sidebar)

```tsx
const { role } = useUserRole()

{role === 'admin' && (
  <>
    <MenuItem label="Logs" />
    <MenuItem label="Agentes" />
    <MenuItem label="Ejecutar corrección" />
  </>
)}
```

---

# 8️⃣ 🧪 Protección de botones críticos

```tsx
if (role !== 'admin') return null
```

---

# 9️⃣ 🚨 Botón Auto-Fix (ejemplo seguro)

```tsx
const handleFix = async () => {
  if (role !== 'admin') return alert('No autorizado')

  await fetch('/api/auto-fix', { method: 'POST' })
}
```

---

# 🔟 🧠 Bonus PRO (te recomiendo hacerlo después)

* Cachear rol en JWT (más rápido)
* Multi-tenant (empresa_id)
* Feature flags por rol

---

# 🚀 Resultado final

Con esto ya tienes:

✅ Seguridad real (no solo UI)
✅ Escalabilidad
✅ Base para SaaS
✅ Control total como admin
✅ Usuarios limitados correctamente

---

# 💡 Insight clave

> Esto convierte tu proyecto de “app” a “plataforma segura”

---


