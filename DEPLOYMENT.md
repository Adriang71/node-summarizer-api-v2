# Deployment na Vercel - Instrukcje

## Wymagania wstępne

1. **Konto Vercel** - zarejestruj się na [vercel.com](https://vercel.com)
2. **Vercel CLI** (opcjonalnie) - `npm i -g vercel`
3. **MongoDB Atlas** - baza danych w chmurze
4. **Klucze API** - OpenRouter i ElevenLabs

## Kroki deploymentu

### 1. Przygotowanie bazy danych
- Utwórz konto na [MongoDB Atlas](https://www.mongodb.com/atlas)
- Stwórz nowy cluster
- Skopiuj connection string (MONGODB_URI)

### 2. Przygotowanie kluczy API
- **OpenRouter**: Zarejestruj się na [openrouter.ai](https://openrouter.ai) i skopiuj API key
- **ElevenLabs**: Zarejestruj się na [elevenlabs.io](https://elevenlabs.io) i skopiuj API key

### 3. Deployment przez Vercel Dashboard

#### Opcja A: Przez GitHub (zalecane)
1. Wypchnij kod na GitHub
2. Przejdź na [vercel.com](https://vercel.com)
3. Kliknij "New Project"
4. Wybierz repozytorium z GitHub
5. Skonfiguruj zmienne środowiskowe (patrz sekcja poniżej)
6. Kliknij "Deploy"

#### Opcja B: Przez Vercel CLI
```bash
# Zainstaluj Vercel CLI
npm i -g vercel

# Zaloguj się
vercel login

# Zdeployuj
vercel

# Dla produkcji
vercel --prod
```

### 4. Konfiguracja zmiennych środowiskowych

W Vercel Dashboard → Project Settings → Environment Variables dodaj:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/web-analyzer
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
OPENROUTER_API_KEY=your_openrouter_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
NODE_ENV=production
```

### 5. Weryfikacja deploymentu

Po deploymentu sprawdź:
- Health check: `https://your-app.vercel.app/`
- API docs: `https://your-app.vercel.app/api-docs`
- Auth endpoint: `https://your-app.vercel.app/api/auth`

## Rozwiązywanie problemów

### Problem: Błąd połączenia z MongoDB
- Sprawdź czy MONGODB_URI jest poprawny
- Upewnij się, że IP 0.0.0.0/0 jest dodane do whitelist w MongoDB Atlas

### Problem: Błąd 500
- Sprawdź logi w Vercel Dashboard
- Upewnij się, że wszystkie zmienne środowiskowe są ustawione

### Problem: CORS errors
- Sprawdź czy origin w CORS middleware jest poprawny
- Dodaj domenę frontendu do whitelist

## Uwagi dotyczące Vercel

1. **Serverless Functions**: Aplikacja działa jako serverless function
2. **Cold Starts**: Pierwsze żądanie może być wolniejsze
3. **Timeout**: Maksymalny czas wykonania to 30 sekund (skonfigurowane w vercel.json)
4. **File Uploads**: Pliki audio są przechowywane lokalnie (rozważ użycie AWS S3 lub podobnego)

## Aktualizacje

Aby zaktualizować aplikację:
1. Wypchnij zmiany na GitHub
2. Vercel automatycznie zredeployuje aplikację
3. Lub użyj `vercel --prod` przez CLI 