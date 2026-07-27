## DINEX — Premium Restaurant POS + Kiosk (localStorage build)

This project is a **production-shaped** POS + self-order kiosk app with a separate **Node.js ESC/POS print server**.

### Tech

- **Frontend**: React + Vite + TypeScript + Tailwind + Router + Zustand + React Hook Form + Zod + Recharts + Framer Motion
- **Data (for now)**: localStorage (versioned DINEX DB)
- **Printing**: Node.js + Express + ESC/POS over LAN (Ethernet printers by IP)

### Quick start (web app)

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

- Login roles are seeded automatically on first run.
- **Default PIN** for all demo users: `1234`

### Quick start (print server)

In a second terminal:

```bash
cd print-server
npm install
npm run start
```

The server listens on `http://localhost:8787`.

Optional environment variables:

```bash
set PORT=8787
set VEG_PRINTER_IP=192.168.1.50
set NONVEG_PRINTER_IP=192.168.1.51
set BILL_PRINTER_IP=192.168.1.52
set PRINTER_PORT=9100
```

### App URLs

- **Login**: `/login`
- **Launcher**: `/launcher`
- **Kiosk**: `/kiosk`
- **Counter**: `/counter`
- **Kitchen**: `/kitchen`
- **Waiter**: `/waiter`
- **Orders**: `/orders`
- **Reports**: `/reports`
- **Inventory**: `/inventory`
- **Admin**: `/admin`
- **Customers**: `/customers`

### Notes

- This build uses localStorage to keep the app fully functional without Firebase. The architecture is already modular so you can swap in Firebase services later.
- Printing is routed by item type:
  - **Veg-only** → Veg printer
  - **Non-veg-only** → Non-veg printer
  - **Mixed** → split and print to both

