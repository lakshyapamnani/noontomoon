/**
 * printer.ts – Shared ESC/POS printing utility for Drona POS
 *
 * Uses Web Serial / WebUSB / Network Fetch to send ESC/POS bytes directly to thermal printers.
 * Falls back to iframe/window.print() when no printer is connected.
 */

// @ts-ignore – no official types; library ships its own
import ReceiptPrinterEncoder from '@point-of-sale/receipt-printer-encoder';
import { PrinterConfig, PrinterConnectionType } from '../types';

// ─── Runtime port store (per browser session) ────────────────────────────────

export interface ActivePrinterConnection {
  type: PrinterConnectionType;
  serialPort?: SerialPort;
  usbDevice?: USBDevice;
  ipAddress?: string;
  label: string;
}

const printerStore: { bill: ActivePrinterConnection | null; kot: ActivePrinterConnection | null } = {
  bill: null,
  kot: null,
};

/** Returns true when Web Serial API is available */
export const isWebSerialSupported = (): boolean =>
  typeof navigator !== 'undefined' && 'serial' in navigator;

/** Returns true when WebUSB API is available */
export const isWebUSBSupported = (): boolean =>
  typeof navigator !== 'undefined' && 'usb' in navigator;

/** Returns the currently connected port config (or null) */
export function getConnectedPrinter(purpose: 'bill' | 'kot'): ActivePrinterConnection | null {
  return printerStore[purpose];
}

/**
 * Let the user pick a printer / configure connection.
 * Must be called from a user gesture for USB/Serial.
 */
export async function connectPrinter(
  purpose: 'bill' | 'kot',
  config: PrinterConfig,
  useSamePrinterForBoth = false
): Promise<ActivePrinterConnection> {
  
  let connection: ActivePrinterConnection;

  if (config.type === 'serial') {
    if (!isWebSerialSupported()) throw new Error('Web Serial API is not supported in this browser.');
    const port = await (navigator as any).serial.requestPort();
    await port.open({ baudRate: 9600 });
    const info = port.getInfo ? port.getInfo() : {};
    const label = info.usbVendorId 
      ? `Serial (VID:${info.usbVendorId?.toString(16).toUpperCase()})` 
      : 'Serial Printer';
    connection = { type: 'serial', serialPort: port, label };

  } else if (config.type === 'usb') {
    if (!isWebUSBSupported()) throw new Error('WebUSB API is not supported in this browser.');
    const device = await (navigator as any).usb.requestDevice({ filters: [] });
    await device.open();
    if (device.configuration === null) await device.selectConfiguration(1);
    await device.claimInterface(0); // Usually interface 0 is the printer
    const label = device.productName || `USB Printer`;
    connection = { type: 'usb', usbDevice: device, label };

  } else if (config.type === 'network') {
    if (!config.ipAddress) throw new Error('IP Address is required for network printers.');
    connection = { type: 'network', ipAddress: config.ipAddress, label: `Network (${config.ipAddress})` };
  } else {
    throw new Error('Invalid printer type selected.');
  }

  printerStore[purpose] = connection;

  // If useSamePrinter, share the same connection for both
  if (useSamePrinterForBoth) {
    printerStore['bill'] = connection;
    printerStore['kot'] = connection;
  }

  return connection;
}

/** Disconnect a printer port */
export async function disconnectPrinter(purpose: 'bill' | 'kot'): Promise<void> {
  const entry = printerStore[purpose];
  if (!entry) return;
  try {
    if (entry.type === 'serial' && entry.serialPort) {
      await entry.serialPort.close();
    } else if (entry.type === 'usb' && entry.usbDevice) {
      await entry.usbDevice.close();
    }
  } catch {
    // ignore close errors
  }
  printerStore[purpose] = null;
}

// ─── Low-level send ────────────────────────────────────────────────────────

async function sendBytesSerial(port: SerialPort, data: Uint8Array): Promise<void> {
  const writer = port.writable!.getWriter();
  try {
    await writer.write(data);
  } finally {
    writer.releaseLock();
  }
}

