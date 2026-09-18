import React from 'react';
import { Award } from 'lucide-react';
import { FORUM_INFO } from '../data/forumInfo';
import { AdminUser } from '../types';

interface HeaderProps {
  onOpenConsult?: () => void;
  onOpenProgram?: () => void;
  onOpenRules?: () => void;
  onOpenDashboard?: () => void;
  onOpenLogin?: () => void;
  onLogout?: () => void;
  currentAdmin?: AdminUser | null;
  submissionCount?: number;
  activeView?: 'FORM' | 'DASHBOARD';
}

export const Header: React.FC<HeaderProps> = () => {
  return (
    <header className="w-full bg-[#001B44] border-b border-[#0A2D6C] shadow-xs sticky top-0 z-30">
      {/* Top Institutional Bar in Deep Navy (#001B44) */}
      <div className="text-white text-xs py-2.5 px-4">
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
              Inscrição de Trabalhos Aberta
            </span>
            <span className="hidden md:inline text-white/30">|</span>
            <span className="hidden md:flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-[#EA7600]" />
              Certificado 8h • ESR / SEGTES
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};


