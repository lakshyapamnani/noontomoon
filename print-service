const express = require('express');
const cors = require('cors');
const net = require('net');

const DEFAULT_PRINTER_PORT = 9100;
const SERVER_PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());
app.use(express.json({ limit: '512kb' }));

// ── ESC/POS command bytes ───────────────────────────────────────────────
const ESC = 0x1b;
const GS  = 0x1d;

const CMD = {
  INIT:         Buffer.from([ESC, 0x40]),              // Initialize printer
  ALIGN_LEFT:   Buffer.from([ESC, 0x61, 0x00]),
  ALIGN_CENTER: Buffer.from([ESC, 0x61, 0x01]),
  ALIGN_RIGHT:  Buffer.from([ESC, 0x61, 0x02]),
  BOLD_ON:      Buffer.from([ESC, 0x45, 0x01]),
  BOLD_OFF:     Buffer.from([ESC, 0x45, 0x00]),
  DOUBLE_ON:    Buffer.from([GS, 0x21, 0x11]),         // Double width+height
  DOUBLE_OFF:   Buffer.from([GS, 0x21, 0x00]),
  WIDE_ON:      Buffer.from([GS, 0x21, 0x10]),         // Double width only
  WIDE_OFF:     Buffer.from([GS, 0x21, 0x00]),
  UNDERLINE_ON: Buffer.from([ESC, 0x2d, 0x01]),
  UNDERLINE_OFF:Buffer.from([ESC, 0x2d, 0x00]),
  CUT:          Buffer.from([GS, 0x56, 0x00]),         // Full cut
  PARTIAL_CUT:  Buffer.from([GS, 0x56, 0x01]),         // Partial cut
  FEED_3:       Buffer.from([ESC, 0x64, 0x03]),        // Feed 3 lines
  FEED_5:       Buffer.from([ESC, 0x64, 0x05]),        // Feed 5 lines
  LF:           Buffer.from('\n', 'ascii'),
};

// ── Helpers ─────────────────────────────────────────────────────────────

const textBuf = (str) => Buffer.from(String(str), 'ascii');

const line = (str) => Buffer.concat([textBuf(str), CMD.LF]);

const separator = (char = '-', width = 42) => line(char.repeat(width));

const centeredLine = (str) => Buffer.concat([CMD.ALIGN_CENTER, line(str), CMD.ALIGN_LEFT]);

const boldLine = (str) => Buffer.concat([CMD.BOLD_ON, line(str), CMD.BOLD_OFF]);

const centeredBoldLine = (str) => Buffer.concat([CMD.ALIGN_CENTER, CMD.BOLD_ON, line(str), CMD.BOLD_OFF, CMD.ALIGN_LEFT]);

const titleLine = (str) => Buffer.concat([CMD.ALIGN_CENTER, CMD.DOUBLE_ON, CMD.BOLD_ON, line(str), CMD.BOLD_OFF, CMD.DOUBLE_OFF, CMD.ALIGN_LEFT]);

const padRight = (str, width) => {
  const s = String(str);
  return s.length >= width ? s.substring(0, width) : s + ' '.repeat(width - s.length);
};

const padLeft = (str, width) => {
  const s = String(str);
  return s.length >= width ? s : ' '.repeat(width - s.length) + s;
};

// ── ESC/POS builders ────────────────────────────────────────────────────

/**
 * Build ESC/POS buffer from plain text lines (for KOT or simple prints).
 * Line 0 = title (double-width centered), TABLE: lines = bold centered,
 * meta lines = centered, everything else = left aligned.
 */
const escposFromLines = (lines) => {
  const bufs = [CMD.INIT];

  lines.forEach((rawLine, idx) => {
    const ln = String(rawLine);
    if (idx === 0) {
      bufs.push(titleLine(ln));
      return;
    }
    if (ln.startsWith('TABLE:')) {
      bufs.push(titleLine(ln));
      return;
    }
    if (ln.startsWith('---') || ln.startsWith('===')) {
      bufs.push(separator(ln[0]));
      return;
    }
    if (ln.startsWith('Cust:') || ln.startsWith('Time:') || ln.startsWith('Printed at')) {
      bufs.push(centeredLine(ln));
      return;
    }
    bufs.push(line(ln));
  });

  bufs.push(CMD.FEED_5, CMD.CUT);
  return Buffer.concat(bufs);
};

/**
 * Build ESC/POS buffer from structured bill data.
 */
