# The Box Office — Short Film Competition
## Registration System

### Stack
- **Frontend:** Single-page HTML (in `public/index.html`)
- **Backend:** Node.js + Express
- **Database:** SQLite (`registrations.db`, auto-created on first run)
- **File storage:** `uploads/` folder (payment screenshots saved here)

---

### Setup & Run

**1. Install dependencies**
```bash
npm install
```

**2. Start the server**
```bash
npm start
```

The site will be live at: `http://localhost:3000`

**3. (Optional) Change the admin password**

Edit `server.js` line 8:
```js
const ADMIN_PASS = 'your-new-password-here';
```
Or set an environment variable before starting:
```bash
ADMIN_PASS=mypassword node server.js
```

---

### How it works

- Users fill the registration form at `http://localhost:3000`
- On submit, form data + payment screenshot are sent to `/api/register`
- The server saves the data to `registrations.db` and the image to `uploads/`
- **Any admin anywhere** can log in via the "Admin Panel" button using the password
- Admin can view all registrations, see payment screenshots, mark them Verified/Rejected, delete entries, and export to CSV/Excel

---

### Deploying (to share with others)

**Railway / Render / Fly.io**
1. Push this folder to a GitHub repo
2. Connect it to Railway/Render — they auto-detect Node.js
3. Set environment variable `ADMIN_PASS` in the platform's dashboard
4. The app runs on their servers — everyone accesses the same database

**Your own VPS/server**
```bash
# Install Node.js if needed, then:
git clone <your-repo> boxoffice
cd boxoffice
npm install
PORT=80 ADMIN_PASS=yourpassword node server.js

# Or use PM2 to keep it running:
npm install -g pm2
pm2 start server.js --name boxoffice
```

---

### File structure
```
boxoffice/
├── server.js          ← Backend (routes, DB, file handling)
├── package.json
├── registrations.db   ← Auto-created SQLite database
├── uploads/           ← Auto-created, stores payment screenshots
├── public/
│   └── index.html     ← The registration website
└── README.md
```

---

### API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/register` | Public | Submit a registration |
| POST | `/api/admin/login` | - | Get admin token |
| GET | `/api/admin/registrations` | Admin | List all registrations |
| GET | `/api/admin/registrations/:id` | Admin | Single registration |
| PATCH | `/api/admin/registrations/:id/status` | Admin | Update payment status |
| DELETE | `/api/admin/registrations/:id` | Admin | Delete a registration |
| GET | `/api/admin/stats` | Admin | Summary statistics |
| GET | `/api/admin/export/csv` | Admin | Download CSV |
