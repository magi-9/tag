# Tag Game - Django + React PWA

Kompletná mobilná PWA aplikácia pre Tag Game s Django backendom, React frontendom, real-time WebSocket komunikáciou a push notifikáciami.

## 🎮 Funkcie

### Pre hráčov:
- 📱 **Mobile-first PWA** - Inštalovateľná na iOS/Android
- 🔔 **Push notifikácie** - Okamžité notifikácie o nových tagoch
- 🏆 **Live leaderboard** - Real-time rebríček s bodmi
- 🎯 **Tag system** - Jednoduché tagnutie hráčov s fotkami
- 📊 **Štatistiky** - Detailné štatistiky hráčov
- 🏅 **Achievements** - Špeciálne ocenenia
- ⏱️ **Countdown** - Odpočítavanie do konca hry

### Pre administrátora:
- ⚙️ **Kompletné nastavenia** - Všetky parametre hry konfigurovateľné
- 👥 **Správa používateľov** - Schvaľovanie nových hráčov
- 📢 **Notifikácie** - Posielanie custom notifikácií
- 🎲 **Bodovací systém** - Nastaviteľné body, penalizácie, bonusy
- 🎁 **Ceny** - Konfigurovateľné výhry a antivýhry
- 📅 **Časové obdobie** - Nastavenie začiatku a konca hry

## 🚀 Rýchly štart s Dockerom

### Predpoklady:
- Docker & Docker Compose nainštalované
- Git

### Spustenie:

```bash
# 1. Klonuj projekt (alebo už máš súbory)
cd /home/tomas-magula/Documents/Tests/tag

# 2. Vytvor .env súbory
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Uprav .env súbory (aspoň ADMIN_USERNAME a ADMIN_PASSWORD v backend/.env)

# 4. Spusti všetko
docker-compose up -d

# 5. Vytvor admin usera
docker-compose exec backend python manage.py createsuperuser

# 6. Generuj VAPID klúče pre push notifikácie
docker-compose exec backend python manage.py shell -c "
from pywebpush import webpush
import base64
vapid_keys = webpush.generate_vapid_keys()
print('VAPID_PUBLIC_KEY=' + vapid_keys['public_key'])
print('VAPID_PRIVATE_KEY=' + vapid_keys['private_key'])
"

# 7. Pridaj VAPID klúče do backend/.env a frontend/.env

# 8. Reštartuj
docker-compose restart
```

### Prístup:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api
- **Django Admin**: http://localhost:8000/admin

## 📱 Manuálna inštalácia

### Backend (Django):

```bash
cd backend

# Vytvor virtuálne prostredie
python -m venv venv
source venv/bin/activate  # Linux/Mac
# alebo
venv\Scripts\activate  # Windows

# Inštaluj dependencies
pip install -r requirements.txt

# Vytvor .env súbor
cp .env.example .env
# Uprav .env (databáza, admin credentials, atď.)

# Spusti migrácie
python manage.py migrate

# Vytvor admin usera
python manage.py createsuperuser

# Zbieraj statické súbory
python manage.py collectstatic

# Spusti server (development)
python manage.py runserver

# V samostatných termináloch spusti:
celery -A config worker -l info
celery -A config beat -l info
```

### Frontend (React):

```bash
cd frontend

# Inštaluj dependencies
npm install

# Vytvor .env súbor
cp .env.example .env
# Uprav VITE_API_URL a VITE_WS_URL

# Spusti dev server
npm run dev

# Pre produkciu:
npm run build
npm run preview
```

## 🔧 Konfigurácia

### Backend (.env):
```env
SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,your-domain.com

DB_NAME=tag_game
DB_USER=postgres
DB_PASSWORD=your-db-password
DB_HOST=db
DB_PORT=5432

REDIS_HOST=redis
REDIS_PORT=6379

ADMIN_USERNAME=admin
ADMIN_PASSWORD=SecurePassword123!
ADMIN_EMAIL=admin@taggame.com

VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key
```

### Frontend (.env):
```env
VITE_API_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000/ws/game/
VITE_VAPID_PUBLIC_KEY=your-public-key
```

## 📊 Herné pravidlá (konfigurovateľné):

### Bodovanie:
- **Tagnutie hráča**: Body podľa rankingu (50-40-30-20-10-5)
- **Penalizácia**: -5 bodov za každú hodinu držania tagu
- **Bonus**: +35 bodov za izolovane netagnuté dni

### Achievements:
- 🥇 **Best Player** - Najviac bodov
- 💩 **Worst Player** - Najmenej bodov (anti-cena)
- ⚡ **Fastest Player** - Najmenej času držal tag
- 🐌 **Slowest Player** - Najviac času držal tag
- 🚀 **Fastest Catch** - Najrýchlejšie tagnutie
- 🏹 **Most Active** - Najviac tagov
- 🎯 **Most Caught** - Najviackrát chytený

## 🔐 Bezpečnosť

- JWT autentifikácia s refresh tokenmi
- Admin schvaľovanie nových hráčov
- HTTPS ready (použite reverse proxy v produkcii)
- CORS konfigurovateľný
- Environment variables pre citlivé údaje

## 📱 PWA Features

- ✅ Offline podpora
- ✅ Inštalovateľná na domovskú obrazovku
- ✅ Push notifikácie (iOS 16.4+, Android)
- ✅ Service Worker pre caching
- ✅ Manifest.json pre inštaláciu
- ✅ Mobile-first responsive dizajn

## 🛠️ Tech Stack

### Backend:
- Django 5.0
- Django REST Framework
- Django Channels (WebSockets)
- Celery + Redis (async tasks)
- PostgreSQL
- PyWebPush (notifikácie)

### Frontend:
- React 18
- Vite
- TailwindCSS
- React Query (data fetching)
- Zustand (state management)
- Framer Motion (animácie)
- Vite PWA Plugin

### Infrastructure:
- Docker & Docker Compose
- Nginx (pre produkciu)
- Redis
- PostgreSQL

## 📝 API Endpointy

### Autentifikácia:
- `POST /api/users/register/` - Registrácia
- `POST /api/users/token/` - Login
- `POST /api/users/token/refresh/` - Refresh token
- `GET /api/users/me/` - Aktuálny user

### Hra:
- `GET /api/game/settings/current/` - Nastavenia hry
- `GET /api/game/leaderboard/` - Rebríček
- `POST /api/game/tags/create_tag/` - Vytvoriť tag
- `GET /api/game/tags/current_holder/` - Aktuálny držiteľ
- `GET /api/game/achievements/` - Achievements

### Admin:
- `POST /api/users/{id}/approve/` - Schváliť usera
- `PUT /api/game/settings/{id}/` - Upraviť nastavenia
- `POST /api/notifications/send_notification/` - Poslať notifikáciu

## 🐛 Troubleshooting

### Docker problémy:
```bash
# Restart všetkého
docker-compose down
docker-compose up -d --build

# Logy
docker-compose logs -f backend
docker-compose logs -f frontend

# Reset databázy
docker-compose down -v
docker-compose up -d
```

### Push notifikácie nefungujú:
1. Skontroluj VAPID klúče v .env súboroch
2. HTTPS je potrebné pre produkciu (okrem localhost)
3. iOS vyžaduje verziu 16.4+
4. Povoľ notifikácie v prehliadači

## 📄 Licencia

MIT

## 👨‍💻 Autor

Vytvorené pre Tag Game 2025

---

**Enjoy the game! 🎮🏃‍♂️**
