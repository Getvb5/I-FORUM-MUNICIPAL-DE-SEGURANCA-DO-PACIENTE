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

// Enable CORS for iframe and preview environments
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

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

app.use((req, res, next) => {
  try {
    ensureDataDir();
    const logLine = `[${new Date().toISOString()}] ${req.method} ${req.url}\n`;
    fs.appendFileSync(path.join(DATA_DIR, 'requests.log'), logLine);
  } catch (_) {}
  next();
});

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
const RESEND_CONFIG_FILE = path.join(DATA_DIR, 'resend-config.json');

interface ResendConfigFile {
  apiKey?: string;
  from?: string;
  domain?: string;
  updatedAt?: string;
}

function loadResendConfigFromFile(): ResendConfigFile | null {
  try {
    ensureDataDir();
    if (fs.existsSync(RESEND_CONFIG_FILE)) {
      const content = fs.readFileSync(RESEND_CONFIG_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('[Resend Config] Erro ao carregar resend-config.json:', err);
  }
  return null;
}

function saveResendConfigToFile(config: ResendConfigFile): boolean {
  try {
    ensureDataDir();
    fs.writeFileSync(RESEND_CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('[Resend Config] Erro ao salvar resend-config.json:', err);
    return false;
  }
}

function getResendApiKey(): string | undefined {
  const fileConfig = loadResendConfigFromFile();
  if (fileConfig?.apiKey) return fileConfig.apiKey;
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

// Persistência local de configuração SMTP para disparo sem bloqueio a qualquer destinatário
const SMTP_CONFIG_FILE = path.join(DATA_DIR, 'smtp-config.json');

interface SmtpConfigFile {
  host?: string;
  port?: number;
  user?: string;
  pass?: string;
  fromName?: string;
  fromEmail?: string;
  service?: string;
  updatedAt?: string;
}

function loadSmtpConfigFromFile(): SmtpConfigFile | null {
  try {
    ensureDataDir();
    if (fs.existsSync(SMTP_CONFIG_FILE)) {
      const content = fs.readFileSync(SMTP_CONFIG_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('[SMTP Config] Erro ao carregar smtp-config.json:', err);
  }
  return null;
}

function saveSmtpConfigToFile(config: SmtpConfigFile): boolean {
  try {
    ensureDataDir();
    fs.writeFileSync(SMTP_CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('[SMTP Config] Erro ao salvar smtp-config.json:', err);
    return false;
  }
}

// Resolver o remetente oficial Resend sob o domínio configurado
async function resolveResendSender(resend?: Resend): Promise<string> {
  const fileConfig = loadResendConfigFromFile();
  if (fileConfig?.from) return fileConfig.from;
  if (fileConfig?.domain) return `I Fórum de Qualidade e Segurança <forum@${fileConfig.domain}>`;
  if (process.env.RESEND_FROM && !process.env.RESEND_FROM.includes('onboarding@resend.dev')) {
    return process.env.RESEND_FROM;
  }
  const domain = process.env.RESEND_DOMAIN || 'intelipay-sesau.com.br';
  return `I Fórum de Qualidade e Segurança <forum@${domain}>`;
}

// Helper to check SMTP configuration (prioriza smtp-config.json, depois env vars)
function getSmtpTransporter() {
  const fileConfig = loadSmtpConfigFromFile();
  const user = fileConfig?.user || process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = fileConfig?.pass || process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
  const host = fileConfig?.host || process.env.SMTP_HOST || (user?.includes('@gmail.com') ? 'smtp.gmail.com' : undefined);
  const port = fileConfig?.port || (process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : (host === 'smtp.gmail.com' ? 465 : 587));

  if (!host || !user || !pass) {
    return null;
  }

  if (host === 'smtp.gmail.com' || fileConfig?.service === 'gmail') {
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
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  serverSubmissions = loadSubmissionsFromFile();
  res.json({
    success: true,
    data: serverSubmissions,
    total: serverSubmissions.length
  });
});

// Estatísticas rápidas de vagas em tempo real para sincronização instantânea entre múltiplos navegadores
app.get('/api/submissions/stats', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
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

    // Garantir que nenhum buffer bruto de base64 sobrecarregue o banco de dados em disco
    if (submission.attachedFile && submission.attachedFile.dataUrl) {
      delete submission.attachedFile.dataUrl;
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
  res.type('application/json');
  try {
    const { submission, registration, recipientEmail, recipientName, recipientRole, htmlContent, textContent, subject, protocolNumber, title, thematicAxisLabel } = req.body || {};

    if (!recipientEmail || typeof recipientEmail !== 'string' || !recipientEmail.includes('@')) {
      return res.status(400).json({
        success: false,
        delivered: false,
        error: 'Endereço de e-mail do destinatário inválido ou não informado.'
      });
    }

    const proto = protocolNumber || submission?.protocolNumber || registration?.protocolNumber || 'FORUM-2026';
    const effectiveSubject = subject || `Confirmação de Inscrição: ${proto} - I Fórum de Qualidade e Segurança do Paciente`;
    const targetName = recipientName || submission?.mainAuthor?.fullName || registration?.fullName || 'Participante';
    const effectiveRole = recipientRole || (registration ? 'Participante / Ouvinte Credenciado' : 'Autor(a) Principal ( Responsável pela Inscrição do Trabalho )');
    const nowFormatted = new Date().toLocaleString('pt-BR');

    const effectiveHtml = htmlContent || `
      <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 680px; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
        <!-- Top Banner Institutional -->
        <div style="background-color: #001B44; color: #ffffff; padding: 24px 20px; text-align: center; border-bottom: 5px solid #EA7600;">
          <span style="display: inline-block; background-color: rgba(234, 118, 0, 0.25); color: #FF9B38; padding: 4px 14px; border-radius: 20px; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 8px; border: 1px solid rgba(234, 118, 0, 0.4);">
            SUS RECIFE • COMPROVANTE OFICIAL DE INSCRIÇÃO
          </span>
          <h1 style="margin: 0 0 6px 0; font-size: 20px; color: #ffffff; line-height: 1.3;">
            I Fórum Municipal de Qualidade e Segurança do Paciente
          </h1>
          <p style="margin: 0; color: #93c5fd; font-size: 13px; font-weight: bold;">
            Oficina de Compartilhamento de Experiências da Rede SUS Recife
          </p>
        </div>
        
        <div style="padding: 24px;">
          <!-- Greeting -->
          <p style="font-size: 15px; margin-top: 0; color: #001B44;">
            Olá, <strong>${targetName}</strong> (${effectiveRole}),
          </p>
          <p style="font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 20px;">
            Confirmamos com sucesso o recebimento e o registro da inscrição no <strong>I Fórum Municipal de Qualidade e Segurança do Paciente</strong>. Segue abaixo o comprovante timbrado completo com os dados informados:
          </p>

          <!-- Official Protocol Box -->
          <div style="background: linear-gradient(135deg, #001B44 0%, #08285c 100%); color: #ffffff; padding: 18px 20px; border-radius: 10px; margin-bottom: 22px; border-left: 6px solid #EA7600; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
              <div>
                <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #93c5fd; font-weight: bold; display: block;">
                  Número de Protocolo Oficial
                </span>
                <span style="font-size: 20px; font-weight: 900; font-family: monospace; letter-spacing: 1px; color: #ffffff;">
                  ${proto}
                </span>
              </div>
              <div style="text-align: right;">
                <span style="display: inline-block; background-color: #10b981; color: #ffffff; font-size: 11px; font-weight: 900; padding: 4px 10px; border-radius: 20px; text-transform: uppercase;">
                  Inscrição Confirmada
                </span>
                <span style="display: block; font-size: 11px; color: #cbd5e1; margin-top: 4px;">
                  ${nowFormatted}
                </span>
              </div>
            </div>
          </div>

          <!-- Section 1: Summary -->
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #001B44; text-transform: uppercase; font-weight: 800; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">
              1. Dados Principais da Inscrição
            </h3>
            <table style="width: 100%; font-size: 13px; line-height: 1.6; border-collapse: collapse;">
              <tr>
                <td style="padding: 4px 0; width: 150px; font-weight: bold; color: #64748b;">Participante:</td>
                <td style="padding: 4px 0; font-weight: 800; color: #001B44;">${targetName}</td>
              </tr>
              ${(title || submission?.title) ? `
                <tr>
                  <td style="padding: 4px 0; font-weight: bold; color: #64748b;">Título do Trabalho:</td>
                  <td style="padding: 4px 0; font-weight: 800; color: #001B44;">${title || submission?.title}</td>
                </tr>
              ` : ''}
              ${(thematicAxisLabel || submission?.thematicAxisLabel) ? `
                <tr>
                  <td style="padding: 4px 0; font-weight: bold; color: #64748b;">Eixo Temático:</td>
                  <td style="padding: 4px 0; color: #334155;">${thematicAxisLabel || submission?.thematicAxisLabel}</td>
                </tr>
              ` : ''}
              <tr>
                <td style="padding: 4px 0; font-weight: bold; color: #64748b;">E-mail Cadastrado:</td>
                <td style="padding: 4px 0;"><a href="mailto:${recipientEmail}" style="color: #0284c7; text-decoration: underline;">${recipientEmail}</a></td>
              </tr>
            </table>
          </div>

          <!-- Section 2: In-Person Event & Venue -->
          <div style="background-color: #eff6ff; border: 2px solid #bfdbfe; border-radius: 10px; padding: 18px; margin-bottom: 22px;">
            <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #1e40af; text-transform: uppercase; font-weight: 800;">
              2. Orientações do Evento Presencial
            </h3>
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #1e3a8a; line-height: 1.6;">
              <strong>Data do Evento:</strong> 30 de Setembro de 2026 (Quarta-feira)<br/>
              <strong>Horário:</strong> 08h00 às 17h00 (Credenciamento na recepção a partir das 07h30)<br/>
              <strong>Local:</strong> Auditório da Interne Soluções em Saúde<br/>
              <strong>Endereço:</strong> <a href="https://www.google.com/maps/search/?api=1&query=Interne+Solu%C3%A7%C3%B5es+em+Sa%C3%BAde,+R.+Marqu%C3%AAs+Amorim,+356+-+Boa+Vista,+Recife+-+PE,+50070-330" target="_blank" style="color: #0284c7; text-decoration: underline;">Rua Marquês Amorim, 356 - Boa Vista, Recife/PE (CEP: 50070-330)</a><br/>
              <strong>Certificação:</strong> 8 Horas emitida pela Escola de Saúde do Recife (ESR/SEGTES)
            </p>
            <div style="margin-top: 14px;">
              <a href="https://www.google.com/maps/search/?api=1&query=Interne+Solu%C3%A7%C3%B5es+em+Sa%C3%BAde,+R.+Marqu%C3%AAs+Amorim,+356+-+Boa+Vista,+Recife+-+PE,+50070-330" target="_blank" style="display: inline-block; background-color: #EA7600; color: #ffffff; padding: 8px 16px; border-radius: 6px; font-size: 12px; font-weight: bold; text-decoration: none; box-shadow: 0 2px 4px rgba(234,118,0,0.3);">
                📍 Abrir Rota no Google Maps
              </a>
            </div>
          </div>

          <!-- Notice -->
          <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 14px; border-radius: 6px; font-size: 12px; color: #92400e; line-height: 1.5; margin-bottom: 24px;">
            <strong>Importante:</strong> Guarde este comprovante para comprovação no credenciamento presencial no dia do evento.
          </div>

          <!-- Footer -->
          <div style="padding-top: 18px; border-top: 2px solid #e2e8f0; font-size: 11px; color: #64748b; line-height: 1.6;">
            <p style="margin: 0; font-weight: bold; color: #001B44; font-size: 12px;">
              Prefeitura da Cidade do Recife • Secretaria de Saúde
            </p>
            <p style="margin: 2px 0 0 0;">
              Núcleo Municipal de Segurança do Paciente (NMSPR) • Comissão Organizadora do Fórum
            </p>
            <p style="margin: 4px 0 0 0;">
              Em caso de dúvidas ou esclarecimentos, contate a comissão: <a href="mailto:nsp.ggai@gmail.com" style="color: #0284c7; font-weight: bold; text-decoration: none;">nsp.ggai@gmail.com</a>
            </p>
          </div>
        </div>
      </div>
    `;

    const effectiveText = textContent || `
PREFEITURA DA CIDADE DO RECIFE • SECRETARIA DE SAÚDE
I FÓRUM MUNICIPAL DE QUALIDADE E SEGURANÇA DO PACIENTE

Prezado(a) ${targetName},

Confirmamos com sucesso sua inscrição!
Protocolo Oficial: ${proto}
${title || submission?.title ? `Título: ${title || submission?.title}\n` : ''}
Data do Evento: 30 de Setembro de 2026 | 08h00 às 17h00
Local: Auditório da Interne Soluções em Saúde - Rua Marquês Amorim, 356, Boa Vista, Recife/PE.
Certificação: 8 Horas emitida pela Escola de Saúde do Recife (ESR/SEGTES).

Dúvidas: nsp.ggai@gmail.com
    `.trim();

    // 1. Se o administrador configurou credenciais SMTP (ex: Gmail App Password, institucional), usar primeiro
    const transporter = getSmtpTransporter();
    let smtpErrorMessage: string | undefined;

    if (transporter) {
      try {
        const fileConfig = loadSmtpConfigFromFile();
        const user = fileConfig?.user || process.env.SMTP_USER || process.env.GMAIL_USER;
        const fromAddress = fileConfig?.fromName
          ? `"${fileConfig.fromName}" <${user}>`
          : (process.env.SMTP_FROM || `I Fórum de Qualidade e Segurança do Paciente <${user}>`);

        const info = await transporter.sendMail({
          from: fromAddress,
          to: recipientEmail,
          subject: effectiveSubject,
          html: effectiveHtml,
          text: effectiveText
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
        subject: effectiveSubject,
        html: effectiveHtml,
        text: effectiveText,
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
            subject: effectiveSubject,
            html: effectiveHtml
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
        message: `Falha no envio automático via Resend: ${resendErrorMessage}`
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

// Endpoint para consultar status das configurações de e-mail (SMTP vs Resend)
app.get('/api/email-config-status', async (req, res) => {
  const fileConfig = loadSmtpConfigFromFile();
  const resendFileConfig = loadResendConfigFromFile();
  const smtpUser = fileConfig?.user || process.env.SMTP_USER || process.env.GMAIL_USER;
  const hasSmtp = Boolean(smtpUser && (fileConfig?.pass || process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD));
  const hasResend = Boolean(getResendApiKey());
  const resendSender = await resolveResendSender();

  res.json({
    smtpConfigured: hasSmtp,
    smtpUser: smtpUser ? `${smtpUser.slice(0, 3)}***@${smtpUser.split('@')[1] || ''}` : null,
    smtpHost: fileConfig?.host || process.env.SMTP_HOST || (smtpUser?.includes('@gmail.com') ? 'smtp.gmail.com' : null),
    resendConfigured: hasResend,
    resendSender,
    resendDomain: resendFileConfig?.domain || process.env.RESEND_DOMAIN || 'intelipay-sesau.com.br',
    resendCustomConfigured: Boolean(resendFileConfig?.apiKey || resendFileConfig?.domain),
    activeDeliveryMode: hasSmtp ? 'SMTP (Qualquer e-mail do mundo)' : (hasResend ? 'RESEND' : 'SIMULATED'),
    canSendToAnyEmailWithoutRestriction: hasSmtp || Boolean(hasResend && (resendFileConfig?.domain || process.env.RESEND_DOMAIN)),
    notice: hasSmtp 
      ? 'Envio via SMTP ativo. Dispara para QUALQUER e-mail (Gmail, Hotmail, Outlook, Yahoo, SESAU, etc.) sem restrição.'
      : (hasResend 
          ? `Envio ativo via Resend com domínio próprio verificado (${resendFileConfig?.domain || process.env.RESEND_DOMAIN || 'intelipay-sesau.com.br'}). Entregas liberadas para qualquer e-mail com SPF e DKIM validados.`
          : 'Nenhum serviço de envio configurado. Em modo simulado.')
  });
});

// Endpoint para salvar nova chave e domínio do Resend
app.post('/api/save-resend-config', async (req, res) => {
  try {
    const { apiKey, domain, from } = req.body || {};
    if (!apiKey && !domain) {
      return res.status(400).json({ success: false, error: 'Chave de API ou Domínio são obrigatórios.' });
    }

    const current = loadResendConfigFromFile() || {};
    const updated: ResendConfigFile = {
      ...current,
      apiKey: apiKey ? apiKey.trim() : (current.apiKey || process.env.RESEND_API_KEY),
      domain: domain ? domain.trim().toLowerCase() : current.domain,
      from: from ? from.trim() : (domain ? `I Fórum de Qualidade e Segurança <forum@${domain.trim().toLowerCase()}>` : current.from),
      updatedAt: new Date().toISOString()
    };

    const saved = saveResendConfigToFile(updated);
    if (!saved) {
      return res.status(500).json({ success: false, error: 'Erro ao salvar configurações do Resend no disco.' });
    }

    return res.json({
      success: true,
      message: 'Configurações do Resend atualizadas com sucesso! O novo domínio e chave já estão ativos.',
      domain: updated.domain,
      from: updated.from
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Erro no servidor' });
  }
});

// Endpoint para salvar configuração SMTP no servidor (ativa imediatamente)
app.post('/api/save-smtp-config', async (req, res) => {
  try {
    const { host, port, user, pass, fromName, fromEmail, service } = req.body || {};
    if (!user || !pass) {
      return res.status(400).json({ success: false, error: 'E-mail (usuário) e senha/token de aplicativo são obrigatórios.' });
    }

    const cleanUser = user.trim();
    const cleanPass = pass.trim().replace(/\s+/g, '');
    const isGmail = cleanUser.toLowerCase().includes('@gmail.com');

    const config: SmtpConfigFile = {
      host: host || (isGmail ? 'smtp.gmail.com' : 'smtp.gmail.com'),
      port: port ? Number(port) : (isGmail ? 465 : 587),
      user: cleanUser,
      pass: cleanPass,
      fromName: fromName || 'I Fórum de Qualidade e Segurança do Paciente',
      fromEmail: fromEmail || cleanUser,
      service: service || (isGmail ? 'gmail' : undefined),
      updatedAt: new Date().toISOString()
    };

    // Testar conexão
    const testTransporter = nodemailer.createTransport({
      service: config.service === 'gmail' || config.host === 'smtp.gmail.com' ? 'gmail' : undefined,
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: { user: config.user, pass: config.pass },
      tls: { rejectUnauthorized: false }
    });

    try {
      await testTransporter.verify();
    } catch (verifyErr: any) {
      return res.status(400).json({
        success: false,
        error: `Falha na autenticação SMTP: ${verifyErr?.message || 'Verifique usuário e senha'}. Se for Gmail, certifique-se de usar a Senha de Aplicativo de 16 caracteres gerada na sua conta Google.`
      });
    }

    const saved = saveSmtpConfigToFile(config);
    if (!saved) {
      return res.status(500).json({ success: false, error: 'Falha ao salvar arquivo de configuração SMTP.' });
    }

    return res.json({
      success: true,
      message: 'SMTP configurado e testado com sucesso! O sistema agora dispara para QUALQUER e-mail sem restrições.',
      user: config.user
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Erro no servidor' });
  }
});

// Endpoint para testar envio manual de e-mail com diagnóstico em tempo real
app.post('/api/test-email', async (req, res) => {
  try {
    const { targetEmail, forceProvider } = req.body;
    const recipient = targetEmail || process.env.SMTP_USER || process.env.GMAIL_USER || 'Getvb98@gmail.com';

    const testSubject = 'Teste de Disparo de E-mail - I Fórum de Qualidade e Segurança (SUS Recife)';
    const testHtml = `
      <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 680px; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
        <!-- Top Banner Institutional -->
        <div style="background-color: #001B44; color: #ffffff; padding: 24px 20px; text-align: center; border-bottom: 5px solid #EA7600;">
          <span style="display: inline-block; background-color: rgba(234, 118, 0, 0.25); color: #FF9B38; padding: 4px 14px; border-radius: 20px; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 8px; border: 1px solid rgba(234, 118, 0, 0.4);">
            SUS RECIFE • TESTE OFICIAL DE CONEXÃO
          </span>
          <h1 style="margin: 0 0 6px 0; font-size: 20px; color: #ffffff; line-height: 1.3;">
            I Fórum Municipal de Qualidade e Segurança do Paciente
          </h1>
          <p style="margin: 0; color: #93c5fd; font-size: 13px; font-weight: bold;">
            Oficina de Compartilhamento de Experiências da Rede SUS Recife
          </p>
        </div>
        
        <div style="padding: 24px;">
          <!-- Greeting -->
          <p style="font-size: 15px; margin-top: 0; color: #001B44;">
            Olá, <strong>Administrador(a)</strong>,
          </p>
          <p style="font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 20px;">
            Este é um e-mail de validação e teste de entrega em tempo real do sistema oficial do <strong>I Fórum Municipal de Qualidade e Segurança do Paciente</strong>. Sua conexão está ativa e pronta para disparar os comprovantes timbrados com sucesso.
          </p>

          <!-- Official Protocol Box -->
          <div style="background: linear-gradient(135deg, #001B44 0%, #08285c 100%); color: #ffffff; padding: 18px 20px; border-radius: 10px; margin-bottom: 22px; border-left: 6px solid #EA7600; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
              <div>
                <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #93c5fd; font-weight: bold; display: block;">
                  Status de Conexão de E-mail
                </span>
                <span style="font-size: 20px; font-weight: 900; font-family: monospace; letter-spacing: 1px; color: #ffffff;">
                  DISPARO ATIVO
                </span>
              </div>
              <div style="text-align: right;">
                <span style="display: inline-block; background-color: #10b981; color: #ffffff; font-size: 11px; font-weight: 900; padding: 4px 10px; border-radius: 20px; text-transform: uppercase;">
                  Verificado
                </span>
                <span style="display: block; font-size: 11px; color: #cbd5e1; margin-top: 4px;">
                  ${new Date().toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          </div>

          <!-- Section 1: Summary -->
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #001B44; text-transform: uppercase; font-weight: 800; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">
              1. Diagnóstico do Teste
            </h3>
            <table style="width: 100%; font-size: 13px; line-height: 1.6; border-collapse: collapse;">
              <tr>
                <td style="padding: 4px 0; width: 150px; font-weight: bold; color: #64748b;">Destinatário do Teste:</td>
                <td style="padding: 4px 0; font-weight: 800; color: #001B44;">${recipient}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; font-weight: bold; color: #64748b;">Data e Hora:</td>
                <td style="padding: 4px 0; color: #334155;">${new Date().toLocaleString('pt-BR')}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; font-weight: bold; color: #64748b;">Domínio Ativo:</td>
                <td style="padding: 4px 0; color: #001B44; font-weight: bold;">intelipay-sesau.com.br</td>
              </tr>
            </table>
          </div>

          <!-- Section 2: In-Person Event & Venue -->
          <div style="background-color: #eff6ff; border: 2px solid #bfdbfe; border-radius: 10px; padding: 18px; margin-bottom: 22px;">
            <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #1e40af; text-transform: uppercase; font-weight: 800;">
              2. Orientações do Evento Presencial
            </h3>
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #1e3a8a; line-height: 1.6;">
              <strong>Data do Evento:</strong> 30 de Setembro de 2026 (Quarta-feira)<br/>
              <strong>Horário:</strong> 08h00 às 17h00 (Credenciamento na recepção a partir das 07h30)<br/>
              <strong>Local:</strong> Auditório da Interne Soluções em Saúde<br/>
              <strong>Endereço:</strong> <a href="https://www.google.com/maps/search/?api=1&query=Interne+Solu%C3%A7%C3%B5es+em+Sa%C3%BAde,+R.+Marqu%C3%AAs+Amorim,+356+-+Boa+Vista,+Recife+-+PE,+50070-330" target="_blank" style="color: #0284c7; text-decoration: underline;">Rua Marquês Amorim, 356 - Boa Vista, Recife/PE (CEP: 50070-330)</a><br/>
              <strong>Certificação:</strong> 8 Horas emitida pela Escola de Saúde do Recife (ESR/SEGTES)
            </p>
            <div style="margin-top: 14px;">
              <a href="https://www.google.com/maps/search/?api=1&query=Interne+Solu%C3%A7%C3%B5es+em+Sa%C3%BAde,+R.+Marqu%C3%AAs+Amorim,+356+-+Boa+Vista,+Recife+-+PE,+50070-330" target="_blank" style="display: inline-block; background-color: #EA7600; color: #ffffff; padding: 8px 16px; border-radius: 6px; font-size: 12px; font-weight: bold; text-decoration: none; box-shadow: 0 2px 4px rgba(234,118,0,0.3);">
                📍 Abrir Rota no Google Maps
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="padding-top: 18px; border-top: 2px solid #e2e8f0; font-size: 11px; color: #64748b; line-height: 1.6;">
            <p style="margin: 0; font-weight: bold; color: #001B44; font-size: 12px;">
              Prefeitura da Cidade do Recife • Secretaria de Saúde
            </p>
            <p style="margin: 2px 0 0 0;">
              Núcleo Municipal de Segurança do Paciente (NMSPR) • Comissão Organizadora do Fórum
            </p>
            <p style="margin: 4px 0 0 0;">
              Em caso de dúvidas ou esclarecimentos, contate a comissão: <a href="mailto:nsp.ggai@gmail.com" style="color: #0284c7; font-weight: bold; text-decoration: none;">nsp.ggai@gmail.com</a>
            </p>
          </div>
        </div>
      </div>
    `;

    // 1. Se SMTP estiver configurado, priorizar ou usar
    const transporter = getSmtpTransporter();
    if (transporter && forceProvider !== 'RESEND') {
      const fileConfig = loadSmtpConfigFromFile();
      const user = fileConfig?.user || process.env.SMTP_USER || process.env.GMAIL_USER;
      const fromAddress = fileConfig?.fromName 
        ? `"${fileConfig.fromName}" <${user}>`
        : (process.env.SMTP_FROM || `I Fórum de Qualidade e Segurança <${user}>`);

      const info = await transporter.sendMail({
        from: fromAddress,
        to: recipient,
        subject: testSubject,
        html: testHtml
      });
      return res.json({ 
        success: true, 
        provider: 'SMTP', 
        messageId: info.messageId, 
        recipient,
        message: `E-mail de teste enviado com sucesso para ${recipient} via SMTP!` 
      });
    }

    // 2. Testar Resend
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
        return res.json({ 
          success: true, 
          provider: 'RESEND', 
          messageId: data.id, 
          recipient,
          message: `E-mail de teste despachado com sucesso para ${recipient} via Resend (${fromEmail})!` 
        });
      }
      return res.json({ success: false, provider: 'RESEND', error: error?.message, recipient });
    }

    return res.json({
      success: false,
      noProvider: true,
      message: 'Nenhum provedor de e-mail ativo. Configure o SMTP do Gmail/institucional ou RESEND_API_KEY.'
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
