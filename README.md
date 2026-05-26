# El Kiosco CRM — Agente IA para Instagram

Sistema completo de atención al cliente con IA para El Kiosco Café Bar. Responde automáticamente mensajes de Instagram DM, gestiona reservas y muestra métricas en un CRM dashboard.

## Características

- **Agente IA** (Claude Sonnet 4.6) que responde DMs de Instagram en español
- **Reservas**: crear, consultar, modificar y cancelar por chat
- **Notificaciones**: email al restaurante cuando hay nueva reserva
- **CRM Dashboard**: métricas, conversaciones, reservas y clientes

---

## Stack Técnico

- Next.js 16 (App Router) + TypeScript
- Vercel Postgres + Drizzle ORM
- Claude API (`claude-sonnet-4-6`)
- Meta Graph API (Instagram Messaging)
- Resend (email)
- Tailwind CSS + Recharts

---

## Configuración paso a paso

### 1. Variables de entorno

Completar los valores en `.env.local`:

```env
DATABASE_URL=                    # Vercel Postgres connection string
ANTHROPIC_API_KEY=               # api.anthropic.com
INSTAGRAM_VERIFY_TOKEN=el_kiosco_verify_token_2024
INSTAGRAM_PAGE_ACCESS_TOKEN=     # Meta Developer > tu app
INSTAGRAM_BUSINESS_ACCOUNT_ID=   # ID cuenta Instagram Business
RESEND_API_KEY=                  # resend.com
RESTAURANT_EMAIL=info@elkiosco.pe
```

### 2. Base de datos

Con Vercel Postgres (recomendado):
1. Ir a [vercel.com](https://vercel.com) → Storage → Create Database → Postgres
2. Copiar el `DATABASE_URL` a `.env.local`
3. Ejecutar migraciones:

```bash
npm run db:push
```

### 3. Instagram / Meta — Configuración del Webhook

#### Requisitos previos
- Cuenta de Facebook con página asociada
- Cuenta de Instagram Business conectada a la página
- App de Meta Developer (developers.facebook.com)

#### Pasos

1. **Crear App en Meta Developer**
   - Ir a [developers.facebook.com](https://developers.facebook.com)
   - Crear nueva app → Business
   - Agregar producto: **Messenger** + **Instagram**

2. **Permisos necesarios** (solicitar en la app):
   - `instagram_manage_messages`
   - `pages_messaging`
   - `instagram_basic`

3. **Configurar Webhook**
   - En tu app de Meta: Webhooks → Instagram → Suscribir
   - **Callback URL**: `https://tu-dominio.vercel.app/api/webhook/instagram`
   - **Verify Token**: `el_kiosco_verify_token_2024`
   - **Campos a suscribir**: `messages`

4. **Obtener Page Access Token**
   - En Meta Developer → Tools → Graph API Explorer
   - Seleccionar tu app y página de Facebook
   - Solicitar token con permisos `instagram_manage_messages, pages_messaging`
   - Copiar el token a `INSTAGRAM_PAGE_ACCESS_TOKEN`

5. **INSTAGRAM_BUSINESS_ACCOUNT_ID**
   - En Graph API Explorer: `GET /me/accounts` → buscar tu página
   - `GET /{page-id}?fields=instagram_business_account`
   - El `id` del resultado es tu `INSTAGRAM_BUSINESS_ACCOUNT_ID`

### 4. Deploy en Vercel

```bash
npm i -g vercel
vercel
```

Agregar las variables de entorno en el dashboard de Vercel.

### 5. Desarrollo local

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

---

## Probar el webhook localmente

Usar [ngrok](https://ngrok.com) para exponer localhost:

```bash
ngrok http 3000
```

Usar la URL de ngrok como Callback URL en Meta Developer.

Simular mensaje entrante:

```bash
curl -X POST http://localhost:3000/api/webhook/instagram \
  -H "Content-Type: application/json" \
  -d '{
    "object": "instagram",
    "entry": [{
      "messaging": [{
        "sender": {"id": "TEST_USER_123"},
        "message": {"text": "Hola, quisiera hacer una reserva para el sábado"}
      }]
    }]
  }'
```

---

## Estructura del proyecto

```
el-kiosco-crm/
├── app/
│   ├── page.tsx                    # Dashboard principal
│   ├── conversations/              # Lista + detalle de conversaciones
│   ├── reservations/               # Gestión de reservas
│   ├── customers/                  # Perfiles de clientes
│   └── api/
│       ├── webhook/instagram/      # Endpoint webhook Meta
│       ├── conversations/          # CRUD conversaciones
│       ├── reservations/           # CRUD reservas
│       ├── customers/              # Lista clientes
│       └── metrics/                # Datos para dashboard
├── lib/
│   ├── agent.ts                    # Agente Claude con tools
│   ├── instagram.ts                # Meta Graph API client
│   ├── notifications.ts            # Emails con Resend
│   ├── constants.ts                # Info del restaurante + prompt
│   └── db/                         # Drizzle schema + conexión
└── components/
    ├── Sidebar.tsx
    ├── dashboard/
    ├── conversations/
    ├── reservations/
    └── CustomersClient.tsx
```

---

## Capacidad de reservas

Por defecto: **30 personas máximo por franja horaria**.
Cambiar en `lib/constants.ts` → `RESTAURANT_INFO.capacity.maxPerSlot`.

---

## Flujo del agente

```
DM de Instagram
    → Webhook POST /api/webhook/instagram
    → Buscar/crear cliente en DB
    → Cargar historial de conversación (últimos 20 mensajes)
    → Claude con tools: check_availability, create_reservation,
                        get_reservation, modify_reservation, cancel_reservation
    → Guardar respuesta en DB
    → Enviar respuesta via Instagram Graph API
    → Si reserva creada: email al restaurante (Resend)
```
