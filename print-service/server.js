const express = require('express');
const cors = require('cors');
const net = require('net');

const PRINTER_HOST = '192.168.0.102';
const PRINTER_PORT = 9100;
const SERVER_PORT = 3001;

const app = express();
app.use(cors());
app.use(express.json({ limit: '256kb' }));

const escposBufferFromLines = (lines) => {
  const init = Buffer.from([0x1b, 0x40]);
  const alignLeft = Buffer.from([0x1b, 0x61, 0x00]);
  const alignCenter = Buffer.from([0x1b, 0x61, 0x01]);
  const boldOn = Buffer.from([0x1b, 0x45, 0x01]);
  const boldOff = Buffer.from([0x1b, 0x45, 0x00]);
  const doubleOn = Buffer.from([0x1d, 0x21, 0x11]);
  const doubleOff = Buffer.from([0x1d, 0x21, 0x00]);
  const cut = Buffer.from([0x1d, 0x56, 0x00]);

  const buffers = [init];

  lines.forEach((line, idx) => {
    if (idx === 0) {
      buffers.push(alignCenter, doubleOn, boldOn, Buffer.from(String(line) + '\n', 'ascii'), boldOff, doubleOff);
      return;
    }
    if (line.startsWith('TABLE:')) {
      buffers.push(alignCenter, doubleOn, boldOn, Buffer.from(String(line) + '\n', 'ascii'), boldOff, doubleOff);
      return;
    }
    if (line.startsWith('Cust:') || line.startsWith('Time:') || line.startsWith('Printed at')) {
      buffers.push(alignCenter, Buffer.from(String(line) + '\n', 'ascii'));
      return;
    }
    buffers.push(alignLeft, Buffer.from(String(line) + '\n', 'ascii'));
  });

  buffers.push(Buffer.from('\n\n', 'ascii'), cut);
  return Buffer.concat(buffers);
};

const sendToPrinter = (payload, printerHost) => new Promise((resolve, reject) => {
  const socket = new net.Socket();

  socket.connect(PRINTER_PORT, printerHost, () => {
    console.log('[print-service] Connected to printer', printerHost, PRINTER_PORT);
    socket.write(payload, (err) => {
      if (err) {
        reject(err);
        return;
      }
      console.log('[print-service] Bytes sent', payload.length);
      socket.end();
      resolve();
    });
  });

  socket.on('error', (err) => {
    reject(err);
  });
});

app.post('/print-kot', async (req, res) => {
  console.log('[print-service] /print-kot request received');
  const lines = Array.isArray(req.body?.lines) ? req.body.lines : [];
  const printerHost = typeof req.body?.printerIp === 'string' && req.body.printerIp.trim().length > 0
    ? req.body.printerIp.trim()
    : PRINTER_HOST;
  if (!lines.length) {
    res.status(400).json({ error: 'No lines provided' });
    return;
  }

  try {
    const payload = escposBufferFromLines(lines);
    await sendToPrinter(payload, printerHost);
    console.log('[print-service] KOT print success');
    res.json({ ok: true });
  } catch (error) {
    console.error('[print-service] KOT print error', error);
    res.status(500).json({ error: 'Print failed' });
  }
});

app.listen(SERVER_PORT, () => {
  console.log(`[print-service] Listening on http://localhost:${SERVER_PORT}`);
});
