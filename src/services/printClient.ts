import type { Order } from "@/types";

const DEFAULT_PRINT_SERVER = "http://localhost:8787";

export async function printKot(order: Order) {
  return await fetch(`${DEFAULT_PRINT_SERVER}/print/kot`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ order })
  });
}

export async function printBill(order: Order) {
  return await fetch(`${DEFAULT_PRINT_SERVER}/print/bill`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ order })
  });
}

export async function pingPrintServer() {
  return await fetch(`${DEFAULT_PRINT_SERVER}/health`, { method: "GET" });
}

