import React, { useState } from 'react';
import { X, Calendar, Clock, Video, Award, Users, MapPin, ExternalLink, Copy, Check } from 'lucide-react';
import { FORUM_INFO, FORUM_PROGRAM } from '../data/forumInfo';

interface ProgramacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProgramacaoModal: React.FC<ProgramacaoModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(FORUM_INFO.location);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header in Deep Navy #001B44 */}
        <div className="bg-[#001B44] text-white p-6 shrink-0 flex items-start justify-between border-b border-[#0A2D6C]">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-[#3498FE] border border-white/15 mb-2">
              <Calendar className="w-3.5 h-3.5 text-[#EA7600]" />
              {FORUM_INFO.dates} • {FORUM_INFO.time}
            </div>
            <h3 className="text-xl font-black text-white font-display">
              Programação Oficial do Fórum
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              {FORUM_INFO.fullTitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Schedule List */}
        <div className="p-6 overflow-y-auto space-y-4 text-slate-800">
          <div className="bg-[#EBF5FF] border border-[#3498FE]/30 rounded-xl p-3.5 text-xs text-[#001B44] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#EA7600] shrink-0" />
              <div>
                <span className="font-bold block sm:inline">Presencial: </span>
                <span>{FORUM_INFO.locationVenue} (Rua Marquês Amorim, 356)</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
              <a
                href={FORUM_INFO.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#3498FE] hover:text-[#1e40af] bg-white px-2 py-1 rounded border border-[#3498FE]/30 transition"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Maps</span>
              </a>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-[#001B44] bg-white px-2 py-1 rounded border border-slate-300 transition cursor-pointer"
              >
                {copied ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                    <Check className="w-3 h-3 text-emerald-600" /> Copiado
                  </span>
                ) : (
                  <span className="flex items-center gap-0.5">
                    <Copy className="w-3 h-3 text-slate-500" /> Copiar
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {FORUM_PROGRAM.map((item, idx) => (
              <div key={idx} className="py-3.5 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold font-mono text-[#001B44] bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#EA7600]" />
                    {item.time}
                  </span>
                  <span className="text-[11px] font-bold text-[#EA7600] uppercase tracking-wider">
                    {item.category}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                  {item.title}
                </h4>
                {item.speaker && (
                  <div className="text-xs text-slate-700 mt-2 p-2.5 rounded-lg bg-sky-50/80 border border-[#3498FE]/30 flex items-start gap-2">
                    <Users className="w-4 h-4 text-[#3498FE] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#001B44]">PALESTRANTE: {item.speaker}</span>
                      {item.role && (
                        <p className="text-slate-600 text-xs mt-0.5 leading-relaxed">
                          {item.role}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[#001B44]">
              <Award className="w-4 h-4 text-[#EA7600]" />
              Critérios para Certificação Oficial
            </div>
            <p>
              O certificado oficial de <strong>8 (oito) horas</strong> será emitido pela <strong>Escola de Saúde do Recife (ESR / SEGTES)</strong> para participantes com credenciamento presencial e frequência confirmada no evento.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#001B44] hover:bg-[#002B66] text-white text-xs font-bold transition cursor-pointer"
          >
            Fechar Programação
          </button>
        </div>
      </div>
    </div>
  );
};
