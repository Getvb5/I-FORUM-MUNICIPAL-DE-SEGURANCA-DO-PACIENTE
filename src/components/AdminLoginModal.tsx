import React, { useState } from 'react';
import { 
  Lock, 
  X, 
  ShieldCheck, 
  KeyRound, 
  Mail, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  Building2, 
  HelpCircle 
} from 'lucide-react';
import { loginAdmin, DEMO_ACCOUNTS } from '../utils/authService';
import { AdminUser } from '../types';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AdminUser) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Por favor, preencha o e-mail institucional e a senha.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const res = loginAdmin(email, password);
      setIsLoading(false);

      if (res.success && res.user) {
        onLoginSuccess(res.user);
        onClose();
      } else {
        setErrorMsg(res.error || 'Credenciais inválidas.');
      }
    }, 300);
  };

  const handleSelectDemoAccount = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="bg-[#001B44] text-white p-5 flex items-center justify-between border-b border-[#0A2D6C]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EA7600] flex items-center justify-center text-white shadow-xs">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/10 px-1.5 py-0.2 rounded text-sky-200">
                  Acesso Restrito
                </span>
                <span className="text-[10px] font-bold text-amber-300">LGPD</span>
              </div>
              <h3 className="font-extrabold text-white text-base font-display">
                Área da Comissão & Avaliadores
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Notice */}
        <div className="bg-amber-50/80 border-b border-amber-200/80 p-3.5 px-5 text-xs text-amber-900 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#EA7600] shrink-0 mt-0.5" />
          <p className="leading-snug">
            As informações de submissões (dados dos autores, CPFs, contatos e textos dos trabalhos) são de acesso exclusivo da <strong>Comissão Organizadora e Científica</strong>.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                E-mail Institucional
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMsg(null);
                  }}
                  placeholder="exemplo@recife.pe.gov.br"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3498FE]/20 focus:border-[#3498FE]"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Senha de Acesso
                </label>
                <span className="text-[11px] text-slate-400">Perfil autorizado</span>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMsg(null);
                  }}
                  placeholder="Digite sua senha"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3498FE]/20 focus:border-[#3498FE]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#001B44] hover:bg-[#0A2D6C] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Lock className="w-3.5 h-3.5 text-[#EA7600]" />
              {isLoading ? 'Autenticando...' : 'Entrar no Painel de Submissões'}
            </button>
          </form>

          {/* Quick Demo Profiles Box */}
          <div className="pt-4 border-t border-slate-200 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Building2 className="w-3.5 h-3.5 text-[#3498FE]" />
              <span>Contas com Acesso Autorizado (Clique para preencher):</span>
            </div>

            <div className="space-y-1.5">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleSelectDemoAccount(acc.email, acc.passwordHash)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-[#EA7600] hover:bg-orange-50/20 text-left transition cursor-pointer flex items-center justify-between group"
                >
                  <div>
                    <div className="text-xs font-bold text-[#001B44] group-hover:text-[#EA7600]">
                      {acc.user.name} ({acc.user.roleTitle})
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {acc.email} • Senha: <span className="font-mono font-bold text-slate-700">{acc.passwordHash}</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-[#3498FE] group-hover:text-[#EA7600] group-hover:underline">
                    Selecionar
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
