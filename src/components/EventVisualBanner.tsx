import React from 'react';
import { Calendar, MapPin, Award, CheckCircle2 } from 'lucide-react';
import { FORUM_INFO } from '../data/forumInfo';

interface EventVisualBannerProps {
  onOpenProgram?: () => void;
  onOpenConsult?: () => void;
  onOpenRules?: () => void;
  submissionCount?: number;
}

export const EventVisualBanner: React.FC<EventVisualBannerProps> = ({
  onOpenProgram,
  onOpenConsult,
  onOpenRules,
  submissionCount = 0,
}) => {
  return (
    <div className="w-full relative overflow-hidden rounded-2xl shadow-lg border border-slate-200/80 mb-6 bg-[#001b44]">
      {/* Background Graphic Replicating the Official Visual Identity */}
      <div className="relative w-full min-h-[220px] sm:min-h-[240px] md:min-h-[260px] flex items-center">
        {/* SVG Decorative Waves mirroring user's provided palette & geometry */}
        <svg
          className="absolute inset-0 w-full h-full preserve-3d pointer-events-none"
          viewBox="0 0 1000 300"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main Base Background is #001B44 */}
          <rect width="1000" height="300" fill="#001B44" />

          {/* Bottom-left Bright Sky Blue Curved Wave with White Border */}
          <path
            d="M -20,320 L -20,225 C 80,185 240,195 450,205 C 505,208 555,245 565,320 Z"
            fill="#FFFFFF"
          />
          <path
            d="M -20,320 L -20,235 C 75,198 235,206 445,215 C 495,217 540,250 550,320 Z"
            fill="#3498FE"
          />

          {/* Right Vibrant Safety Orange Wavy Section with White Wave Border */}
          <path
            d="M 605,-20 C 585,45 590,95 625,140 C 665,190 735,230 795,320 L 1020,320 L 1020,-20 Z"
            fill="#FFFFFF"
          />
          <path
            d="M 622,-20 C 603,45 608,93 642,137 C 682,187 750,227 810,320 L 1020,320 L 1020,-20 Z"
            fill="#EA7600"
          />
        </svg>

        {/* Floating Icons Medallions on the Orange Section (as in the official image) */}
        <div className="absolute right-6 sm:right-12 md:right-16 top-1/2 -translate-y-1/2 flex flex-col gap-4 sm:gap-6 z-10 pointer-events-none">
          {/* Top Medallion: Hands Clasping / Handshake */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white rounded-full shadow-md flex items-center justify-center p-3 border-2 border-white/60 transform hover:scale-105 transition">
            <svg
              viewBox="0 0 24 24"
              className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-[#EA7600]"
              fill="currentColor"
            >
              <path d="M19.5 9.5l-3.5 3.5-3-3a1 1 0 00-1.4 0l-4.5 4.5a1 1 0 000 1.4l1.4 1.4a1 1 0 001.4 0L13 14.1l3 3a1 1 0 001.4 0l4.2-4.2a1 1 0 000-1.4l-1.4-1.4a1 1 0 00-.7-.6z" />
              <path d="M4.5 14.5l3.5-3.5 3 3a1 1 0 001.4 0l4.5-4.5a1 1 0 000-1.4L15.5 6.7a1 1 0 00-1.4 0L11 9.9l-3-3a1 1 0 00-1.4 0L2.4 11.1a1 1 0 000 1.4l1.4 1.4c.2.4.5.6.7.6z" />
            </svg>
          </div>

          {/* Bottom Medallion: Cupped Hands Holding Healthcare Cross */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white rounded-full shadow-md flex items-center justify-center p-3 border-2 border-white/60 transform hover:scale-105 transition">
            <svg
              viewBox="0 0 24 24"
              className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-[#EA7600]"
              fill="currentColor"
            >
              <circle cx="12" cy="7" r="4.5" fill="#EA7600" />
              <path d="M11 4.5h2V6h1.5v2H13v1.5h-2V8H9.5V6H11V4.5z" fill="#FFFFFF" />
            </svg>
          </div>
        </div>

        {/* Content Over the Navy Section */}
        <div className="relative z-10 p-6 sm:p-8 md:p-10 max-w-xl md:max-w-2xl text-white">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-xs text-[#3498FE] border border-white/15 text-xs font-bold mb-2.5">
            <span className="w-2 h-2 rounded-full bg-[#EA7600] animate-ping" />
            <span>Item 7 do Edital • Inscrição e Submissão de Trabalhos</span>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight tracking-tight font-display mb-2 drop-shadow-xs">
            Oficina Temática do I Fórum de Qualidade e Segurança do Paciente
          </h2>

          <p className="text-xs sm:text-sm text-sky-100 font-medium mb-4 leading-relaxed max-w-lg">
            Submissão de <strong>Relatos de Experiência</strong> e <strong>Produções Artísticas</strong> desenvolvidos na Rede SUS Recife entre 2023 e 2026. 12 vagas por eixo (36 apresentações no total).
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs text-sky-100 font-semibold mb-5">
            <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-white/10">
              <Calendar className="w-3.5 h-3.5 text-[#EA7600]" />
              <span>30 de Setembro de 2026</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-white/10">
              <MapPin className="w-3.5 h-3.5 text-[#3498FE]" />
              <span>{FORUM_INFO.locationVenue}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-white/10">
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span>Até 8 Autores por Trabalho</span>
            </div>
          </div>

          {/* Banner Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5 no-print">
            {onOpenRules && (
              <button
                type="button"
                onClick={onOpenRules}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#EA7600] hover:bg-[#D26500] text-white text-xs font-bold shadow-md transition cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Normas de Submissão (Item 7)
              </button>
            )}
            {onOpenProgram && (
              <button
                type="button"
                onClick={onOpenProgram}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/30 text-xs font-bold backdrop-blur-xs transition cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-[#3498FE]" />
                Programação da Oficina
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
