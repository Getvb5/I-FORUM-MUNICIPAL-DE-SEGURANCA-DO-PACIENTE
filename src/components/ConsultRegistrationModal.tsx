import React, { useState } from 'react';
import { Search, X, AlertCircle, CreditCard, CheckCircle2 } from 'lucide-react';
import { RegistrationData } from '../types';
import { cleanCPF, formatCPF } from '../utils/cpfValidator';

interface ConsultRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  registrations: RegistrationData[];
  onSelectRegistration: (reg: RegistrationData) => void;
}

export const ConsultRegistrationModal: React.FC<ConsultRegistrationModalProps> = ({
  isOpen,
  onClose,
  registrations,
  onSelectRegistration,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const termDigits = cleanCPF(searchTerm);
    const trimmed = searchTerm.trim().toLowerCase();

    if (!trimmed) {
      setErrorMessage('Digite o número do seu CPF ou o protocolo de inscrição.');
      return;
    }

    const found = registrations.find((r) => {
      const regCpfDigits = cleanCPF(r.cpf);
      return (
        (termDigits.length > 5 && regCpfDigits.includes(termDigits)) ||
        r.protocolNumber.toLowerCase().includes(trimmed) ||
        r.email.toLowerCase() === trimmed
      );
    });

    if (found) {
      onSelectRegistration(found);
      onClose();
    } else {
      setErrorMessage(
        'Nenhuma inscrição encontrada com os dados informados neste dispositivo. Verifique se o CPF foi digitado corretamente ou realize uma nova inscrição.'
      );
    }
  };

  const handleCpfInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^[\d.-]+$/.test(val) || val === '') {
      setSearchTerm(formatCPF(val));
    } else {
      setSearchTerm(val);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header in Deep Navy #001B44 */}
        <div className="bg-[#001B44] text-white px-6 py-4 flex items-center justify-between border-b border-[#0A2D6C]">
          <div className="flex items-center gap-2.5">
            <Search className="w-5 h-5 text-[#EA7600]" />
            <h3 className="font-bold text-base font-display">Consultar Inscrição</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <p className="text-xs text-slate-600 mb-4">
            Já se inscreveu para o <strong>I Fórum Municipal de Qualidade e Segurança do Paciente</strong>? Digite seu CPF para consultar seus dados e recuperar seu comprovante digital com QR Code.
          </p>

          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label htmlFor="search-cpf" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                CPF ou Protocolo da Inscrição
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <CreditCard className="w-4 h-4" />
                </div>
                <input
                  id="search-cpf"
                  type="text"
                  placeholder="000.000.000-00 ou SESAU-REC-..."
                  value={searchTerm}
                  onChange={handleCpfInput}
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3498FE]/20 focus:border-[#3498FE] font-mono"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#EA7600] hover:bg-[#D26500] text-white text-xs font-bold shadow-md transition cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                Localizar Comprovante
              </button>
            </div>
          </form>

          {/* Quick list of locally registered participants on this machine if any */}
          {registrations.length > 0 && (
            <div className="mt-6 pt-5 border-t border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Inscrições recentes neste navegador:
              </span>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {registrations.map((reg) => (
                  <button
                    key={reg.id}
                    type="button"
                    onClick={() => {
                      onSelectRegistration(reg);
                      onClose();
                    }}
                    className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-[#EA7600]/40 hover:bg-[#FFF5E6]/40 transition flex items-center justify-between text-xs cursor-pointer group"
                  >
                    <div>
                      <span className="font-bold text-slate-800 block group-hover:text-[#001B44]">
                        {reg.fullName}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono block">
                        CPF: {reg.cpf} • {reg.protocolNumber}
                      </span>
                      {reg.cnesUnit && (
                        <span className="text-[10px] font-semibold text-[#EA7600] block truncate max-w-xs">
                          {reg.cnesUnit}
                        </span>
                      )}
                    </div>
                    <span className="text-[#EA7600] font-bold text-xs flex items-center gap-1">
                      Visualizar
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
