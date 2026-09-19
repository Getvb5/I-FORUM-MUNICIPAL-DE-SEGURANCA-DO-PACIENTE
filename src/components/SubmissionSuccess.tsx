import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Printer, 
  Calendar, 
  FileText, 
  Building2, 
  User, 
  Users, 
  Mail, 
  Phone, 
  QrCode, 
  Download, 
  PlusCircle, 
  ShieldCheck,
  BookOpen,
  Palette,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Share2
} from 'lucide-react';
import { WorkSubmissionData } from '../types';
import { FORUM_INFO } from '../data/forumInfo';
import { generateGoogleCalendarUrl, downloadIcsFile } from '../utils/calendar';
import {
  generateEmailHtml,
  generatePlainTextReceipt,
  generateExecutiveReceiptText,
  generateGmailWebLink,
  generateMailtoLink,
  saveEmailLog
} from '../utils/emailConfirmation';

interface SubmissionSuccessProps {
  submission: WorkSubmissionData;
  onNewSubmission: () => void;
  onOpenConsult?: () => void;
}

export const SubmissionSuccess: React.FC<SubmissionSuccessProps> = ({
  submission,
  onNewSubmission,
  onOpenConsult
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedReceipt, setCopiedReceipt] = useState(false);
  const [showFullReport, setShowFullReport] = useState(true);
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<{
    success: boolean;
    message: string;
    messageId?: string;
    showDirectOptions?: boolean;
    targetEmail?: string;
  } | null>(null);
  const [customEmail, setCustomEmail] = useState(submission.mainAuthor.email);
  const [showEmailInput, setShowEmailInput] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyProtocol = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(submission.protocolNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleCopyReceiptText = () => {
    const plainText = generatePlainTextReceipt(submission, submission.mainAuthor.fullName);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(plainText);
      setCopiedReceipt(true);
      setTimeout(() => setCopiedReceipt(false), 3000);
    }
  };

  const handleResendEmail = async (targetEmail?: string) => {
    const emailToSend = (targetEmail || customEmail || submission.mainAuthor.email).trim();
    if (!emailToSend || !emailToSend.includes('@')) {
      setResendStatus({ success: false, message: 'Informe um endereço de e-mail válido.', showDirectOptions: false });
      return;
    }
    setResending(true);
    setResendStatus(null);
    try {
      const subject = `Confirmação de Inscrição: ${submission.protocolNumber} - I Fórum de Qualidade e Segurança do Paciente`;
      const htmlContent = generateEmailHtml(submission, submission.mainAuthor.fullName, 'Autor(a) Principal');
      const textContent = generatePlainTextReceipt(submission, submission.mainAuthor.fullName);

      const response = await fetch('/api/send-confirmation-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submission,
          protocolNumber: submission.protocolNumber,
          thematicAxis: submission.thematicAxis,
          thematicAxisLabel: submission.thematicAxisLabel,
          title: submission.title,
          recipientEmail: emailToSend,
          recipientName: submission.mainAuthor.fullName,
          recipientRole: 'Autor(a) Principal',
          subject,
          htmlContent,
          textContent
        })
      });

      let data: any = null;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch {
          data = null;
        }
      }

      if (response.ok && data?.delivered) {
        setResendStatus({
          success: true,
          message: `E-mail entregue com sucesso para ${emailToSend}!`,
          messageId: data.messageId,
          targetEmail: emailToSend,
          showDirectOptions: false
        });
      } else if (response.ok && data?.success) {
        setResendStatus({
          success: true,
          message: data.message || `E-mail registrado com sucesso para ${emailToSend}!`,
          messageId: data.messageId,
          targetEmail: emailToSend,
          showDirectOptions: false
        });
      } else {
        const errorMsg = data?.error || data?.message || 'O serviço de e-mail está processando. Você também pode enviar diretamente pelo seu Gmail com 1 clique abaixo.';
        setResendStatus({
          success: false,
          message: errorMsg,
          targetEmail: emailToSend,
          showDirectOptions: true
        });
      }
    } catch (err: any) {
      setResendStatus({
        success: false,
        message: 'A requisição automática oscilou na rede. Você pode disparar o comprovante diretamente pelo Gmail Web ou seu aplicativo de e-mail com 1 clique:',
        targetEmail: emailToSend,
        showDirectOptions: true
      });
    } finally {
      setResending(false);
    }
  };

  const handleShareWhatsApp = () => {
    const text = `*COMPROVANTE OFICIAL DE INSCRIÇÃO DE TRABALHO*\n*I Fórum de Qualidade e Segurança do Paciente - SUS Recife*\n\n📌 *Protocolo:* ${submission.protocolNumber}\n📚 *Eixo:* ${submission.thematicAxisLabel}\n📑 *Título:* ${submission.title}\n👤 *Autor(a) Principal:* ${submission.mainAuthor.fullName}\n🏢 *Unidade/Lotação:* ${submission.mainAuthor.workLocation}\n📅 *Apresentação Presencial:* 30/09/2026 das 08h às 17h\n📍 *Local:* ${FORUM_INFO.locationVenue} (${FORUM_INFO.locationAddress})\n\n_Comprovante emitido pela Escola de Saúde do Recife (ESR/SEGTES)._`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const googleCalUrl = generateGoogleCalendarUrl();

  const formattedDate = new Date(submission.submittedAt).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Alert */}
      <div className="bg-emerald-600 text-white rounded-2xl p-5 sm:p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0 mt-0.5">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest bg-white/25 px-2.5 py-0.5 rounded">
              Inscrição Registrada com Sucesso
            </span>
            <h2 className="text-xl sm:text-2xl font-black mt-1 font-display">
              Trabalho Inscrito na Oficina Municipal!
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl">
              Seu trabalho foi recebido e registrado com sucesso. Guarde o protocolo oficial abaixo para comprovação e acompanhamento.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-end sm:self-center shrink-0">
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer border border-emerald-500"
          >
            <Share2 className="w-4 h-4 text-emerald-200" />
            Enviar no WhatsApp
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-emerald-700" />
            Imprimir Comprovante
          </button>
        </div>
      </div>

      {/* Confirmação de Envio Automático por E-mail (@intelipay) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 no-print">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
            <Mail className="w-5 h-5" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-[#001B44]">
                  Confirmação de Inscrição por E-mail
                </h3>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-600" />
                  Domínio @intelipay-sesau.com.br
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleResendEmail(submission.mainAuthor.email)}
                  disabled={resending}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-bold transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  {resending ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Mail className="w-3.5 h-3.5" />
                      Reenviar Agora
                    </>
                  )}
                </button>

                <a
                  href={generateGmailWebLink(
                    submission.mainAuthor.email,
                    `Confirmação de Inscrição: ${submission.protocolNumber} - I Fórum de Qualidade e Segurança do Paciente`,
                    generateExecutiveReceiptText(submission, submission.mainAuthor.fullName)
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#001B44] text-xs font-bold transition flex items-center gap-1.5 border border-slate-300"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#EA7600]" />
                  Abrir no Gmail Web
                </a>

                <button
                  type="button"
                  onClick={() => setShowEmailInput(!showEmailInput)}
                  className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  {showEmailInput ? 'Fechar' : 'Enviar para outro e-mail'}
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              O comprovante com protocolo <strong>{submission.protocolNumber}</strong> foi despachado para: <strong className="text-[#001B44]">{submission.mainAuthor.email}</strong>
              {submission.coAuthors.length > 0 && ` (e ${submission.coAuthors.length} coautor(es))`}.
            </p>

            {/* Optional custom email input */}
            {showEmailInput && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 mt-2">
                <label className="block text-xs font-bold text-slate-700">
                  Enviar cópia para outro e-mail:
                </label>
                <div className="flex flex-wrap gap-2">
                  <input
                    type="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="Digite o e-mail (ex: Getvb98@gmail.com)"
                    className="flex-1 min-w-[220px] px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleResendEmail(customEmail)}
                    disabled={resending}
                    className="px-4 py-1.5 bg-[#001B44] hover:bg-[#0A2D6C] text-white text-xs font-bold rounded-lg transition disabled:bg-slate-400 cursor-pointer"
                  >
                    {resending ? 'Enviando...' : 'Enviar Cópia'}
                  </button>
                  <a
                    href={generateGmailWebLink(
                      customEmail,
                      `Confirmação de Inscrição: ${submission.protocolNumber} - I Fórum de Qualidade e Segurança do Paciente`,
                      generateExecutiveReceiptText(submission, submission.mainAuthor.fullName)
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#001B44] text-xs font-bold rounded-lg transition border border-slate-300 flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#EA7600]" />
                    Gmail
                  </a>
                </div>
              </div>
            )}

            {/* Resend Status Banner */}
            {resendStatus && (
              <div className={`p-3.5 rounded-xl text-xs space-y-2 ${
                resendStatus.success
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                  : 'bg-amber-50 text-amber-950 border border-amber-300'
              }`}>
                <div className="flex items-center gap-2">
                  {resendStatus.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <span className="text-amber-700 shrink-0 font-black text-sm">ℹ️</span>
                  )}
                  <div className="flex-1 font-semibold">
                    <span>{resendStatus.message}</span>
                    {resendStatus.messageId && (
                      <span className="block text-[10px] text-emerald-700 font-mono mt-0.5">
                        ID de Entrega: {resendStatus.messageId}
                      </span>
                    )}
                  </div>
                </div>

                {/* Direct 1-click fallback buttons when needed */}
                {resendStatus.showDirectOptions && (
                  <div className="pt-2 border-t border-amber-200/80 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-700 w-full">
                      Opções diretas de envio sem depender do servidor:
                    </span>
                    <a
                      href={generateGmailWebLink(
                        resendStatus.targetEmail || submission.mainAuthor.email,
                        `Confirmação de Inscrição: ${submission.protocolNumber} - I Fórum de Qualidade e Segurança do Paciente`,
                        generateExecutiveReceiptText(submission, submission.mainAuthor.fullName)
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-[#001B44] text-xs font-bold shadow-2xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#EA7600]" />
                      Abrir no Gmail Web
                    </a>

                    <a
                      href={generateMailtoLink(
                        resendStatus.targetEmail || submission.mainAuthor.email,
                        `Confirmação de Inscrição: ${submission.protocolNumber} - I Fórum de Qualidade e Segurança do Paciente`,
                        generateExecutiveReceiptText(submission, submission.mainAuthor.fullName)
                      )}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-[#001B44] text-xs font-bold shadow-2xs"
                    >
                      <Mail className="w-3.5 h-3.5 text-[#3498FE]" />
                      Enviar via Outlook / App de E-mail
                    </a>

                    <button
                      type="button"
                      onClick={handleCopyReceiptText}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-[#001B44] text-xs font-bold shadow-2xs cursor-pointer"
                    >
                      {copiedReceipt ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Texto Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-600" />
                          <span>Copiar Texto do Comprovante</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="text-[11px] bg-sky-50 text-sky-950 border border-sky-200 rounded-lg p-2.5 flex items-start gap-2">
              <span className="font-bold shrink-0">💡 Dica:</span>
              <span>Caso não localize o e-mail na Caixa de Entrada em instantes, confira a pasta <strong>Spam / Lixo Eletrônico</strong> de <em>{submission.mainAuthor.email}</em> ou use o botão <strong>Abrir no Gmail Web</strong> acima.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Official Comprovante Card (printable) */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden printable-comprovante">
        {/* Institutional Top Bar in Navy & Orange */}
        <div className="bg-[#001B44] text-white p-5 sm:p-6 border-b-4 border-[#EA7600] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#0A2D6C] border border-[#3498FE]/40 flex items-center justify-center text-[#3498FE] shrink-0">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#EA7600] bg-white/10 px-2 py-0.5 rounded">
                SUS RECIFE • OFICIAL 2026
              </span>
              <h3 className="text-base sm:text-lg font-black text-white leading-tight font-display mt-0.5">
                Comprovante de Inscrição de Trabalho na Oficina
              </h3>
              <p className="text-xs text-sky-200">
                {FORUM_INFO.fullTitle}
              </p>
            </div>
          </div>

          <div className="flex flex-col md:items-end text-left md:text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
              Protocolo Oficial de Inscrição
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-base sm:text-lg font-mono font-black text-[#EA7600] bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-2xs">
                {submission.protocolNumber}
              </span>
              <button
                type="button"
                onClick={handleCopyProtocol}
                className="text-xs text-sky-200 hover:text-white underline cursor-pointer no-print"
              >
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
            <span className="text-[11px] text-sky-200 mt-1">
              Data/Hora: {formattedDate}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-7 space-y-6">
          {/* Header Specs: Eixo, Modalidade, Vaga */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                Eixo Temático Escolhido
              </span>
              <span className="font-extrabold text-xs sm:text-sm text-[#001B44] block">
                {submission.thematicAxisLabel}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                Modalidade de Apresentação
              </span>
              <span className="font-extrabold text-xs sm:text-sm text-[#EA7600] flex items-center gap-1.5">
                {submission.modality === 'RELATO_EXPERIENCIA' ? (
                  <>
                    <BookOpen className="w-4 h-4" />
                    Relato de Experiência (Oral)
                  </>
                ) : (
                  <>
                    <Palette className="w-4 h-4" />
                    Produção Artística ({submission.artisticProduction?.artisticCategory})
                  </>
                )}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                Ordem de Inscrição no Eixo
              </span>
              <span className="font-extrabold text-xs sm:text-sm text-emerald-700 block">
                {submission.slotOrder <= 10 ? `Vaga #${submission.slotOrder} de 10 (Apresentação Garantida)` : `Ordem #${submission.slotOrder} (Lista Geral)`}
              </span>
            </div>
          </div>

          {/* Title of the Work */}
          <div className="p-4 rounded-xl bg-sky-50/50 border border-[#3498FE]/30">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#001B44] block mb-1">
              Título do Trabalho (Desenvolvido em {submission.developmentPeriod})
            </span>
            <h4 className="text-base sm:text-lg font-black text-[#001B44] leading-snug">
              {submission.title}
            </h4>
          </div>

          {/* Autores */}
          <div>
            <h5 className="text-xs font-extrabold uppercase tracking-wider text-[#001B44] mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#EA7600]" />
              Relação de Autores/as ({1 + submission.coAuthors.length} participantes)
            </h5>

            <div className="space-y-3">
              {/* Autor Principal */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[#001B44]">
                      {submission.mainAuthor.fullName}
                    </span>
                    <span className="text-[10px] font-bold bg-[#EA7600] text-white px-2 py-0.5 rounded">
                      Autor(a) Principal ( Responsável pela Inscrição do Trabalho )
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span>CPF: {submission.mainAuthor.cpf}</span>
                    <span>•</span>
                    <span>{submission.mainAuthor.professionalBackground}</span>
                    <span>•</span>
                    <span>Cargo: {submission.mainAuthor.roleOrFunction}</span>
                    {submission.mainAuthor.sesauMatricula && (
                      <>
                        <span>•</span>
                        <span>Matrícula: {submission.mainAuthor.sesauMatricula}</span>
                      </>
                    )}
                  </div>
                  <div className="text-xs text-slate-700 font-semibold flex items-center gap-1.5 pt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-[#3498FE]" />
                    <span>{submission.mainAuthor.workLocation}</span>
                  </div>
                </div>

                <div className="text-right text-xs text-slate-500 font-mono shrink-0">
                  <div>{submission.mainAuthor.email}</div>
                  <div>{submission.mainAuthor.phone}</div>
                </div>
              </div>

              {/* Coautores */}
              {submission.coAuthors.map((co, idx) => (
                <div key={co.id} className="p-3.5 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{co.fullName}</span>
                      <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                        Coautor(a) #{idx + 1}
                      </span>
                    </div>
                    <div className="text-slate-500 text-[11px] flex flex-wrap gap-2 mt-0.5">
                      <span>CPF: {co.cpf}</span>
                      <span>•</span>
                      <span>{co.professionalBackground}</span>
                      <span>•</span>
                      <span>{co.roleOrFunction} ({co.workLocation})</span>
                    </div>
                  </div>
                  <div className="text-slate-500 font-mono text-[11px] text-right">
                    <span>{co.email}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Roteiro Estruturado do Trabalho */}
          <div className="border-t border-slate-200 pt-5">
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-xs font-extrabold uppercase tracking-wider text-[#001B44] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#3498FE]" />
                Conteúdo do Trabalho Inscrito
              </h5>
              <button
                type="button"
                onClick={() => setShowFullReport(!showFullReport)}
                className="text-xs font-bold text-[#EA7600] hover:underline cursor-pointer no-print"
              >
                {showFullReport ? 'Ocultar Detalhes' : 'Expandir Roteiro Completo'}
              </button>
            </div>

            {showFullReport && (
              <div className="space-y-4 text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200/80">
                {submission.modality === 'RELATO_EXPERIENCIA' && submission.experienceReport && (
                  <div className="space-y-3.5">
                    <div>
                      <strong className="block text-[#001B44] mb-0.5">1. O que foi realizado e por quê?</strong>
                      <p className="bg-white p-3 rounded-lg border border-slate-200 whitespace-pre-line">
                        {submission.experienceReport.whatAndWhy}
                      </p>
                    </div>

                    <div>
                      <strong className="block text-[#001B44] mb-0.5">2. Como foi desenvolvida a experiência?</strong>
                      <p className="bg-white p-3 rounded-lg border border-slate-200 whitespace-pre-line">
                        {submission.experienceReport.howDeveloped}
                      </p>
                    </div>

                    <div>
                      <strong className="block text-[#001B44] mb-0.5">3. O que você e a sua equipe aprenderam com essa experiência?</strong>
                      <p className="bg-white p-3 rounded-lg border border-slate-200 whitespace-pre-line">
                        {submission.experienceReport.whatLearned}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <strong className="block text-[#001B44] mb-0.5">4. Desafios encontrados</strong>
                        <p className="bg-white p-2.5 rounded-lg border border-slate-200 whitespace-pre-line">
                          {submission.experienceReport.challenges}
                        </p>
                      </div>
                      <div>
                        <strong className="block text-[#001B44] mb-0.5">5. O que mais e menos gostou</strong>
                        <p className="bg-white p-2.5 rounded-lg border border-slate-200 whitespace-pre-line">
                          {submission.experienceReport.likedAndDisliked}
                        </p>
                      </div>
                      <div>
                        <strong className="block text-[#001B44] mb-0.5">6. O que ainda pode ser feito</strong>
                        <p className="bg-white p-2.5 rounded-lg border border-slate-200 whitespace-pre-line">
                          {submission.experienceReport.whatCanBeDone}
                        </p>
                      </div>
                    </div>

                    {submission.experienceReport.references && (
                      <div className="pt-2 border-t border-slate-200">
                        <strong className="block text-[#001B44] mb-0.5">Referências (Item Obrigatório):</strong>
                        <p className="bg-white p-3 rounded-lg border border-slate-200 whitespace-pre-line font-mono text-[11px] text-slate-700">
                          {submission.experienceReport.references}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {submission.modality === 'PRODUCAO_ARTISTICA' && submission.artisticProduction && (
                  <div className="space-y-3.5">
                    <div>
                      <strong className="block text-[#001B44] mb-0.5">Modalidade:</strong>
                      <span className="font-semibold text-slate-800">
                        {submission.artisticProduction.artisticCategory}
                      </span>
                    </div>

                    <div>
                      <strong className="block text-[#001B44] mb-0.5">Contexto de Criação (Onde, quando e por quê):</strong>
                      <p className="bg-white p-3 rounded-lg border border-slate-200 whitespace-pre-line">
                        {submission.artisticProduction.creationContext}
                      </p>
                    </div>

                    {submission.artisticProduction.textContent && (
                      <div>
                        <strong className="block text-[#001B44] mb-0.5">Texto / Cordel / Poesia:</strong>
                        <p className="bg-white p-4 rounded-lg border border-slate-200 whitespace-pre-line font-serif">
                          {submission.artisticProduction.textContent}
                        </p>
                      </div>
                    )}

                    {submission.attachedFile?.previewUrl && (
                      <div>
                        <strong className="block text-[#001B44] mb-1">Fotografia / Imagem Anexada:</strong>
                        <img 
                          src={submission.attachedFile.previewUrl} 
                          alt="Arquivo Anexado" 
                          className="max-h-64 rounded-xl border border-slate-300 shadow-sm"
                        />
                      </div>
                    )}

                    {submission.artisticProduction.references && (
                      <div className="pt-2 border-t border-slate-200">
                        <strong className="block text-[#001B44] mb-0.5">Referências (Item Obrigatório):</strong>
                        <p className="bg-white p-3 rounded-lg border border-slate-200 whitespace-pre-line font-mono text-[11px] text-slate-700">
                          {submission.artisticProduction.references}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {submission.mediaLink && (
                  <div className="pt-2 border-t border-slate-200">
                    <strong className="block text-[#001B44] mb-1">Link para Arquivos Externos (Áudio/Vídeo):</strong>
                    <a
                      href={submission.mediaLink.startsWith('http') ? submission.mediaLink : `https://${submission.mediaLink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 border border-sky-200 text-[#001B44] hover:bg-sky-100 font-bold transition text-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#EA7600]" />
                      <span>{submission.mediaLink}</span>
                    </a>
                  </div>
                )}

                {submission.attachedFile && (
                  <div className="pt-2 text-xs text-slate-600 border-t border-slate-200 flex items-center gap-2">
                    <strong className="text-[#001B44]">Arquivo Anexado:</strong> 
                    <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                      {submission.attachedFile.name} ({(submission.attachedFile.size / 1024).toFixed(0)} KB)
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Local do Evento e Orientações */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-extrabold text-[#001B44] block">
                Apresentação Presencial: 30 de Setembro de 2026 • 08h às 17h
              </span>
              <span className="text-slate-600">
                {FORUM_INFO.locationVenue} — {FORUM_INFO.locationAddress}
              </span>
            </div>
            <div className="text-slate-500 font-mono text-[11px]">
              Certificação ESR/SEGTES: 8 Horas
            </div>
          </div>
        </div>

        {/* Footer with Seal */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            {FORUM_INFO.organizer} • Escola de Saúde do Recife (ESR/SEGTES)
          </span>
          <span className="font-mono text-[11px] text-[#001B44] font-bold">
            Autenticidade: {submission.protocolNumber}
          </span>
        </div>
      </div>

      {/* Action Buttons (no-print) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 no-print">
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={googleCalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-[#001B44] flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
          >
            <Calendar className="w-4 h-4 text-[#EA7600]" />
            Adicionar ao Google Agenda
          </a>

          <button
            type="button"
            onClick={downloadIcsFile}
            className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-[#001B44] flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
          >
            <Download className="w-4 h-4 text-[#3498FE]" />
            Baixar Arquivo .ICS
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          {onOpenConsult && (
            <button
              type="button"
              onClick={onOpenConsult}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#001B44] text-xs font-bold transition cursor-pointer border border-slate-300"
            >
              Consultar Trabalhos
            </button>
          )}

          <button
            type="button"
            onClick={onNewSubmission}
            className="px-5 py-2.5 rounded-xl bg-[#EA7600] hover:bg-[#D26500] text-white text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            Inscrever Outro Trabalho
          </button>
        </div>
      </div>
    </div>
  );
};
