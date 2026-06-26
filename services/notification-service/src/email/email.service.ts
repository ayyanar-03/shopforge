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
      const account = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email', port: 587,
        auth: { user: account.user, pass: account.pass },
      });
      this.logger.log(`Ethereal account: ${account.user}`);
    }
    return this.transporter;
  }

  async sendOrderConfirmation(
    to: string, userName: string,
    order: { id: number; total: number; items: { name: string; quantity: number; price: number }[] },
  ) {
    try {
      const t = await this.getTransporter();
      const rows = order.items.map((i) =>
        `<tr><td style="padding:6px 12px">${i.name}</td><td style="padding:6px 12px;text-align:center">${i.quantity}</td><td style="padding:6px 12px;text-align:right">$${(i.price * i.quantity).toFixed(2)}</td></tr>`,
      ).join('');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const info = await t.sendMail({
        from: process.env.SMTP_FROM ?? '"ShopForge" <no-reply@shopforge.dev>',
        to, subject: `Order #${order.id} confirmed — ShopForge`,
        html: `<div style="font-family:sans-serif;max-width:560px"><h2 style="color:#1d4ed8">ShopForge</h2><p>Hi ${userName}, thanks for your order!</p><table style="width:100%;border-collapse:collapse">${rows}<tr><td colspan="2" style="padding:10px 12px;font-weight:bold">Total</td><td style="padding:10px 12px;text-align:right;font-weight:bold">$${order.total.toFixed(2)}</td></tr></table><p style="color:#6b7280;font-size:13px">Order #${order.id}</p></div>`,
      });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const url = nodemailer.getTestMessageUrl(info);
      if (url) this.logger.log(`Email preview: ${url}`);
    } catch (err) { this.logger.error('sendOrderConfirmation failed', err); }
  }

  async sendLowStockAlert(to: string, sellerName: string, productName: string, stock: number) {
    try {
      const t = await this.getTransporter();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const info = await t.sendMail({
        from: process.env.SMTP_FROM ?? '"ShopForge" <no-reply@shopforge.dev>',
        to, subject: `Low stock: ${productName} — ShopForge`,
        html: `<div style="font-family:sans-serif"><h2 style="color:#dc2626">Low Stock Alert</h2><p>Hi ${sellerName}, <strong>${productName}</strong> has only <strong>${stock}</strong> unit(s) left.</p></div>`,
      });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const url = nodemailer.getTestMessageUrl(info);
      if (url) this.logger.log(`Low-stock email preview: ${url}`);
    } catch (err) { this.logger.error('sendLowStockAlert failed', err); }
  }
}
