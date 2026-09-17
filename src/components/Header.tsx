import React from 'react';
import { ShieldCheck, Search, Calendar, Award, FileText } from 'lucide-react';
import { FORUM_INFO } from '../data/forumInfo';

interface HeaderProps {
  onOpenConsult: () => void;
  onOpenProgram: () => void;
  onOpenRules: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenConsult, onOpenProgram, onOpenRules }) => {
  return (
    <header className="w-full bg-white border-b border-slate-200 shadow-xs sticky top-0 z-30">
      {/* Top Institutional Bar in Deep Navy (#001B44) */}
      <div className="bg-[#001B44] text-white text-xs py-2 px-4 border-b border-[#0A2D6C]">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-3">
            <span className="font-extrabold tracking-wider uppercase text-[10px] bg-[#EA7600] text-white px-2 py-0.5 rounded shadow-xs">
              SUS • RECIFE
            </span>
            <span className="hidden sm:inline text-sky-200 text-xs font-medium">
              Prefeitura do Recife • Secretaria de Saúde • {FORUM_INFO.organizerShort}
            </span>
          </div>
          <div className="flex items-center space-x-4 text-[11px] text-sky-200 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#EA7600] animate-pulse"></span>
              Submissão de Trabalhos Aberta • 12 Vagas por Eixo
            </span>
            <span className="hidden md:inline text-white/30">|</span>
            <span className="hidden md:flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-[#EA7600]" />
              Certificado 8h • ESR / SEGTES
            </span>
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-6xl mx-auto px-4 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 text-left w-full md:w-auto">
          {/* Logo with Navy and Orange Branding */}
          <div className="w-12 h-12 rounded-2xl bg-[#001B44] border-2 border-[#EA7600] flex items-center justify-center text-white shadow-md shadow-slate-900/10 shrink-0 relative overflow-hidden">
            <ShieldCheck className="w-7 h-7 text-[#3498FE]" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#EA7600] rounded-full border border-white"></div>
          </div>
          <div>
            <h1 className="text-base md:text-lg font-black text-[#001B44] leading-tight font-display">
              {FORUM_INFO.title}
            </h1>
            <p className="text-xs text-slate-600 font-medium">
              Realização: <span className="text-slate-800 font-semibold">{FORUM_INFO.organizerShort}</span> • Parceria: <span className="text-slate-800 font-semibold">{FORUM_INFO.partnershipShort}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons styled with the Palette */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end no-print">
          <button
            type="button"
            onClick={onOpenRules}
            id="btn-ver-normas"
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border border-slate-300 text-[#001B44] bg-white hover:bg-slate-50 hover:border-[#EA7600] transition cursor-pointer shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-[#EA7600]" />
            Normas (Item 7)
          </button>

          <button
            type="button"
            onClick={onOpenProgram}
            id="btn-ver-programacao"
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border border-slate-300 text-[#001B44] bg-white hover:bg-slate-50 hover:border-[#3498FE] transition cursor-pointer shadow-2xs"
          >
            <Calendar className="w-3.5 h-3.5 text-[#3498FE]" />
            Programação
          </button>

          <button
            type="button"
            onClick={onOpenConsult}
            id="btn-consultar-submissao"
            className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-[#EA7600] hover:bg-[#D26500] text-white shadow-xs transition cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-white" />
            Consultar Submissão
          </button>
        </div>
      </div>
    </header>
  );
};


