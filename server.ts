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

// Helper to get Resend API key
function getResendApiKey(): string | undefined {
  return (
    process.env.RESEND_API_KEY ||
    process.env.RESEND_KEY ||
    process.env.RESEND_TOKEN ||
    process.env.VITE_RESEND_API_KEY
  );
}

// Helper to get Resend client
function getResendClient(): Resend | null {
  const apiKey = getResendApiKey();
  if (!apiKey) return null;
  return new Resend(apiKey);
}

// Resolver o remetente oficial Resend sob o domínio @intelipay
async function resolveResendSender(resend: Resend): Promise<string> {
  if (process.env.RESEND_FROM && !process.env.RESEND_FROM.includes('onboarding@resend.dev')) {
    return process.env.RESEND_FROM;
  }

  // Consultar domínios na conta do Resend
  try {
    const { data: domains } = await resend.domains.list();
    if (domains && Array.isArray(domains) && domains.length > 0) {
      // Prioridade 1: Domínio que contenha "intelipay"
      const intelipayDomain = domains.find(d => d.name.toLowerCase().includes('intelipay'));
      if (intelipayDomain) {
        return `I Fórum de Qualidade e Segurança <forum@${intelipayDomain.name}>`;
      }
      // Prioridade 2: Qualquer domínio verificado
      const verified = domains.find(d => d.status === 'verified');
      if (verified) {
        return `I Fórum de Qualidade e Segurança <forum@${verified.name}>`;
      }
      return `I Fórum de Qualidade e Segurança <forum@${domains[0].name}>`;
    }
  } catch (err) {
    console.warn('[Resend Domain Lookup] Consulta de domínios falhou ou sem permissão:', err);
  }

  const domain = process.env.RESEND_DOMAIN || 'intelipay-sesau.com.br';
  return `I Fórum de Qualidade e Segurança <forum@${domain}>`;
}

// Helper to check SMTP configuration
function getSmtpTransporter() {
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
  const host = process.env.SMTP_HOST || (user?.includes('@gmail.com') ? 'smtp.gmail.com' : undefined);
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : (host === 'smtp.gmail.com' ? 465 : 587);

  if (!host || !user || !pass) {
    return null;
  }

  if (host === 'smtp.gmail.com') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass
      }
    });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}

// API Health Check
app.get('/api/health', (req, res) => {
  const hasResend = Boolean(process.env.RESEND_API_KEY);
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
  const host = process.env.SMTP_HOST || (user?.includes('@gmail.com') ? 'smtp.gmail.com' : undefined);
  const isSmtpConfigured = Boolean(host && user && pass);

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    smtpConfigured: isSmtpConfigured,
    resendConfigured: hasResend,
    canSendAutomatically: isSmtpConfigured || hasResend
  });
});

// API Check email provider status
app.get('/api/email-status', async (req, res) => {
  const resendKey = getResendApiKey();
  const hasResend = Boolean(resendKey);
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
  const host = process.env.SMTP_HOST || (user?.includes('@gmail.com') ? 'smtp.gmail.com' : undefined);
  const isSmtpConfigured = Boolean(host && user && pass);

  let fromEmail = 'I Fórum de Qualidade e Segurança <forum@intelipay.com.br>';
  if (hasResend) {
    const resend = getResendClient();
    if (resend) {
      fromEmail = await resolveResendSender(resend);
    }
  } else if (isSmtpConfigured) {
    fromEmail = process.env.SMTP_FROM || user || 'forum@intelipay.com.br';
  }

  res.json({
    configured: isSmtpConfigured || hasResend,
    provider: hasResend ? 'RESEND' : isSmtpConfigured ? 'SMTP' : 'NONE',
    fromEmail,
    domain: '@intelipay'
  });
});

