# 🎮 TAG GAME - Kompletná PWA Aplikácia

## ✅ ČO BOLO VYTVORENÉ

### 🏗️ Backend (Django)
- ✅ Custom User model s approval systémom
- ✅ JWT autentifikácia (login, register, refresh)
- ✅ GameSettings model (singleton) - všetky nastavenia konfigurovateľné
- ✅ Tag model - evidencia tagov s bodmi a penalizáciami
- ✅ Achievement system
- ✅ Push notifications cez PyWebPush
- ✅ WebSocket real-time updates (Django Channels)
- ✅ Celery pre async tasky
- ✅ Admin panel pre správu

### 📱 Frontend (React + Vite)
- ✅ PWA ready (manifest, service worker, offline support)
- ✅ Mobile-first responsive dizajn (TailwindCSS)
- ✅ React Router navigation
- ✅ React Query pre data fetching
- ✅ Zustand pre state management
- ✅ WebSocket real-time connection
- ✅ Push notifications (Web Push API)
- ✅ Všetky pages: Login, Register, Home, Leaderboard, Tag, Profile, Achievements, Notifications, Admin

### 🔧 Admin Panel
- ✅ Nastavenia hry (bodovanie, penalizácie, bonusy)
- ✅ Dátumy začiatku/konca hry
- ✅ Ceny a anticeny
- ✅ Schvaľovanie používateľov
- ✅ Posielanie custom notifikácií
- ✅ Správa všetkých hráčov

### 🎯 Herná logika
- ✅ Bodovanie podľa rankingu (50-40-30-20-10-5)
- ✅ Penalizácia za čas držania (-5 bodov/hodinu)
- ✅ Bonus za netagnuté dni (+35 bodov)
- ✅ Achievements (najrýchlejší, najpomalší, najviac tagov, atď.)
- ✅ Live leaderboard s real-time updates
- ✅ Sledovanie aktuálneho držiteľa tagu

### 🐳 Docker Setup
- ✅ docker-compose.yml (PostgreSQL, Redis, Django, Celery, Frontend)
- ✅ Dockerfile pre backend aj frontend
- ✅ Automatické migrácie a setup
- ✅ Volume mappings pre development

## 🚀 AKO SPUSTIŤ

### Rýchly štart:
```bash
chmod +x start.sh
./start.sh
```

### Manuálne:
```bash
# 1. Skopíruj .env súbory
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 2. Uprav backend/.env
# Nastav: ADMIN_USERNAME, ADMIN_PASSWORD, SECRET_KEY

# 3. Spusti Docker
docker-compose up -d --build

# 4. Generuj VAPID klúče
docker-compose exec backend python -c "
from pywebpush import webpush
vapid_keys = webpush.generate_vapid_keys()
print('VAPID_PUBLIC_KEY=' + vapid_keys['public_key'])
print('VAPID_PRIVATE_KEY=' + vapid_keys['private_key'])
"

# 5. Pridaj VAPID klúče do .env súborov
# backend/.env: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY
# frontend/.env: VITE_VAPID_PUBLIC_KEY (len public key)

# 6. Reštartuj
docker-compose restart

# 7. Otvor http://localhost:5173
```

## 📂 Štruktúra projektu

```
tag/
├── backend/                 # Django backend
│   ├── config/             # Django settings, urls, asgi, celery
│   ├── users/              # User model, auth, registrácia
│   ├── game/               # Game logic, tagy, settings
│   ├── notifications/      # Push notifications
│   ├── manage.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # React komponenty (Layout, BottomNav, atď.)
│   │   ├── pages/         # Pages (Home, Login, Leaderboard, atď.)
│   │   ├── stores/        # Zustand stores (auth, game)
│   │   ├── utils/         # API calls, PWA utils
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── Dockerfile
│   └── .env.example
├── docker-compose.yml      # Orchestrácia všetkých služieb
├── README.md              # Dokumentácia
└── start.sh               # Quick start script
```

## 🎮 Používanie

