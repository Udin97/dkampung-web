/**
 * parseNotes — converts the serialised notes string from reservations into structured data.
 *
 * Notes format (written by app/reservations/page.js):
 *   PESANAN:
 *   • Apam Putih × 25 pax — RM 37.50
 *   Jumlah: 50 pax | Anggaran: RM 82.50
 *   Nota: some optional text
 */
export function parseNotes(notes) {
  if (!notes) return { items: [], totalQty: 0, totalPrice: 0, specialNote: '' }

  const items = []
  for (const line of notes.split('\n')) {
    const m = line.match(/^•\s(.+)\s×\s(\d+)\spax\s—\sRM\s([\d.]+)/)
    if (m) items.push({ name: m[1], qty: parseInt(m[2]), subtotal: parseFloat(m[3]) })
  }

  const totLine = notes.match(/Jumlah:\s(\d+)\spax\s\|\sAnggaran:\sRM\s([\d.]+)/)
  const totalQty   = totLine ? parseInt(totLine[1])   : items.reduce((s, i) => s + i.qty, 0)
  const totalPrice = totLine ? parseFloat(totLine[2]) : items.reduce((s, i) => s + i.subtotal, 0)

  const notaLine  = notes.match(/Nota:\s(.+)/)
  const specialNote = notaLine ? notaLine[1].trim() : ''

  return { items, totalQty, totalPrice, specialNote }
}

function fmtDate(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString('ms-MY', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
  } catch { return dateStr }
}

function bookingRef(id) {
  return id ? `DK-${id.slice(0, 8).toUpperCase()}` : 'DK-??????'
}

// ─── Email receipt ────────────────────────────────────────────────────────────

