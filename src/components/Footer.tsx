import React from 'react';
import { ShieldCheck, Mail, Phone, MapPin, ExternalLink, HelpCircle } from 'lucide-react';
import { FORUM_INFO } from '../data/forumInfo';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#001B44] text-slate-300 pt-12 pb-8 border-t border-[#0A2D6C] no-print mt-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-white/10 text-xs">
          {/* Col 1: Realização */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2 text-white">
              <div className="p-2 bg-[#EA7600] rounded-xl shadow-xs">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-black text-sm block tracking-tight text-white font-display">
                  {FORUM_INFO.title}
                </span>
                <span className="text-[11px] font-bold text-[#3498FE]">Edição Oficial 2026 • Modalidade Presencial</span>
              </div>
            </div>
            <p className="text-slate-300 leading-relaxed pr-4">
              Realização do <strong>Núcleo Municipal de Segurança do Paciente do Recife (NMSPR)</strong> / SERMAC / SEAB, em parceria com a <strong>Escola de Saúde do Recife (ESR / SEGTES)</strong> e a <strong>Secretaria de Saúde da Prefeitura da Cidade do Recife</strong>.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
              <span className="bg-white/10 text-white px-2.5 py-1 rounded-md border border-white/15 font-semibold">
                SUS Recife
              </span>
              <span className="bg-white/10 text-[#3498FE] px-2.5 py-1 rounded-md border border-white/15 font-semibold">
                NMSPR • SERMAC • SEAB
              </span>
              <span className="bg-white/10 text-[#EA7600] px-2.5 py-1 rounded-md border border-white/15 font-bold">
                ESR • SEGTES
              </span>
            </div>
          </div>

          {/* Col 2: Informações do Evento */}
          <div className="space-y-2.5">
            <h5 className="font-bold text-white uppercase tracking-wider text-[11px]">
              Informações do Evento
            </h5>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-center gap-2">
                <span className="text-[#EA7600]">•</span>
                <span>{FORUM_INFO.dates}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#EA7600]">•</span>
                <span>{FORUM_INFO.time}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#EA7600]">•</span>
                <span>Auditório da Interne (Boa Vista)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#EA7600]">•</span>
                <span>Certificado Oficial de 8 horas (ESR)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#EA7600]">•</span>
                <span>Inscrição Digital Gratuita</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Contatos e Ouvidoria */}
          <div className="space-y-2.5">
            <h5 className="font-bold text-white uppercase tracking-wider text-[11px]">
              Canais Oficiais de Comunicação
            </h5>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#3498FE] shrink-0" />
                <a
                  href="mailto:nsp.ggai@gmail.com"
                  className="hover:text-white hover:underline transition"
                >
                  nsp.ggai@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#3498FE] shrink-0" />
                <span>Ouvidoria SUS Recife: 0800 281 1520</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#3498FE] shrink-0" />
                <span>Local: Rua Marques Amorim, 356, Boa Vista</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-3">
          <div>
            © 2026 Secretaria de Saúde da Cidade do Recife • Todos os direitos reservados.
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-slate-400">Em conformidade com a LGPD (Lei nº 13.709/2018)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