async function sendBytesUSB(device: USBDevice, data: Uint8Array): Promise<void> {
  // Find bulk OUT endpoint
  let outEndpointNumber = null;
  for (const alt of device.configuration!.interfaces[0].alternates) {
    for (const endpoint of alt.endpoints) {
      if (endpoint.direction === "out" && endpoint.type === "bulk") {
        outEndpointNumber = endpoint.endpointNumber;
        break;
      }
    }
    if (outEndpointNumber !== null) break;
  }

  if (outEndpointNumber === null) {
    throw new Error("Could not find a bulk OUT endpoint for the USB printer.");
  }
  
  await (device as any).transferOut(outEndpointNumber, data);
}

async function sendBytesNetwork(ip: string, data: Uint8Array): Promise<void> {
  // Try sending over HTTP to port 80 or 9100.
  // Many POS printers accept blind HTTP POST requests containing ESC/POS binary data at their IP.
  // (We use mode: 'no-cors' so the browser doesn't block it even if printer doesn't send CORS headers).
  try {
    await fetch(`http://${ip}/`, {
      method: 'POST',
      body: data,
      mode: 'no-cors'
    });
  } catch (err: any) {
    // Some printers listen strictly on 9100
    try {
      await fetch(`http://${ip}:9100/`, {
        method: 'POST',
        body: data,
        mode: 'no-cors'
      });
    } catch (err2: any) {
      throw new Error(`Failed to send data to IP Printer at ${ip}: ${err2.message}`);
    }
  }
}

// ─── ESC/POS helpers ──────────────────────────────────────────────────────

export interface ReceiptLine {
  type: 'text' | 'divider' | 'row2' | 'row3' | 'emptyline';
  text?: string;
  bold?: boolean;
  align?: 'left' | 'center' | 'right';
  size?: 'normal' | 'large';
  col1?: string;
  col2?: string;
  col1Bold?: boolean;
  col2Bold?: boolean;
  itemName?: string;
  qty?: string | number;
  amount?: string;
}

function buildEncoder(widthMm: 80 | 58 = 80): ReceiptPrinterEncoder {
  const width = widthMm === 58 ? 32 : 48; // character columns
  return new ReceiptPrinterEncoder({ columns: width });
}

function encodeReceipt(lines: ReceiptLine[], widthMm: 80 | 58 = 80): Uint8Array {
  const cols = widthMm === 58 ? 32 : 48;
  let enc = buildEncoder(widthMm).initialize();

  for (const line of lines) {
    switch (line.type) {
      case 'emptyline':
        enc = enc.newline();
        break;

      case 'divider':
        enc = enc.line('-'.repeat(cols));
        break;

      case 'text': {
        const txt = line.text ?? '';
        if (line.size === 'large') enc = enc.size(2);
        if (line.bold) enc = enc.bold(true);
        enc = enc.align(line.align ?? 'left').line(txt);
        if (line.bold) enc = enc.bold(false);
        if (line.size === 'large') enc = enc.size(1);
        break;
      }

      case 'row2': {
        const left = (line.col1 ?? '').substring(0, cols - 10);
        const right = (line.col2 ?? '');
        const pad = cols - left.length - right.length;
        const spacer = pad > 0 ? ' '.repeat(pad) : ' ';
        const row = left + spacer + right;
        if (line.col1Bold || line.col2Bold) enc = enc.bold(true);
        enc = enc.align('left').line(row);
        if (line.col1Bold || line.col2Bold) enc = enc.bold(false);
        break;
      }

      case 'row3': {
        const amtWidth = 7;
        const qtyWidth = 4;
        const nameWidth = cols - qtyWidth - amtWidth - 2;
        const name = String(line.itemName ?? '').substring(0, nameWidth).padEnd(nameWidth);
        const qty = String(line.qty ?? '').padStart(qtyWidth);
        const amt = String(line.amount ?? '').padStart(amtWidth);
        enc = enc.align('left').line(`${name}${qty}${amt}`);
        break;
      }
    }
  }

  return enc.cut().encode();
}

// ─── Public print API ─────────────────────────────────────────────────────

/**
 * Print ESC/POS receipt to the configured printer.
 * Returns `false` if no printer connected (caller should fallback to iframe).
 */
