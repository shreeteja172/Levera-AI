import { BrevoClient } from "@getbrevo/brevo";

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY!,
});

export async function sendOtpEmail(
  to: string,
  otp: string
): Promise<void> {
  await brevo.transactionalEmails.sendTransacEmail({
    sender: {
      name: "Levera",
      email: process.env.BREVO_SENDER_EMAIL!,
    },
    to: [{ email: to }],
    subject: "Your Levera verification code",
    htmlContent: `<div style="margin:0;padding:0;background:#09090b;font-family:Inter,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;color:#e4e4e7;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;background:#09090b;">
    <tr>
      <td align="center">

        <table width="520" cellpadding="0" cellspacing="0" 
          style="
            background:#0f0f12;
            border:1px solid rgba(255,255,255,0.08);
            border-radius:20px;
            overflow:hidden;
            box-shadow:0 20px 60px rgba(0,0,0,0.6);
          ">

          <!-- Header -->
          <tr>
            <td style="padding:40px 32px 32px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.05);">
              <div style="display:inline-block;vertical-align:middle;margin-bottom:12px;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF5A1F" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                  <circle cx="12" cy="12" r="2.5" fill="#FF5A1F" />
                </svg>
              </div>

              <h1 style="
                margin:0 0 8px;
                font-size:26px;
                font-weight:700;
                letter-spacing:-0.5px;
                color:#ffffff;
              ">
                Levera
              </h1>

              <p style="
                margin:0;
                color:#a1a1aa;
                font-size:14px;
                font-weight:400;
              ">
                Master Data Structures. Build Better Algorithms.
              </p>
            </td>
          </tr>


          <!-- Content -->
          <tr>
            <td style="padding:32px 32px 40px;">

              <h2 style="
                color:#ffffff;
                font-size:20px;
                font-weight:600;
                margin:0 0 12px;
              ">
                Verify your account
              </h2>

              <p style="
                color:#a1a1aa;
                line-height:24px;
                font-size:15px;
                margin:0 0 24px;
              ">
                Use the verification code below to continue signing in to your
                Levera account.
              </p>


              <!-- OTP BOX -->
              <div style="
                margin:32px 0;
                padding:28px 24px;
                text-align:center;
                background:#141417;
                border:1px solid rgba(255,90,31,0.15);
                border-radius:16px;
              ">

                <p style="
                  margin:0 0 16px;
                  color:#71717a;
                  font-size:11px;
                  font-weight:600;
                  text-transform:uppercase;
                  letter-spacing:2px;
                ">
                  Verification Code
                </p>

                <div style="
                  font-size:44px;
                  font-weight:800;
                  letter-spacing:14px;
                  color:#FF5A1F;
                  font-family:ui-monospace,SFMono-Regular,SF Mono,Menlo,Consolas,Liberation Mono,monospace;
                  margin-left:14px; /* offset the last letter spacing */
                ">
                  ${otp}
                </div>

              </div>


              <p style="
                color:#a1a1aa;
                font-size:14px;
                line-height:22px;
                margin:0;
              ">
                This code expires in 
                <strong style="color:#ffffff;font-weight:600;">
                  5 minutes
                </strong>.
                If you didn't request this code, you can safely ignore this email.
              </p>

            </td>
          </tr>


          <!-- Footer -->
          <tr>
            <td style="
              padding:24px 32px;
              border-top:1px solid rgba(255,255,255,0.05);
              text-align:center;
              background:#0c0c0e;
            ">

              <p style="
                margin:0;
                color:#71717a;
                font-size:12px;
              ">
                © ${new Date().getFullYear()} Levera. All rights reserved.
              </p>

              <p style="
                margin:8px 0 0;
                color:#52525b;
                font-size:12px;
              ">
                Built for developers who think beyond limits 🚀
              </p>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</div>`,
  });
}