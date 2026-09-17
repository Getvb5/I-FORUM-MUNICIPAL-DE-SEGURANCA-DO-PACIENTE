import React from 'react';
import { Calendar, MapPin } from 'lucide-react';
import { FORUM_INFO } from '../data/forumInfo';

interface EventVisualBannerProps {
  onOpenProgram?: () => void;
  onOpenConsult?: () => void;
  onOpenRules?: () => void;
  onOpenDashboard?: () => void;
  submissionCount?: number;
  isAdminLoggedIn?: boolean;
}

export const EventVisualBanner: React.FC<EventVisualBannerProps> = ({
  onOpenProgram,
}) => {
  return (
    <div className="w-full relative overflow-hidden rounded-2xl shadow-lg border border-slate-200/80 mb-6 bg-[#001B44]">
      {/* 1. ESPAÇO AZUL ESCURO (#001B44) - Contém o Título e a Arte Oficial */}
      <div className="relative w-full min-h-[135px] sm:min-h-[155px] md:min-h-[170px] flex items-center overflow-hidden bg-[#001B44]">
        {/* SVG Decorative Waves on the right */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 1000 200"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Base Navy */}
          <rect width="1000" height="200" fill="#001B44" />

          {/* Right Vibrant Orange Section with White Wave Border */}
          <path
            d="M 680,-20 C 650,35 655,75 690,110 C 730,150 790,175 850,220 L 1020,220 L 1020,-20 Z"
            fill="#FFFFFF"
          />
          <path
            d="M 698,-20 C 668,35 673,73 707,107 C 747,147 805,172 865,220 L 1020,220 L 1020,-20 Z"
            fill="#EA7600"
          />
        </svg>

        {/* Floating Icons Medallions on the Orange Section */}
        <div className="absolute right-4 sm:right-8 md:right-12 top-1/2 -translate-y-1/2 flex flex-col gap-2.5 sm:gap-3.5 z-10 pointer-events-none">
          {/* Top Medallion: Hands Clasping / Handshake */}
          <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white rounded-full shadow-md flex items-center justify-center p-2 border-2 border-white/60">
            <svg
              viewBox="0 0 24 24"
              className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-[#EA7600]"
              fill="currentColor"
            >
              <path d="M19.5 9.5l-3.5 3.5-3-3a1 1 0 00-1.4 0l-4.5 4.5a1 1 0 000 1.4l1.4 1.4a1 1 0 001.4 0L13 14.1l3 3a1 1 0 001.4 0l4.2-4.2a1 1 0 000-1.4l-1.4-1.4a1 1 0 00-.7-.6z" />
              <path d="M4.5 14.5l3.5-3.5 3 3a1 1 0 001.4 0l4.5-4.5a1 1 0 000-1.4L15.5 6.7a1 1 0 00-1.4 0L11 9.9l-3-3a1 1 0 00-1.4 0L2.4 11.1a1 1 0 000 1.4l1.4 1.4c.2.4.5.6.7.6z" />
            </svg>
          </div>

          {/* Bottom Medallion: Cupped Hands Holding Healthcare Cross */}
          <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white rounded-full shadow-md flex items-center justify-center p-2 border-2 border-white/60">
            <svg
              viewBox="0 0 24 24"
              className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-[#EA7600]"
              fill="currentColor"
            >
              <circle cx="12" cy="7" r="4.5" fill="#EA7600" />
              <path d="M11 4.5h2V6h1.5v2H13v1.5h-2V8H9.5V6H11V4.5z" fill="#FFFFFF" />
            </svg>
          </div>
        </div>

        {/* Título Institucional no Espaço Azul Escuro */}
        <div className="relative z-10 px-5 py-5 sm:px-8 sm:py-6 max-w-[calc(100%-110px)] sm:max-w-xl md:max-w-2xl text-white">
          <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-black text-white leading-snug tracking-tight font-display drop-shadow-xs uppercase">
            I FÓRUM MUNICIPAL DE QUALIDADE E SEGURANÇA DO PACIENTE DA SECRETARIA DE SAÚDE DO RECIFE
          </h2>
        </div>
      </div>

      {/* 2. ESPAÇO AZUL CLARO (#3498FE) - Faixa dedicada com Data, Local e Programação lado a lado */}
      <div className="w-full bg-[#3498FE] border-t-2 border-white/30 px-4 sm:px-8 py-2.5 sm:py-3">
        <div className="flex flex-row items-center gap-2 sm:gap-3 flex-nowrap overflow-x-auto text-xs">
          {/* Data */}
          <div className="flex items-center gap-1.5 bg-white text-[#001B44] px-3 py-1.5 rounded-lg font-bold shadow-xs shrink-0 whitespace-nowrap">
            <Calendar className="w-3.5 h-3.5 text-[#EA7600] shrink-0" />
            <span>{FORUM_INFO.dates}</span>
          </div>

          {/* Local */}
          <div className="flex items-center gap-1.5 bg-white text-[#001B44] px-3 py-1.5 rounded-lg font-bold shadow-xs shrink-0 whitespace-nowrap">
            <MapPin className="w-3.5 h-3.5 text-[#001B44] shrink-0" />
            <span>{FORUM_INFO.locationVenue}</span>
          </div>

          {/* Programação */}
          {onOpenProgram && (
            <button
              type="button"
              onClick={onOpenProgram}
              className="flex items-center gap-1.5 bg-[#001B44] hover:bg-[#002b66] text-white px-3.5 py-1.5 rounded-lg font-bold shadow-xs shrink-0 whitespace-nowrap transition cursor-pointer group"
            >
              <Calendar className="w-3.5 h-3.5 text-[#3498FE] group-hover:text-amber-300 transition shrink-0" />
              <span>Programação</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
