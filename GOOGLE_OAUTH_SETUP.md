# Google OAuth Setup Instructions

## 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. Create OAuth 2.0 Credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: **Web application**
   - Name: `Auction Platform`
   - Authorized JavaScript origins:
     - `http://localhost:5173` (dev)
     - `http://localhost:3000` (dev)
     - `https://yourdomain.com` (production)
   - Authorized redirect URIs:
     - `http://localhost:5173` (dev)
     - `https://yourdomain.com` (production)
   - Click "Create"

5. Copy the **Client ID** and **Client Secret**

## 2. Backend Configuration

Add to `backend/.env`:

```env
# Google OAuth
GOOGLE_OAUTH_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=your-client-secret-here
```

## 3. Frontend Configuration

Add to `frontend/.env`:

```env
# Google OAuth
VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
```

## 4. Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
```

## 5. Test Google Login

1. Start backend: `python manage.py runserver`
2. Start frontend: `npm run dev`
3. Go to login page: http://localhost:5173/login
4. Click "Continue with Google" button
5. Select your Google account
6. You should be logged in automatically

## How It Works

1. User clicks "Continue with Google" button
2. Google Sign-In popup appears
3. User authenticates with Google
4. Google returns a JWT token
5. Frontend sends token to backend: `POST /api/users/auth/google/`
6. Backend verifies token with Google
7. Backend creates/finds user and returns JWT tokens
8. Frontend stores JWT tokens and user is logged in

## Security Notes

- Google token is verified server-side for security
- JWT tokens are used for subsequent API requests
- Tokens are stored in localStorage (consider httpOnly cookies for production)
- Users created via Google login have username format: `email_prefix_googleid`

## Testing Without Credentials

If you don't have Google OAuth credentials yet, the button will still appear but login will fail with "Invalid Google token" error. You can still use username/password login.

## Production Deployment

1. Add production domain to Google Cloud Console authorized origins
2. Update environment variables with production credentials
3. Consider using httpOnly cookies instead of localStorage for tokens
4. Enable HTTPS (required by Google OAuth)