### Pre hráčov:
1. **Registrácia** - Zaregistruj sa cez /register
2. **Čakanie na schválenie** - Admin ťa musí schváliť
3. **Login** - Po schválení sa prihlás
4. **Tag hráča** - Choď na "Tag" tab a tagnite aktuálneho držiteľa
5. **Sleduj rebríček** - Live updates bodov
6. **Achievements** - Pozri špeciálne ocenenia
7. **Push notifikácie** - Povoľ v Profile pre notifikácie o nových tagoch

### Pre admina:
1. **Login** s admin credentials z .env
2. **Admin panel** - Posledný tab v navigácii
3. **Nastavenia** - Uprav bodovanie, dátumy, ceny
4. **Používatelia** - Schváľuj nových hráčov
5. **Notifikácie** - Posielaj správy všetkým

## 📱 PWA Inštalácia

### iOS (Safari):
1. Otvor http://localhost:5173 v Safari
2. Klikni na "Share" button
3. "Add to Home Screen"
4. Otvor appku z domovskej obrazovky

### Android (Chrome):
1. Otvor http://localhost:5173 v Chrome
2. Menu → "Install app"
3. Alebo banner "Add to Home Screen"

## 🔔 Push Notifikácie

### Aktivácia:
1. V Profile klikni "Povoliť notifikácie"
2. Prehliadač požiada o povolenie
3. Potvrď

### Testovanie:
- Admin môže poslať test notifikáciu cez Admin → Notifikácie
- Každý tag automaticky pošle notifikáciu všetkým hráčom

## 🐛 Riešenie problémov

### Push notifikácie nefungujú:
- Skontroluj že máš VAPID klúče v .env
- Pre iOS potrebuješ iOS 16.4+
- Pre produkciu musíš mať HTTPS

### Docker neštartuje:
```bash
docker-compose down -v
docker-compose up -d --build
```

### Frontend sa nenačíta:
```bash
docker-compose logs frontend
# Skontroluj či beží na porte 5173
```

### Backend API nefunguje:
```bash
docker-compose logs backend
# Skontroluj migrácie: docker-compose exec backend python manage.py migrate
```

## 📊 API Dokumentácia

Všetky endpointy sú na `http://localhost:8000/api/`

### Autentifikácia:
- `POST /users/token/` - Login (username, password)
- `POST /users/token/refresh/` - Refresh token
- `POST /users/register/` - Registrácia
- `GET /users/me/` - Aktuálny profil
- `PUT /users/update_profile/` - Upraviť profil

### Hra:
- `GET /game/settings/current/` - Nastavenia hry
- `GET /game/leaderboard/` - Rebríček
- `POST /game/tags/create_tag/` - Vytvoriť tag
- `GET /game/tags/current_holder/` - Kto drží tag
- `GET /game/achievements/` - Všetky achievements

### Admin:
- `POST /users/{id}/approve/` - Schváliť usera
- `PUT /game/settings/1/` - Upraviť nastavenia
- `POST /notifications/send_notification/` - Poslať notifikáciu

## 🎨 Customizácia

### Zmena farieb (TailwindCSS):
Uprav `frontend/tailwind.config.js`:
```js
colors: {
  primary: '#2b2d42',  // Hlavná farba
  accent: '#f28d35',   // Akcentová farba
  // ...
}
```

### Zmena bodovacieho systému:
Admin panel → Nastavenia → Bodovanie za tagnutie

### Pridanie nových achievements:
Uprav `backend/game/game_engine.py` → `calculate_achievements()`

## 📞 Podpora

V prípade problémov:
1. Skontroluj logy: `docker-compose logs -f`
2. Skontroluj .env súbory
3. Reštartuj: `docker-compose restart`

## ✨ Funkcie navyše

- ✅ Real-time WebSocket updates
- ✅ Automatické prepočítavanie bodov
- ✅ History tagov
- ✅ Fotky pri tagnutí
- ✅ Lokácia tagu (voliteľné)
- ✅ Countdown do konca hry
- ✅ Offline podpora (PWA)
- ✅ Mobile-first dizajn
- ✅ Dark mode ready (ľahko pridať)

---

**Hra je KOMPLETNÁ a READY TO USE! 🎮🏆**

Všetko čo bolo v pôvodnej hre je zachované + rozšírené o:
- Admin panel s kompletným nastavením
- PWA funkcionalitu
- Push notifikácie
- Real-time updates
- User approval system
- Moderný mobile-first dizajn
