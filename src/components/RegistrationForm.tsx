import React, { useState } from 'react';
import { 
  User, 
  CreditCard, 
  Building2, 
  Mail, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  Calendar, 
  Clock, 
  Award, 
  Info, 
  ChevronRight,
  ShieldCheck,
  Accessibility,
  ExternalLink,
  Users,
  FileText
} from 'lucide-react';
import { RegistrationData } from '../types';
import { formatCPF, cleanCPF, validateCPF } from '../utils/cpfValidator';
import { sendRegistrationConfirmationEmail } from '../utils/emailConfirmation';
import { 
  INSTITUTIONAL_OPTIONS, 
  ACCESSIBILITY_OPTIONS, 
  TARGET_PROFILE_OPTIONS,
  CNES_HEALTH_UNITS,
  FORUM_INFO 
} from '../data/forumInfo';
import { LocationActionButtons } from './LocationActionButtons';

interface RegistrationFormProps {
  onSubmit: (data: RegistrationData) => void;
  registeredCount: number;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSubmit, registeredCount }) => {
  // Form field states
  const [fullName, setFullName] = useState('');
  const [cpf, setCpf] = useState('');
  const [cnesUnit, setCnesUnit] = useState('');
  const [customCnesUnit, setCustomCnesUnit] = useState('');
  const [showCnesList, setShowCnesList] = useState(false);
  const [targetProfile, setTargetProfile] = useState('');
  const [institutionalLink, setInstitutionalLink] = useState('');
  const [customInstitution, setCustomInstitution] = useState('');
  const [roleOrFunction, setRoleOrFunction] = useState('');
  const [email, setEmail] = useState('');
  const [emailConfirm, setEmailConfirm] = useState('');
  const [phone, setPhone] = useState('');
  const [accessibilityNeed, setAccessibilityNeed] = useState('Nenhuma necessidade específica');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Errors and interaction tracking
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // CPF Validation status
  const cleanCpfDigits = cleanCPF(cpf);
  const isCpfComplete = cleanCpfDigits.length === 11;
  const isCpfValid = isCpfComplete ? validateCPF(cpf) : false;

  // Email Validation
  const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  const isEmailValid = isValidEmail(email);
  const doEmailsMatch = email.trim().toLowerCase() === emailConfirm.trim().toLowerCase() && emailConfirm.length > 0;

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setCpf(formatted);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
    let formatted = digits;
    if (digits.length > 2 && digits.length <= 7) {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    } else if (digits.length > 7) {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }
    setPhone(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    // Mark all as touched
    setTouched({
      fullName: true,
      cpf: true,
      cnesUnit: true,
      institutionalLink: true,
      email: true,
      emailConfirm: true,
      termsAccepted: true
    });

    if (!fullName.trim() || fullName.trim().split(' ').length < 2) {
      setGeneralError('Por favor, informe seu nome completo com sobrenome.');
      return;
    }

    if (!isCpfValid) {
      setGeneralError('O número de CPF informado não é válido. Verifique os dígitos e tente novamente.');
      return;
    }

    if (!cnesUnit) {
      setGeneralError('Selecione a Unidade de Saúde / Estabelecimento conforme CNES.');
      return;
    }

    if (cnesUnit === 'Outra Unidade de Saúde / Estabelecimento SUS Recife' && !customCnesUnit.trim()) {
      setGeneralError('Por favor, informe o nome da sua unidade de saúde / estabelecimento.');
      return;
    }

    if (!institutionalLink) {
      setGeneralError('Selecione seu vínculo institucional com a Rede SUS ou área de atuação.');
      return;
    }

    if (institutionalLink === 'Outro Vínculo Institucional' && !customInstitution.trim()) {
      setGeneralError('Por favor, especifique seu vínculo institucional.');
      return;
    }

    if (!isEmailValid) {
      setGeneralError('Informe um endereço de e-mail válido para receber o comprovante e as instruções de acesso.');
      return;
    }

    if (!doEmailsMatch) {
      setGeneralError('A confirmação de e-mail não confere com o e-mail informado.');
      return;
    }

    if (!termsAccepted) {
      setGeneralError('É necessário aceitar a declaração e os termos de credenciamento (LGPD) para prosseguir.');
      return;
    }

    setIsSubmitting(true);

    // Generate unique protocol number
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const protocolNumber = `NMSPR-REC-2026-${randomSuffix}`;
    const id = `reg_${Date.now()}_${randomSuffix}`;

    const finalCnesUnit = cnesUnit === 'Outra Unidade de Saúde / Estabelecimento SUS Recife'
      ? customCnesUnit.trim()
      : cnesUnit;

    const registrationPayload: RegistrationData = {
      id,
      protocolNumber,
      fullName: fullName.trim(),
      cpf: formatCPF(cpf),
      email: email.trim().toLowerCase(),
      cnesUnit: finalCnesUnit || undefined,
      institutionalLink: institutionalLink === 'Outro Vínculo Institucional' ? customInstitution.trim() : institutionalLink,
      targetProfile: targetProfile || undefined,
      institutionSpecific: customInstitution.trim() || undefined,
      roleOrFunction: roleOrFunction.trim() || undefined,
      phone: phone.trim() || undefined,
      accessibilityNeed,
      modality: 'Presencial (Interne)',
      registeredAt: new Date().toISOString(),
      status: 'CONFIRMADA'
    };

    // Disparo oficial com todos os detalhes da inscrição (aguardando envio para garantir a entrega)
    try {
      await sendRegistrationConfirmationEmail(registrationPayload);
    } catch (err) {
      console.warn('Erro no envio de e-mail de participante:', err);
    }

    setIsSubmitting(false);
    onSubmit(registrationPayload);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* OFFICIAL IDENTIFICATION SHEET COMPONENT (MIRRORING THE OFFICIAL DOCUMENT) */}
      <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-md overflow-hidden">
        {/* Document Header in Deep Navy #001B44 */}
        <div className="bg-[#001B44] text-white p-5 sm:p-6 border-b border-[#0A2D6C]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EA7600] flex items-center justify-center text-white shrink-0 shadow-xs">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#3498FE] block">
                  Prefeitura do Recife • Secretaria de Saúde
                </span>
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white font-display">
                  Ficha de Identificação Oficial do Evento
                </h2>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/20 text-xs font-bold text-white">
              <span className="w-2 h-2 rounded-full bg-[#EA7600] animate-pulse"></span>
              Inscrições Abertas • {registeredCount} credenciados
            </div>
          </div>
        </div>

        {/* Structured Official Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <tbody className="divide-y divide-slate-200">
              {/* Evento */}
              <tr className="hover:bg-slate-50/70 transition">
                <td className="w-36 sm:w-44 px-4 sm:px-6 py-3.5 font-bold text-[#001B44] bg-slate-50/80 border-r border-slate-200 uppercase tracking-wider text-xs shrink-0">
                  Evento
                </td>
                <td className="px-4 sm:px-6 py-3.5 text-[#001B44] font-black text-sm sm:text-base">
                  {FORUM_INFO.fullTitle}
                </td>
              </tr>

              {/* Realização */}
              <tr className="hover:bg-slate-50/70 transition">
                <td className="px-4 sm:px-6 py-3.5 font-bold text-[#001B44] bg-slate-50/80 border-r border-slate-200 uppercase tracking-wider text-xs">
                  Realização
                </td>
                <td className="px-4 sm:px-6 py-3.5 text-slate-800 font-semibold">
                  {FORUM_INFO.organizer}
                </td>
              </tr>

              {/* Parceria */}
              <tr className="hover:bg-slate-50/70 transition">
                <td className="px-4 sm:px-6 py-3.5 font-bold text-[#001B44] bg-slate-50/80 border-r border-slate-200 uppercase tracking-wider text-xs">
                  Parceria
                </td>
                <td className="px-4 sm:px-6 py-3.5 text-slate-800 font-semibold">
                  {FORUM_INFO.partnership}
                </td>
              </tr>

              {/* Data e Horário */}
              <tr className="hover:bg-slate-50/70 transition">
                <td className="px-4 sm:px-6 py-3.5 font-bold text-[#001B44] bg-slate-50/80 border-r border-slate-200 uppercase tracking-wider text-xs">
                  Data e Horário
                </td>
                <td className="px-4 sm:px-6 py-3.5 text-slate-900 font-bold">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[#EA7600] bg-[#FFF5E6] px-2.5 py-1 rounded-md border border-[#FED7AA] font-bold">
                      <Calendar className="w-3.5 h-3.5" />
                      {FORUM_INFO.dates}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[#001B44] bg-slate-100 px-2.5 py-1 rounded-md font-semibold">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {FORUM_INFO.time}
                    </span>
                  </div>
                </td>
              </tr>

              {/* Local */}
              <tr className="hover:bg-slate-50/70 transition">
                <td className="px-4 sm:px-6 py-3.5 font-bold text-[#001B44] bg-slate-50/80 border-r border-slate-200 uppercase tracking-wider text-xs">
                  Local
                </td>
                <td className="px-4 sm:px-6 py-3.5 text-slate-800">
                  <LocationActionButtons variant="card" className="border-0 p-0 bg-transparent" />
                </td>
              </tr>

              {/* Modalidade */}
              <tr className="hover:bg-slate-50/70 transition">
                <td className="px-4 sm:px-6 py-3.5 font-bold text-[#001B44] bg-slate-50/80 border-r border-slate-200 uppercase tracking-wider text-xs">
                  Modalidade
                </td>
                <td className="px-4 sm:px-6 py-3.5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#001B44] bg-[#EBF5FF] px-2.5 py-1 rounded-md border border-[#3498FE]/40">
                    <span className="w-2 h-2 rounded-full bg-[#3498FE]"></span>
                    {FORUM_INFO.modality}
                  </span>
                  <span className="text-xs text-slate-500 ml-2">
                    (Inscrição digital prévia obrigatória para controle de capacidade do auditório)
                  </span>
                </td>
              </tr>

              {/* Carga Horária */}
              <tr className="hover:bg-slate-50/70 transition">
                <td className="px-4 sm:px-6 py-3.5 font-bold text-[#001B44] bg-slate-50/80 border-r border-slate-200 uppercase tracking-wider text-xs">
                  Carga horária
                </td>
                <td className="px-4 sm:px-6 py-3.5 text-slate-800">
                  <span className="font-bold text-[#001B44]">{FORUM_INFO.hoursWorkload}</span>
                  <span className="text-slate-600 text-xs ml-2">
                    • Certificação oficial emitida pela Escola de Saúde do Recife (ESR / SEGTES)
                  </span>
                </td>
              </tr>

              {/* Público-alvo */}
              <tr className="hover:bg-slate-50/70 transition">
                <td className="px-4 sm:px-6 py-3.5 font-bold text-[#001B44] bg-slate-50/80 border-r border-slate-200 uppercase tracking-wider text-xs align-top">
                  Público-alvo
                </td>
                <td className="px-4 sm:px-6 py-3.5 text-slate-800 leading-relaxed text-xs sm:text-sm">
                  {FORUM_INFO.targetAudience}
                </td>
              </tr>

              {/* Unidades Convocadas (Nome conforme CNES) */}
              <tr className="hover:bg-slate-50/70 transition">
                <td className="px-4 sm:px-6 py-3.5 font-bold text-[#001B44] bg-slate-50/80 border-r border-slate-200 uppercase tracking-wider text-xs align-top">
                  Unidades Convocadas (CNES)
                </td>
                <td className="px-4 sm:px-6 py-3.5 text-slate-800 text-xs sm:text-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="font-semibold text-slate-700">
                      19 Unidades de Saúde Municipais Prioritárias com Núcleos de Segurança do Paciente (NSP)
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCnesList(!showCnesList)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#001B44] hover:text-[#EA7600] bg-slate-100 px-2.5 py-1 rounded-md transition cursor-pointer border border-slate-200"
                    >
                      {showCnesList ? 'Ocultar Relação de Unidades' : 'Ver Relação Oficial Conforme CNES'}
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showCnesList ? '-rotate-90' : 'rotate-90'}`} />
                    </button>
                  </div>

                  {showCnesList && (
                    <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs animate-in fade-in duration-200">
                      {CNES_HEALTH_UNITS.slice(0, 19).map((unit) => (
                        <div key={unit} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200/80">
                          <span className="w-2 h-2 rounded-full bg-[#EA7600] shrink-0" />
                          <span className="font-mono text-[11px] font-bold text-[#001B44]">{unit}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Registration Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-lg font-bold text-[#001B44] flex items-center gap-2 font-display">
              <ShieldCheck className="w-5 h-5 text-[#EA7600]" />
              Credenciamento e Inscrição Digital
            </h3>
            <p className="text-xs text-slate-500">
              Preencha com atenção. Seus dados serão utilizados para o crachá de acesso presencial e emissão do certificado de 8 horas.
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-[#FFF5E6] text-[#EA7600] border border-[#FED7AA]">
              <span className="w-2 h-2 rounded-full bg-[#EA7600]"></span>
              Gratuito • Vagas Presenciais Limitadas
            </span>
          </div>
        </div>

        {generalError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3 animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Não foi possível concluir a inscrição</p>
              <p className="text-xs text-rose-700 mt-0.5">{generalError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* REQUIRED FIELDS REQUESTED BY USER */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Field 1: Nome Completo */}
            <div className="md:col-span-2">
              <label htmlFor="field-nome" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Nome Completo <span className="text-[#EA7600]">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="field-nome"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Ex: Dra. Maria Clara de Albuquerque Silva"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, fullName: true }))}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-slate-800 transition bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 ${
                    touched.fullName && (!fullName.trim() || fullName.trim().split(' ').length < 2)
                      ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                      : 'border-slate-200 focus:ring-[#3498FE]/20 focus:border-[#3498FE]'
                  }`}
                />
              </div>
              {touched.fullName && (!fullName.trim() || fullName.trim().split(' ').length < 2) && (
                <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Informe o nome completo para correta emissão do certificado pela ESR/SEGTES.
                </p>
              )}
            </div>

            {/* Field 2: CPF */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="field-cpf" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  CPF <span className="text-[#EA7600]">*</span>
                </label>
                <span className="text-[11px] text-slate-400">Somente números ou com pontuação</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <CreditCard className="w-4 h-4" />
                </div>
                <input
                  id="field-cpf"
                  type="text"
                  required
                  maxLength={14}
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={handleCpfChange}
                  onBlur={() => setTouched(prev => ({ ...prev, cpf: true }))}
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm text-slate-800 transition font-mono bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 ${
                    touched.cpf && !isCpfValid
                      ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/30'
                      : isCpfValid
                      ? 'border-emerald-400 focus:ring-emerald-500/20 focus:border-emerald-500 bg-emerald-50/30'
                      : 'border-slate-200 focus:ring-[#3498FE]/20 focus:border-[#3498FE]'
                  }`}
                />
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                  {isCpfValid ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : touched.cpf && !isCpfValid && cleanCpfDigits.length > 0 ? (
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                  ) : null}
                </div>
              </div>
              {touched.cpf && !isCpfValid && (
                <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  CPF inválido. Certifique-se de digitar os 11 dígitos válidos.
                </p>
              )}
              {isCpfValid && (
                <p className="mt-1.5 text-xs text-emerald-600 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  CPF validado com sucesso.
                </p>
              )}
            </div>

            {/* Field: Unidade de Saúde / Estabelecimento (Nome conforme CNES) */}
            <div className="md:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1.5 gap-1">
                <label htmlFor="field-cnes" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Unidade de Saúde / Estabelecimento (Nome conforme CNES) <span className="text-[#EA7600]">*</span>
                </label>
                <span className="text-[11px] font-semibold text-[#001B44] bg-[#EBF5FF] px-2 py-0.5 rounded border border-[#3498FE]/30">
                  Rede Municipal SUS Recife
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Building2 className="w-4 h-4 text-[#EA7600]" />
                </div>
                <select
                  id="field-cnes"
                  required
                  value={cnesUnit}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCnesUnit(val);
                    // Helpful auto-assist for institutional link
                    if (val && !institutionalLink) {
                      if (val.includes('POLICLINICA')) {
                        setInstitutionalLink('Atenção Especializada - Policlínica Municipal (Recife)');
                      } else if (val.includes('MATERNIDADE')) {
                        setInstitutionalLink('Maternidade Municipal (Prof. Barros Lima, Bandeira Filho, Arnaldo Marques)');
                      } else if (val.includes('SAMU')) {
                        setInstitutionalLink('Rede de Urgência e Emergência - SAMU 192 Recife');
                      } else if (val.includes('CENTRO MEDICO') || val.includes('CENTRAL DE ALERGOLOGIA')) {
                        setInstitutionalLink('Atenção Especializada - Policlínica Municipal (Recife)');
                      } else if (val.includes('NIVEL CENTRAL') || val.includes('LABORATORIO')) {
                        setInstitutionalLink('SESAU Recife - Sede / Gestão Central (SERMAC / SEAB / SEGTES)');
                      }
                    }
                  }}
                  onBlur={() => setTouched(prev => ({ ...prev, cnesUnit: true }))}
                  className={`w-full pl-10 pr-8 py-2.5 rounded-xl border text-sm text-slate-800 transition bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 appearance-none cursor-pointer ${
                    touched.cnesUnit && !cnesUnit
                      ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                      : 'border-slate-200 focus:ring-[#3498FE]/20 focus:border-[#3498FE]'
                  }`}
                >
                  <option value="">Selecione sua unidade conforme CNES...</option>
                  <optgroup label="Unidades Convocadas com NSPs (Conforme CNES)">
                    {CNES_HEALTH_UNITS.slice(0, 19).map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Outras Unidades / Órgãos">
                    {CNES_HEALTH_UNITS.slice(19).map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </optgroup>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
              {touched.cnesUnit && !cnesUnit && (
                <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Selecione sua unidade de saúde conforme o CNES.
                </p>
              )}
            </div>

            {/* Custom CNES input if "Outra Unidade de Saúde / Estabelecimento SUS Recife" is selected */}
            {cnesUnit === 'Outra Unidade de Saúde / Estabelecimento SUS Recife' && (
              <div className="md:col-span-2 animate-in fade-in duration-200">
                <label htmlFor="field-cnes-custom" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Informe o Nome da sua Unidade de Saúde / Estabelecimento SUS <span className="text-[#EA7600]">*</span>
                </label>
                <input
                  id="field-cnes-custom"
                  type="text"
                  required
                  placeholder="Digite o nome da USF, UBS, policlínica ou serviço de saúde..."
                  value={customCnesUnit}
                  onChange={(e) => setCustomCnesUnit(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3498FE]/20 focus:border-[#3498FE]"
                />
              </div>
            )}

            {/* Field 3: Vínculo Institucional */}
            <div>
              <label htmlFor="field-vinculo" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Vínculo Institucional <span className="text-[#EA7600]">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <select
                  id="field-vinculo"
                  required
                  value={institutionalLink}
                  onChange={(e) => setInstitutionalLink(e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, institutionalLink: true }))}
                  className={`w-full pl-10 pr-8 py-2.5 rounded-xl border text-sm text-slate-800 transition bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 appearance-none cursor-pointer ${
                    touched.institutionalLink && !institutionalLink
                      ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                      : 'border-slate-200 focus:ring-[#3498FE]/20 focus:border-[#3498FE]'
                  }`}
                >
                  <option value="">Selecione seu vínculo com a Rede SUS...</option>
                  {INSTITUTIONAL_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
              {touched.institutionalLink && !institutionalLink && (
                <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Selecione seu vínculo institucional.
                </p>
              )}
            </div>

            {/* Custom institution specification if "Outro Vínculo Institucional" */}
            {institutionalLink === 'Outro Vínculo Institucional' && (
              <div className="md:col-span-2 animate-in fade-in duration-200">
                <label htmlFor="field-outro-vinculo" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Especifique a Instituição / Unidade de Saúde <span className="text-[#EA7600]">*</span>
                </label>
                <input
                  id="field-outro-vinculo"
                  type="text"
                  required
                  placeholder="Nome do hospital, unidade, faculdade ou serviço de saúde..."
                  value={customInstitution}
                  onChange={(e) => setCustomInstitution(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3498FE]/20 focus:border-[#3498FE]"
                />
              </div>
            )}

            {/* Segmento / Perfil do Público-Alvo (Conforme a Ficha Oficial) */}
            <div className="md:col-span-2">
              <label htmlFor="field-perfil-alvo" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Segmento de Atuação (Público-Alvo)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Users className="w-4 h-4" />
                </div>
                <select
                  id="field-perfil-alvo"
                  value={targetProfile}
                  onChange={(e) => setTargetProfile(e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3498FE]/20 focus:border-[#3498FE] appearance-none cursor-pointer"
                >
                  <option value="">Selecione seu perfil (ex: Membro de NSP, Assistência, Gestão, Residente, Estudante)...</option>
                  {TARGET_PROFILE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Conforme definido na realização do NMSPR / SERMAC / SEAB, com prioridade para membros dos Núcleos de Segurança do Paciente (NSP).
              </p>
            </div>

            {/* Field: Cargo / Função / Unidade */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="field-cargo" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Unidade de Atuação / Cargo / Função
                </label>
                <span className="text-[11px] text-slate-400">Opcional</span>
              </div>
              <input
                id="field-cargo"
                type="text"
                placeholder="Ex: USF Coque, Membro do NSP, Enfermeiro(a), Médico(a), Residente Multiprofissional..."
                value={roleOrFunction}
                onChange={(e) => setRoleOrFunction(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3498FE]/20 focus:border-[#3498FE] bg-slate-50/50"
              />
            </div>

            {/* Field 4: E-mail */}
            <div>
              <label htmlFor="field-email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                E-mail Principal <span className="text-[#EA7600]">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="field-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="seu.email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-slate-800 transition bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 ${
                    touched.email && !isEmailValid
                      ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                      : 'border-slate-200 focus:ring-[#3498FE]/20 focus:border-[#3498FE]'
                  }`}
                />
              </div>
              {touched.email && !isEmailValid && (
                <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Insira um e-mail válido para receber seu comprovante de inscrição.
                </p>
              )}
            </div>

            {/* Field: Confirmação de E-mail */}
            <div>
              <label htmlFor="field-email-confirm" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Confirmar E-mail <span className="text-[#EA7600]">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="field-email-confirm"
                  type="email"
                  required
                  placeholder="Repita seu e-mail"
                  value={emailConfirm}
                  onChange={(e) => setEmailConfirm(e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, emailConfirm: true }))}
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm text-slate-800 transition bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 ${
                    touched.emailConfirm && !doEmailsMatch
                      ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                      : doEmailsMatch
                      ? 'border-emerald-400 focus:ring-emerald-500/20 focus:border-emerald-500'
                      : 'border-slate-200 focus:ring-[#3498FE]/20 focus:border-[#3498FE]'
                  }`}
                />
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                  {doEmailsMatch && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                </div>
              </div>
              {touched.emailConfirm && !doEmailsMatch && (
                <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Os e-mails informados não coincidem.
                </p>
              )}
            </div>

            {/* Field: Telefone / WhatsApp */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="field-telefone" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  WhatsApp / Celular
                </label>
                <span className="text-[11px] text-slate-400">Para avisos sobre o credenciamento</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  id="field-telefone"
                  type="tel"
                  placeholder="(81) 98765-4321"
                  value={phone}
                  onChange={handlePhoneChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3498FE]/20 focus:border-[#3498FE] bg-slate-50/50 font-mono"
                />
              </div>
            </div>

            {/* Field: Necessidade de Acessibilidade */}
            <div>
              <label htmlFor="field-acessibilidade" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Recursos de Acessibilidade (Presencial)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Accessibility className="w-4 h-4" />
                </div>
                <select
                  id="field-acessibilidade"
                  value={accessibilityNeed}
                  onChange={(e) => setAccessibilityNeed(e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3498FE]/20 focus:border-[#3498FE] appearance-none cursor-pointer"
                >
                  {ACCESSIBILITY_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
            </div>

          </div>

          {/* Event Venue Notice with Sky Blue Accent */}
          <div className="p-4 rounded-xl bg-[#EBF5FF]/60 border border-[#3498FE]/30 text-xs text-slate-700 flex items-start gap-3">
            <MapPin className="w-5 h-5 text-[#EA7600] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#001B44] block text-sm">
                Confirmação de Local e Horário Presencial
              </span>
              <p className="mt-0.5">
                O evento ocorrerá no auditório da <strong>{FORUM_INFO.locationVenue}</strong>, localizado na <strong>{FORUM_INFO.locationAddress}</strong>, no dia <strong>{FORUM_INFO.dates}</strong>, das <strong>{FORUM_INFO.time}</strong>. O credenciamento será realizado na entrada mediante apresentação do comprovante com QR Code gerado ao final desta inscrição.
              </p>
            </div>
          </div>

          {/* LGPD and Terms Acceptance */}
          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                id="field-termos"
                type="checkbox"
                required
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-[#EA7600] border-slate-300 focus:ring-[#EA7600] cursor-pointer accent-[#EA7600]"
              />
              <span className="text-xs text-slate-600 leading-relaxed select-none">
                Declaro estar ciente de que as informações fornecidas destinam-se exclusivamente à gestão de inscrições, credenciamento presencial no local do evento (Interne Soluções em Saúde) e emissão do certificado oficial de 8 horas pela <strong>Escola de Saúde do Recife (ESR / SEGTES)</strong>, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
              </span>
            </label>
            {touched.termsAccepted && !termsAccepted && (
              <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1 ml-7">
                <AlertCircle className="w-3 h-3" />
                Você precisa aceitar os termos institucionais para efetivar sua inscrição presencial.
              </p>
            )}
          </div>

          {/* Submit Button in Vibrant Orange (#EA7600) */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#3498FE] shrink-0" />
              Inscrição 100% gratuita • Comprovante e QR Code imediatos
            </div>

            <button
              id="btn-confirmar-inscricao"
              type="submit"
              disabled={isSubmitting}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-black text-sm text-white shadow-lg transition-all transform active:scale-98 cursor-pointer ${
                isSubmitting
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-[#EA7600] hover:bg-[#D26500] shadow-[#EA7600]/30 hover:shadow-[#EA7600]/40'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Emitindo credencial presencial...</span>
                </>
              ) : (
                <>
                  <span>Concluir Inscrição no Fórum</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
