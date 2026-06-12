import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Alamat tujuan & pengirim diambil dari env agar tidak hardcode.
const CONTACT_EMAIL_TO = process.env.CONTACT_EMAIL_TO || '';
// Resend butuh domain terverifikasi untuk "from". Untuk testing bisa pakai onboarding@resend.dev.
const CONTACT_EMAIL_FROM = process.env.CONTACT_EMAIL_FROM || 'Toko Rizky <onboarding@resend.dev>';

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json({ message: 'Nama, email, dan pesan wajib diisi.' }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY || !CONTACT_EMAIL_TO) {
      return NextResponse.json(
        { message: 'Konfigurasi email server belum lengkap.' },
        { status: 500 },
      );
    }

    const safeSubject = subject || 'Pesan dari halaman kontak';

    const { error } = await resend.emails.send({
      from: CONTACT_EMAIL_FROM,
      to: CONTACT_EMAIL_TO,
      replyTo: email,
      subject: `[Kontak] ${safeSubject} — ${name}`,
      text:
        `Nama    : ${name}\n` +
        `Email   : ${email}\n` +
        `Subjek  : ${safeSubject}\n\n` +
        `Pesan:\n${message}\n`,
      html:
        `<h2>Pesan baru dari halaman kontak</h2>` +
        `<p><strong>Nama:</strong> ${escapeHtml(name)}</p>` +
        `<p><strong>Email:</strong> ${escapeHtml(email)}</p>` +
        `<p><strong>Subjek:</strong> ${escapeHtml(safeSubject)}</p>` +
        `<hr/>` +
        `<p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ message: 'Gagal mengirim pesan. Coba lagi nanti.' }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Contact route error:', error);
    return NextResponse.json({ message: error.message || 'Terjadi kesalahan.' }, { status: 500 });
  }
}

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
