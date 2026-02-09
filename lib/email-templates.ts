
interface EmailTemplateProps {
    url: string;
    subject: string;
    previewText: string;
    buttonText: string;
    title: string;
    message: string;
}

export const getEmailTemplate = ({
    url,
    subject,
    previewText,
    buttonText,
    title,
    message
}: EmailTemplateProps) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1f2937; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); margin-top: 40px; margin-bottom: 40px; }
    .header { background-color: #4f46e5; padding: 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 1px; }
    .content { padding: 40px 30px; }
    .title { font-size: 20px; font-weight: 600; color: #111827; margin-bottom: 16px; }
    .message { font-size: 16px; line-height: 24px; color: #4b5563; margin-bottom: 24px; }
    .button-container { text-align: center; margin: 32px 0; }
    .button { background-color: #4f46e5; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block; transition: background-color 0.2s; }
    .button:hover { background-color: #4338ca; }
    .footer { background-color: #f9fafb; padding: 24px; text-align: center; font-size: 14px; color: #6b7280; border-top: 1px solid #e5e7eb; }
    .link-text { color: #4f46e5; word-break: break-all; }
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${previewText}
  </div>
  <div class="container">
    <div class="header">
        <h1>CupQuest</h1>
    </div>
    <div class="content">
      <h2 class="title">${title}</h2>
      <p class="message">${message}</p>
      <div class="button-container">
        <a href="${url}" class="button" target="_blank">${buttonText}</a>
      </div>
      <p class="message" style="margin-top: 32px; font-size: 14px;">
        If the button above doesn't work, copy and paste this link into your browser:
        <br />
        <a href="${url}" class="link-text">${url}</a>
      </p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} CupQuest. All rights reserved.</p>
      <p>If you didn't request this email, you can safely ignore it.</p>
    </div>
  </div>
</body>
</html>
  `;
};