const escposFromBillData = (data) => {
  const LINE_WIDTH = 42;
  const bufs = [CMD.INIT];

  // Restaurant header
  if (data.restaurantName) {
    bufs.push(titleLine(data.restaurantName.toUpperCase()));
  }
  if (data.restaurantAddress) {
    bufs.push(centeredLine(data.restaurantAddress));
  }
  if (data.restaurantPhone) {
    bufs.push(centeredLine('Tel: ' + data.restaurantPhone));
  }

  bufs.push(separator('-', LINE_WIDTH));

  // Invoice title
  bufs.push(titleLine('TAX INVOICE'));

  bufs.push(separator('-', LINE_WIDTH));

  // Invoice meta
  if (data.billNo) bufs.push(boldLine('Invoice No: ' + data.billNo));
  if (data.tableName) bufs.push(line('Table: ' + data.tableName));
  if (data.customerName) bufs.push(line('Cust: ' + data.customerName));
  if (data.date) bufs.push(line('Date: ' + data.date));
  if (data.time) bufs.push(line('Time: ' + data.time));
  if (data.orderType) bufs.push(line('Type: ' + data.orderType.replace('_', ' ')));

  bufs.push(separator('-', LINE_WIDTH));

  // Item sections
  const printItemSection = (title, items) => {
    if (!items || items.length === 0) return;

    bufs.push(centeredBoldLine('--- ' + title + ' ---'));

    // Header row
    const nameW = LINE_WIDTH - 6 - 8; // qty=6, amt=8
    bufs.push(CMD.BOLD_ON);
    bufs.push(line(padRight('Item', nameW) + padLeft('Qty', 6) + padLeft('Amt', 8)));
    bufs.push(CMD.BOLD_OFF);

    let sectionTotal = 0;
    items.forEach((item) => {
      const itemName = item.name || '';
      const qty = item.quantity || 0;
      const price = item.price || 0;
      const amt = qty * price;
      sectionTotal += amt;

      const details = [];
      if (item.selectedMl) details.push(item.selectedMl);
      if (item.selectedPortion) details.push(item.selectedPortion === 'HALF' ? 'H' : 'F');
      const suffix = details.length ? ' (' + details.join('|') + ')' : '';
      const fullName = itemName + suffix;

      // Word wrap the item name if needed
      const maxNameLen = nameW;
      if (fullName.length <= maxNameLen) {
        bufs.push(line(padRight(fullName, nameW) + padLeft(String(qty), 6) + padLeft(String(amt), 8)));
      } else {
        // First line with qty and amt
        bufs.push(line(padRight(fullName.substring(0, maxNameLen), nameW) + padLeft(String(qty), 6) + padLeft(String(amt), 8)));
        // Continuation lines
        let remaining = fullName.substring(maxNameLen);
        while (remaining.length > 0) {
          bufs.push(line('  ' + remaining.substring(0, maxNameLen - 2)));
          remaining = remaining.substring(maxNameLen - 2);
        }
      }
    });

    bufs.push(CMD.BOLD_ON);
    bufs.push(line(padRight(title.toUpperCase() + ' TOTAL:', LINE_WIDTH - 8) + padLeft('Rs ' + sectionTotal, 8)));
    bufs.push(CMD.BOLD_OFF);
    bufs.push(CMD.LF);
  };

  if (data.foodItems && data.foodItems.length > 0) {
    printItemSection('FOOD ITEMS', data.foodItems);
  }
  if (data.drinkItems && data.drinkItems.length > 0) {
    printItemSection('DRINK ITEMS', data.drinkItems);
  }

  bufs.push(separator('-', LINE_WIDTH));

  // Totals
  const totalLine = (label, value) => {
    bufs.push(line(padRight(label, LINE_WIDTH - 10) + padLeft('Rs ' + value, 10)));
  };

  totalLine('Subtotal:', String(data.subtotal || 0));
  if (data.gst && data.gst > 0) {
    totalLine('GST (' + (data.gstPercent || '') + '%):', String(data.gst));
  }
  if (data.vat && data.vat > 0) {
    totalLine('VAT (' + (data.vatPercent || '') + '%):', String(data.vat));
  }
  if (data.tax && data.tax > 0) {
    totalLine('Tax Total:', String(data.tax));
  }
  if (data.discountAmount && data.discountAmount > 0) {
    totalLine('Discount (' + (data.discountPercent || 0) + '%):', '-' + String(data.discountAmount));
  }

  // Grand total - bold and double width
  bufs.push(separator('-', LINE_WIDTH));
  bufs.push(CMD.BOLD_ON, CMD.WIDE_ON);
  bufs.push(line(padRight('TOTAL:', LINE_WIDTH / 2 - 5) + padLeft('Rs ' + (data.total || 0), LINE_WIDTH / 2 + 5)));
  bufs.push(CMD.WIDE_OFF, CMD.BOLD_OFF);
  bufs.push(separator('-', LINE_WIDTH));

  // Payment mode
  if (data.paymentMode) {
    bufs.push(centeredBoldLine('Paid via ' + data.paymentMode));
  }

  // Tax registration numbers
  if (data.gstNo && data.gstNo !== 'NOT SET') {
    bufs.push(line('GSTIN: ' + data.gstNo));
  }
  if (data.vatNo && data.vatNo !== 'NOT SET') {
    bufs.push(line('VAT NO: ' + data.vatNo));
  }
  if (data.fssaiNo && data.fssaiNo !== 'NOT SET') {
    bufs.push(line('FSSAI NO: ' + data.fssaiNo));
  }

  // Footer
  bufs.push(CMD.LF);
  bufs.push(centeredBoldLine('Thank you!'));
  bufs.push(centeredLine('Visit again.'));

  bufs.push(CMD.FEED_5, CMD.CUT);
  return Buffer.concat(bufs);
};