export async function printEscPos(
  purpose: 'bill' | 'kot',
  lines: ReceiptLine[],
  widthMm: 80 | 58 = 80
): Promise<boolean> {
  const entry = printerStore[purpose];
  if (!entry) return false;

  try {
    const bytes = encodeReceipt(lines, widthMm);
    
    if (entry.type === 'serial' && entry.serialPort) {
      await sendBytesSerial(entry.serialPort, bytes);
    } else if (entry.type === 'usb' && entry.usbDevice) {
      await sendBytesUSB(entry.usbDevice, bytes);
    } else if (entry.type === 'network' && entry.ipAddress) {
      await sendBytesNetwork(entry.ipAddress, bytes);
    } else {
      return false;
    }
    
    return true;
  } catch (err) {
    console.error(`ESC/POS print error [${purpose}]:`, err);
    // Mark port as disconnected so next print uses fallback
    printerStore[purpose] = null;
    return false;
  }
}

// ─── Receipt builders ─────────────────────────────────────────────────────

export interface BillData {
  restaurantName: string;
  address: string;
  phone: string;
  gstNo?: string;
  billNo: string;
  customerName?: string;
  date: string;
  time: string;
  orderType: string;
  tableName?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    selectedPortion?: string;
    selectedMl?: string;
  }>;
  subtotal: number;
  gst: number;
  vat: number;
  tax: number;
  total: number;
  paymentMode: string;
}

export function buildBillLines(data: BillData): ReceiptLine[] {
  const lines: ReceiptLine[] = [];

  lines.push({ type: 'text', text: data.restaurantName, bold: true, align: 'center', size: 'large' });
  lines.push({ type: 'text', text: data.address, align: 'center' });
  lines.push({ type: 'text', text: `Tel: ${data.phone}`, align: 'center' });
  if (data.gstNo) {
    lines.push({ type: 'text', text: `GSTIN: ${data.gstNo}`, align: 'center' });
  }
  lines.push({ type: 'divider' });
  lines.push({ type: 'row2', col1: 'Bill:', col2: data.billNo, col1Bold: true });
  if (data.customerName) {
    lines.push({ type: 'row2', col1: 'Cust:', col2: data.customerName });
  }
  lines.push({ type: 'row2', col1: 'Date:', col2: data.date });
  lines.push({ type: 'row2', col1: 'Time:', col2: data.time });
  lines.push({ type: 'row2', col1: 'Type:', col2: data.orderType.replace('_', ' ') });
  if (data.tableName) {
    lines.push({ type: 'row2', col1: 'Table:', col2: data.tableName });
  }
  lines.push({ type: 'divider' });

  lines.push({ type: 'row3', itemName: 'ITEM', qty: 'QTY', amount: 'AMT' });
  lines.push({ type: 'divider' });

  for (const it of data.items) {
    let itemLabel = it.name;
    if (it.selectedPortion) itemLabel += ` (${it.selectedPortion})`;
    if (it.selectedMl) itemLabel += ` (${it.selectedMl})`;
    lines.push({
      type: 'row3',
      itemName: itemLabel,
      qty: String(it.quantity),
      amount: `${(it.price * it.quantity).toFixed(0)}`,
    });
  }

  lines.push({ type: 'divider' });
  lines.push({ type: 'row2', col1: 'Subtotal:', col2: `Rs ${data.subtotal.toFixed(0)}` });
  if (data.gst > 0) {
    lines.push({ type: 'row2', col1: 'GST:', col2: `Rs ${data.gst.toFixed(0)}` });
  }
  if (data.vat > 0) {
    lines.push({ type: 'row2', col1: 'VAT:', col2: `Rs ${data.vat.toFixed(0)}` });
  }
  lines.push({ type: 'row2', col1: 'Tax Total:', col2: `Rs ${data.tax.toFixed(0)}` });
  lines.push({ type: 'row2', col1: 'TOTAL:', col2: `Rs ${data.total.toFixed(0)}`, col1Bold: true, col2Bold: true });
  lines.push({ type: 'divider' });
  lines.push({ type: 'text', text: `Paid via ${data.paymentMode}`, bold: true, align: 'center' });
  lines.push({ type: 'emptyline' });
  lines.push({ type: 'text', text: 'Thank you! Visit again.', align: 'center' });
  lines.push({ type: 'emptyline' });
  lines.push({ type: 'emptyline' });

  return lines;
}

export interface KOTData {
  tableName: string;
  customerName?: string;
  time: string;
  items: Array<{
    name: string;
    quantity: number;
    selectedPortion?: string;
    selectedVegChoice?: string;
    selectedMl?: string;
  }>;
}

