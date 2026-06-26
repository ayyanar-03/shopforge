import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  private async getTransporter(): Promise<nodemailer.Transporter> {
    if (this.transporter) return this.transporter;

    if (process.env.SMTP_HOST) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT ?? '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
    } else {
      // Dev: auto-create an Ethereal test account — preview URL logged to console
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });
      this.logger.log(`Ethereal test account: ${testAccount.user}`);
    }

    return this.transporter;
  }

  async sendOrderConfirmation(
    to: string,
    userName: string,
    order: {
      id: number;
      total: number;
      items: { name: string; quantity: number; price: number }[];
    },
  ) {
    try {
      const transporter = await this.getTransporter();

      const itemRows = order.items
        .map(
          (i) =>
            `<tr>
              <td style="padding:6px 12px;border-bottom:1px solid #f0f0f0">${i.name}</td>
              <td style="padding:6px 12px;border-bottom:1px solid #f0f0f0;text-align:center">${i.quantity}</td>
              <td style="padding:6px 12px;border-bottom:1px solid #f0f0f0;text-align:right">$${(i.price * i.quantity).toFixed(2)}</td>
            </tr>`,
        )
        .join('');

      const html = `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          <h2 style="color:#1d4ed8">ShopForge</h2>
          <p>Hi ${userName},</p>
          <p>Thanks for your order! Here's a summary:</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0">
            <thead>
              <tr style="background:#f8fafc">
                <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280">ITEM</th>
                <th style="padding:8px 12px;text-align:center;font-size:12px;color:#6b7280">QTY</th>
                <th style="padding:8px 12px;text-align:right;font-size:12px;color:#6b7280">SUBTOTAL</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding:10px 12px;font-weight:bold">Total</td>
                <td style="padding:10px 12px;text-align:right;font-weight:bold;font-size:18px">$${order.total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
          <p style="color:#6b7280;font-size:13px">Order #${order.id} · We'll email you when it ships.</p>
        </div>`;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM ?? '"ShopForge" <no-reply@shopforge.dev>',
        to,
        subject: `Order #${order.id} confirmed — ShopForge`,
        html,
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) this.logger.log(`Email preview: ${previewUrl}`);
    } catch (err: unknown) {
      this.logger.error('Failed to send order confirmation email', err);
    }
  }
}