export function emailHtml(reservation) {
  const { id, name, email, phone, date, time, branch, notes, created_at } = reservation
  const { items, totalPrice, specialNote } = parseNotes(notes)
  const ref = bookingRef(id)

  const itemRows = items.length
    ? items.map(({ name: n, qty, subtotal }) => `
        <tr>
          <td style="padding:10px 16px;color:#1A1008;font-size:14px">${n}</td>
          <td style="padding:10px 16px;color:#6B5744;font-size:14px;text-align:center">${qty} pax</td>
          <td style="padding:10px 16px;color:#1A1008;font-size:14px;text-align:right;font-weight:600">RM ${subtotal.toFixed(2)}</td>
        </tr>`).join('')
    : `<tr><td colspan="3" style="padding:10px 16px;color:#6B5744;font-size:13px;text-align:center">—</td></tr>`

  return `
<!DOCTYPE html>
<html lang="ms">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px;background:#F5F0E8;font-family:'Helvetica Neue',Arial,sans-serif">
  <div style="max-width:560px;margin:auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10)">

    <!-- Header -->
    <div style="background:#1B4332;padding:24px 28px;display:flex;align-items:center;justify-content:space-between">
      <div>
        <div style="color:#C9A84C;font-size:22px;font-weight:900;letter-spacing:3px">DKAMPUNG</div>
        <div style="color:#C9A84C;opacity:0.6;font-size:11px;letter-spacing:1.5px;margin-top:2px">KUIH TRADISIONAL</div>
      </div>
      <div style="text-align:right">
        <div style="color:#C9A84C;font-size:13px;font-weight:700">${ref}</div>
        <div style="color:#fff;opacity:0.5;font-size:11px;margin-top:2px">RESIT TEMPAHAN</div>
      </div>
    </div>

    <!-- Status -->
    <div style="padding:20px 28px;border-bottom:1px solid #F0E8DC">
      <div style="font-size:20px;font-weight:700;color:#1B4332;margin-bottom:4px">Tempahan Diterima ✅</div>
      <div style="color:#6B5744;font-size:14px">
        Terima kasih, <strong>${name}</strong>. Tempahan anda telah kami terima dan sedang diproses.
      </div>
    </div>

    <!-- Info grid -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0;border-bottom:1px solid #F0E8DC">
      <div style="padding:20px 28px;border-right:1px solid #F0E8DC">
        <div style="font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#C9A84C;margin-bottom:10px">Pelanggan</div>
        ${[['Nama', name], ['Telefon', phone], ['Emel', email]].map(([k, v]) => `
          <div style="margin-bottom:6px">
            <span style="color:#6B5744;font-size:12px">${k}: </span>
            <span style="color:#1A1008;font-size:13px;font-weight:600">${v}</span>
          </div>`).join('')}
      </div>
      <div style="padding:20px 28px">
        <div style="font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#C9A84C;margin-bottom:10px">Butiran</div>
        ${[['Tarikh', fmtDate(date)], ['Masa', time], ['Cawangan', branch]].map(([k, v]) => `
          <div style="margin-bottom:6px">
            <span style="color:#6B5744;font-size:12px">${k}: </span>
            <span style="color:#1A1008;font-size:13px;font-weight:600">${v}</span>
          </div>`).join('')}
      </div>
    </div>

    <!-- Order table -->
    <div style="padding:20px 28px;border-bottom:1px solid #F0E8DC">
      <div style="font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#C9A84C;margin-bottom:12px">Senarai Pesanan</div>
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="background:#F5F0E8">
            <th style="padding:8px 16px;text-align:left;font-size:11px;color:#6B5744;font-weight:600;letter-spacing:1px;text-transform:uppercase">Item</th>
            <th style="padding:8px 16px;text-align:center;font-size:11px;color:#6B5744;font-weight:600;letter-spacing:1px;text-transform:uppercase">Kuantiti</th>
            <th style="padding:8px 16px;text-align:right;font-size:11px;color:#6B5744;font-weight:600;letter-spacing:1px;text-transform:uppercase">Jumlah</th>
          </tr>
        </thead>
        <tbody style="border-top:1px solid #F0E8DC">
          ${itemRows}
        </tbody>
        <tfoot>
          <tr style="background:#1B4332">
            <td colspan="2" style="padding:12px 16px;color:#C9A84C;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase">Jumlah Anggaran</td>
            <td style="padding:12px 16px;color:#C9A84C;font-size:16px;font-weight:900;text-align:right">RM ${totalPrice.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    ${specialNote ? `
    <!-- Special note -->
    <div style="padding:16px 28px;border-bottom:1px solid #F0E8DC;background:#FFFBF5">
      <div style="font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#C9A84C;margin-bottom:6px">Nota Khas</div>
      <div style="color:#1A1008;font-size:13px">${specialNote}</div>
    </div>` : ''}

    <!-- Notice -->
    <div style="margin:20px 28px;padding:16px;background:#FEF3C7;border-radius:12px;border-left:3px solid #C9A84C">
      <div style="color:#92400E;font-size:13px;line-height:1.6">
        <strong>Seterusnya:</strong> Kami akan menghubungi anda dalam masa <strong>24 jam</strong> untuk pengesahan muktamad.
        Untuk pertanyaan segera, WhatsApp kami di
        <a href="https://wa.me/60143860742" style="color:#1B4332;font-weight:700">+60 14-386 0742</a>.
      </div>
    </div>

    <!-- Footer -->
    <div style="padding:16px 28px;background:#F5F0E8;text-align:center">
      <div style="color:#6B5744;font-size:11px">© 2025 DKAMPUNG · Terima kasih kerana memilih kami!</div>
      <div style="color:#6B5744;opacity:0.6;font-size:10px;margin-top:4px">Resit dijana automatik · ${ref}</div>
    </div>

  </div>
</body>
</html>`
}

// ─── Print receipt ─────────────────────────────────────────────────────────────

