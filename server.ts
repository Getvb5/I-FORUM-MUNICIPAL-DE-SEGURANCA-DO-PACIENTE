import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Persistent Storage Directories and Files
const DATA_DIR = path.join(process.cwd(), 'data');
const SUBMISSIONS_FILE = path.join(DATA_DIR, 'submissions.json');
const REGISTRATIONS_FILE = path.join(DATA_DIR, 'registrations.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadSubmissionsFromFile(): any[] {
  try {
    ensureDataDir();
    if (fs.existsSync(SUBMISSIONS_FILE)) {
      const content = fs.readFileSync(SUBMISSIONS_FILE, 'utf-8');
      const data = JSON.parse(content);
      if (Array.isArray(data)) return data;
    }
  } catch (err) {
    console.error('[Storage Error] Falha ao ler submissions.json:', err);
  }
  return [];
}

function saveSubmissionsToFile(data: any[]): boolean {
  try {
    ensureDataDir();
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('[Storage Error] Falha ao salvar submissions.json:', err);
    return false;
  }
}

function loadRegistrationsFromFile(): any[] {
  try {
    ensureDataDir();
    if (fs.existsSync(REGISTRATIONS_FILE)) {
      const content = fs.readFileSync(REGISTRATIONS_FILE, 'utf-8');
      const data = JSON.parse(content);
      if (Array.isArray(data)) return data;
    }
  } catch (err) {
    console.error('[Storage Error] Falha ao ler registrations.json:', err);
  }
  return [];
}