export function buildKOTLines(data: KOTData): ReceiptLine[] {
  const lines: ReceiptLine[] = [];

  lines.push({ type: 'text', text: 'K.O.T.', bold: true, align: 'center', size: 'large' });
  lines.push({ type: 'divider' });
  lines.push({ type: 'text', text: `TABLE: ${data.tableName.toUpperCase()}`, bold: true, align: 'center', size: 'large' });
  if (data.customerName) {
    lines.push({ type: 'text', text: `Cust: ${data.customerName}`, align: 'center' });
  }
  lines.push({ type: 'text', text: `Time: ${data.time}`, align: 'center' });
  lines.push({ type: 'divider' });
  lines.push({ type: 'row2', col1: 'ITEM', col2: 'QTY', col1Bold: true, col2Bold: true });
  lines.push({ type: 'divider' });

  for (const it of data.items) {
    let label = it.name.toUpperCase();
    if (it.selectedPortion) label += ` (${it.selectedPortion})`;
    if (it.selectedVegChoice) label += ` (${it.selectedVegChoice})`;
    if (it.selectedMl) label += ` (${it.selectedMl})`;
    lines.push({ type: 'row2', col1: label, col2: String(it.quantity), col2Bold: true });
  }

  lines.push({ type: 'divider' });
  lines.push({ type: 'text', text: `Printed: ${new Date().toLocaleTimeString()}`, align: 'center' });
  lines.push({ type: 'emptyline' });
  lines.push({ type: 'emptyline' });

  return lines;
}

export interface RunningBillData {
  restaurantName: string;
  address: string;
  phone: string;
  gstNo?: string;
  tableName: string;
  customerName: string;
  items: Array<{ name: string; quantity: number; price: number; selectedPortion?: string }>;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
}

export function buildRunningBillLines(data: RunningBillData): ReceiptLine[] {
  const lines: ReceiptLine[] = [];

  lines.push({ type: 'text', text: data.restaurantName, bold: true, align: 'center', size: 'large' });
  lines.push({ type: 'text', text: data.address, bold: true, align: 'center' });
  lines.push({ type: 'text', text: `Tel: ${data.phone}`, bold: true, align: 'center' });
  if (data.gstNo) {
    lines.push({ type: 'text', text: `GSTIN: ${data.gstNo}`, bold: true, align: 'center' });
  }
  lines.push({ type: 'divider' });
  lines.push({ type: 'text', text: `${data.tableName} - RUNNING BILL`, bold: true, align: 'center' });
  lines.push({ type: 'row2', col1: 'Cust:', col2: data.customerName, col1Bold: true, col2Bold: true });
  lines.push({ type: 'row2', col1: 'Date:', col2: new Date().toLocaleDateString(), col1Bold: true, col2Bold: true });
  lines.push({ type: 'row2', col1: 'Time:', col2: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), col1Bold: true, col2Bold: true });
  lines.push({ type: 'divider' });
  lines.push({ type: 'row3', itemName: 'ITEM', qty: 'QTY', amount: 'AMT' });
  lines.push({ type: 'divider' });

  for (const it of data.items) {
    let itemLabel = it.name;
    if (it.selectedPortion) itemLabel += ` (${it.selectedPortion === 'HALF' ? 'Half' : 'Full'})`;
    lines.push({
      type: 'row3',
      itemName: itemLabel,
      qty: String(it.quantity),
      amount: `${(it.price * it.quantity).toFixed(0)}`,
    });
  }

  lines.push({ type: 'divider' });
  lines.push({ type: 'row2', col1: 'Subtotal:', col2: `Rs ${data.subtotal.toFixed(0)}`, col1Bold: true, col2Bold: true });
  lines.push({ type: 'row2', col1: `Tax (${(data.taxRate * 100).toFixed(0)}%):`, col2: `Rs ${data.taxAmount.toFixed(0)}`, col1Bold: true, col2Bold: true });
  lines.push({ type: 'row2', col1: 'TOTAL:', col2: `Rs ${data.total.toFixed(0)}`, col1Bold: true, col2Bold: true });
  lines.push({ type: 'divider' });
  lines.push({ type: 'text', text: '** Running Bill - Not Final **', bold: true, align: 'center' });
  lines.push({ type: 'emptyline' });
  lines.push({ type: 'emptyline' });

  return lines;
}
