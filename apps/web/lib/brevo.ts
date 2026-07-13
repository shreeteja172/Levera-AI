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
    htmlContent: `<div style="margin:0;padding:0;background:#050505;font-family:Inter,Segoe UI,Arial,sans-serif;color:#ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;background:#050505;">
    <tr>
      <td align="center">

        <table width="520" cellpadding="0" cellspacing="0" 
          style="
            background:#0b0b0f;
            border:1px solid #1f2937;
            border-radius:20px;
            overflow:hidden;
            box-shadow:0 20px 60px rgba(0,0,0,0.5);
          ">

          <!-- Header -->
          <tr>
            <td style="padding:32px;text-align:center;">
              <div style="
                display:inline-block;
                background:linear-gradient(135deg,#00ff9d,#00c2ff);
                width:48px;
                height:48px;
                border-radius:14px;
                line-height:48px;
                font-size:24px;
                font-weight:800;
                color:#050505;
              ">
                L
              </div>

              <h1 style="
                margin:20px 0 8px;
                font-size:28px;
                letter-spacing:-1px;
                color:#ffffff;
              ">
                Levera AI
              </h1>

              <p style="
                margin:0;
                color:#9ca3af;
                font-size:14px;
              ">
                Intelligent tools for smarter developers
              </p>
            </td>
          </tr>


          <!-- Content -->
          <tr>
            <td style="padding:0 32px 32px;">

              <h2 style="
                color:#ffffff;
                font-size:20px;
                margin-bottom:12px;
              ">
                Verify your account
              </h2>

              <p style="
                color:#9ca3af;
                line-height:24px;
                font-size:15px;
              ">
                Use the verification code below to continue signing in to your
                Levera AI account.
              </p>


              <!-- OTP BOX -->
              <div style="
                margin:32px 0;
                padding:24px;
                text-align:center;
                background:#111827;
                border:1px solid #1f2937;
                border-radius:16px;
              ">

                <p style="
                  margin:0 0 12px;
                  color:#6b7280;
                  font-size:12px;
                  text-transform:uppercase;
                  letter-spacing:2px;
                ">
                  Verification Code
                </p>

                <div style="
                  font-size:42px;
                  font-weight:800;
                  letter-spacing:12px;
                  color:#00ff9d;
                  font-family:monospace;
                ">
                  ${otp}
                </div>

              </div>


              <p style="
                color:#9ca3af;
                font-size:14px;
                line-height:22px;
              ">
                This code expires in 
                <strong style="color:#ffffff;">
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
              border-top:1px solid #1f2937;
              text-align:center;
            ">

              <p style="
                margin:0;
                color:#6b7280;
                font-size:12px;
              ">
                © ${new Date().getFullYear()} Levera AI. All rights reserved.
              </p>

              <p style="
                margin:8px 0 0;
                color:#4b5563;
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