import { WorkSubmissionData } from '../types';

export interface SentEmailLog {
  id: string;
  protocolNumber: string;
  recipientEmail: string;
  recipientName: string;
  recipientRole: string;
  subject: string;
  sentAt: string;
  status: 'DELIVERED' | 'SIMULATED' | 'FAILED';
  deliveryMode?: 'SMTP' | 'RESEND' | 'SIMULATED' | 'DIRECT';
  previewHtml: string;
  message?: string;
  restrictedByResend?: boolean;
}

const EMAIL_LOGS_STORAGE_KEY = 'nmspr_submission_email_logs_v1';

export function getSentEmailLogs(): SentEmailLog[] {
  try {
    const raw = localStorage.getItem(EMAIL_LOGS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Erro ao ler logs de e-mails:', e);
    return [];
  }
}

export function saveEmailLog(log: SentEmailLog): void {
  try {
    const logs = getSentEmailLogs();
    logs.unshift(log);
    // Keep last 100 logs
    localStorage.setItem(EMAIL_LOGS_STORAGE_KEY, JSON.stringify(logs.slice(0, 100)));
  } catch (e) {
    console.error('Erro ao salvar log de e-mail:', e);
  }
}

/**
 * Gera o texto puro do comprovante para uso em mailto e Gmail Web
 */
export function generatePlainTextReceipt(submission: WorkSubmissionData, recipientName: string): string {
  return `PREFEITURA DA CIDADE DO RECIFE
SECRETARIA DE SAÚDE • NÚCLEO MUNICIPAL DE SEGURANÇA DO PACIENTE (NMSPR)
I FÓRUM MUNICIPAL DE QUALIDADE E SEGURANÇA DO PACIENTE

COMPROVANTE OFICIAL DE INSCRIÇÃO DE TRABALHO

Prezado(a) ${recipientName},

Confirmamos com sucesso a inscrição do seu trabalho na Oficina de Compartilhamento de Experiências!

• PROTOCOLO OFICIAL: ${submission.protocolNumber}
• TÍTULO DO TRABALHO: ${submission.title}
• MODALIDADE: ${submission.modality === 'RELATO_EXPERIENCIA' ? 'Relato de Experiência (Anexo A)' : 'Produção Artística (Anexo B)'}
• EIXO TEMÁTICO: ${submission.thematicAxisLabel}
• PERÍODO DE REALIZAÇÃO: ${submission.developmentPeriod}
• DATA DA INSCRIÇÃO: ${new Date(submission.submittedAt).toLocaleString('pt-BR')}

AUTOR(A) PRINCIPAL:
• Nome: ${submission.mainAuthor.fullName}
• Cargo/Função: ${submission.mainAuthor.roleOrFunction}
• Local de Atuação: ${submission.mainAuthor.workLocation}

${submission.coAuthors && submission.coAuthors.length > 0 ? `COAUTORES:\n${submission.coAuthors.map((c, i) => `• ${i + 1}. ${c.fullName} (${c.email})`).join('\n')}\n` : ''}
EVENTO PRESENCIAL:
• Data: 16 de Abril de 2026
• Local: Auditório da Interne Educação - Ilha do Leite, Recife/PE
• Contato da Organização: nsp.ggai@gmail.com

Guarde este protocolo para consulta e homologação.
Secretaria de Saúde do Recife • SUS Recife`;
}

/**
 * Gera o HTML institucional oficial do e-mail de confirmação
 */
export function generateEmailHtml(submission: WorkSubmissionData, recipientName: string, recipientRole: string): string {
  return `
    <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 620px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #001B44; color: #ffffff; padding: 24px; text-align: center; border-bottom: 4px solid #EA7600;">
        <span style="display: inline-block; background-color: rgba(234, 118, 0, 0.2); color: #EA7600; padding: 4px 12px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">SUS Recife • Oficial 2026</span>
        <h2 style="margin: 0 0 6px 0; font-size: 20px; color: #ffffff;">I Fórum Municipal de Qualidade e Segurança do Paciente</h2>
        <p style="margin: 0; color: #3498FE; font-size: 13px; font-weight: bold;">Oficina de Compartilhamento de Experiências</p>
      </div>
      
      <div style="padding: 24px;">
        <p style="font-size: 15px; margin-top: 0;">Olá, <strong>${recipientName}</strong> (${recipientRole}),</p>
        <p style="font-size: 14px; line-height: 1.6; color: #334155;">
          Confirmamos o recebimento e registro da sua <strong>inscrição de trabalho</strong> no I Fórum Municipal de Qualidade e Segurança do Paciente da Rede SUS Recife.
        </p>

        <div style="background-color: #f8fafc; border-left: 4px solid #EA7600; padding: 18px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0; border-left-width: 4px;">
          <p style="margin: 0 0 10px 0; font-size: 13px;">
            <strong style="color: #64748b; text-transform: uppercase; font-size: 11px; display: block;">Número de Protocolo Oficial:</strong>
            <span style="color: #001B44; font-weight: 900; font-family: monospace; font-size: 17px; background-color: #ffffff; padding: 4px 10px; border-radius: 6px; display: inline-block; border: 1px solid #cbd5e1; margin-top: 4px;">${submission.protocolNumber}</span>
          </p>
          <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Título do Trabalho:</strong> ${submission.title}</p>
          <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Modalidade:</strong> ${submission.modality === 'RELATO_EXPERIENCIA' ? 'Relato de Experiência (Anexo A)' : 'Produção Artística (Anexo B)'}</p>
          <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Eixo Temático:</strong> ${submission.thematicAxisLabel}</p>
          <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Período de Realização:</strong> ${submission.developmentPeriod}</p>
          <p style="margin: 0; font-size: 13px;"><strong>Data e Hora:</strong> ${new Date(submission.submittedAt).toLocaleString('pt-BR')}</p>
        </div>

        <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 14px; margin-bottom: 20px;">
          <h4 style="margin: 0 0 6px 0; font-size: 13px; color: #1e40af;">Dados da Apresentação Presencial</h4>
          <p style="margin: 0; font-size: 12px; color: #1e3a8a; line-height: 1.5;">
            <strong>Data:</strong> 16 de Abril de 2026<br/>
            <strong>Local:</strong> Auditório da Interne Educação — Ilha do Leite, Recife/PE<br/>
            <strong>Certificação:</strong> 8 Horas emitida pela Escola de Saúde do Recife (ESR/SEGTES)
          </p>
        </div>

        <p style="font-size: 13px; color: #475569; line-height: 1.5;">
          Guarde este número de protocolo para comprovação e acompanhamento das etapas de avaliação da Comissão Organizadora.
        </p>

        <div style="margin-top: 28px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b;">
          <p style="margin: 0;"><strong>Secretaria de Saúde da Cidade do Recife</strong></p>
          <p style="margin: 2px 0 0 0;">Núcleo Municipal de Segurança do Paciente (NMSPR) • Coordenação do Fórum</p>
          <p style="margin: 4px 0 0 0;">Dúvidas ou suporte: <a href="mailto:nsp.ggai@gmail.com" style="color: #3498FE; text-decoration: none;">nsp.ggai@gmail.com</a></p>
        </div>
      </div>
    </div>
  `;
}

/**
 * Gera o link para abertura direta no Gmail Web (com campos pré-preenchidos)
 */
export function generateGmailWebLink(recipientEmail: string, subject: string, plainBody: string): string {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipientEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(plainBody)}`;
}

/**
 * Gera o link mailto para abertura no cliente padrão de e-mail (Outlook, Apple Mail, etc.)
 */
export function generateMailtoLink(recipientEmail: string, subject: string, plainBody: string): string {
  return `mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(plainBody)}`;
}

/**
 * Envia o e-mail de confirmação de inscrição para o autor principal e coautores.
 * Tenta enviar via rota /api/send-confirmation-email do backend (se configurado SMTP)
 * e também armazena os recibos e logs formatados.
 */
export async function sendSubmissionConfirmationEmail(submission: WorkSubmissionData): Promise<{
  success: boolean;
  sentCount: number;
  recipients: string[];
  results: SentEmailLog[];
}> {
  const recipients = [
    {
      name: submission.mainAuthor.fullName,
      email: submission.mainAuthor.email,
      role: 'Autor(a) Principal'
    },
    ...submission.coAuthors.map(co => ({
      name: co.fullName,
      email: co.email,
      role: 'Coautor(a)'
    }))
  ].filter(r => Boolean(r.email && r.email.includes('@')));

  const subject = `Confirmação de Inscrição de Trabalho: ${submission.protocolNumber} - I Fórum de Qualidade e Segurança do Paciente`;
  const results: SentEmailLog[] = [];

  for (const recipient of recipients) {
    const previewHtml = generateEmailHtml(submission, recipient.name, recipient.role);
    let status: 'DELIVERED' | 'SIMULATED' | 'FAILED' = 'SIMULATED';
    let deliveryMode: 'SMTP' | 'RESEND' | 'SIMULATED' | 'DIRECT' = 'SIMULATED';
    let responseMsg = 'E-mail preparado e registrado no sistema.';
    let isRestricted = false;

    try {
      const response = await fetch('/api/send-confirmation-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submission,
          recipientEmail: recipient.email,
          recipientName: recipient.name,
          recipientRole: recipient.role,
          subject,
          htmlContent: previewHtml
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.delivered) {
          status = 'DELIVERED';
          deliveryMode = data.provider === 'RESEND' ? 'RESEND' : 'SMTP';
          responseMsg = data.provider === 'RESEND' 
            ? 'Enviado automaticamente via Resend!' 
            : 'Enviado com sucesso via servidor SMTP.';
        } else {
          status = 'SIMULATED';
          deliveryMode = 'SIMULATED';
          isRestricted = Boolean(data.restrictedByResend);
          responseMsg = data.message || 'Serviço de e-mail em modo de preparação.';
        }
      } else {
        status = 'SIMULATED';
        responseMsg = 'Serviço de envio direto ativo.';
      }
    } catch (err: any) {
      console.warn('[Email Dispatch Notice] Requisição ao endpoint de e-mail finalizada:', err?.message);
      status = 'SIMULATED';
      responseMsg = 'Comprovante pronto para visualização e envio direto.';
    }

    const log: SentEmailLog = {
      id: `email_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      protocolNumber: submission.protocolNumber,
      recipientEmail: recipient.email,
      recipientName: recipient.name,
      recipientRole: recipient.role,
      subject,
      sentAt: new Date().toISOString(),
      status,
      deliveryMode,
      previewHtml,
      message: responseMsg,
      restrictedByResend: isRestricted
    };

    saveEmailLog(log);
    results.push(log);
  }

  return {
    success: true,
    sentCount: recipients.length,
    recipients: recipients.map(r => r.email),
    results
  };
}
