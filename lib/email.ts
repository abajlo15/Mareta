import { Resend } from 'resend';

const ADMIN_NOTIFICATION_EMAIL = 'maretasunglasseshr@gmail.com';

type OrderEmailItem = {
  quantity?: number;
  price?: number;
  product?: { name?: string } | { name?: string }[] | null;
};

type OrderEmailPayload = {
  id: string;
  total_amount: number;
  payment_method?: string | null;
  shipping_provider?: string | null;
  shipping_address?: {
    full_name?: string;
    email?: string;
    phone?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    postal_code?: string;
    country?: string;
  } | null;
  order_items?: OrderEmailItem[] | null;
};

function formatMoney(value: number): string {
  return `${Number(value).toFixed(2)} EUR`;
}

function resolveProductName(item: OrderEmailItem): string {
  if (Array.isArray(item.product)) {
    return item.product[0]?.name || 'Proizvod';
  }
  return item.product?.name || 'Proizvod';
}

function buildItemsRows(order: OrderEmailPayload): string {
  const items = order.order_items || [];
  if (!items.length) return '<tr><td style="padding:8px 0;color:#64748b;">Bez stavki</td></tr>';
  return items
    .map((item) => {
      const qty = item.quantity || 0;
      const price = Number(item.price || 0);
      const name = resolveProductName(item);
      return `<tr><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;">${name} x ${qty}</td><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;text-align:right;">${formatMoney(price * qty)}</td></tr>`;
    })
    .join('');
}

function paymentLabel(paymentMethod?: string | null): string {
  if (paymentMethod === 'card') return 'Kartica';
  if (paymentMethod === 'cash_on_delivery') return 'Pouzećem';
  return paymentMethod || '—';
}

function shippingLabel(provider?: string | null): string {
  if (provider === 'boxnow') return 'BoxNow';
  if (provider === 'internal') return 'Dostava';
  return provider || '—';
}

function buildEmailWrapper(title: string, subtitle: string, content: string): string {
  return `
    <div style="margin:0;padding:24px;background:#f8fafc;font-family:Arial,sans-serif;color:#0f172a;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
        <tr>
          <td style="padding:20px 24px;background:linear-gradient(135deg,#0f172a,#1e293b);color:#ffffff;">
            <p style="margin:0;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;opacity:0.9;">Mareta Sunglasses</p>
            <h1 style="margin:8px 0 0;font-size:22px;line-height:1.3;">${title}</h1>
            <p style="margin:8px 0 0;font-size:14px;color:#cbd5e1;">${subtitle}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px;">
            ${content}
          </td>
        </tr>
        <tr>
          <td style="padding:16px 24px;background:#f8fafc;border-top:1px solid #e2e8f0;">
            <p style="margin:0;font-size:12px;color:#64748b;">Mareta Sunglasses • Ova poruka je automatski generirana.</p>
          </td>
        </tr>
      </table>
    </div>
  `;
}

function buildCustomerEmailHtml(order: OrderEmailPayload): string {
  const shortOrderId = order.id.slice(0, 8);
  const content = `
    <div style="margin:0 0 14px;padding:12px 14px;border:1px solid #bae6fd;background:#f0f9ff;border-radius:8px;">
      <p style="margin:0;font-size:14px;color:#0c4a6e;">Narudžba <strong>#${shortOrderId}</strong> je uspješno zaprimljena i u obradi je.</p>
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 18px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px 12px;">
      <tr><td style="padding:4px 0;color:#334155;">Ukupno</td><td style="padding:4px 0;color:#0f172a;text-align:right;"><strong>${formatMoney(order.total_amount)}</strong></td></tr>
      <tr><td style="padding:4px 0;color:#334155;">Način plaćanja</td><td style="padding:4px 0;color:#0f172a;text-align:right;">${paymentLabel(order.payment_method)}</td></tr>
      <tr><td style="padding:4px 0;color:#334155;">Dostava</td><td style="padding:4px 0;color:#0f172a;text-align:right;">${shippingLabel(order.shipping_provider)}</td></tr>
    </table>
    <p style="margin:0 0 8px;font-size:14px;font-weight:700;">Stavke narudžbe</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 16px;">
      ${buildItemsRows(order)}
    </table>
    <p style="margin:0;font-size:14px;color:#334155;">Javit ćemo vam se čim bude novih informacija o narudžbi. Hvala vam na kupnji.</p>
  `;
  return buildEmailWrapper(`Potvrda narudžbe #${shortOrderId}`, 'Narudžba je uspješno kreirana', content);
}

