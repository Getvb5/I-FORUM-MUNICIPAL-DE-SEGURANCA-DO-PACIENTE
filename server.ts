import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to get Resend client
function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

// Helper to check SMTP configuration
function getSmtpTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass
    }
  });
}

// API Health Check
app.get('/api/health', (req, res) => {
  const hasResend = Boolean(process.env.RESEND_API_KEY);
  const isSmtpConfigured = Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
  );
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    smtpConfigured: isSmtpConfigured,
    resendConfigured: hasResend,
    canSendAutomatically: isSmtpConfigured || hasResend
  });
});

// API Check email provider status
app.get('/api/email-status', (req, res) => {
  const hasResend = Boolean(process.env.RESEND_API_KEY);
  const isSmtpConfigured = Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
  );
  res.json({
    configured: isSmtpConfigured || hasResend,
    provider: hasResend ? 'RESEND' : isSmtpConfigured ? 'SMTP' : 'NONE',
    fromEmail: process.env.RESEND_FROM || process.env.SMTP_FROM || 'nsp.ggai@gmail.com'
  });
});

// API Send Confirmation Email Endpoint
app.post('/api/send-confirmation-email', async (req, res) => {
  try {
    const { submission, recipientEmail, recipientName, recipientRole, htmlContent, subject } = req.body;

    if (!recipientEmail || !subject || !htmlContent) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios ausentes: recipientEmail, subject ou htmlContent.'
      });
    }

    // 1. Tentar envio via Resend (se chave API estiver configurada)
    const resend = getResendClient();
    if (resend) {
      const fromEmail = process.env.RESEND_FROM || 'I Fórum de Qualidade e Segurança do Paciente <onboarding@resend.dev>';
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: recipientEmail,
        subject: subject,
        html: htmlContent
      });

      if (error) {
        console.error('[Resend Error] Falha no disparo:', error);
        
        // Verifica se é a restrição do plano gratuito de testes do Resend
        const isRestrictedToSelf = error.message && error.message.includes('only send testing emails');
        return res.json({
          success: true,
          delivered: false,
          restrictedByResend: isRestrictedToSelf,
          provider: 'RESEND',
          error: error.message,
          recipientEmail,
          message: isRestrictedToSelf 
            ? `No modo de teste do Resend, o envio automático direto só é permitido para o e-mail cadastrado na conta. Para outros destinatários, use o botão 'Abrir no Gmail Web' ou verifique um domínio no painel resend.com.`
            : `Erro no envio via Resend: ${error.message}`
        });
      }

      console.info(`[Resend Sent] E-mail entregue com sucesso para ${recipientEmail} (ID: ${data?.id})`);
      return res.json({
        success: true,
        delivered: true,
        provider: 'RESEND',
        messageId: data?.id,
        recipientEmail
      });
    }

    // 2. Tentar envio via SMTP / Nodemailer (se credenciais SMTP estiverem configuradas)
    const transporter = getSmtpTransporter();
    if (transporter) {
      const fromAddress = process.env.SMTP_FROM || `I Fórum de Qualidade e Segurança do Paciente <${process.env.SMTP_USER}>`;

      const info = await transporter.sendMail({
        from: fromAddress,
        to: recipientEmail,
        subject: subject,
        html: htmlContent
      });

      console.info(`[SMTP Sent] Mensagem enviada para ${recipientEmail} (ID: ${info.messageId})`);

      return res.json({
        success: true,
        delivered: true,
        provider: 'SMTP',
        messageId: info.messageId,
        recipientEmail
      });
    }

    // 3. Sem credenciais configuradas: modo preparado
    console.warn(
      `[Email Notification] Nenhum provedor (SMTP ou RESEND_API_KEY) configurado no servidor (.env). E-mail para ${recipientEmail} preparado com sucesso em modo de demonstração/simulado.`
    );
    return res.json({
      success: true,
      delivered: false,
      mode: 'SIMULATED',
      recipientEmail,
      message: 'Nenhum provedor de e-mail (Resend ou SMTP) configurado no servidor. O comprovante foi gerado e registrado.',
      protocolNumber: submission?.protocolNumber
    });
  } catch (error: any) {
    console.error('[Email Error] Falha ao despachar e-mail:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Erro ao enviar e-mail via servidor.'
    });
  }
});

// Vite Middleware for Development / Static serving for Production
async function setupApp() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

setupApp();
