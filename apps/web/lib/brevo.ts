import { BrevoClient } from "@getbrevo/brevo";

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY!,
});

const BRAND = "#FF5A1F";
const INK = "#09090b";
const CARD = "#101014";
const LINE = "rgba(255,255,255,0.08)";
const MUTED = "#a1a1aa";
const FAINT = "#71717a";

const SERIF = "Georgia, 'Times New Roman', Times, serif";
const SANS =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const MONO =
  "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace";

function shell({
  preheader,
  eyebrow,
  heading,
  intro,
  content,
  outro,
}: {
  preheader: string;
  eyebrow: string;
  heading: string;
  intro: string;
  content: string;
  outro: string;
}): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="dark" />
<title>Levera</title>
</head>
<body style="margin:0;padding:0;background:${INK};">
  <div style="display:none;font-size:1px;color:${INK};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    ${preheader}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${INK};padding:40px 16px;">
    <tr>
      <td align="center">

        <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:560px;background:${CARD};border:1px solid ${LINE};border-radius:16px;overflow:hidden;">

          <tr>
            <td style="height:3px;background:${BRAND};font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <tr>
            <td style="padding:36px 40px 0 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-family:${MONO};font-size:20px;font-weight:700;color:${BRAND};letter-spacing:1px;padding-right:10px;">
                    &lt;&#183;&gt;
                  </td>
                  <td style="font-family:${SERIF};font-size:21px;color:#ffffff;letter-spacing:-0.3px;">
                    Levera
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:30px 40px 0 40px;">
              <p style="margin:0 0 14px 0;font-family:${SANS};font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:${FAINT};">
                ${eyebrow}
              </p>
              <h1 style="margin:0 0 14px 0;font-family:${SERIF};font-size:28px;line-height:1.25;color:#ffffff;font-weight:400;letter-spacing:-0.4px;">
                ${heading}
              </h1>
              <p style="margin:0;font-family:${SANS};font-size:15px;line-height:1.65;color:${MUTED};">
                ${intro}
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:28px 40px 0 40px;">
              ${content}
            </td>
          </tr>

          <tr>
            <td style="padding:26px 40px 36px 40px;">
              <p style="margin:0;font-family:${SANS};font-size:13px;line-height:1.7;color:${FAINT};">
                ${outro}
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:22px 40px;border-top:1px solid ${LINE};background:#0c0c0f;">
              <p style="margin:0 0 6px 0;font-family:${SERIF};font-size:13px;color:${MUTED};">
                From brute force to optimal.
              </p>
              <p style="margin:0;font-family:${SANS};font-size:11px;color:#52525b;">
                &copy; ${new Date().getFullYear()} Levera &#183; You received this because someone used this address to sign in.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  const content = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#16161b;border:1px solid rgba(255,90,31,0.18);border-radius:12px;">
      <tr>
        <td align="center" style="padding:26px 20px;">
          <p style="margin:0 0 14px 0;font-family:${SANS};font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:${FAINT};">
            Verification code
          </p>
          <div style="font-family:${MONO};font-size:38px;font-weight:700;letter-spacing:12px;color:${BRAND};text-indent:12px;">
            ${otp}
          </div>
          <p style="margin:16px 0 0 0;font-family:${SANS};font-size:12px;color:${FAINT};">
            Expires in 5 minutes
          </p>
        </td>
      </tr>
    </table>`;

  await brevo.transactionalEmails.sendTransacEmail({
    sender: { name: "Levera", email: process.env.BREVO_SENDER_EMAIL! },
    to: [{ email: to }],
    subject: `${otp} is your Levera code`,
    htmlContent: shell({
      preheader: `${otp} — your Levera sign-in code. Expires in 5 minutes.`,
      eyebrow: "Sign in",
      heading: "Let's get you back to solving.",
      intro:
        "Use the code below to finish signing in. It's good for five minutes — about one honest attempt at a hard DP problem.",
      content,
      outro:
        "Didn't try to sign in? You can safely ignore this email. Nothing changes until the code is used, and it expires on its own.",
    }),
  });
}

export async function sendResetPasswordEmail(
  to: string,
  url: string,
): Promise<void> {
  const content = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center" style="padding:0 0 22px 0;">
          <a href="${url}"
            style="display:inline-block;padding:14px 34px;background:${BRAND};color:#ffffff;font-family:${SANS};font-size:15px;font-weight:600;text-decoration:none;border-radius:10px;">
            Choose a new password
          </a>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 18px;background:#16161b;border:1px solid ${LINE};border-radius:10px;">
          <p style="margin:0 0 8px 0;font-family:${SANS};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${FAINT};">
            Or paste this link
          </p>
          <p style="margin:0;font-family:${MONO};font-size:12px;line-height:1.6;color:${MUTED};word-break:break-all;">
            ${url}
          </p>
        </td>
      </tr>
    </table>`;

  await brevo.transactionalEmails.sendTransacEmail({
    sender: { name: "Levera", email: process.env.BREVO_SENDER_EMAIL! },
    to: [{ email: to }],
    subject: "Reset your Levera password",
    htmlContent: shell({
      preheader:
        "Set a new Levera password. This link works once and expires in an hour.",
      eyebrow: "Password reset",
      heading: "Happens to the best of us.",
      intro:
        "Someone asked to reset the password on this account. If that was you, pick a new one below — the link works once and expires in an hour.",
      content,
      outro:
        "If this wasn't you, ignore this email and your password stays exactly as it is. No one can reset it without this link.",
    }),
  });
}
