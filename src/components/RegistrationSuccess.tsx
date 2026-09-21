import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Printer, 
  Download, 
  Calendar as CalendarIcon, 
  MapPin, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  ShieldCheck, 
  Award,
  Clock,
  User,
  Building2,
  Mail,
  CreditCard,
  Users,
  Check,
  Copy,
  MessageCircle,
  Share2
} from 'lucide-react';
import { RegistrationData } from '../types';
import { FORUM_INFO } from '../data/forumInfo';
import { maskCPF } from '../utils/cpfValidator';
import { generateGoogleCalendarUrl, downloadIcsFile } from '../utils/calendar';
import {
  generateAttendeeEmailHtml,
  generateAttendeePlainTextReceipt,
  generateAttendeeExecutiveText,
  generateGmailWebLink,
  generateWhatsAppShareLink
} from '../utils/emailConfirmation';

interface RegistrationSuccessProps {
  registration: RegistrationData;
  onNewRegistration: () => void;
}

export const RegistrationSuccess: React.FC<RegistrationSuccessProps> = ({
  registration,
  onNewRegistration,
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [showFullCpf, setShowFullCpf] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedReceipt, setCopiedReceipt] = useState(false);
  const [resending, setResending] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [resendStatus, setResendStatus] = useState<{
    success: boolean;
    message: string;
    delivered?: boolean;
    provider?: string;
  } | null>(null);

  const handleCopyReceipt = async () => {
    try {
      const text = generateAttendeeExecutiveText(registration);
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopiedReceipt(true);
      setTimeout(() => setCopiedReceipt(false), 2500);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const handleResendEmail = async (targetEmailAddress?: string) => {
    const emailToSend = targetEmailAddress?.trim() || registration.email;
    if (!emailToSend || !emailToSend.includes('@')) {
      setResendStatus({
        success: false,
        message: 'Por favor, insira um endereço de e-mail válido com @ e domínio.'
      });
      return;
    }

    setResending(true);
    setResendStatus(null);

    try {
      const subject = `Confirmação de Inscrição Presencial: ${registration.protocolNumber} - I Fórum de Qualidade e Segurança do Paciente`;
      const htmlContent = generateAttendeeEmailHtml(registration);
      const textContent = generateAttendeePlainTextReceipt(registration);

      const response = await fetch('/api/send-confirmation-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registration,
          recipientEmail: emailToSend,
          recipientName: registration.fullName,
          recipientRole: 'Participante / Ouvinte Credenciado',
          subject,
          htmlContent,
          textContent,
          protocolNumber: registration.protocolNumber
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setResendStatus({
          success: true,
          delivered: true,
          provider: data.provider,
          message: `Comprovante oficial despachado com sucesso para ${emailToSend}! Verifique a Caixa de Entrada ou Lixo Eletrônico.`
        });
      } else {
        setResendStatus({
          success: false,
          message: data.error || data.message || 'Falha ao despachar. Utilize o botão "Abrir no Gmail Web" ou "Enviar no WhatsApp" para entrega imediata.'
        });
      }
    } catch (err: any) {
      setResendStatus({
        success: false,
        message: `Não foi possível conectar ao servidor: ${err.message || 'Erro de rede'}. Você pode enviar diretamente usando o botão "Abrir no Gmail Web".`
      });
    } finally {
      setResending(false);
    }
  };

  const handleCopyAddress = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(FORUM_INFO.location);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = FORUM_INFO.location;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2500);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  useEffect(() => {
    // Fire festive celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    // Generate QR Code with protocol & participant payload for gate accreditation
    const qrPayload = JSON.stringify({
      evento: FORUM_INFO.title,
      protocolo: registration.protocolNumber,
      nome: registration.fullName,
      cpf: registration.cpf,
      vinculo: registration.institutionalLink,
      perfil: registration.targetProfile || 'Profissional / Estudante',
      local: 'Interne Soluções em Saúde - Rua Marquês Amorim, 356',
      data: '30/09/2026',
      status: registration.status,
      realizacao: 'NMSPR - SERMAC/SEAB',
      parceria: 'ESR - SEGTES'
    });

    QRCode.toDataURL(qrPayload, {
      width: 220,
      margin: 1.5,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    })
      .then(url => setQrCodeUrl(url))
      .catch(err => console.error('Erro ao gerar QR code:', err));
  }, [registration]);

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(registration.registeredAt).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top Banner Alert (Hidden in Print) */}
      <div className="bg-[#001B44] text-white rounded-2xl p-6 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 no-print animate-in fade-in duration-300 border border-[#0A2D6C]">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-2.5 bg-[#EA7600] rounded-xl shrink-0 shadow-md">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-wider bg-white/15 px-2.5 py-0.5 rounded text-[#3498FE]">
              Inscrição Presencial Homologada
            </span>
            <h2 className="text-xl font-black text-white mt-1 font-display tracking-tight">
              Parabéns, sua vaga presencial está confirmada!
            </h2>
            <p className="text-xs sm:text-sm text-slate-200">
              Apresente esta credencial com QR Code na portaria da Interne Soluções em Saúde no dia 30/09/2026 para retirada do seu crachá.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
          <button
            type="button"
            onClick={handlePrint}
            id="btn-imprimir-comprovante"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#EA7600] hover:bg-[#D26500] text-white text-xs font-black shadow-md transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Imprimir Comprovante
          </button>
        </div>
      </div>

      {/* Confirmação de Envio Automático da Credencial por E-mail (@intelipay) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 no-print">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
            <Mail className="w-5 h-5" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm font-extrabold text-[#001B44]">
                  Credencial Presencial Despachada por E-mail
                </h4>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-600" />
                  Domínio Oficial @intelipay
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleResendEmail(registration.email)}
                  disabled={resending}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
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
                    registration.email,
                    `Credencial Oficial: ${registration.protocolNumber} - I Fórum de Qualidade e Segurança`,
                    generateAttendeeExecutiveText(registration)
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#001B44] text-xs font-bold transition flex items-center gap-1.5 border border-slate-300"
                  title="Abre o Gmail com a credencial pronta para envio direto de sua conta para qualquer e-mail"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#EA7600]" />
                  Abrir no Gmail Web
                </a>

                <a
                  href={generateWhatsAppShareLink(
                    undefined,
                    generateAttendeeExecutiveText(registration)
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition flex items-center gap-1.5 border border-emerald-300"
                  title="Compartilhar credencial no WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  WhatsApp
                </a>

                <button
                  type="button"
                  onClick={handleCopyReceipt}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 border border-slate-300 cursor-pointer"
                  title="Copiar texto da credencial"
                >
                  {copiedReceipt ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copiar Texto
                    </>
                  )}
                </button>

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
              A credencial com QR Code e protocolo <strong>{registration.protocolNumber}</strong> foi enviada para: <strong className="text-[#001B44]">{registration.email}</strong>.
            </p>

            {/* Form de disparo para qualquer e-mail */}
            {showEmailInput && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 mt-2">
                <label className="block text-xs font-bold text-slate-700">
                  Disparar credencial para qualquer outro e-mail:
                </label>
                <div className="flex flex-wrap gap-2">
                  <input
                    type="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="Digite qualquer e-mail (ex: participante@recife.pe.gov.br ou hotmail, gmail, etc.)"
                    className="flex-1 min-w-[240px] px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleResendEmail(customEmail)}
                    disabled={resending}
                    className="px-4 py-1.5 bg-[#001B44] hover:bg-[#0A2D6C] text-white text-xs font-bold rounded-lg transition disabled:bg-slate-400 cursor-pointer"
                  >
                    {resending ? 'Enviando...' : 'Disparar Agora'}
                  </button>
                  <a
                    href={generateGmailWebLink(
                      customEmail,
                      `Credencial Oficial: ${registration.protocolNumber} - I Fórum de Qualidade e Segurança`,
                      generateAttendeeExecutiveText(registration)
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#001B44] text-xs font-bold rounded-lg transition border border-slate-300 flex items-center gap-1"
                    title="Abre o Gmail com este endereço preenchido"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#EA7600]" />
                    Pelo Gmail Web
                  </a>
                </div>
              </div>
            )}

            {/* Status do Reenvio */}
            {resendStatus && (
              <div className={`p-3 rounded-xl text-xs ${
                resendStatus.success
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                  : 'bg-amber-50 text-amber-950 border border-amber-300'
              }`}>
                <p className="font-semibold">{resendStatus.message}</p>
              </div>
            )}

            <div className="text-[11px] bg-amber-50 text-amber-950 border border-amber-200 rounded-xl p-3 space-y-1.5">
              <div className="flex items-start gap-2">
                <span className="font-extrabold text-amber-800 shrink-0 text-xs">⚠️ Importante para e-mails institucionais (@ufpe.br, @recife.pe.gov.br, etc.):</span>
              </div>
              <p className="text-amber-900 leading-relaxed">
                Os filtros de segurança de universidades (como o Google Workspace da <strong>UFPE</strong>) e órgãos públicos costumam direcionar mensagens automáticas de sistemas externos para a pasta <strong>Spam / Lixo Eletrônico</strong>.
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-amber-900 pl-1 font-medium">
                <li>Verifique a pasta <strong>Spam</strong> do seu e-mail institucional (<em>{registration.email}</em>) e marque como <em>"Não é spam"</em>.</li>
                <li>Ou utilize o botão <strong>"Abrir no Gmail Web"</strong> acima para despachar uma cópia direta da sua conta Google, ou <strong>"WhatsApp"</strong> para envio direto.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* THE OFFICIAL CREDENTIAL VOUCHER (PRINTABLE) */}
      <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-xl overflow-hidden print-card relative">
        {/* Certificate / Ticket Header in Deep Navy #001B44 */}
        <div className="bg-[#001B44] text-white p-6 sm:p-8 relative border-b border-[#0A2D6C]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/15 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#EA7600] flex items-center justify-center text-white shrink-0 shadow-md">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-[10px] sm:text-xs uppercase font-extrabold tracking-widest text-[#3498FE] block">
                  Prefeitura da Cidade do Recife • Secretaria de Saúde
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight font-display">
                  {FORUM_INFO.title}
                </h3>
                <span className="text-xs text-slate-300 font-medium">
                  {FORUM_INFO.organizerShort} • Parceria: {FORUM_INFO.partnershipShort}
                </span>
              </div>
            </div>

            <div className="sm:text-right bg-white/10 sm:bg-transparent p-3 sm:p-0 rounded-lg w-full sm:w-auto border sm:border-0 border-white/10">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#3498FE] block">
                Protocolo Oficial
              </span>
              <span className="text-base sm:text-lg font-mono font-extrabold text-[#FED7AA] tracking-wider">
                {registration.protocolNumber}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#EA7600] bg-[#FFF5E6] px-2 py-0.5 rounded mt-1 border border-[#FED7AA]">
                <CheckCircle2 className="w-3 h-3" />
                Vaga Presencial Garantida
              </span>
            </div>
          </div>

          {/* Quick Details Stripe */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 text-xs text-slate-200">
            <div>
              <span className="text-[10px] uppercase text-[#3498FE] block font-bold">Modalidade</span>
              <span className="font-bold text-white">{FORUM_INFO.modality} (Interne Soluções em Saúde)</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-[#3498FE] block font-bold">Data</span>
              <span className="font-bold text-white">{FORUM_INFO.dates}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-[#3498FE] block font-bold">Horário</span>
              <span className="font-bold text-white">{FORUM_INFO.time}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-[#3498FE] block font-bold">Carga Horária</span>
              <span className="font-bold text-white">8 horas • ESR / SEGTES</span>
            </div>
          </div>
        </div>

        {/* Ticket Body: Participant & QR Code */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-center bg-white">
          {/* Participant Information Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">
                Nome do Participante Credenciado
              </span>
              <h4 className="text-xl sm:text-2xl font-black text-[#001B44] flex items-center gap-2 font-display">
                <User className="w-5 h-5 text-[#EA7600] shrink-0" />
                {registration.fullName}
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* CPF */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">
                  CPF
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold font-mono text-slate-800 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                    {showFullCpf ? registration.cpf : maskCPF(registration.cpf)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowFullCpf(!showFullCpf)}
                    className="text-xs text-[#EA7600] hover:text-[#D26500] flex items-center gap-1 cursor-pointer no-print ml-2 font-semibold"
                    title={showFullCpf ? 'Ocultar CPF' : 'Mostrar CPF completo'}
                  >
                    {showFullCpf ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Email */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">
                  E-mail do Participante
                </span>
                <span className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  {registration.email}
                </span>
              </div>
            </div>

            {/* Institutional Link & Target Profile */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2.5">
              {registration.cnesUnit && (
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">
                    Unidade de Saúde (Conforme CNES)
                  </span>
                  <p className="text-sm font-black text-[#001B44] flex items-start gap-2">
                    <Building2 className="w-4 h-4 text-[#EA7600] shrink-0 mt-0.5" />
                    <span>{registration.cnesUnit}</span>
                  </p>
                </div>
              )}

              <div className={registration.cnesUnit ? "pt-2 border-t border-slate-200/60" : ""}>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">
                  Vínculo Institucional (Rede SUS)
                </span>
                <p className="text-sm font-bold text-slate-700 flex items-start gap-2">
                  <Building2 className="w-4 h-4 text-[#3498FE] shrink-0 mt-0.5" />
                  <span>{registration.institutionalLink}</span>
                </p>
              </div>

              {registration.targetProfile && (
                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">
                    Segmento (Público-Alvo)
                  </span>
                  <p className="text-xs font-bold text-[#001B44] flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#3498FE]" />
                    {registration.targetProfile}
                  </p>
                </div>
              )}

              {registration.roleOrFunction && (
                <p className="text-xs text-slate-600 pl-5">
                  <strong>Função / Cargo:</strong> {registration.roleOrFunction}
                </p>
              )}
            </div>

            {/* Local do Evento Presencial */}
            <div className="p-3 bg-[#EBF5FF]/70 border border-[#3498FE]/30 rounded-xl text-xs text-[#001B44] flex items-start justify-between gap-2.5">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#EA7600] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-[#001B44]">Local de Apresentação Presencial:</span>
                  <span>{FORUM_INFO.locationVenue} — {FORUM_INFO.locationAddress}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 no-print">
                <a
                  href={FORUM_INFO.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-[#3498FE] hover:text-[#1e40af] transition"
                  title="Abrir no Google Maps"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={handleCopyAddress}
                  className="p-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-[#001B44] transition cursor-pointer"
                  title="Copiar endereço"
                >
                  {copiedAddress ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Accessibility / Timestamp */}
            <div className="flex flex-wrap gap-2 text-xs">
              {registration.accessibilityNeed !== 'Nenhuma necessidade específica' && (
                <span className="bg-[#FFF5E6] text-[#EA7600] px-2.5 py-1 rounded-lg border border-[#FED7AA] font-bold">
                  Acessibilidade: {registration.accessibilityNeed}
                </span>
              )}
              <span className="text-slate-400 text-[11px] self-center ml-auto">
                Inscrição registrada em: {formattedDate}
              </span>
            </div>
          </div>

          {/* QR Code Credential Column */}
          <div className="flex flex-col items-center justify-center p-5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-2">
              QR Code para Credenciamento na Portaria
            </span>
            {qrCodeUrl ? (
              <div className="bg-white p-2.5 rounded-xl shadow-xs border-2 border-[#001B44]/20">
                <img
                  src={qrCodeUrl}
                  alt={`QR Code da Inscrição ${registration.protocolNumber}`}
                  className="w-40 h-40 object-contain mx-auto"
                />
              </div>
            ) : (
              <div className="w-40 h-40 bg-slate-200 rounded-xl animate-pulse flex items-center justify-center text-xs text-slate-400">
                Gerando credencial...
              </div>
            )}
            <span className="text-[11px] font-mono font-bold text-[#001B44] mt-2">
              {registration.protocolNumber}
            </span>
            <p className="text-[10px] text-slate-500 mt-1 leading-tight">
              Apresente na entrada da Interne Soluções em Saúde (celular ou impresso) no dia 30/09/2026.
            </p>
          </div>
        </div>

        {/* Footer of the Credential Card */}
        <div className="bg-slate-100/70 border-t border-slate-200 px-6 py-4 text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#EA7600] shrink-0" />
            <span>
              Certificado oficial de <strong>8 (oito) horas</strong> emitido pela <strong>Escola de Saúde do Recife (ESR / SEGTES)</strong>.
            </span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono font-bold">
            NMSPR • SERMAC • SEAB • PREFEITURA DO RECIFE
          </div>
        </div>
      </div>

      {/* Access Location & Actions (Hidden in Print) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm no-print space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-[#001B44] uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#EA7600]" />
              Como Chegar ao Local do Fórum
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              {FORUM_INFO.locationVenue} — {FORUM_INFO.locationAddress}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={FORUM_INFO.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#EA7600] hover:bg-[#D26500] text-white text-xs font-bold transition cursor-pointer shrink-0 shadow-sm"
            >
              <span>Traçar Rota no Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              type="button"
              onClick={handleCopyAddress}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#001B44] text-xs font-bold border border-slate-300 transition cursor-pointer shrink-0"
              title="Copiar endereço completo"
            >
              {copiedAddress ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-extrabold">Endereço Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-600" />
                  <span>Copiar Endereço</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Calendar Integration & New Registration */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 mr-1">Salvar na Agenda:</span>
            <a
              href={generateGoogleCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#EBF5FF] text-[#001B44] hover:bg-[#D6EBFF] text-xs font-bold border border-[#3498FE]/40 transition"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-[#3498FE]" />
              Google Agenda
            </a>

            <button
              type="button"
              onClick={downloadIcsFile}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 text-xs font-semibold border border-slate-200 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Baixar iCal (.ics)
            </button>
          </div>

          <button
            type="button"
            onClick={onNewRegistration}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#EA7600] hover:text-[#D26500] transition cursor-pointer py-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Cadastrar outro participante
          </button>
        </div>
      </div>
    </div>
  );
};
