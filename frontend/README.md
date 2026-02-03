# PFM Frontend (React)

Login and register UI for the Personal Finance Manager API.

## Setup

1. Install dependencies (requires [Node.js](https://nodejs.org/) and npm):
   ```bash
   cd frontend
   npm install
   ```

2. Start the **backend** first (port 9006):
   ```bash
   mvn spring-boot:run
   ```

3. Start the frontend dev server:
   ```bash
   npm run dev
   ```

4. Open **http://localhost:5173** in your browser.

## Features

- **Login** – `/login` – sign in with username/password, stores JWT in `localStorage`
- **Register** – `/register` – create account, then redirects to login
- **Dashboard** – `/` – protected page after login; sign out clears token

API requests from the dev server are proxied to `http://localhost:9006` via Vite config.
