import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Ime, email, predmet i poruka su obavezni.' },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'Email servis nije konfiguriran.' },
        { status: 500 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const from = process.env.RESEND_FROM ?? 'Mareta <onboarding@resend.dev>';
    const to = process.env.CONTACT_EMAIL_TO ?? process.env.RESEND_FROM ?? 'onboarding@resend.dev';
    const toAddress = typeof to === 'string' ? [to] : to;

    const { data, error } = await resend.emails.send({
      from,
      to: toAddress,
      replyTo: email,
      subject: `[Kontakt] ${subject}`,
      html: `
        <h2>Nova poruka s web stranice</h2>
        <p><strong>Od:</strong> ${name} &lt;${email}&gt;</p>
        <p><strong>Predmet:</strong> ${subject}</p>
        <p><strong>Poruka:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err) {
    return NextResponse.json(
      { error: 'Greška pri slanju poruke.' },
      { status: 500 }
    );
  }
}
