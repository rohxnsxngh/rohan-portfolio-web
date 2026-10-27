import type { APIRoute } from 'astro';
import { Resend } from 'resend';

// This route reads the request body and a runtime secret, so it must run as a
// function. Every page in this site opts into prerendering; saying so here
// keeps the one route that cannot be static explicit rather than implied.
export const prerender = false;

// Sending identity. The domain has to be verified in Resend (SPF + DKIM
// records on rohxnsxngh.com) for these to be accepted; see NOTE below.
const FROM_ADDRESS = 'Portfolio Contact Form <website@rohxnsxngh.com>';
const TO_ADDRESS = 'rohan.singh.do@gmail.com';

// Caps on what a stranger can push through the form. Long enough for a real
// message, short enough that a single POST cannot be used to mail a payload.
const MAX_LENGTHS = { name: 100, email: 254, subject: 200, message: 5000 };

// What the visitor is told when the send fails for any reason. Resend's own
// error text can name the account, the domain or the verification state, so it
// goes to the server log instead of to whoever filled in the form.
const SEND_FAILURE_MESSAGE =
  'Your message could not be sent right now. Please email rohan.singh.do@gmail.com directly.';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// A newline in a value that ends up in a header (the subject) is the classic
// header-injection vector, so collapse anything line-shaped before use.
function singleLine(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').trim();
}

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  // Read the key per request rather than at module scope: `new Resend()` throws
  // when the key is absent, and at module scope that throw happens at import
  // time and takes down the route with an opaque 500 before any handler runs.
  const apiKey = import.meta.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error(
      '[contact] RESEND_API_KEY is not set. The contact form cannot send mail. ' +
        'Add it to the Vercel project environment (and .env.local for `astro dev`).'
    );
    return json(
      { error: 'The contact form is not configured. Please email rohan.singh.do@gmail.com directly.' },
      500
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Malformed request. Please try again.' }, 400);
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const subject = typeof body.subject === 'string' ? body.subject.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (!name || !email || !subject || !message) {
    return json({ error: 'All fields are required.' }, 400);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return json({ error: 'Please enter a valid email address.' }, 400);
  }

  if (
    name.length > MAX_LENGTHS.name ||
    email.length > MAX_LENGTHS.email ||
    subject.length > MAX_LENGTHS.subject ||
    message.length > MAX_LENGTHS.message
  ) {
    return json({ error: 'That message is too long. Please shorten it and try again.' }, 400);
  }

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(singleLine(subject));

  // NOTE: `from` must be an address on a domain verified in the Resend
  // dashboard. Resend rejects the send outright if rohxnsxngh.com is not
  // verified, or if `from` is swapped back to the onboarding@resend.dev
  // sandbox sender, which only ever delivers to the Resend account owner and
  // silently drops mail triggered by anyone else. `replyTo` carries the
  // visitor's address so hitting reply in the inbox answers them, not the site.
  let sent;
  try {
    sent = await new Resend(apiKey).emails.send({
      from: FROM_ADDRESS,
      to: [TO_ADDRESS],
      replyTo: email,
      subject: `[Portfolio Contact] ${singleLine(subject)}`,
      text: [
        `From: ${name} (${email})`,
        `Subject: ${singleLine(subject)}`,
        '',
        message,
        '',
        'Sent from the contact form at rohxnsxngh.com',
      ].join('\n'),
      html: `
        <div style="font-family: 'IBM Plex Mono', monospace; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>

          <div style="margin: 20px 0;">
            <p style="margin: 10px 0;">
              <strong style="color: #666;">From:</strong><br>
              ${safeName} (${safeEmail})
            </p>

            <p style="margin: 10px 0;">
              <strong style="color: #666;">Subject:</strong><br>
              ${safeSubject}
            </p>

            <p style="margin: 10px 0;">
              <strong style="color: #666;">Message:</strong>
            </p>
            <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; white-space: pre-wrap;">
              ${escapeHtml(message)}
            </div>
          </div>

          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">

          <p style="color: #999; font-size: 12px;">
            This message was sent from your portfolio contact form at rohxnsxngh.com
          </p>
        </div>
      `,
    });
  } catch (thrown) {
    console.error('[contact] Resend threw while sending from', FROM_ADDRESS, thrown);
    return json({ error: SEND_FAILURE_MESSAGE }, 502);
  }

  // Resend reports rejections in the response body rather than by throwing, and
  // a rejected send with no id means nothing reached the inbox. Treat both as
  // failure so the visitor is never told a message arrived when it did not.
  if (sent.error || !sent.data?.id) {
    console.error(
      `[contact] Resend rejected the send from ${FROM_ADDRESS}: ` +
        `${sent.error?.name ?? 'no_id_returned'}: ${sent.error?.message ?? 'no error message returned'}. ` +
        'If this mentions the domain or the sender, verify rohxnsxngh.com in the Resend dashboard.'
    );
    return json({ error: SEND_FAILURE_MESSAGE }, 502);
  }

  return json({ success: true, id: sent.data.id }, 200);
};
