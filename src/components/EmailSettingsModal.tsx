import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  CheckCircle2, 
  AlertTriangle, 
  Send, 
  Server, 
  Key, 
  ShieldCheck, 
  HelpCircle, 
  ExternalLink,
  X,
  Globe,
  RefreshCw
} from 'lucide-react';

interface EmailSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EmailStatus {
  smtpConfigured: boolean;
  smtpUser: string | null;
  smtpHost: string | null;
  resendConfigured: boolean;
  resendSender: string;
  resendDomain?: string;
  resendCustomConfigured?: boolean;
  activeDeliveryMode: string;
  canSendToAnyEmailWithoutRestriction: boolean;
  notice?: string;
}

export const EmailSettingsModal: React.FC<EmailSettingsModalProps> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<EmailStatus | null>(null);
  const [activeTab, setActiveTab] = useState<'RESEND' | 'GMAIL'>('RESEND');
  const [loading, setLoading] = useState(false);
  const [savingSmtp, setSavingSmtp] = useState(false);
  const [savingResend, setSavingResend] = useState(false);
  const [testing, setTesting] = useState(false);

  // Form states - SMTP
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [fromName, setFromName] = useState('I Fórum de Qualidade e Segurança do Paciente');
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState('465');

  // Form states - Resend
  const [resendApiKey, setResendApiKey] = useState('');
  const [resendDomain, setResendDomain] = useState('');

  // Test states
  const [targetTestEmail, setTargetTestEmail] = useState('');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saveResult, setSaveResult] = useState<{ success: boolean; message: string } | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/email-config-status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
        if (data.smtpUser) {
          setSmtpUser(data.smtpUser);
        }
        if (data.resendDomain) {
          setResendDomain(data.resendDomain);
        }
      }
    } catch (err) {
      console.warn('Erro ao consultar status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      setTestResult(null);
      setSaveResult(null);
    }
  }, [isOpen]);

  const handleSaveSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smtpUser || !smtpPass) {
      setSaveResult({ success: false, message: 'Informe o e-mail de envio e a Senha de Aplicativo de 16 letras do Google.' });
      return;
    }

    setSavingSmtp(true);
    setSaveResult(null);

    try {
      const res = await fetch('/api/save-smtp-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: smtpUser.trim(),
          pass: smtpPass.trim(),
          fromName: fromName.trim(),
          host: smtpHost.trim() || 'smtp.gmail.com',
          port: Number(smtpPort) || 465
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSaveResult({ success: true, message: data.message });
        setSmtpPass('');
        await fetchStatus();
      } else {
        setSaveResult({ success: false, message: data.error || 'Falha ao salvar configuração SMTP.' });
      }
    } catch (err: any) {
      setSaveResult({ success: false, message: `Erro de rede: ${err.message}` });
    } finally {
      setSavingSmtp(false);
    }
  };

  const handleSaveResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendDomain && !resendApiKey) {
      setSaveResult({ success: false, message: 'Informe o novo domínio ou a nova chave do Resend.' });
      return;
    }

    setSavingResend(true);
    setSaveResult(null);

    try {
      const res = await fetch('/api/save-resend-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: resendDomain.trim(),
          apiKey: resendApiKey.trim() || undefined
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSaveResult({ success: true, message: data.message });
        setResendApiKey('');
        await fetchStatus();
      } else {
        setSaveResult({ success: false, message: data.error || 'Falha ao salvar configuração Resend.' });
      }
    } catch (err: any) {
      setSaveResult({ success: false, message: `Erro de rede: ${err.message}` });
    } finally {
      setSavingResend(false);
    }
  };

  const handleTestEmail = async () => {
    if (!targetTestEmail || !targetTestEmail.includes('@')) {
      setTestResult({ success: false, message: 'Digite um e-mail de destino válido para testar.' });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetEmail: targetTestEmail.trim() })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: `E-mail de teste enviado com sucesso via ${data.provider} para ${targetTestEmail}! (ID: ${data.messageId || 'OK'})`
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || data.message || 'Falha no disparo de teste.'
        });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: `Erro de rede: ${err.message}` });
    } finally {
      setTesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-[#001B44] text-white rounded-t-3xl relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EA7600] flex items-center justify-center text-white shadow-md">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#3498FE]">
                Painel Administrativo
              </span>
              <h3 className="text-xl font-black text-white font-display">
                Configuração de Envio de E-mails
              </h3>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Atual do Provedor */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-[#001B44] uppercase tracking-wider flex items-center gap-2">
                <Server className="w-4 h-4 text-[#EA7600]" />
                Status Atual do Sistema
              </h4>
              <button
                type="button"
                onClick={fetchStatus}
                disabled={loading}
                className="text-[11px] text-slate-500 hover:text-[#001B44] flex items-center gap-1 cursor-pointer font-semibold"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Modo de Envio Ativo</span>
                <span className="font-extrabold text-[#001B44] text-xs">
                  {status?.activeDeliveryMode || 'Verificando...'}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Domínio / Remetente</span>
                <span className="font-extrabold text-[#001B44] text-xs truncate block" title={status?.resendSender}>
                  {status?.resendSender || 'Não configurado'}
                </span>
              </div>
            </div>

            {/* Aviso explicativo */}
            {!status?.canSendToAnyEmailWithoutRestriction && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-950 space-y-1.5">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Por que os e-mails não chegam automaticamente para todos?</strong>
                    <p className="mt-0.5 text-amber-900 leading-relaxed text-[11px]">
                      O Resend bloqueia o envio externo para destinatários que não sejam o titular até que um <strong>novo domínio próprio</strong> seja validado em sua conta Resend via registros DNS, <strong>OU</strong> até que o envio direto via <strong>Gmail (SMTP)</strong> seja conectado abaixo.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {status?.canSendToAnyEmailWithoutRestriction && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Disparo Irrestrito Ativo!</strong>
                  <p className="mt-0.5 text-emerald-800 text-[11px]">
                    O servidor está enviando e-mails autenticados para qualquer destinatário (Gmail, Outlook, Yahoo, Hotmail, servidores institucionais, etc.).
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Abas de Configuração: Resend vs Gmail SMTP */}
          <div className="flex border-b border-slate-200 gap-2">
            <button
              type="button"
              onClick={() => { setActiveTab('RESEND'); setSaveResult(null); }}
              className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'RESEND'
                  ? 'border-[#EA7600] text-[#EA7600]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              Novo Domínio Resend
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('GMAIL'); setSaveResult(null); }}
              className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'GMAIL'
                  ? 'border-[#001B44] text-[#001B44]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              Gmail SMTP (Envio Direto)
            </button>
          </div>

          {/* ABA 1: NOVO DOMÍNIO RESEND */}
          {activeTab === 'RESEND' && (
            <form onSubmit={handleSaveResend} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#EA7600]" />
                <h4 className="text-sm font-extrabold text-[#001B44]">
                  Configurar Novo Domínio no Resend
                </h4>
              </div>

              <div className="text-[11px] bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 space-y-1.5">
                <strong className="block font-bold text-[#001B44] flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-[#EA7600]" />
                  Passo a passo no Resend:
                </strong>
                <ol className="list-decimal list-inside space-y-1 text-slate-600">
                  <li>Acesse <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer" className="underline font-bold text-[#001B44] inline-flex items-center gap-0.5">resend.com/domains <ExternalLink className="w-2.5 h-2.5" /></a> e clique em <strong>Add Domain</strong>.</li>
                  <li>Adicione seu novo domínio (ex: <code className="bg-white px-1 py-0.5 border rounded">meunovodominio.com.br</code> ou subdomínio).</li>
                  <li>Insira os registros DNS (DKIM TXT e SPF MX/TXT) no seu provedor de domínio (Registro.br, Cloudflare, etc.).</li>
                  <li>Gere uma nova API Key em <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline font-bold text-[#001B44] inline-flex items-center gap-0.5">resend.com/api-keys <ExternalLink className="w-2.5 h-2.5" /></a> e salve abaixo.</li>
                </ol>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Novo Domínio Validado:
                  </label>
                  <input
                    type="text"
                    value={resendDomain}
                    onChange={(e) => setResendDomain(e.target.value)}
                    placeholder="ex: seunovodominio.com.br"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#EA7600]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nova Resend API Key (opcional se mantiver a mesma):
                  </label>
                  <input
                    type="password"
                    value={resendApiKey}
                    onChange={(e) => setResendApiKey(e.target.value)}
                    placeholder="re_..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#EA7600]"
                  />
                </div>
              </div>

              {saveResult && (
                <div className={`p-3 rounded-xl text-xs ${
                  saveResult.success 
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-300' 
                    : 'bg-rose-50 text-rose-900 border border-rose-300'
                }`}>
                  {saveResult.message}
                </div>
              )}

              <button
                type="submit"
                disabled={savingResend}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#EA7600] hover:bg-[#D26500] disabled:bg-slate-400 text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                {savingResend ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Salvando Novo Domínio...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-white" />
                    Salvar e Ativar Novo Domínio Resend
                  </>
                )}
              </button>
            </form>
          )}

          {/* ABA 2: GMAIL SMTP */}
          {activeTab === 'GMAIL' && (
            <form onSubmit={handleSaveSmtp} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-[#001B44]" />
                <h4 className="text-sm font-extrabold text-[#001B44]">
                  Ativar Envio via Gmail SMTP (Não exige configurar DNS)
                </h4>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Esta é a alternativa mais rápida caso não queira esperar propagação de DNS. Conecte sua conta Google e os disparos saem diretamente pelos servidores do Gmail.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    E-mail do Remetente (Gmail):
                  </label>
                  <input
                    type="email"
                    value={smtpUser}
                    onChange={(e) => setSmtpUser(e.target.value)}
                    placeholder="ex: nsp.ggai@gmail.com ou seu@gmail.com"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#001B44]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Senha de Aplicativo Google (16 letras):
                  </label>
                  <input
                    type="password"
                    value={smtpPass}
                    onChange={(e) => setSmtpPass(e.target.value)}
                    placeholder="xxxx xxxx xxxx xxxx"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#001B44]"
                    required
                  />
                </div>
              </div>

              <div className="text-[11px] bg-sky-50 border border-sky-200 rounded-xl p-3 text-sky-900 space-y-1">
                <strong className="block font-bold flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-sky-600" />
                  Como gerar a Senha de Aplicativo no Google:
                </strong>
                <ol className="list-decimal list-inside space-y-0.5 text-sky-800">
                  <li>Acesse <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="underline font-bold text-sky-950 inline-flex items-center gap-0.5">myaccount.google.com/apppasswords <ExternalLink className="w-2.5 h-2.5" /></a>.</li>
                  <li>Dê o nome de "Fórum Recife" e clique em <strong>Criar</strong>.</li>
                  <li>Copie o código de 16 letras gerado e cole no campo acima.</li>
                </ol>
              </div>

              {saveResult && (
                <div className={`p-3 rounded-xl text-xs ${
                  saveResult.success 
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-300' 
                    : 'bg-rose-50 text-rose-900 border border-rose-300'
                }`}>
                  {saveResult.message}
                </div>
              )}

              <button
                type="submit"
                disabled={savingSmtp}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#001B44] hover:bg-[#0A2D6C] disabled:bg-slate-400 text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                {savingSmtp ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Testando Conexão com o Google...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-[#EA7600]" />
                    Salvar e Ativar Envio Gmail
                  </>
                )}
              </button>
            </form>
          )}

          {/* Seção de Teste de Disparo em Tempo Real */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
            <h4 className="text-sm font-extrabold text-[#001B44] flex items-center gap-2">
              <Send className="w-4 h-4 text-[#EA7600]" />
              Testar Envio para Qualquer Destinatário Agora
            </h4>
            <p className="text-xs text-slate-600">
              Digite qualquer endereço de e-mail (ex: <code className="bg-white px-1 border rounded">getulio.batista@ufpe.br</code>) para testar a entrega em tempo real:
            </p>

            <div className="flex flex-wrap gap-2">
              <input
                type="email"
                value={targetTestEmail}
                onChange={(e) => setTargetTestEmail(e.target.value)}
                placeholder="ex: getulio.batista@ufpe.br"
                className="flex-1 min-w-[240px] px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#EA7600] bg-white"
              />
              <button
                type="button"
                onClick={handleTestEmail}
                disabled={testing}
                className="px-5 py-2 bg-[#EA7600] hover:bg-[#D26500] disabled:bg-slate-400 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer shadow-xs"
              >
                {testing ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Enviando Teste...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Enviar Teste
                  </>
                )}
              </button>
            </div>

            {testResult && (
              <div className={`p-3 rounded-xl text-xs ${
                testResult.success
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                  : 'bg-amber-50 text-amber-950 border border-amber-300'
              }`}>
                {testResult.message}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 rounded-b-3xl border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition cursor-pointer"
          >
            Fechar Janela
          </button>
        </div>
      </div>
    </div>
  );
};
