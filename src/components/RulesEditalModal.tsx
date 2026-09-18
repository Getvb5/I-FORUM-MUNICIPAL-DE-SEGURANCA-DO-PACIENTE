import React from 'react';
import { X, FileText, CheckCircle2, AlertTriangle, Users, Calendar, Award, Palette, BookOpen, Presentation, ExternalLink } from 'lucide-react';
import { THEMATIC_AXES, SUBMISSION_RULES, FORUM_INFO } from '../data/forumInfo';

interface RulesEditalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesEditalModal: React.FC<RulesEditalModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="bg-[#001B44] text-white p-5 sm:p-6 flex items-start justify-between gap-4 border-b border-[#0A2D6C]">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EA7600] flex items-center justify-center text-white shrink-0 mt-0.5">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/20 text-white px-2 py-0.5 rounded">
                  Item 7 do Edital • Oficinas
                </span>
                <span className="text-[11px] text-sky-200">SUS Recife • 2026</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white leading-tight font-display">
                Normas e Regras de Inscrição de Trabalhos
              </h3>
              <p className="text-xs text-sky-200 mt-1">
                {FORUM_INFO.fullTitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 text-sm text-slate-700 leading-relaxed">
          {/* Section 7 - Regras Gerais */}
          <div>
            <h4 className="text-base font-extrabold text-[#001B44] mb-3 pb-2 border-b border-slate-200 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#EA7600] text-white text-xs flex items-center justify-center font-bold">7</span>
              7. Inscrição de Trabalhos na Oficina
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 7.1 Elegibilidade */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-xs font-bold text-[#001B44] uppercase tracking-wider block mb-1">
                  7.1 Elegibilidade
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Poderão inscrever trabalhos: <strong>trabalhadores/as da assistência e da gestão em saúde</strong>, <strong>profissionais residentes</strong> e <strong>estudantes de graduação na área da saúde</strong>, atuantes na Rede SUS Recife, em especial os Núcleos de Segurança do Paciente (NSP).
                </p>
                <div className="mt-2.5 p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#EA7600] shrink-0 mt-0.5" />
                  <span>
                    <strong>Atenção:</strong> Residentes e estudantes participam como autores/as ou coautores/as, <em>desde que o trabalho tenha ao menos um/a profissional ou gestor/a vinculado/a à Rede de Saúde do Recife</em>.
                  </span>
                </div>
              </div>

              {/* 7.2 Período e Âmbito */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-xs font-bold text-[#001B44] uppercase tracking-wider block mb-1">
                  7.2 Período e Âmbito
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Os trabalhos deverão ter sido desenvolvidos entre <strong>2025 e 2026</strong>, no âmbito da Rede SUS Recife (Atenção Primária, Média e Alta Complexidade, serviços ambulatoriais e hospitalares, e Gestão em Saúde).
                </p>
                <div className="mt-2.5 flex items-center gap-2 text-xs font-semibold text-[#001B44] bg-white p-2 rounded-lg border border-slate-200">
                  <Calendar className="w-4 h-4 text-[#3498FE]" />
                  <span>Jan/2025 a Set/2026 • Rede SUS Recife</span>
                </div>
              </div>

              {/* 7.3 Modalidades */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-xs font-bold text-[#001B44] uppercase tracking-wider block mb-1">
                  7.3 Modalidades
                </span>
                <p className="text-xs text-slate-600 mb-2">
                  Há duas modalidades de apresentação:
                </p>
                <ul className="text-xs space-y-1 text-slate-700">
                  <li className="flex items-center gap-1.5 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#EA7600]" />
                    <span>Relatos de Experiência (apresentação oral com slides em modelo oficial)</span>
                  </li>
                  <li className="flex items-center gap-1.5 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#3498FE]" />
                    <span>Produções Artísticas (fotografia, texto, cordel, poesia, áudio e vídeo por link)</span>
                  </li>
                </ul>
              </div>

              {/* 7.4 Vagas e Ordem */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-xs font-bold text-[#001B44] uppercase tracking-wider block mb-1">
                  7.4 Vagas (Total 30 Apresentações)
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Cada eixo oferecerá <strong>10 (dez) vagas para apresentação</strong>, distribuídas rigorosamente por <strong>ordem de inscrição/submissão</strong>, totalizando 30 apresentações. As vagas contemplam ambas as modalidades dentro do eixo escolhido.
                </p>
              </div>

              {/* 7.6 Limites de Autoria */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 md:col-span-2">
                <span className="text-xs font-bold text-[#001B44] uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#EA7600]" />
                  7.6 Limites de Participação e Autoria
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                    <span className="text-lg font-black text-[#001B44] block">Até 8</span>
                    <span className="text-slate-600 font-medium">Autores/as por trabalho (1 principal + até 7 coautores)</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                    <span className="text-lg font-black text-[#EA7600] block">Máx 2</span>
                    <span className="text-slate-600 font-medium">Trabalhos como autor/a principal por participante</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                    <span className="text-lg font-black text-[#3498FE] block">Até 5</span>
                    <span className="text-slate-600 font-medium">Trabalhos como coautor/a por participante</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Os 3 Eixos Temáticos */}
          <div>
            <h4 className="text-base font-extrabold text-[#001B44] mb-3 pb-2 border-b border-slate-200 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#3498FE]" />
              Eixos Temáticos (10 vagas em cada eixo)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {THEMATIC_AXES.map((axis) => (
                <div key={axis.id} className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#EA7600] block mb-1">
                    Eixo {axis.number} • 10 Vagas
                  </span>
                  <h5 className="font-bold text-[#001B44] text-xs leading-snug mb-1.5">
                    {axis.title}
                  </h5>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {axis.id === 'EIXO_2' ? (
                      <>
                        Continuidade e integração do cuidado entre níveis e pontos de atenção, e segurança no manejo de condições crônicas, com especial interesse no{' '}
                        <mark className="bg-amber-100/90 text-amber-950 font-bold px-1 py-0.5 rounded border border-amber-300 not-italic">
                          cuidado seguro às pessoas com DCNT (Campanha OMS 2026)
                        </mark>
                        , além de comunicação efetiva, escuta ativa e participação do paciente e da família.
                      </>
                    ) : (
                      axis.description
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ANEXO A - Roteiro para Relatos de Experiência */}
          <div className="p-4 sm:p-5 rounded-2xl bg-sky-50/50 border border-sky-200/80">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-[#001B44]" />
              <h4 className="text-sm font-extrabold text-[#001B44] uppercase tracking-wider">
                ANEXO A – Roteiro para Relatos de Experiência (Apresentação Oral)
              </h4>
            </div>
            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              O relato deve ser objetivo e <strong>não ultrapassar 1.000 palavras no total</strong>. A apresentação oral terá tempo dedicado na programação das oficinas.
            </p>

            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#001B44] text-white">
                  <tr>
                    <th className="px-3.5 py-2.5 font-bold uppercase tracking-wider text-[11px] w-1/3">Campo do Relato</th>
                    <th className="px-3.5 py-2.5 font-bold uppercase tracking-wider text-[11px]">Orientação e Limite de Palavras</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="px-3.5 py-2 font-bold text-slate-800">Título da experiência</td>
                    <td className="px-3.5 py-2 text-slate-600">Até 15 palavras.</td>
                  </tr>
                  <tr>
                    <td className="px-3.5 py-2 font-bold text-slate-800">O que foi realizado e por quê?</td>
                    <td className="px-3.5 py-2 text-slate-600">Até 200 palavras.</td>
                  </tr>
                  <tr>
                    <td className="px-3.5 py-2 font-bold text-slate-800">Como foi desenvolvida a experiência?</td>
                    <td className="px-3.5 py-2 text-slate-600">Até 300 palavras.</td>
                  </tr>
                  <tr>
                    <td className="px-3.5 py-2 font-bold text-slate-800">O que você e a sua equipe aprenderam com essa experiência?</td>
                    <td className="px-3.5 py-2 text-slate-600">Até 200 palavras.</td>
                  </tr>
                  <tr>
                    <td className="px-3.5 py-2 font-bold text-slate-800">Que desafios foram encontrados para o seu desenvolvimento?</td>
                    <td className="px-3.5 py-2 text-slate-600">Até 100 palavras.</td>
                  </tr>
                  <tr>
                    <td className="px-3.5 py-2 font-bold text-slate-800">O que você mais gostou e o que não gostou da experiência desenvolvida?</td>
                    <td className="px-3.5 py-2 text-slate-600">Até 100 palavras.</td>
                  </tr>
                  <tr>
                    <td className="px-3.5 py-2 font-bold text-slate-800">Pensando no que você descreveu sobre a sua experiência, o que mais ainda pode ser feito?</td>
                    <td className="px-3.5 py-2 text-slate-600">Até 100 palavras.</td>
                  </tr>
                  <tr className="bg-slate-50 font-bold">
                    <td className="px-3.5 py-2.5 text-[#001B44]">TOTAL DO RELATO</td>
                    <td className="px-3.5 py-2.5 text-[#EA7600]">Até 1.000 palavras no total.</td>
                  </tr>
                  <tr className="bg-amber-50/50">
                    <td className="px-3.5 py-2 font-bold text-[#001B44]">Referências <span className="text-[#EA7600]">*</span></td>
                    <td className="px-3.5 py-2 text-slate-700 font-semibold">
                      <strong>Obrigatório • Sem limite de palavras.</strong> Fontes bibliográficas, legislações ou protocolos do SUS que embasam a experiência.
                    </td>
                  </tr>
                  <tr className="bg-sky-50/50">
                    <td className="px-3.5 py-2 font-bold text-[#001B44]">Anexo dos Slides (PPT ou PDF) <span className="text-[#EA7600]">*</span></td>
                    <td className="px-3.5 py-2 text-slate-700 font-semibold">
                      <strong>Obrigatório.</strong> Envio da apresentação de slides no modelo oficial (.pptx) ou em PDF para a oficina.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Download Template PPTX */}
            <div className="mt-3 p-3.5 rounded-xl bg-white border border-sky-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#001B44] text-[#EA7600] flex items-center justify-center shrink-0">
                  <Presentation className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#001B44]">
                    Template Oficial (.PPTX) • Dia Mundial da Segurança do Paciente 2026 (14 Slides)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Formato widescreen 16:9 rigorosamente com os 14 slides oficiais (Capa, Apresentação, Roteiro do Relato, Referências ABNT e Encerramento).
                  </div>
                </div>
              </div>
              <a
                href={SUBMISSION_RULES.officialTemplateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-[#EA7600] hover:bg-[#D26500] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Acessar Modelo</span>
              </a>
            </div>
          </div>

          {/* ANEXO B - Roteiro para Produções Artísticas */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/50 border border-amber-200/80">
            <div className="flex items-center gap-2 mb-2">
              <Palette className="w-4 h-4 text-[#EA7600]" />
              <h4 className="text-sm font-extrabold text-[#001B44] uppercase tracking-wider">
                ANEXO B – Roteiro para Produções Artísticas
              </h4>
            </div>
            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              Orienta a inscrição de produções artísticas relacionadas à temática da qualidade e segurança do paciente na Rede SUS Recife.
            </p>

            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#001B44] text-white">
                  <tr>
                    <th className="px-3.5 py-2.5 font-bold uppercase tracking-wider text-[11px] w-1/3">Campo da Produção</th>
                    <th className="px-3.5 py-2.5 font-bold uppercase tracking-wider text-[11px]">Orientação e Especificações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="px-3.5 py-2 font-bold text-slate-800">Título da Produção Artística</td>
                    <td className="px-3.5 py-2 text-slate-600">Até 15 palavras.</td>
                  </tr>
                  <tr>
                    <td className="px-3.5 py-2 font-bold text-slate-800">Modalidade da produção</td>
                    <td className="px-3.5 py-2 text-slate-600">
                      Fotografia, texto literário, cordel, poesia ou outra manifestação artística relacionada à qualidade e segurança do paciente.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3.5 py-2 font-bold text-slate-800">Contexto de criação</td>
                    <td className="px-3.5 py-2 text-slate-600">Onde, quando e por que foi produzida. Até 300 palavras.</td>
                  </tr>
                  <tr>
                    <td className="px-3.5 py-2 font-bold text-slate-800">Especificações técnicas de arquivo</td>
                    <td className="px-3.5 py-2 text-slate-600">
                      • <strong>Fotografias:</strong> formato JPG, PNG ou PDF, resolução mínima de 1080x1080 px.<br />
                      • <strong>Textos, cordéis e poesias:</strong> formato PDF ou DOCX, ou texto digitado de até 1.000 palavras.<br />
                      • <strong>Áudio e Vídeo:</strong> disponibilização de link (Drive, YouTube, Vimeo, etc.).
                    </td>
                  </tr>
                  <tr className="bg-amber-50/50">
                    <td className="px-3.5 py-2 font-bold text-[#001B44]">Referências <span className="text-[#EA7600]">*</span></td>
                    <td className="px-3.5 py-2 text-slate-700 font-semibold">
                      <strong>Obrigatório • Sem limite de palavras.</strong> Fontes bibliográficas, autores ou inspirações que fundamentam a produção.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Acessar Modelo Produção Artística */}
            <div className="mt-3 p-3.5 rounded-xl bg-white border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#001B44] text-[#EA7600] flex items-center justify-center shrink-0">
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#001B44]">
                    Modelo e Orientações • Produções Artísticas (Anexo B)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Pasta oficial com modelos, parâmetros técnicos e orientações para fotografias, textos, cordéis, poesias e outras expressões.
                  </div>
                </div>
              </div>
              <a
                href={SUBMISSION_RULES.artisticTemplateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-[#EA7600] hover:bg-[#D26500] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Acessar Modelo</span>
              </a>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            Comissão Científica e Organizadora • NMSPR / SERMAC / SEAB / ESR
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#001B44] text-white hover:bg-[#0A2D6C] text-xs font-bold transition cursor-pointer shadow-xs"
          >
            Entendi as Regras
          </button>
        </div>
      </div>
    </div>
  );
};