// ── TCP send ────────────────────────────────────────────────────────────

const sendToPrinter = (payload, printerHost, printerPort) => new Promise((resolve, reject) => {
  const port = printerPort || DEFAULT_PRINTER_PORT;
  const socket = new net.Socket();
  socket.setTimeout(5000);

  socket.connect(port, printerHost, () => {
    console.log(`[print-service] Connected to ${printerHost}:${port}`);
    socket.write(payload, (err) => {
      if (err) {
        reject(err);
        return;
      }
      console.log(`[print-service] Sent ${payload.length} bytes`);
      socket.end();
      resolve();
    });
  });

  socket.on('timeout', () => {
    socket.destroy();
    reject(new Error('Connection timed out'));
  });

  socket.on('error', (err) => {
    reject(err);
  });
});

// ── Routes ──────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'print-service', version: '2.0' });
});

// KOT print — accepts { lines: string[], printerIp: string, printerPort?: number }
app.post('/print-kot', async (req, res) => {
  console.log('[print-service] /print-kot request received');
  const lines = Array.isArray(req.body?.lines) ? req.body.lines : [];
  const printerHost = typeof req.body?.printerIp === 'string' && req.body.printerIp.trim().length > 0
    ? req.body.printerIp.trim()
    : null;
  const printerPort = req.body?.printerPort || DEFAULT_PRINTER_PORT;

  if (!lines.length) {
    res.status(400).json({ error: 'No lines provided' });
    return;
  }
  if (!printerHost) {
    res.status(400).json({ error: 'No printerIp provided' });
    return;
  }

  try {
    const payload = escposFromLines(lines);
    await sendToPrinter(payload, printerHost, printerPort);
    console.log('[print-service] KOT print success');
    res.json({ ok: true });
  } catch (error) {
    console.error('[print-service] KOT print error:', error.message);
    res.status(500).json({ error: 'Print failed: ' + error.message });
  }
});

// Bill print — accepts structured bill data + printerIp
app.post('/print-bill', async (req, res) => {
  console.log('[print-service] /print-bill request received');
  const data = req.body?.data;
  const printerHost = typeof req.body?.printerIp === 'string' && req.body.printerIp.trim().length > 0
    ? req.body.printerIp.trim()
    : null;
  const printerPort = req.body?.printerPort || DEFAULT_PRINTER_PORT;

  if (!data) {
    res.status(400).json({ error: 'No bill data provided' });
    return;
  }
  if (!printerHost) {
    res.status(400).json({ error: 'No printerIp provided' });
    return;
  }

  try {
    const payload = escposFromBillData(data);
    await sendToPrinter(payload, printerHost, printerPort);
    console.log('[print-service] Bill print success');
    res.json({ ok: true });
  } catch (error) {
    console.error('[print-service] Bill print error:', error.message);
    res.status(500).json({ error: 'Print failed: ' + error.message });
  }
});

// Bill print from plain text lines (same as KOT format)
app.post('/print-bill-raw', async (req, res) => {
  console.log('[print-service] /print-bill-raw request received');
  const lines = Array.isArray(req.body?.lines) ? req.body.lines : [];
  const printerHost = typeof req.body?.printerIp === 'string' && req.body.printerIp.trim().length > 0
    ? req.body.printerIp.trim()
    : null;
  const printerPort = req.body?.printerPort || DEFAULT_PRINTER_PORT;

  if (!lines.length) {
    res.status(400).json({ error: 'No lines provided' });
    return;
  }
  if (!printerHost) {
    res.status(400).json({ error: 'No printerIp provided' });
    return;
  }

  try {
    const payload = escposFromLines(lines);
    await sendToPrinter(payload, printerHost, printerPort);
    console.log('[print-service] Bill raw print success');
    res.json({ ok: true });
  } catch (error) {
    console.error('[print-service] Bill raw print error:', error.message);
    res.status(500).json({ error: 'Print failed: ' + error.message });
  }
});

// ── Start ───────────────────────────────────────────────────────────────

app.listen(SERVER_PORT, () => {
  console.log(`[print-service] Listening on http://localhost:${SERVER_PORT}`);
  console.log('[print-service] Endpoints:');
  console.log('  POST /print-kot   — KOT from text lines');
  console.log('  POST /print-bill  — Bill from structured data');
  console.log('  POST /print-bill-raw — Bill from text lines');
  console.log('  GET  /health      — Health check');
});