// API Send Confirmation Email Endpoint
app.post('/api/send-confirmation-email', async (req, res) => {
  try {
    const { submission, registration, recipientEmail, recipientName, recipientRole, htmlContent, subject } = req.body;

    if (!recipientEmail || !subject || !htmlContent) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios ausentes: recipientEmail, subject ou htmlContent.'
      });
    }

    // 1. Envio automático via Resend com domínio @intelipay
    const resend = getResendClient();
    let resendErrorMessage: string | undefined;

    if (resend) {
      const fromEmail = await resolveResendSender(resend);
      console.info(`[Resend Auto-Send] Disparando e-mail para ${recipientEmail} a partir de ${fromEmail}...`);

      let { data, error } = await resend.emails.send({
        from: fromEmail,
        to: recipientEmail,
        subject: subject,
        html: htmlContent
      });

      // Se falhou por domínio não verificado ou não autorizado para esta chave, tentar variantes conhecidas de @intelipay
      if (error && error.message) {
        console.warn(`[Resend Auto-Send Notice] Tentativa inicial com ${fromEmail} retornou: ${error.message}. Testando variantes de @intelipay...`);
        const domainCandidates = [
          'I Fórum de Qualidade e Segurança <forum@intelipay-sesau.com.br>',
          'I Fórum de Qualidade e Segurança <contato@intelipay-sesau.com.br>',
          'I Fórum de Qualidade e Segurança <forum@intelipay.com.br>',
          'I Fórum de Qualidade e Segurança <contato@intelipay.com.br>',
          'I Fórum de Qualidade e Segurança <nao-responder@intelipay.com.br>'
        ].filter(cand => cand !== fromEmail);

        for (const candidate of domainCandidates) {
          console.info(`[Resend Auto-Retry] Tentando remetente: ${candidate}`);
          const retry = await resend.emails.send({
            from: candidate,
            to: recipientEmail,
            subject: subject,
            html: htmlContent
          });
          if (!retry.error && retry.data?.id) {
            data = retry.data;
            error = null as any;
            console.info(`[Resend Auto-Retry Success] E-mail entregue com remetente ${candidate}!`);
            break;
          }
        }
      }

      if (!error && data?.id) {
        console.info(`[Resend Sent] E-mail entregue automaticamente para ${recipientEmail} (ID: ${data.id}) via domínio @intelipay`);
        return res.json({
          success: true,
          delivered: true,
          provider: 'RESEND',
          messageId: data.id,
          recipientEmail
        });
      }

      console.error('[Resend Error] Falha no disparo via Resend:', error);
      resendErrorMessage = error?.message;
    }

    // 2. Tentar envio via SMTP / Nodemailer como fallback secundário caso configurado
    const transporter = getSmtpTransporter();
    let smtpErrorMessage: string | undefined;

    if (transporter) {
      try {
        const user = process.env.SMTP_USER || process.env.GMAIL_USER;
        const fromAddress = process.env.SMTP_FROM || `I Fórum de Qualidade e Segurança do Paciente <${user}>`;

        const info = await transporter.sendMail({
          from: fromAddress,
          to: recipientEmail,
          subject: subject,
          html: htmlContent
        });

        console.info(`[SMTP Sent] Mensagem enviada automaticamente para ${recipientEmail} (ID: ${info.messageId})`);

        return res.json({
          success: true,
          delivered: true,
          provider: 'SMTP',
          messageId: info.messageId,
          recipientEmail
        });
      } catch (smtpErr: any) {
        console.error('[SMTP Error] Falha no envio via SMTP:', smtpErr);
        smtpErrorMessage = smtpErr?.message || 'Falha ao autenticar ou conectar no servidor SMTP.';
      }
    }

    // Se o Resend teve erro
    if (resendErrorMessage) {
      return res.json({
        success: false,
        delivered: false,
        provider: 'RESEND',
        error: resendErrorMessage,
        recipientEmail,
        message: `Falha no envio automático via Resend (@intelipay): ${resendErrorMessage}`
      });
    }

    // Se houve erro no SMTP
    if (smtpErrorMessage) {
      return res.json({
        success: false,
        delivered: false,
        provider: 'SMTP',
        error: smtpErrorMessage,
        recipientEmail,
        message: `Erro na autenticação SMTP: ${smtpErrorMessage}.`
      });
    }

    // 3. Sem credenciais configuradas: modo preparado
    console.warn(
      `[Email Notification] Nenhum provedor (RESEND_API_KEY ou SMTP) configurado no servidor. E-mail para ${recipientEmail} registrado com sucesso.`
    );
    return res.json({
      success: true,
      delivered: false,
      mode: 'SIMULATED',
      noProviderConfigured: true,
      recipientEmail,
      message: 'Comprovante oficial gerado e registrado para envio automático.',
      protocolNumber: submission?.protocolNumber || registration?.protocolNumber
    });
  } catch (error: any) {
    console.error('[Email Error] Falha ao despachar e-mail:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Erro ao enviar e-mail via servidor.'
    });
  }
});

// Endpoint para testar envio manual de e-mail com diagnóstico em tempo real
app.post('/api/test-email', async (req, res) => {
  try {
    const { targetEmail } = req.body;
    const recipient = targetEmail || process.env.SMTP_USER || process.env.GMAIL_USER || 'Getvb98@gmail.com';

    const testSubject = 'Teste de Conexão - I Fórum de Qualidade e Segurança';
    const testHtml = `
      <div style="font-family: sans-serif; padding: 20px; color: #001B44;">
        <h2>Teste de Envio de E-mail Concluído com Sucesso!</h2>
        <p>Este é um e-mail de verificação das configurações do sistema do I Fórum de Qualidade e Segurança do Paciente (SUS Recife).</p>
        <p><strong>Data/Hora do Teste:</strong> ${new Date().toLocaleString('pt-BR')}</p>
      </div>
    `;

    // 1. Testar Resend
    const resend = getResendClient();
    if (resend) {
      const fromEmail = process.env.RESEND_FROM || 'I Fórum <onboarding@resend.dev>';
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: recipient,
        subject: testSubject,
        html: testHtml
      });
      if (!error && data?.id) {
        return res.json({ success: true, provider: 'RESEND', messageId: data.id, recipient });
      }
      return res.json({ success: false, provider: 'RESEND', error: error?.message, recipient });
    }

    // 2. Testar SMTP
    const transporter = getSmtpTransporter();
    if (transporter) {
      const user = process.env.SMTP_USER || process.env.GMAIL_USER;
      const fromAddress = process.env.SMTP_FROM || `I Fórum <${user}>`;
      const info = await transporter.sendMail({
        from: fromAddress,
        to: recipient,
        subject: testSubject,
        html: testHtml
      });
      return res.json({ success: true, provider: 'SMTP', messageId: info.messageId, recipient });
    }

    return res.json({
      success: false,
      noProvider: true,
      message: 'Nenhum provedor configurado. Defina RESEND_API_KEY ou SMTP_HOST / SMTP_USER / SMTP_PASS.'
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
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