function buildAdminEmailHtml(order: OrderEmailPayload): string {
  const shipping = order.shipping_address || {};
  const content = `
    <div style="margin:0 0 14px;padding:12px 14px;border:1px solid #bbf7d0;background:#f0fdf4;border-radius:8px;">
      <p style="margin:0;font-size:14px;color:#166534;">Stigla je nova narudžba i spremna je za internu obradu.</p>
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 18px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px 12px;">
      <tr><td style="padding:4px 0;color:#334155;">ID narudžbe</td><td style="padding:4px 0;color:#0f172a;text-align:right;"><strong>${order.id}</strong></td></tr>
      <tr><td style="padding:4px 0;color:#334155;">Kupac</td><td style="padding:4px 0;color:#0f172a;text-align:right;">${shipping.full_name || '—'}</td></tr>
      <tr><td style="padding:4px 0;color:#334155;">Email</td><td style="padding:4px 0;color:#0f172a;text-align:right;">${shipping.email || '—'}</td></tr>
      <tr><td style="padding:4px 0;color:#334155;">Telefon</td><td style="padding:4px 0;color:#0f172a;text-align:right;">${shipping.phone || '—'}</td></tr>
      <tr><td style="padding:4px 0;color:#334155;">Ukupno</td><td style="padding:4px 0;color:#0f172a;text-align:right;"><strong>${formatMoney(order.total_amount)}</strong></td></tr>
      <tr><td style="padding:4px 0;color:#334155;">Način plaćanja</td><td style="padding:4px 0;color:#0f172a;text-align:right;">${paymentLabel(order.payment_method)}</td></tr>
      <tr><td style="padding:4px 0;color:#334155;">Dostava</td><td style="padding:4px 0;color:#0f172a;text-align:right;">${shippingLabel(order.shipping_provider)}</td></tr>
    </table>
    <p style="margin:0 0 6px;font-size:14px;color:#334155;">Adresa: ${shipping.address_line1 || '—'}${shipping.address_line2 ? `, ${shipping.address_line2}` : ''}, ${shipping.postal_code || '—'} ${shipping.city || ''}, ${shipping.country || '—'}</p>
    <p style="margin:14px 0 8px;font-size:14px;font-weight:700;">Stavke narudžbe</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      ${buildItemsRows(order)}
    </table>
  `;
  return buildEmailWrapper(`Nova narudžba #${order.id.slice(0, 8)}`, 'Zaprimljena je nova narudžba u webshopu', content);
}

export async function sendOrderCreatedEmails(order: OrderEmailPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  if (!apiKey) {
    console.warn('Order emails skipped: RESEND_API_KEY is missing.');
    return;
  }
  if (!fromEmail) {
    console.warn('Order emails skipped: RESEND_FROM_EMAIL is missing.');
    return;
  }

  const resend = new Resend(apiKey);
  const customerEmail = order.shipping_address?.email;

  const sends: Array<Promise<{ data?: { id?: string } | null; error?: { message?: string } | null }>> = [];
  if (customerEmail) {
    sends.push(
      resend.emails.send({
        from: fromEmail,
        to: customerEmail,
        subject: `Potvrda narudžbe #${order.id.slice(0, 8)}`,
        html: buildCustomerEmailHtml(order),
      })
    );
  } else {
    console.warn(`Order ${order.id}: customer email missing, skipped customer notification.`);
  }

  sends.push(
    resend.emails.send({
      from: fromEmail,
      to: ADMIN_NOTIFICATION_EMAIL,
      subject: `Nova narudžba ${order.id.slice(0, 8)}`,
      html: buildAdminEmailHtml(order),
    })
  );

  const results = await Promise.all(sends);
  const failed = results.find((result) => result?.error);
  if (failed?.error) {
    throw new Error(failed.error.message || "Resend failed to send email.");
  }
}
