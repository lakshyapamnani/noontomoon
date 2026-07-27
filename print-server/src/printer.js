import escpos from "escpos";
import Network from "escpos-network";

escpos.Network = Network;

export async function printToIp({ ip, port = 9100, build }) {
  const device = new escpos.Network(ip, port);
  const printer = new escpos.Printer(device, { encoding: "GB18030" });

  await new Promise((resolve, reject) => {
    device.open((err) => (err ? reject(err) : resolve(null)));
  });

  try {
    build(printer);
    printer.cut();
    printer.close();
  } catch (e) {
    try {
      printer.close();
    } catch {
      // ignore
    }
    throw e;
  }
}

export function buildKot(printer, { header, lines, footer }) {
  printer.align("ct").style("b").size(1, 1).text(header.title);
  printer.size(0, 0).style("normal").text(header.subtitle);
  printer.text("--------------------------------");
  printer.align("lt").style("b").text(`TOKEN: #${header.token}`);
  printer.style("normal").text(`${header.mode} · ${header.payment} · ${header.time}`);
  if (header.customer) printer.text(`Customer: ${header.customer}`);
  printer.text("--------------------------------");
  for (const l of lines) {
    const name = l.name.length > 26 ? l.name.slice(0, 26) : l.name;
    printer.style("b").text(`${String(l.qty).padStart(2, " ")}  ${name}`);
    if (l.notes) printer.style("normal").text(`    Note: ${l.notes}`);
  }
  printer.text("--------------------------------");
  printer.align("ct").text(footer);
}

export function buildBill(printer, { header, lines, totals, footer }) {
  printer.align("ct").style("b").size(1, 1).text(header.title);
  printer.size(0, 0).style("normal").text(header.subtitle);
  printer.text("--------------------------------");
  printer.align("lt").style("b").text(`Invoice · TOKEN #${header.token}`);
  printer.style("normal").text(`${header.time}`);
  if (header.customer) printer.text(`Customer: ${header.customer}`);
  printer.text("--------------------------------");
  printer.style("b").text("QTY  ITEM                      AMT");
  printer.style("normal");
  for (const l of lines) {
    const name = l.name.length > 22 ? l.name.slice(0, 22) : l.name;
    const qty = String(l.qty).padStart(2, " ");
    const amt = String(l.amount).padStart(6, " ");
    printer.text(`${qty}   ${name.padEnd(22, " ")}  ${amt}`);
  }
  printer.text("--------------------------------");
  printer.text(`Subtotal: ${totals.subtotal}`);
  printer.text(`Tax:      ${totals.tax}`);
  printer.style("b").text(`TOTAL:    ${totals.total}`);
  printer.style("normal").text("--------------------------------");
  printer.align("ct").text(footer);
}

