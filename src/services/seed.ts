import type { InventoryItem, MenuCategory, MenuItem, User } from "@/types";
import { ensureAdminUser, readDb, updateDb } from "@/services/db";
import { sha256Hex } from "@/utils/crypto";
import { createId } from "@/utils/id";
import { nowMs } from "@/utils/time";

const DEMO_PIN = "1234";

export async function ensureDemoSeed() {
  const db = readDb();
  if (db.categories.length && db.items.length && db.users.length) return;

  const pinHash = await sha256Hex(DEMO_PIN);
  ensureAdminUser(pinHash);

  updateDb((db2) => {
    const t = nowMs();

    const hasAnyUser = db2.users.length > 0;
    const users: User[] = hasAnyUser
      ? db2.users
      : [
          {
            id: createId("usr"),
            displayName: "Counter",
            role: "counter",
            pinHash,
            isActive: true,
            createdAt: t
          },
          {
            id: createId("usr"),
            displayName: "Kitchen",
            role: "kitchen",
            pinHash,
            isActive: true,
            createdAt: t
          },
          {
            id: createId("usr"),
            displayName: "Waiter",
            role: "waiter",
            pinHash,
            isActive: true,
            createdAt: t
          },
          {
            id: createId("usr"),
            displayName: "Manager",
            role: "manager",
            pinHash,
            isActive: true,
            createdAt: t
          },
          ...db2.users
        ];

    const hasMenu = db2.categories.length > 0 && db2.items.length > 0;
    const categories: MenuCategory[] = hasMenu
      ? db2.categories
      : [
          { id: "cat_v1", name: "Starters", type: "veg", sort: 10 },
          { id: "cat_v2", name: "Mains", type: "veg", sort: 20 },
          { id: "cat_n1", name: "Grill", type: "nonveg", sort: 10 },
          { id: "cat_n2", name: "Curries", type: "nonveg", sort: 20 },
          { id: "cat_d1", name: "Classic", type: "dessert", sort: 10 },
          { id: "cat_d2", name: "Cold", type: "dessert", sort: 20 }
        ];

    const img = (accent: string) =>
      `data:image/svg+xml,${encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='640' height='420' viewBox='0 0 640 420'>
          <defs>
            <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
              <stop offset='0' stop-color='${accent}' stop-opacity='0.92'/>
              <stop offset='1' stop-color='#0B0C10' stop-opacity='0.95'/>
            </linearGradient>
          </defs>
          <rect width='640' height='420' rx='32' fill='#0B0C10'/>
          <rect x='24' y='24' width='592' height='372' rx='28' fill='url(#g)' opacity='0.9'/>
          <circle cx='520' cy='110' r='78' fill='rgba(255,255,255,0.12)'/>
          <path d='M140 292c64-74 132-120 220-120s156 46 220 120' fill='none' stroke='rgba(255,255,255,0.14)' stroke-width='16' stroke-linecap='round'/>
          <path d='M176 308h288' stroke='rgba(255,255,255,0.14)' stroke-width='12' stroke-linecap='round'/>
        </svg>`
      )}`;

    const hasItems = db2.items.length > 0;
    const items: MenuItem[] = hasItems
      ? db2.items
      : [
          {
            id: "itm_paneer_tikka",
            name: "Paneer Tikka",
            description: "Charred cottage cheese, spice rub, lemon.",
            price: 220,
            type: "veg",
            categoryId: "cat_v1",
            imageUrl: img("#22C55E"),
            isActive: true,
            taxPercent: 5
          },
          {
            id: "itm_truffle_dal",
            name: "Dal Makhani (Signature)",
            description: "Slow cooked, silky finish, house butter.",
            price: 240,
            type: "veg",
            categoryId: "cat_v2",
            imageUrl: img("#16A34A"),
            isActive: true,
            taxPercent: 5
          },
          {
            id: "itm_tandoori_chicken",
            name: "Tandoori Chicken",
            description: "Smoky, tender, yogurt marinade.",
            price: 320,
            type: "nonveg",
            categoryId: "cat_n1",
            imageUrl: img("#EF4444"),
            isActive: true,
            taxPercent: 5
          },
          {
            id: "itm_butter_chicken",
            name: "Butter Chicken",
            description: "Creamy tomato gravy, balanced spice.",
            price: 340,
            type: "nonveg",
            categoryId: "cat_n2",
            imageUrl: img("#F43F5E"),
            isActive: true,
            taxPercent: 5
          },
          {
            id: "itm_gulab_jamun",
            name: "Gulab Jamun",
            description: "Warm, saffron syrup, soft center.",
            price: 120,
            type: "dessert",
            categoryId: "cat_d1",
            imageUrl: img("#EAB308"),
            isActive: true,
            taxPercent: 0
          },
          {
            id: "itm_kulfi",
            name: "Malai Kulfi",
            description: "Slow set, pistachio, cardamom.",
            price: 140,
            type: "dessert",
            categoryId: "cat_d2",
            imageUrl: img("#A855F7"),
            isActive: true,
            taxPercent: 0
          }
        ];

    const hasInventory = db2.inventory.length > 0;
    const inventory: InventoryItem[] = hasInventory
      ? db2.inventory
      : [
          { id: createId("inv"), name: "Paneer", unit: "kg", stock: 6.5, lowStockAt: 2, updatedAt: t },
          { id: createId("inv"), name: "Chicken", unit: "kg", stock: 11.2, lowStockAt: 4, updatedAt: t },
          { id: createId("inv"), name: "Butter", unit: "kg", stock: 3.8, lowStockAt: 1.5, updatedAt: t },
          { id: createId("inv"), name: "Milk", unit: "l", stock: 18, lowStockAt: 6, updatedAt: t }
        ];

    return { ...db2, users, categories, items, inventory, meta: { ...db2.meta, lastSeedAt: t } };
  });
}

export function demoPin() {
  return DEMO_PIN;
}

