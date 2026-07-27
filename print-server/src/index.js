import express from "express";
import cors from "cors";
import pino from "pino";
import { buildBill, buildKot, printToIp } from "./printer.js";
import { markFailed, markPrinted, wasPrinted } from "./jobStore.js";

const log = pino({ level: process.env.LOG_LEVEL || "info" });
const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const PORT = Number(process.env.PORT || 8787);
const PRINTER_VEG_IP = process.env.VEG_PRINTER_IP || "192.168.1.50";
const PRINTER_NONVEG_IP = process.env.NONVEG_PRINTER_IP || "192.168.1.51";
const PRINTER_BILL_IP = process.env.BILL_PRINTER_IP || "192.168.1.52";
const PRINTER_PORT = Number(process.env.PRINTER_PORT || 9100);

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    printers: {
      veg: PRINTER_VEG_IP,
      nonveg: PRINTER_NONVEG_IP,
      bill: PRINTER_BILL_IP,
      port: PRINTER_PORT
    }
  });
});

app.post("/print/kot", async (req, res) => {
  const order = req.body?.order;
  if (!order?.id || !order?.token || !Array.isArray(order?.items)) return res.status(400).json({ ok: false, message: "Invalid order" });

  const veg = order.items.filter((i) => i.type === "veg");
  const nonveg = order.items.filter((i) => i.type === "nonveg");
  const time = new Date(order.createdAt || Date.now()).toLocaleString();

  const jobs = [];
  if (veg.length) jobs.push({ key: `${order.id}:kot:veg`, ip: PRINTER_VEG_IP, items: veg, label: "VEG KOT" });
  if (nonveg.length) jobs.push({ key: `${order.id}:kot:nonveg`, ip: PRINTER_NONVEG_IP, items: nonveg, label: "NON‑VEG KOT" });
  if (!jobs.length) return res.json({ ok: true, skipped: true, reason: "no_veg_or_nonveg_items" });

  try {
    for (const j of jobs) {
      if (wasPrinted(j.key)) {
        log.info({ job: j.key }, "duplicate_kot_prevented");
        continue;
      }
      await printToIp({
        ip: j.ip,
        port: PRINTER_PORT,
        build: (printer) =>
          buildKot(printer, {
            header: {
              title: j.label,
              subtitle: "DINEX",
              token: order.token,
              mode: order.mode === "dine_in" ? "DINE IN" : "TAKEAWAY",
              payment: String(order.paymentMode || "").toUpperCase(),
              time,
              customer: order.customerName ? `${order.customerName} (${order.customerPhone || ""})` : ""
            },
            lines: j.items.map((it) => ({ qty: it.qty, name: it.name, notes: it.notes })),
            footer: "— Kitchen copy —"
          })
      });
      markPrinted(j.key, { token: order.token, ip: j.ip, type: "kot" });
    }
    res.json({ ok: true });
  } catch (e) {
    const key = `${order.id}:kot:error`;
    markFailed(key, e, { orderId: order.id, token: order.token });
    log.error({ err: e }, "kot_print_failed");
    res.status(500).json({ ok: false, message: "KOT print failed" });
  }
});

app.post("/print/bill", async (req, res) => {
  const order = req.body?.order;
  if (!order?.id || !order?.token || !Array.isArray(order?.items)) return res.status(400).json({ ok: false, message: "Invalid order" });

  const jobKey = `${order.id}:bill`;
  if (wasPrinted(jobKey)) {
    log.info({ job: jobKey }, "duplicate_bill_prevented");
    return res.json({ ok: true, duplicatePrevented: true });
  }

  try {
    const time = new Date(order.createdAt || Date.now()).toLocaleString();
    await printToIp({
      ip: PRINTER_BILL_IP,
      port: PRINTER_PORT,
      build: (printer) =>
        buildBill(printer, {
          header: {
            title: "DINEX",
            subtitle: "Tax Invoice",
            token: order.token,
            time,
            customer: order.customerName ? `${order.customerName} (${order.customerPhone || ""})` : ""
          },
          lines: order.items.map((it) => ({
            qty: it.qty,
            name: it.name,
            amount: Math.round(it.unitPrice * it.qty)
          })),
          totals: {
            subtotal: Math.round(order.subtotal || 0),
            tax: Math.round(order.tax || 0),
            total: Math.round(order.total || 0)
          },
          footer: "Thanks for dining with us"
        })
    });
    markPrinted(jobKey, { token: order.token, ip: PRINTER_BILL_IP, type: "bill" });
    res.json({ ok: true });
  } catch (e) {
    markFailed(jobKey, e, { orderId: order.id, token: order.token });
    log.error({ err: e }, "bill_print_failed");
    res.status(500).json({ ok: false, message: "Bill print failed" });
  }
});

app.listen(PORT, () => {
  log.info(
    {
      port: PORT,
      printers: { veg: PRINTER_VEG_IP, nonveg: PRINTER_NONVEG_IP, bill: PRINTER_BILL_IP, rawPort: PRINTER_PORT }
    },
    "dinex_print_server_started"
  );
});

