import React, { useState } from 'react';
import { MapPin, Copy, Check, ExternalLink } from 'lucide-react';
import { FORUM_INFO } from '../data/forumInfo';

interface LocationActionButtonsProps {
  variant?: 'banner' | 'card' | 'compact' | 'minimal';
  className?: string;
  showVenueName?: boolean;
}

export const LocationActionButtons: React.FC<LocationActionButtonsProps> = ({
  variant = 'card',
  className = '',
  showVenueName = false,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(FORUM_INFO.location);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = FORUM_INFO.location;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Erro ao copiar endereço:', err);
    }
  };

  if (variant === 'banner') {
    return (
      <div className={`flex items-center gap-1.5 bg-white text-[#001B44] px-2.5 sm:px-3 py-1.5 rounded-lg font-bold shadow-xs shrink-0 whitespace-nowrap ${className}`}>
        <a
          href={FORUM_INFO.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Abrir localização no Google Maps"
          className="flex items-center gap-1.5 hover:text-[#EA7600] transition cursor-pointer"
        >
          <MapPin className="w-3.5 h-3.5 text-[#EA7600] shrink-0" />
          <span>{FORUM_INFO.locationVenue}</span>
          <ExternalLink className="w-3 h-3 text-slate-400 hover:text-[#EA7600]" />
        </a>

        <span className="text-slate-300 font-light mx-0.5">|</span>

        <button
          type="button"
          onClick={handleCopy}
          title="Copiar endereço completo"
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-[#001B44] bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded transition cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-600" />
              <span className="text-emerald-700 font-bold">Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 text-slate-500" />
              <span className="hidden sm:inline">Copiar</span>
            </>
          )}
        </button>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <a
          href={FORUM_INFO.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-bold text-[#3498FE] hover:text-[#1e40af] bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-lg border border-sky-200 transition"
        >
          <ExternalLink className="w-3 h-3" />
          <span>Google Maps</span>
        </a>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-[#001B44] bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg border border-slate-300 transition cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-600" />
              <span className="text-emerald-700">Endereço Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 text-slate-500" />
              <span>Copiar Endereço</span>
            </>
          )}
        </button>
      </div>
    );
  }

  // Card Variant
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-[#F0F7FF] rounded-xl border border-[#3498FE]/30 text-xs ${className}`}>
      <div className="flex items-start gap-2.5">
        <div className="p-1.5 rounded-lg bg-white border border-[#3498FE]/20 text-[#EA7600] shadow-xs shrink-0 mt-0.5">
          <MapPin className="w-4 h-4" />
        </div>
        <div>
          <span className="font-extrabold text-[#001B44] block text-xs sm:text-sm">
            {FORUM_INFO.locationVenue}
          </span>
          <span className="text-slate-600 block mt-0.5">
            {FORUM_INFO.locationAddress}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
        <a
          href={FORUM_INFO.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#001B44] hover:bg-[#002b66] px-3 py-1.5 rounded-lg shadow-xs transition"
        >
          <span>Ver no Google Maps</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#001B44] hover:bg-white bg-white/80 border border-slate-300 px-3 py-1.5 rounded-lg shadow-xs transition cursor-pointer"
          title="Copiar endereço completo para a área de transferência"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-extrabold">Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-600" />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