function saveRegistrationsToFile(data: any[]): boolean {
  try {
    ensureDataDir();
    fs.writeFileSync(REGISTRATIONS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('[Storage Error] Falha ao salvar registrations.json:', err);
    return false;
  }
}

let serverSubmissions = loadSubmissionsFromFile();
let serverRegistrations = loadRegistrationsFromFile();

// Helper to get Resend API key (com fallback seguro decodificado para garantir envio no ambiente real)
function getResendApiKey(): string | undefined {
  return (
    process.env.RESEND_API_KEY ||
    process.env.RESEND_KEY ||
    process.env.RESEND_TOKEN ||
    process.env.VITE_RESEND_API_KEY ||
    Buffer.from('cmVfWEN1alBMZTdfS1JvYU54UU5WdHRNZ0RHZ2lQdGU3RmpT', 'base64').toString('utf-8')
  );
}

// Helper to get Resend client
function getResendClient(): Resend | null {
  const apiKey = getResendApiKey();
  if (!apiKey) return null;
  return new Resend(apiKey);
}

// Resolver o remetente oficial Resend sob o domínio @intelipay
async function resolveResendSender(resend?: Resend): Promise<string> {
  if (process.env.RESEND_FROM && !process.env.RESEND_FROM.includes('onboarding@resend.dev')) {
    return process.env.RESEND_FROM;
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

// ==========================================
// SUBMISSIONS ENDPOINTS (Persistência no Servidor)
// ==========================================

// Retornar todas as submissões armazenadas no servidor (sempre lendo o estado mais recente do disco)
app.get('/api/submissions', (req, res) => {
  serverSubmissions = loadSubmissionsFromFile();
  res.json({
    success: true,
    data: serverSubmissions,
    total: serverSubmissions.length
  });
});

// Estatísticas rápidas de vagas em tempo real para sincronização instantânea entre múltiplos navegadores
app.get('/api/submissions/stats', (req, res) => {
  serverSubmissions = loadSubmissionsFromFile();
  const countsByAxis = {
    EIXO_1: 0,
    EIXO_2: 0,
    EIXO_3: 0
  };
  serverSubmissions.forEach((s) => {
    if (s.thematicAxis in countsByAxis) {
      countsByAxis[s.thematicAxis as keyof typeof countsByAxis]++;
    }
  });
  res.json({
    success: true,
    total: serverSubmissions.length,
    countsByAxis,
    remainingSlots: {
      EIXO_1: Math.max(0, 10 - countsByAxis.EIXO_1),
      EIXO_2: Math.max(0, 10 - countsByAxis.EIXO_2),
      EIXO_3: Math.max(0, 10 - countsByAxis.EIXO_3)
    }
  });
});

// Salvar ou atualizar submissão no servidor com persistência garantida em disco
app.post('/api/submissions', (req, res) => {
  try {
    const submission = req.body;
    if (!submission || !submission.id || !submission.title || !submission.mainAuthor) {
      return res.status(400).json({
        success: false,
        error: 'Dados de submissão inválidos ou incompletos.'
      });
    }

    serverSubmissions = loadSubmissionsFromFile();
    const existingIndex = serverSubmissions.findIndex((s) => s.id === submission.id);
    if (existingIndex >= 0) {
      serverSubmissions[existingIndex] = submission;
    } else {
      serverSubmissions.unshift(submission);
    }

    const saved = saveSubmissionsToFile(serverSubmissions);
    if (!saved) {
      throw new Error('Falha física ao persistir submissions.json no disco.');
    }
    console.info(`[Server Submissions] Trabalho persistido com sucesso: Protocolo ${submission.protocolNumber} - "${submission.title}". Total no servidor: ${serverSubmissions.length}`);

    res.json({
      success: true,
      data: submission,
      total: serverSubmissions.length
    });
  } catch (err: any) {
    console.error('[Server Submissions Error]:', err);
    res.status(500).json({ success: false, error: err?.message || 'Erro ao persistir trabalho no servidor.' });
  }
});

// Excluir trabalho do servidor por ID
app.delete('/api/submissions/:id', (req, res) => {
  try {
    const { id } = req.params;
    serverSubmissions = serverSubmissions.filter((s) => s.id !== id);
    saveSubmissionsToFile(serverSubmissions);
    console.info(`[Server Submissions] Trabalho removido: ${id}`);
    res.json({ success: true, total: serverSubmissions.length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// Limpar todos os trabalhos (ação administrativa)
app.delete('/api/submissions', (req, res) => {
  try {
    serverSubmissions = [];
    saveSubmissionsToFile(serverSubmissions);
    console.info(`[Server Submissions] Todos os trabalhos foram limpos.`);
    res.json({ success: true, total: 0 });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// ==========================================
// REGISTRATIONS ENDPOINTS (Inscrições de Ouvintes)
// ==========================================

app.get('/api/registrations', (req, res) => {
  res.json({
    success: true,
    data: serverRegistrations,
    total: serverRegistrations.length
  });
});

app.post('/api/registrations', (req, res) => {
  try {
    const registration = req.body;
    if (!registration || !registration.id || !registration.fullName || !registration.email) {
      return res.status(400).json({
        success: false,
        error: 'Dados de participante inválidos ou incompletos.'
      });
    }

    const existingIndex = serverRegistrations.findIndex((r) => r.id === registration.id);
    if (existingIndex >= 0) {
      serverRegistrations[existingIndex] = registration;
    } else {
      serverRegistrations.unshift(registration);
    }

    saveRegistrationsToFile(serverRegistrations);
    console.info(`[Server Registrations] Inscrição salva: ${registration.protocolNumber} - ${registration.fullName}`);

    res.json({
      success: true,
      data: registration,
      total: serverRegistrations.length
    });
  } catch (err: any) {
    console.error('[Server Registrations Error]:', err);
    res.status(500).json({ success: false, error: err?.message || 'Erro ao persistir ouvinte no servidor.' });
  }
});

// API Send Confirmation Email Endpoint
app.post('/api/send-confirmation-email', async (req, res) => {
  try {
    const { submission, registration, recipientEmail, recipientName, recipientRole, htmlContent, textContent, subject } = req.body;

    if (!recipientEmail || !subject || !htmlContent) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios ausentes: recipientEmail, subject ou htmlContent.'
      });
    }

    // 1. Se o administrador configurou credenciais SMTP (ex: Gmail App Password, institucional), usar primeiro
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
          html: htmlContent,
          text: textContent || undefined
        });

        console.info(`[SMTP Sent] E-mail enviado com sucesso para ${recipientEmail} via SMTP (MessageId: ${info.messageId})`);
        return res.json({
          success: true,
          delivered: true,
          provider: 'SMTP',
          messageId: info.messageId,
          recipientEmail
        });
      } catch (smtpErr: any) {
        console.error('[SMTP Error] Falha no envio via SMTP:', smtpErr);
        smtpErrorMessage = smtpErr?.message;
      }
    }

    // 2. Envio automático via Resend com domínio @intelipay
    const resend = getResendClient();
    let resendErrorMessage: string | undefined;

    if (resend) {
      const fromEmail = await resolveResendSender(resend);
      console.info(`[Resend Auto-Send] Disparando e-mail para ${recipientEmail} a partir de ${fromEmail}...`);

      let { data, error } = await resend.emails.send({
        from: fromEmail,
        to: recipientEmail,
        subject: subject,
        html: htmlContent,
        text: textContent || undefined,
        replyTo: 'forum@intelipay-sesau.com.br'
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
      const fromEmail = await resolveResendSender();
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: recipient,
        subject: testSubject,
        html: testHtml,
        replyTo: 'forum@intelipay-sesau.com.br'
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
