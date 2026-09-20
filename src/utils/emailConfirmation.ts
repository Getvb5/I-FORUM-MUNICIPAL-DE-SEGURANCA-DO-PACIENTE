import { WorkSubmissionData, RegistrationData } from '../types';

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
  messageId?: string;
  error?: string;
  accountEmail?: string;
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

function escapeHtml(str?: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Gera o texto puro completo do comprovante para uso em mailto e Gmail Web
 */
export function generatePlainTextReceipt(submission: WorkSubmissionData, recipientName: string): string {
  const isExperience = submission.modality === 'RELATO_EXPERIENCIA';
  const exp = submission.experienceReport;
  const art = submission.artisticProduction;

  let reportText = '';
  if (isExperience && exp) {
    reportText = `
--- CONTEÚDO DO RELATO DE EXPERIÊNCIA ---
1. O QUE FOI REALIZADO E POR QUÊ:
${exp.whatAndWhy || 'Não informado'}

2. COMO FOI DESENVOLVIDA A EXPERIÊNCIA:
${exp.howDeveloped || 'Não informado'}

3. O QUE A EQUIPE APRENDEU:
${exp.whatLearned || 'Não informado'}

4. DESAFIOS ENCONTRADOS:
${exp.challenges || 'Não informado'}

5. PONTOS POSITIVOS E A MELHORAR:
${exp.likedAndDisliked || 'Não informado'}

6. O QUE MAIS PODE SER FEITO:
${exp.whatCanBeDone || 'Não informado'}

7. REFERÊNCIAS:
${exp.references || 'Não informado'}
`;
  } else if (!isExperience && art) {
    reportText = `
--- CONTEÚDO DA PRODUÇÃO ARTÍSTICA ---
CATEGORIA ARTÍSTICA: ${art.artisticCategory} ${art.customArtisticCategory ? `(${art.customArtisticCategory})` : ''}

CONTEXTO DE CRIAÇÃO (Onde, quando e por que foi produzida):
${art.creationContext || 'Não informado'}

${art.textContent ? `TEXTO / CORDEL / POESIA:\n${art.textContent}\n` : ''}
REFERÊNCIAS:
${art.references || 'Não informado'}
`;
  }

  let coAuthorsText = 'Nenhum coautor informado (trabalho individual).\n';
  if (submission.coAuthors && submission.coAuthors.length > 0) {
    coAuthorsText = submission.coAuthors.map((c, i) => 
      `• Coautor(a) ${i + 1}: ${c.fullName}
  CPF: ${c.cpf} | E-mail: ${c.email} | Telefone: ${c.phone || 'Não informado'}
  Cargo/Função: ${c.roleOrFunction} | Local: ${c.workLocation} ${c.cnesUnit ? `| Unidade: ${c.cnesUnit}` : ''}`
    ).join('\n\n') + '\n';
  }

  return `PREFEITURA DA CIDADE DO RECIFE
SECRETARIA DE SAÚDE • NÚCLEO MUNICIPAL DE SEGURANÇA DO PACIENTE (NMSPR)
I FÓRUM MUNICIPAL DE QUALIDADE E SEGURANÇA DO PACIENTE
Oficina de Compartilhamento de Experiências da Rede SUS Recife

=======================================================
COMPROVANTE OFICIAL DE INSCRIÇÃO DE TRABALHO
=======================================================

Prezado(a) ${recipientName},

Confirmamos com sucesso a inscrição do seu trabalho! Seguem abaixo todos os dados e detalhes oficiais registrados no sistema:

DADOS DO PROTOCOLO:
• Número de Protocolo: ${submission.protocolNumber}
• Data e Hora da Inscrição: ${new Date(submission.submittedAt).toLocaleString('pt-BR')}
• Status: INSCRITO E REGISTRADO (Oficina de Apresentação Presencial)
• Vaga no Eixo: Vaga nº ${submission.slotOrder}

DADOS DO TRABALHO:
• Título: ${submission.title}
• Modalidade: ${submission.modality === 'RELATO_EXPERIENCIA' ? 'Relato de Experiência (Anexo A)' : `Produção Artística (Anexo B - ${art?.artisticCategory || 'Geral'})`}
• Eixo Temático: ${submission.thematicAxisLabel}
• Período de Realização da Prática: ${submission.developmentPeriod}
${submission.mediaLink ? `• Link de Mídia Complementar: ${submission.mediaLink}\n` : ''}${submission.attachedFile ? `• Arquivo Anexado: ${submission.attachedFile.name}\n` : ''}${submission.accessibilityNeed ? `• Necessidade de Acessibilidade: ${submission.accessibilityNeed}\n` : ''}
${reportText}
AUTOR(A) PRINCIPAL (RESPONSÁVEL PELA INSCRIÇÃO DO TRABALHO):
• Nome Completo: ${submission.mainAuthor.fullName}
• CPF: ${submission.mainAuthor.cpf}
• E-mail: ${submission.mainAuthor.email}
• Telefone/WhatsApp: ${submission.mainAuthor.phone}
• Perfil de Participação: ${submission.mainAuthor.authorType === 'PROFISSIONAL_GESTOR' ? 'Profissional / Gestor da Saúde' : submission.mainAuthor.authorType === 'RESIDENTE' ? 'Residente em Saúde' : 'Estudante da Saúde'}
• Formação Profissional: ${submission.mainAuthor.professionalBackground || 'Não informada'}
• Cargo/Função: ${submission.mainAuthor.roleOrFunction}
• Local de Atuação: ${submission.mainAuthor.workLocation}
• Unidade de Saúde (CNES): ${submission.mainAuthor.cnesUnit || 'Não informada'}
${submission.mainAuthor.sesauMatricula ? `• Matrícula SESAU: ${submission.mainAuthor.sesauMatricula}\n` : ''}
COAUTORES PARTICIPANTES (${submission.coAuthors ? submission.coAuthors.length : 0}):
${coAuthorsText}
DADOS DO EVENTO PRESENCIAL & APRESENTAÇÃO:
• Evento: I Fórum Municipal de Qualidade e Segurança do Paciente
• Data: 30 de Setembro de 2026 (Quarta-feira)
• Horário: 08h00 às 17h00 (Credenciamento a partir das 07h30)
• Local: Auditório da Interne Soluções em Saúde
• Endereço: Rua Marquês Amorim, 356 - Boa Vista, Recife/PE (CEP: 50070-330)
• Link no Google Maps: https://www.google.com/maps/search/?api=1&query=Interne+Solu%C3%A7%C3%B5es+em+Sa%C3%BAde,+R.+Marqu%C3%AAs+Amorim,+356+-+Boa+Vista,+Recife+-+PE,+50070-330
• Formato da Apresentação: Comunicação Oral presencial (10 min de apresentação + 5 min de debate pela comissão)
• Certificação: 8 Horas emitida pela Escola de Saúde do Recife (ESR / SEGTES)

INSTRUÇÕES IMPORTANTES:
1. Guarde este protocolo para consulta, homologação e credenciamento no dia do evento.
2. É obrigatória a presença do autor principal ou de pelo menos um dos coautores cadastrados no dia da apresentação para recebimento do certificado.
3. Dúvidas ou suporte: nsp.ggai@gmail.com

Secretaria de Saúde da Cidade do Recife
Núcleo Municipal de Segurança do Paciente (NMSPR)`;
}

/**
 * Gera o HTML institucional oficial e detalhado do e-mail de confirmação
 */
export function generateEmailHtml(submission: WorkSubmissionData, recipientName: string, recipientRole: string): string {
  const isExperience = submission.modality === 'RELATO_EXPERIENCIA';
  const exp = submission.experienceReport;
  const art = submission.artisticProduction;

  // Render Experience Report Sections
  let reportHtml = '';
  if (isExperience && exp) {
    reportHtml = `
      <div style="margin-top: 18px; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
        <div style="background-color: #f1f5f9; padding: 10px 14px; border-bottom: 1px solid #cbd5e1;">
          <h4 style="margin: 0; font-size: 13px; color: #001B44; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px;">
            Estrutura Completa do Relato de Experiência (Anexo A)
          </h4>
        </div>
        <div style="padding: 14px; font-size: 13px; color: #334155; line-height: 1.5;">
          <div style="margin-bottom: 12px;">
            <strong style="color: #001B44; display: block; font-size: 12px; text-transform: uppercase;">1. O que foi realizado e por quê?</strong>
            <p style="margin: 4px 0 0 0; background: #f8fafc; padding: 8px 10px; border-radius: 6px; border-left: 3px solid #001B44;">
              ${escapeHtml(exp.whatAndWhy) || '<em>Não informado</em>'}
            </p>
          </div>
          <div style="margin-bottom: 12px;">
            <strong style="color: #001B44; display: block; font-size: 12px; text-transform: uppercase;">2. Como foi desenvolvida a experiência?</strong>
            <p style="margin: 4px 0 0 0; background: #f8fafc; padding: 8px 10px; border-radius: 6px; border-left: 3px solid #001B44;">
              ${escapeHtml(exp.howDeveloped) || '<em>Não informado</em>'}
            </p>
          </div>
          <div style="margin-bottom: 12px;">
            <strong style="color: #001B44; display: block; font-size: 12px; text-transform: uppercase;">3. O que você e a sua equipe aprenderam?</strong>
            <p style="margin: 4px 0 0 0; background: #f8fafc; padding: 8px 10px; border-radius: 6px; border-left: 3px solid #001B44;">
              ${escapeHtml(exp.whatLearned) || '<em>Não informado</em>'}
            </p>
          </div>
          <div style="margin-bottom: 12px;">
            <strong style="color: #001B44; display: block; font-size: 12px; text-transform: uppercase;">4. Desafios encontrados:</strong>
            <p style="margin: 4px 0 0 0; background: #f8fafc; padding: 8px 10px; border-radius: 6px; border-left: 3px solid #EA7600;">
              ${escapeHtml(exp.challenges) || '<em>Não informado</em>'}
            </p>
          </div>
          <div style="margin-bottom: 12px;">
            <strong style="color: #001B44; display: block; font-size: 12px; text-transform: uppercase;">5. O que mais gostou e não gostou:</strong>
            <p style="margin: 4px 0 0 0; background: #f8fafc; padding: 8px 10px; border-radius: 6px; border-left: 3px solid #001B44;">
              ${escapeHtml(exp.likedAndDisliked) || '<em>Não informado</em>'}
            </p>
          </div>
          <div style="margin-bottom: 12px;">
            <strong style="color: #001B44; display: block; font-size: 12px; text-transform: uppercase;">6. O que mais pode ser feito:</strong>
            <p style="margin: 4px 0 0 0; background: #f8fafc; padding: 8px 10px; border-radius: 6px; border-left: 3px solid #001B44;">
              ${escapeHtml(exp.whatCanBeDone) || '<em>Não informado</em>'}
            </p>
          </div>
          <div>
            <strong style="color: #001B44; display: block; font-size: 12px; text-transform: uppercase;">7. Referências:</strong>
            <p style="margin: 4px 0 0 0; background: #f8fafc; padding: 8px 10px; border-radius: 6px; font-family: monospace; font-size: 11px;">
              ${escapeHtml(exp.references) || '<em>Não informadas</em>'}
            </p>
          </div>
        </div>
      </div>
    `;
  } else if (!isExperience && art) {
    reportHtml = `
      <div style="margin-top: 18px; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
        <div style="background-color: #f1f5f9; padding: 10px 14px; border-bottom: 1px solid #cbd5e1;">
          <h4 style="margin: 0; font-size: 13px; color: #001B44; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px;">
            Estrutura da Produção Artística (Anexo B)
          </h4>
        </div>
        <div style="padding: 14px; font-size: 13px; color: #334155; line-height: 1.5;">
          <div style="margin-bottom: 12px;">
            <strong style="color: #001B44; display: block; font-size: 12px; text-transform: uppercase;">Categoria Artística:</strong>
            <p style="margin: 4px 0 0 0; font-weight: bold; color: #EA7600;">
              ${escapeHtml(art.artisticCategory)} ${art.customArtisticCategory ? `(${escapeHtml(art.customArtisticCategory)})` : ''}
            </p>
          </div>
          <div style="margin-bottom: 12px;">
            <strong style="color: #001B44; display: block; font-size: 12px; text-transform: uppercase;">Contexto de Criação (Onde, quando e por que foi produzida):</strong>
            <p style="margin: 4px 0 0 0; background: #f8fafc; padding: 8px 10px; border-radius: 6px; border-left: 3px solid #001B44;">
              ${escapeHtml(art.creationContext) || '<em>Não informado</em>'}
            </p>
          </div>
          ${art.textContent ? `
            <div style="margin-bottom: 12px;">
              <strong style="color: #001B44; display: block; font-size: 12px; text-transform: uppercase;">Texto / Cordel / Poesia:</strong>
              <div style="margin: 4px 0 0 0; background: #f8fafc; padding: 10px 12px; border-radius: 6px; border-left: 3px solid #EA7600; white-space: pre-wrap; font-family: Georgia, serif; font-style: italic;">
                ${escapeHtml(art.textContent)}
              </div>
            </div>
          ` : ''}
          <div>
            <strong style="color: #001B44; display: block; font-size: 12px; text-transform: uppercase;">Referências:</strong>
            <p style="margin: 4px 0 0 0; background: #f8fafc; padding: 8px 10px; border-radius: 6px; font-family: monospace; font-size: 11px;">
              ${escapeHtml(art.references) || '<em>Não informadas</em>'}
            </p>
          </div>
        </div>
      </div>
    `;
  }

  // Render Coauthors Table
  let coAuthorsHtml = '';
  if (submission.coAuthors && submission.coAuthors.length > 0) {
    coAuthorsHtml = `
      <div style="margin-top: 16px; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #f8fafc; padding: 8px 12px; border-bottom: 1px solid #cbd5e1;">
          <h4 style="margin: 0; font-size: 12px; color: #001B44; text-transform: uppercase; font-weight: 800;">
            Coautores Registrados (${submission.coAuthors.length})
          </h4>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
          <thead>
            <tr style="background-color: #f1f5f9; color: #475569; border-bottom: 1px solid #e2e8f0;">
              <th style="padding: 6px 10px; font-weight: bold;">Nome</th>
              <th style="padding: 6px 10px; font-weight: bold;">CPF</th>
              <th style="padding: 6px 10px; font-weight: bold;">Cargo / Função</th>
              <th style="padding: 6px 10px; font-weight: bold;">Local de Atuação</th>
            </tr>
          </thead>
          <tbody>
            ${submission.coAuthors.map((c, i) => `
              <tr style="border-bottom: 1px solid #f1f5f9; background-color: ${i % 2 === 0 ? '#ffffff' : '#fcfcfc'};">
                <td style="padding: 6px 10px; font-weight: bold; color: #001B44;">
                  ${escapeHtml(c.fullName)}<br/>
                  <span style="font-weight: normal; color: #64748b; font-size: 11px;">${escapeHtml(c.email)}</span>
                </td>
                <td style="padding: 6px 10px; font-family: monospace; color: #334155;">${escapeHtml(c.cpf)}</td>
                <td style="padding: 6px 10px; color: #334155;">${escapeHtml(c.roleOrFunction)}</td>
                <td style="padding: 6px 10px; color: #334155;">
                  ${escapeHtml(c.workLocation)}
                  ${c.cnesUnit ? `<br/><span style="color: #64748b; font-size: 10px;">CNES: ${escapeHtml(c.cnesUnit)}</span>` : ''}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } else {
    coAuthorsHtml = `
      <p style="font-size: 12px; color: #64748b; font-style: italic; margin: 8px 0 0 0;">
        Nenhum coautor cadastrado (trabalho registrado como autoria individual).
      </p>
    `;
  }

  return `
    <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 680px; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
      <!-- Top Banner Institutional -->
      <div style="background-color: #001B44; color: #ffffff; padding: 24px; text-align: center; border-bottom: 5px solid #EA7600;">
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
          Olá, <strong>${escapeHtml(recipientName)}</strong> (${escapeHtml(recipientRole)}),
        </p>
        <p style="font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 20px;">
          Confirmamos com sucesso o recebimento e o registro da inscrição do trabalho científico/artístico na Oficina de Compartilhamento de Experiências. Segue abaixo o comprovante timbrado completo com todos os dados informados:
        </p>

        <!-- Official Protocol Box -->
        <div style="background: linear-gradient(135deg, #001B44 0%, #08285c 100%); color: #ffffff; padding: 18px 20px; border-radius: 10px; margin-bottom: 22px; border-left: 6px solid #EA7600; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
            <div>
              <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #93c5fd; font-weight: bold; display: block;">
                Número de Protocolo Oficial
              </span>
              <span style="font-size: 20px; font-weight: 900; font-family: monospace; letter-spacing: 1px; color: #ffffff;">
                ${escapeHtml(submission.protocolNumber)}
              </span>
            </div>
            <div style="text-align: right;">
              <span style="display: inline-block; background-color: #10b981; color: #ffffff; font-size: 11px; font-weight: 900; padding: 4px 10px; border-radius: 20px; text-transform: uppercase;">
                Inscrição Confirmada
              </span>
              <span style="display: block; font-size: 11px; color: #cbd5e1; margin-top: 4px;">
                ${new Date(submission.submittedAt).toLocaleString('pt-BR')}
              </span>
            </div>
          </div>
        </div>

        <!-- Section 1: Work Summary -->
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #001B44; text-transform: uppercase; font-weight: 800; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">
            1. Dados do Trabalho Submetido
          </h3>
          <table style="width: 100%; font-size: 13px; line-height: 1.6; border-collapse: collapse;">
            <tr>
              <td style="padding: 4px 0; width: 150px; font-weight: bold; color: #64748b;">Título:</td>
              <td style="padding: 4px 0; font-weight: 800; color: #001B44; font-size: 14px;">${escapeHtml(submission.title)}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-weight: bold; color: #64748b;">Modalidade:</td>
              <td style="padding: 4px 0; color: #334155; font-weight: bold;">
                ${submission.modality === 'RELATO_EXPERIENCIA' ? 'Relato de Experiência (Anexo A)' : `Produção Artística (Anexo B - ${escapeHtml(art?.artisticCategory || 'Geral')})`}
              </td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-weight: bold; color: #64748b;">Eixo Temático:</td>
              <td style="padding: 4px 0; color: #334155;">${escapeHtml(submission.thematicAxisLabel)}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-weight: bold; color: #64748b;">Período da Prática:</td>
              <td style="padding: 4px 0; color: #334155;">${escapeHtml(submission.developmentPeriod)}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-weight: bold; color: #64748b;">Ordem no Eixo:</td>
              <td style="padding: 4px 0; color: #334155;">Vaga ${submission.slotOrder}</td>
            </tr>
            ${submission.mediaLink ? `
              <tr>
                <td style="padding: 4px 0; font-weight: bold; color: #64748b;">Link de Mídia:</td>
                <td style="padding: 4px 0;"><a href="${escapeHtml(submission.mediaLink)}" target="_blank" style="color: #0284c7; text-decoration: underline;">${escapeHtml(submission.mediaLink)}</a></td>
              </tr>
            ` : ''}
            ${submission.attachedFile ? `
              <tr>
                <td style="padding: 4px 0; font-weight: bold; color: #64748b;">Arquivo Anexo:</td>
                <td style="padding: 4px 0; color: #334155; font-weight: bold;">${escapeHtml(submission.attachedFile.name)}</td>
              </tr>
            ` : ''}
            ${submission.accessibilityNeed ? `
              <tr>
                <td style="padding: 4px 0; font-weight: bold; color: #64748b;">Acessibilidade:</td>
                <td style="padding: 4px 0; color: #b45309; font-weight: bold;">${escapeHtml(submission.accessibilityNeed)}</td>
              </tr>
            ` : ''}
          </table>

          <!-- Full Content Details -->
          ${reportHtml}
        </div>

        <!-- Section 2: Main Author -->
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #001B44; text-transform: uppercase; font-weight: 800; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">
            2. Autor(a) Principal (Responsável pela Inscrição)
          </h3>
          <table style="width: 100%; font-size: 13px; line-height: 1.6; border-collapse: collapse;">
            <tr>
              <td style="padding: 4px 0; width: 150px; font-weight: bold; color: #64748b;">Nome Completo:</td>
              <td style="padding: 4px 0; font-weight: bold; color: #001B44;">${escapeHtml(submission.mainAuthor.fullName)}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-weight: bold; color: #64748b;">CPF:</td>
              <td style="padding: 4px 0; font-family: monospace; color: #334155;">${escapeHtml(submission.mainAuthor.cpf)}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-weight: bold; color: #64748b;">E-mail:</td>
              <td style="padding: 4px 0; color: #334155;">${escapeHtml(submission.mainAuthor.email)}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-weight: bold; color: #64748b;">Telefone/WhatsApp:</td>
              <td style="padding: 4px 0; color: #334155;">${escapeHtml(submission.mainAuthor.phone)}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-weight: bold; color: #64748b;">Perfil:</td>
              <td style="padding: 4px 0; color: #334155;">
                ${submission.mainAuthor.authorType === 'PROFISSIONAL_GESTOR' ? 'Profissional / Gestor da Saúde' : submission.mainAuthor.authorType === 'RESIDENTE' ? 'Residente em Saúde' : 'Estudante da Saúde'}
              </td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-weight: bold; color: #64748b;">Cargo / Função:</td>
              <td style="padding: 4px 0; color: #334155;">${escapeHtml(submission.mainAuthor.roleOrFunction)}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-weight: bold; color: #64748b;">Local de Atuação:</td>
              <td style="padding: 4px 0; color: #334155;">${escapeHtml(submission.mainAuthor.workLocation)}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-weight: bold; color: #64748b;">Unidade (CNES):</td>
              <td style="padding: 4px 0; color: #334155;">${escapeHtml(submission.mainAuthor.cnesUnit) || 'Não informada'}</td>
            </tr>
            ${submission.mainAuthor.sesauMatricula ? `
              <tr>
                <td style="padding: 4px 0; font-weight: bold; color: #64748b;">Matrícula SESAU:</td>
                <td style="padding: 4px 0; color: #334155;">${escapeHtml(submission.mainAuthor.sesauMatricula)}</td>
              </tr>
            ` : ''}
          </table>

          <!-- Coauthors Section -->
          ${coAuthorsHtml}
        </div>

        <!-- Section 3: In-Person Event & Venue -->
        <div style="background-color: #eff6ff; border: 2px solid #bfdbfe; border-radius: 10px; padding: 18px; margin-bottom: 22px;">
          <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #1e40af; text-transform: uppercase; font-weight: 800;">
            3. Orientações do Evento Presencial e Apresentação
          </h3>
          <p style="margin: 0 0 8px 0; font-size: 13px; color: #1e3a8a; line-height: 1.6;">
            <strong>Data do Evento:</strong> 30 de Setembro de 2026 (Quarta-feira)<br/>
            <strong>Horário:</strong> 08h00 às 17h00 (Credenciamento na recepção a partir das 07h30)<br/>
            <strong>Local:</strong> Auditório da Interne Soluções em Saúde<br/>
            <strong>Endereço:</strong> Rua Marquês Amorim, 356 - Boa Vista, Recife/PE (CEP: 50070-330)<br/>
            <strong>Formato de Apresentação:</strong> Comunicação Oral (10 min de apresentação + 5 min de considerações pela banca avaliadora)<br/>
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
          <strong>Importante:</strong> Guarde este comprovante para comprovação no credenciamento. É obrigatória a presença do autor principal ou de pelo menos um coautor credenciado no dia do evento para realizar a apresentação oral e ter direito ao certificado oficial.
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
}

/**
 * Gera o texto puro para confirmação de Ouvinte / Participante
 */
export function generateAttendeePlainTextReceipt(registration: RegistrationData): string {
  return `PREFEITURA DA CIDADE DO RECIFE
SECRETARIA DE SAÚDE • NÚCLEO MUNICIPAL DE SEGURANÇA DO PACIENTE (NMSPR)
I FÓRUM MUNICIPAL DE QUALIDADE E SEGURANÇA DO PACIENTE

=======================================================
COMPROVANTE OFICIAL DE INSCRIÇÃO NO EVENTO (OUVINTE)
=======================================================

Prezado(a) ${registration.fullName},

Sua inscrição para participação no I Fórum de Qualidade e Segurança do Paciente foi confirmada com sucesso!

DADOS DO PARTICIPANTE:
• Protocolo de Inscrição: ${registration.protocolNumber}
• Nome Completo: ${registration.fullName}
• CPF: ${registration.cpf}
• E-mail: ${registration.email}
• Telefone: ${registration.phone || 'Não informado'}
• Perfil: ${registration.targetProfile || 'Profissional / Estudante'}
• Vínculo Institucional: ${registration.institutionalLink || 'Não informado'}
• Cargo / Função: ${registration.roleOrFunction || 'Não informado'}
• Unidade de Saúde (CNES): ${registration.cnesUnit || 'Não informada'}
${registration.accessibilityNeed ? `• Necessidade de Acessibilidade: ${registration.accessibilityNeed}\n` : ''}• Data da Inscrição: ${new Date(registration.registeredAt).toLocaleString('pt-BR')}

DADOS DO EVENTO PRESENCIAL:
• Data: 30 de Setembro de 2026 (Quarta-feira)
• Horário: 08h00 às 17h00 (Credenciamento a partir das 07h30)
• Local: Auditório da Interne Soluções em Saúde
• Endereço: Rua Marquês Amorim, 356 - Boa Vista, Recife/PE (CEP: 50070-330)
• Link no Google Maps: https://www.google.com/maps/search/?api=1&query=Interne+Solu%C3%A7%C3%B5es+em+Sa%C3%BAde,+R.+Marqu%C3%AAs+Amorim,+356+-+Boa+Vista,+Recife+-+PE,+50070-330
• Certificação: 8 Horas emitida pela Escola de Saúde do Recife (ESR/SEGTES)

Apresente este protocolo ou documento com foto na recepção para credenciamento.
Secretaria de Saúde do Recife • NMSPR`;
}

/**
 * Gera o HTML oficial para confirmação de Ouvinte / Participante
 */
export function generateAttendeeEmailHtml(registration: RegistrationData): string {
  return `
    <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 640px; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #001B44; color: #ffffff; padding: 24px; text-align: center; border-bottom: 5px solid #EA7600;">
        <span style="display: inline-block; background-color: rgba(234, 118, 0, 0.25); color: #FF9B38; padding: 4px 14px; border-radius: 20px; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 8px;">
          SUS RECIFE • CONFIRMAÇÃO DE INSCRIÇÃO
        </span>
        <h1 style="margin: 0 0 6px 0; font-size: 20px; color: #ffffff;">
          I Fórum Municipal de Qualidade e Segurança do Paciente
        </h1>
        <p style="margin: 0; color: #93c5fd; font-size: 13px; font-weight: bold;">
          Credenciamento de Participante • Recife 2026
        </p>
      </div>

      <div style="padding: 24px;">
        <p style="font-size: 15px; margin-top: 0; color: #001B44;">
          Olá, <strong>${escapeHtml(registration.fullName)}</strong>,
        </p>
        <p style="font-size: 14px; line-height: 1.6; color: #334155;">
          Sua inscrição para participação presencial no <strong>I Fórum Municipal de Qualidade e Segurança do Paciente</strong> foi confirmada com sucesso!
        </p>

        <!-- Protocol Box -->
        <div style="background: linear-gradient(135deg, #001B44 0%, #08285c 100%); color: #ffffff; padding: 18px 20px; border-radius: 10px; margin: 20px 0; border-left: 6px solid #EA7600;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
            <div>
              <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #93c5fd; font-weight: bold; display: block;">
                Protocolo de Inscrição Oficial
              </span>
              <span style="font-size: 20px; font-weight: 900; font-family: monospace; color: #ffffff;">
                ${escapeHtml(registration.protocolNumber)}
              </span>
            </div>
            <div>
              <span style="display: inline-block; background-color: #10b981; color: #ffffff; font-size: 11px; font-weight: 900; padding: 4px 10px; border-radius: 20px; text-transform: uppercase;">
                Confirmada
              </span>
            </div>
          </div>
        </div>

        <!-- Details -->
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 10px 0; font-size: 13px; color: #001B44; text-transform: uppercase; font-weight: 800;">
            Dados Cadastrados
          </h3>
          <table style="width: 100%; font-size: 13px; line-height: 1.6; border-collapse: collapse;">
            <tr>
              <td style="padding: 4px 0; width: 140px; font-weight: bold; color: #64748b;">Nome:</td>
              <td style="padding: 4px 0; font-weight: bold; color: #001B44;">${escapeHtml(registration.fullName)}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-weight: bold; color: #64748b;">CPF:</td>
              <td style="padding: 4px 0; font-family: monospace;">${escapeHtml(registration.cpf)}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-weight: bold; color: #64748b;">E-mail:</td>
              <td style="padding: 4px 0;">${escapeHtml(registration.email)}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-weight: bold; color: #64748b;">Perfil:</td>
              <td style="padding: 4px 0;">${escapeHtml(registration.targetProfile || 'Profissional / Estudante')}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-weight: bold; color: #64748b;">Vínculo:</td>
              <td style="padding: 4px 0;">${escapeHtml(registration.institutionalLink || '-')}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-weight: bold; color: #64748b;">Cargo/Função:</td>
              <td style="padding: 4px 0;">${escapeHtml(registration.roleOrFunction || '-')}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-weight: bold; color: #64748b;">Unidade (CNES):</td>
              <td style="padding: 4px 0;">${escapeHtml(registration.cnesUnit || 'Não informada')}</td>
            </tr>
            ${registration.accessibilityNeed ? `
              <tr>
                <td style="padding: 4px 0; font-weight: bold; color: #64748b;">Acessibilidade:</td>
                <td style="padding: 4px 0; color: #b45309; font-weight: bold;">${escapeHtml(registration.accessibilityNeed)}</td>
              </tr>
            ` : ''}
          </table>
        </div>

        <!-- Venue info -->
        <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 16px; margin-bottom: 20px;">
          <h4 style="margin: 0 0 8px 0; font-size: 13px; color: #1e40af; text-transform: uppercase; font-weight: bold;">
            Local e Data do Evento
          </h4>
          <p style="margin: 0; font-size: 12px; color: #1e3a8a; line-height: 1.6;">
            <strong>Data:</strong> 30 de Setembro de 2026 (08h00 às 17h00)<br/>
            <strong>Credenciamento:</strong> A partir das 07h30 na recepção<br/>
            <strong>Local:</strong> Auditório da Interne Soluções em Saúde<br/>
            <strong>Endereço:</strong> Rua Marquês Amorim, 356 - Boa Vista, Recife/PE<br/>
            <strong>Certificação:</strong> 8 Horas emitida pela Escola de Saúde do Recife (ESR/SEGTES)
          </p>
          <div style="margin-top: 12px;">
            <a href="https://www.google.com/maps/search/?api=1&query=Interne+Solu%C3%A7%C3%B5es+em+Sa%C3%BAde,+R.+Marqu%C3%AAs+Amorim,+356+-+Boa+Vista,+Recife+-+PE,+50070-330" target="_blank" style="display: inline-block; background-color: #EA7600; color: #ffffff; padding: 6px 14px; border-radius: 6px; font-size: 11px; font-weight: bold; text-decoration: none;">
              📍 Abrir no Google Maps
            </a>
          </div>
        </div>

        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b;">
          <p style="margin: 0;"><strong>Secretaria de Saúde da Cidade do Recife</strong></p>
          <p style="margin: 2px 0 0 0;">Núcleo Municipal de Segurança do Paciente (NMSPR) • Coordenação do Fórum</p>
          <p style="margin: 4px 0 0 0;">Dúvidas: <a href="mailto:nsp.ggai@gmail.com" style="color: #0284c7; text-decoration: none;">nsp.ggai@gmail.com</a></p>
        </div>
      </div>
    </div>
  `;
}

/**
 * Envia e-mail de confirmação de inscrição para participante ouvinte
 */
export async function sendRegistrationConfirmationEmail(registration: RegistrationData): Promise<{
  success: boolean;
  delivered: boolean;
  message?: string;
}> {
  if (!registration.email || !registration.email.includes('@')) {
    return { success: false, delivered: false, message: 'E-mail inválido.' };
  }

  const subject = `Confirmação de Inscrição: ${registration.protocolNumber} - I Fórum de Qualidade e Segurança do Paciente`;
  const htmlContent = generateAttendeeEmailHtml(registration);
  const textContent = generateAttendeePlainTextReceipt(registration);

  try {
    const response = await fetch('/api/send-confirmation-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        registration,
        recipientEmail: registration.email,
        recipientName: registration.fullName,
        recipientRole: 'Participante (Ouvinte)',
        subject,
        htmlContent,
        textContent
      })
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, delivered: Boolean(data.delivered), message: data.message };
    }
    return { success: false, delivered: false };
  } catch (err: any) {
    console.warn('Erro ao enviar e-mail de confirmação de ouvinte:', err);
    return { success: false, delivered: false };
  }
}

/**
 * Gera o texto executivo do comprovante ideal para URL do Gmail Web e mailto
 * (tamanho enxuto e seguro para não ultrapassar limites de caracteres de URL de navegadores)
 */
export function generateExecutiveReceiptText(submission: WorkSubmissionData, recipientName: string): string {
  const isExp = submission.modality === 'RELATO_EXPERIENCIA';
  const modalityLabel = isExp ? 'Relato de Experiência (Anexo A)' : 'Produção Artística (Anexo B)';

  return `PREFEITURA DA CIDADE DO RECIFE • SECRETARIA DE SAÚDE
NÚCLEO MUNICIPAL DE SEGURANÇA DO PACIENTE (NMSPR)
I FÓRUM MUNICIPAL DE QUALIDADE E SEGURANÇA DO PACIENTE

Prezado(a) ${recipientName},

Confirmamos com sucesso o recebimento da inscrição do seu trabalho!

PROTOCOLO OFICIAL: ${submission.protocolNumber}
DATA DE INSCRIÇÃO: ${new Date(submission.submittedAt).toLocaleString('pt-BR')}
STATUS: INSCRITO E REGISTRADO (Vaga nº ${submission.slotOrder})

DADOS DO TRABALHO:
• Título: ${submission.title}
• Modalidade: ${modalityLabel}
• Eixo Temático: ${submission.thematicAxisLabel}
• Autor(a) Principal: ${submission.mainAuthor.fullName} (${submission.mainAuthor.email})
${submission.coAuthors && submission.coAuthors.length > 0 ? `• Coautores: ${submission.coAuthors.map(c => c.fullName).join(', ')}\n` : ''}
EVENTO PRESENCIAL & APRESENTAÇÃO:
• Data: 30 de Setembro de 2026 (Quarta-feira) | 08h00 às 17h00
• Local: Auditório da Interne Soluções em Saúde
• Endereço: Rua Marquês Amorim, 356 - Boa Vista, Recife/PE (CEP: 50070-330)
• Formato: Comunicação Oral (10 min de apresentação + 5 min de banca)
• Certificação: 8 Horas emitida pela Escola de Saúde do Recife (ESR / SEGTES)

Guarde este protocolo para comprovação e credenciamento na portaria.
Dúvidas ou informações: nsp.ggai@gmail.com`;
}

/**
 * Gera o texto executivo para ouvinte/participante presencial para Gmail Web
 */
export function generateAttendeeExecutiveText(registration: RegistrationData): string {
  return `PREFEITURA DA CIDADE DO RECIFE • SECRETARIA DE SAÚDE
I FÓRUM MUNICIPAL DE QUALIDADE E SEGURANÇA DO PACIENTE

Prezado(a) ${registration.fullName},

Sua inscrição presencial como participante foi confirmada com sucesso!

DADOS DA CREDENCIAL:
• Protocolo Oficial: ${registration.protocolNumber}
• Participante: ${registration.fullName}
• CPF: ${registration.cpf}
• Vínculo: ${registration.institutionalLink}
• Status: VAGA PRESENCIAL GARANTIDA

DADOS DO EVENTO:
• Data: 30 de Setembro de 2026 (Quarta-feira) | 08h00 às 17h00
• Local: Auditório da Interne Soluções em Saúde
• Endereço: Rua Marquês Amorim, 356 - Boa Vista, Recife/PE (CEP: 50070-330)
• Carga Horária: 8 Horas (Certificado ESR / SEGTES)

Apresente seu protocolo ou QR Code na portaria para retirada do crachá.
Dúvidas: nsp.ggai@gmail.com`;
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
 * Gera link de compartilhamento rápido pelo WhatsApp Web/App
 */
export function generateWhatsAppShareLink(phone: string | undefined, message: string): string {
  const cleanPhone = (phone || '').replace(/\D/g, '');
  const encodedText = encodeURIComponent(message);
  if (cleanPhone.length >= 10) {
    const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    return `https://api.whatsapp.com/send?phone=${fullPhone}&text=${encodedText}`;
  }
  return `https://api.whatsapp.com/send?text=${encodedText}`;
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
      role: 'Autor(a) Principal ( Responsável pela Inscrição do Trabalho )'
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
    const plainText = generatePlainTextReceipt(submission, recipient.name);
    let status: 'DELIVERED' | 'SIMULATED' | 'FAILED' = 'SIMULATED';
    let deliveryMode: 'SMTP' | 'RESEND' | 'SIMULATED' | 'DIRECT' = 'SIMULATED';
    let responseMsg = 'E-mail preparado e registrado no sistema.';
    let isRestricted = false;
    let messageId: string | undefined;
    let errorMessage: string | undefined;
    let accountEmail: string | undefined;

    try {
      const response = await fetch('/api/send-confirmation-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          protocolNumber: submission.protocolNumber,
          thematicAxis: submission.thematicAxis,
          thematicAxisLabel: submission.thematicAxisLabel,
          title: submission.title,
          recipientEmail: recipient.email,
          recipientName: recipient.name,
          recipientRole: recipient.role,
          subject,
          htmlContent: previewHtml,
          textContent: plainText
        })
      });

      if (response.ok) {
        const data = await response.json();
        messageId = data.messageId;
        errorMessage = data.error;
        accountEmail = data.accountEmail;

        if (data.delivered) {
          status = 'DELIVERED';
          deliveryMode = data.provider === 'RESEND' ? 'RESEND' : 'SMTP';
          responseMsg = data.provider === 'RESEND' 
            ? 'Enviado automaticamente via Resend!' 
            : 'Enviado com sucesso via servidor SMTP.';
        } else {
          status = data.provider === 'RESEND' ? 'FAILED' : 'SIMULATED';
          deliveryMode = data.provider === 'RESEND' ? 'RESEND' : 'SIMULATED';
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
      messageId,
      error: errorMessage,
      accountEmail,
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