export function printHtml(reservation) {
  const { id, name, email, phone, date, time, branch, notes, created_at } = reservation
  const { items, totalPrice, specialNote } = parseNotes(notes)
  const ref = bookingRef(id)
  const issuedDate = created_at
    ? new Date(created_at).toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })

  const itemRows = items.length
    ? items.map(({ name: n, qty, subtotal }) =>
        `<tr><td>${n}</td><td class="center">${qty} pax</td><td class="right">RM ${subtotal.toFixed(2)}</td></tr>`
      ).join('')
    : `<tr><td colspan="3" class="center muted">Tiada pesanan dicatat</td></tr>`

  return `<!DOCTYPE html>
<html lang="ms">
<head>
  <meta charset="UTF-8">
  <title>Resit Tempahan ${ref}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 13px; color: #111; background: #fff; padding: 32px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #1B4332; padding-bottom: 16px; margin-bottom: 20px; }
    .brand { font-size: 22px; font-weight: 900; letter-spacing: 3px; color: #1B4332; }
    .brand-sub { font-size: 10px; letter-spacing: 2px; color: #6B5744; margin-top: 2px; }
    .ref-block { text-align: right; }
    .ref-block .ref { font-size: 16px; font-weight: 700; color: #1B4332; }
    .ref-block .label { font-size: 10px; color: #6B5744; margin-top: 2px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 20px; }
    .info-section h3 { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #C9A84C; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
    .info-section p { margin-bottom: 4px; font-size: 13px; }
    .info-section p span { font-weight: 700; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    table thead tr { background: #1B4332; color: #C9A84C; }
    table thead th { padding: 9px 12px; text-align: left; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; }
    table tbody tr:nth-child(even) { background: #F9F6F0; }
    table tbody td { padding: 9px 12px; border-bottom: 1px solid #eee; }
    table tfoot tr { background: #F0EDE6; font-weight: 700; }
    table tfoot td { padding: 10px 12px; font-size: 14px; border-top: 2px solid #1B4332; }
    .center { text-align: center; }
    .right { text-align: right; }
    .muted { color: #999; }
    .nota-box { border: 1px solid #ddd; border-radius: 6px; padding: 10px 14px; margin-bottom: 20px; font-size: 12px; color: #555; }
    .sign-section { margin-top: 32px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
    .sign-line { border-top: 1px solid #333; padding-top: 6px; font-size: 11px; color: #555; }
    .footer { margin-top: 24px; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 12px; }
    @media print {
      body { padding: 16px; }
      button { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">DKAMPUNG</div>
      <div class="brand-sub">KUIH TRADISIONAL</div>
    </div>
    <div class="ref-block">
      <div class="ref">${ref}</div>
      <div class="label">RESIT TEMPAHAN</div>
      <div class="label" style="margin-top:4px">Tarikh: ${issuedDate}</div>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-section">
      <h3>Maklumat Pelanggan</h3>
      <p>Nama: <span>${name}</span></p>
      <p>Telefon: <span>${phone}</span></p>
      <p>Emel: <span>${email}</span></p>
    </div>
    <div class="info-section">
      <h3>Butiran Tempahan</h3>
      <p>Cawangan: <span>${branch}</span></p>
      <p>Tarikh Ambil: <span>${fmtDate(date)}</span></p>
      <p>Masa: <span>${time}</span></p>
    </div>
  </div>

  <h3 style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#C9A84C;margin-bottom:10px;border-bottom:1px solid #eee;padding-bottom:4px">Senarai Pesanan</h3>
  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th class="center">Kuantiti</th>
        <th class="right">Jumlah (RM)</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
    <tfoot>
      <tr>
        <td colspan="2">JUMLAH ANGGARAN</td>
        <td class="right">RM ${totalPrice.toFixed(2)}</td>
      </tr>
    </tfoot>
  </table>

  ${specialNote ? `<div class="nota-box"><strong>Nota Khas:</strong> ${specialNote}</div>` : ''}

  <div class="sign-section">
    <div>
      <div style="height:40px"></div>
      <div class="sign-line">Tandatangan Pelanggan</div>
    </div>
    <div>
      <div style="height:40px"></div>
      <div class="sign-line">Tandatangan Kakitangan</div>
    </div>
  </div>

  <div class="footer">
    © 2025 DKAMPUNG · +60 14-386 0742 · Resit dijana automatik · ${ref}
  </div>
</body>
</html>`
}
