import React, { useState } from 'react';
import { Search, X, FileText, CheckCircle2, AlertCircle, Building2, User, Award, ArrowRight } from 'lucide-react';
import { WorkSubmissionData } from '../types';
import { formatCPF, isValidCPF } from '../utils/cpfValidator';
import { SUBMISSION_RULES } from '../data/forumInfo';

interface ConsultSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  submissions: WorkSubmissionData[];
  onSelectSubmission: (submission: WorkSubmissionData) => void;
  onOpenDashboard?: () => void;
}

export const ConsultSubmissionModal: React.FC<ConsultSubmissionModalProps> = ({
  isOpen,
  onClose,
  submissions,
  onSelectSubmission,
  onOpenDashboard
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const cleanTerm = searchTerm.trim().toUpperCase();
  const cleanDigits = searchTerm.replace(/\D/g, '');

  const filtered = submissions.filter((sub) => {
    // Check protocol
    if (sub.protocolNumber.toUpperCase().includes(cleanTerm)) return true;
    
    // Check main author CPF or name
    if (sub.mainAuthor.cpf.replace(/\D/g, '').includes(cleanDigits) && cleanDigits.length >= 3) return true;
    if (sub.mainAuthor.fullName.toUpperCase().includes(cleanTerm)) return true;

    // Check coauthors CPF or name
    return sub.coAuthors.some(co => 
      (co.cpf.replace(/\D/g, '').includes(cleanDigits) && cleanDigits.length >= 3) ||
      co.fullName.toUpperCase().includes(cleanTerm)
    );
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!searchTerm.trim()) {
      setErrorMsg('Informe o CPF ou o número do Protocolo de Inscrição.');
      return;
    }
    setHasSearched(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="bg-[#001B44] text-white p-5 flex items-center justify-between border-b border-[#0A2D6C]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EA7600] flex items-center justify-center text-white">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base font-display">
                Consultar Inscrição de Trabalhos
              </h3>
              <p className="text-xs text-sky-200">
                Oficina • I Fórum de Qualidade e Segurança do Paciente
              </p>
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

        {/* Modal Search Input */}
        <div className="p-5 sm:p-6 space-y-4">
          <form onSubmit={handleSearchSubmit} className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Digite seu CPF ou o Número de Protocolo
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ex: 000.000.000-00 ou SUB-NMSPR-2026-..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setErrorMsg(null);
                }}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3498FE]/20 focus:border-[#3498FE]"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#EA7600] hover:bg-[#D26500] text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Search className="w-3.5 h-3.5" />
                Buscar
              </button>
            </div>
            {errorMsg && (
              <p className="text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errorMsg}
              </p>
            )}
          </form>

          {/* Search Results */}
          {hasSearched && (
            <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">
                Resultados Encontrados ({filtered.length})
              </span>

              {filtered.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-600">
                  Nenhum trabalho inscrito encontrado para os dados informados. Verifique se o CPF ou protocolo está correto.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto">
                  {filtered.map((sub) => {
                    const isMain = sub.mainAuthor.cpf.replace(/\D/g, '') === cleanDigits;

                    return (
                      <div
                        key={sub.id}
                        onClick={() => {
                          onSelectSubmission(sub);
                          onClose();
                        }}
                        className="p-3.5 rounded-xl border border-slate-200 hover:border-[#EA7600] hover:bg-orange-50/20 transition cursor-pointer flex items-center justify-between gap-3 text-left group"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#001B44] text-white">
                              {sub.thematicAxis}
                            </span>
                            <span className="text-xs font-bold text-[#001B44] line-clamp-1 group-hover:text-[#EA7600]">
                              {sub.title}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-600">
                            Protocolo: <strong className="font-mono text-slate-800">{sub.protocolNumber}</strong>
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2">
                            <span>Autor Principal: {sub.mainAuthor.fullName}</span>
                            {isMain ? (
                              <span className="text-[10px] font-bold text-[#EA7600] bg-orange-100 px-1.5 rounded">Você é Autor Principal</span>
                            ) : (
                              <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-1.5 rounded">Você é Coautor</span>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-1 text-xs font-bold text-[#EA7600]">
                          <span>Abrir</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Quick info on limits & link to dashboard */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 leading-relaxed flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <strong>Lembrete de Limites (Item 7.6):</strong> Cada participante pode inscrever no máximo 2 trabalhos como autor/a principal e figurar em até 5 como coautor/a.
            </div>
            {onOpenDashboard && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDashboard();
                }}
                className="text-xs font-bold text-[#EA7600] hover:underline whitespace-nowrap cursor-pointer shrink-0"
              >
                Abrir Painel Geral de Trabalhos →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
