import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  Building2, 
  User, 
  Users, 
  Award, 
  Palette, 
  BookOpen, 
  CheckCircle2, 
  Eye, 
  ChevronRight, 
  PlusCircle, 
  Sparkles,
  ExternalLink,
  Printer,
  Lock,
  LogOut,
  ShieldCheck,
  Trash2,
  AlertTriangle,
  Mail
} from 'lucide-react';
import { WorkSubmissionData, ThematicAxisId, SubmissionModality, AdminUser } from '../types';
import { THEMATIC_AXES } from '../data/forumInfo';
import { EmailSettingsModal } from './EmailSettingsModal';

interface SubmissionsDashboardProps {
  submissions: WorkSubmissionData[];
  onSelectSubmission: (submission: WorkSubmissionData) => void;
  onNewSubmission: () => void;
  currentAdmin: AdminUser | null;
  onLogout: () => void;
  onClearAllSubmissions?: () => void;
  onDeleteSubmission?: (id: string) => void;
}

export const SubmissionsDashboard: React.FC<SubmissionsDashboardProps> = ({
  submissions,
  onSelectSubmission,
  onNewSubmission,
  currentAdmin,
  onLogout,
  onClearAllSubmissions,
  onDeleteSubmission,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAxis, setSelectedAxis] = useState<string>('ALL');
  const [selectedModality, setSelectedModality] = useState<string>('ALL');
  const [expandedSubmissionId, setExpandedSubmissionId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  // Axis stats
  const axisCounts: Record<ThematicAxisId, number> = {
    EIXO_1: submissions.filter(s => s.thematicAxis === 'EIXO_1').length,
    EIXO_2: submissions.filter(s => s.thematicAxis === 'EIXO_2').length,
    EIXO_3: submissions.filter(s => s.thematicAxis === 'EIXO_3').length
  };

  const experienceReportsCount = submissions.filter(s => s.modality === 'RELATO_EXPERIENCIA').length;
  const artisticCount = submissions.filter(s => s.modality === 'PRODUCAO_ARTISTICA').length;

  // Filtered submissions
  const filtered = submissions.filter((sub) => {
    // Axis filter
    if (selectedAxis !== 'ALL' && sub.thematicAxis !== selectedAxis) return false;

    // Modality filter
    if (selectedModality !== 'ALL' && sub.modality !== selectedModality) return false;

    // Search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchTitle = sub.title.toLowerCase().includes(term);
      const matchProtocol = sub.protocolNumber.toLowerCase().includes(term);
      const matchMainAuthor = sub.mainAuthor.fullName.toLowerCase().includes(term) || sub.mainAuthor.cpf.includes(term);
      const matchLocation = sub.mainAuthor.workLocation.toLowerCase().includes(term);
      const matchCoAuthors = sub.coAuthors.some(co => co.fullName.toLowerCase().includes(term));

      if (!matchTitle && !matchProtocol && !matchMainAuthor && !matchLocation && !matchCoAuthors) {
        return false;
      }
    }

    return true;
  });

  // Export to CSV function
  const handleExportCSV = () => {
    const headers = [
      'Protocolo',
      'Data Inscrição',
      'Eixo Temático',
      'Ordem da Vaga',
      'Modalidade',
      'Título',
      'Ano Realização',
      'Autor Principal',
      'CPF Autor',
      'E-mail Autor',
      'Telefone Autor',
      'Cargo/Função',
      'Local Atuação',
      'Unidade CNES',
      'Qtd Coautores',
      'Nomes Coautores'
    ];

    const rows = submissions.map(s => [
      `"${s.protocolNumber}"`,
      `"${new Date(s.submittedAt).toLocaleDateString('pt-BR')}"`,
      `"${s.thematicAxisLabel}"`,
      s.slotOrder,
      `"${s.modality === 'RELATO_EXPERIENCIA' ? 'Relato de Experiência' : `Produção Artística (${s.artisticProduction?.artisticCategory || ''})`}"`,
      `"${s.title.replace(/"/g, '""')}"`,
      `"${s.developmentPeriod}"`,
      `"${s.mainAuthor.fullName.replace(/"/g, '""')}"`,
      `"${s.mainAuthor.cpf}"`,
      `"${s.mainAuthor.email}"`,
      `"${s.mainAuthor.phone}"`,
      `"${s.mainAuthor.roleOrFunction.replace(/"/g, '""')}"`,
      `"${s.mainAuthor.workLocation.replace(/"/g, '""')}"`,
      `"${s.mainAuthor.cnesUnit || ''}"`,
      s.coAuthors.length,
      `"${s.coAuthors.map(c => c.fullName).join('; ').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `submissoes_oficina_recife_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Authenticated Admin Bar */}
      {currentAdmin && (
        <div className="bg-[#001B44] text-white p-3.5 px-5 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-sm border border-[#0A2D6C]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#EA7600] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {currentAdmin.avatarInitials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-white">{currentAdmin.name}</span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.2 rounded-full">
                  Sessão Autorizada
                </span>
              </div>
              <p className="text-[11px] text-sky-200">
                {currentAdmin.roleTitle} • {currentAdmin.organization}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onLogout}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-rose-500 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-white/20"
              title="Encerrar sessão da comissão"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sair da Área Restrita
            </button>
          </div>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-[#001B44] text-white px-2 py-0.5 rounded">
              Painel Restrito • Comissão Avaliadora
            </span>
            <span className="text-xs font-bold text-[#EA7600]">
              {submissions.length} {submissions.length === 1 ? 'trabalho inscrito' : 'trabalhos inscritos'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#001B44] font-display">
            Gestão dos Trabalhos Inscritos na Oficina
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Visualização restrita de Relatos de Experiência e Produções Artísticas por Eixo Temático e ordem de inscrição (Item 7.4).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowEmailModal(true)}
            className="px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-[#001B44] text-xs font-bold transition flex items-center gap-1.5 border border-sky-200 cursor-pointer shadow-2xs"
            title="Configurar envio de e-mails para qualquer endereço via SMTP / Gmail"
          >
            <Mail className="w-4 h-4 text-sky-600" />
            Configurar E-mails
          </button>

          {onClearAllSubmissions && submissions.length > 0 && (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition flex items-center gap-1.5 border border-rose-200 cursor-pointer"
              title="Excluir todas as inscrições registradas e zerar o painel"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              Zerar Inscrições
            </button>
          )}

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#001B44] text-xs font-bold transition flex items-center gap-1.5 border border-slate-300 cursor-pointer shadow-2xs"
          >
            <Download className="w-4 h-4 text-[#3498FE]" />
            Exportar Planilha (CSV)
          </button>

          <button
            type="button"
            onClick={onNewSubmission}
            className="px-4 py-2 rounded-xl bg-[#EA7600] hover:bg-[#D26500] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Inscrever Novo Trabalho
          </button>
        </div>
      </div>

      {/* Axis Vacancies & Progress Cards (10 vagas por eixo) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {THEMATIC_AXES.map((axis) => {
          const count = axisCounts[axis.id] || 0;
          const pct = Math.min(100, Math.round((count / axis.maxSlots) * 100));
          const remaining = Math.max(0, axis.maxSlots - count);
          const isSelected = selectedAxis === axis.id;

          return (
            <div
              key={axis.id}
              onClick={() => setSelectedAxis(isSelected ? 'ALL' : axis.id)}
              className={`p-4 rounded-xl border-2 transition cursor-pointer bg-white relative flex flex-col justify-between ${
                isSelected 
                  ? 'border-[#EA7600] ring-2 ring-[#EA7600]/15 shadow-xs' 
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-black uppercase text-[#001B44]">
                    Eixo {axis.number}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {count} de {axis.maxSlots} vagas
                  </span>
                </div>
                <h4 className="font-extrabold text-xs text-[#001B44] line-clamp-2 mb-2 leading-snug">
                  {axis.title}
                </h4>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
                  <div 
                    className="bg-[#EA7600] h-full transition-all duration-300 rounded-full" 
                    style={{ width: `${pct}%` }} 
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">
                  {remaining > 0 ? `${remaining} vagas disponíveis` : 'Vagas esgotadas (Fila)'}
                </span>
                <span className="font-bold text-[#EA7600]">
                  {isSelected ? 'Filtro Ativo' : 'Clique p/ filtrar'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por título, autor, CPF, unidade de saúde ou protocolo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3498FE]/20 focus:border-[#3498FE]"
            />
          </div>

          {/* Filter by Axis */}
          <div>
            <select
              value={selectedAxis}
              onChange={(e) => setSelectedAxis(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3498FE]/20"
            >
              <option value="ALL">Todos os Eixos Temáticos</option>
              <option value="EIXO_1">Eixo 1 (Segurança do Paciente & Riscos)</option>
              <option value="EIXO_2">Eixo 2 (Integração do Cuidado & Condições Crônicas)</option>
              <option value="EIXO_3">Eixo 3 (Educação Permanente & Qualidade)</option>
            </select>
          </div>

          {/* Filter by Modality */}
          <div>
            <select
              value={selectedModality}
              onChange={(e) => setSelectedModality(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3498FE]/20"
            >
              <option value="ALL">Todas as Modalidades</option>
              <option value="RELATO_EXPERIENCIA">Relatos de Experiência (Oral)</option>
              <option value="PRODUCAO_ARTISTICA">Produções Artísticas</option>
            </select>
          </div>
        </div>

        {/* Quick Active Filters Summary */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            Exibindo <strong>{filtered.length}</strong> de <strong>{submissions.length}</strong> trabalhos inscritos
          </span>
          {(selectedAxis !== 'ALL' || selectedModality !== 'ALL' || searchTerm.trim()) && (
            <button
              type="button"
              onClick={() => {
                setSelectedAxis('ALL');
                setSelectedModality('ALL');
                setSearchTerm('');
              }}
              className="text-[#EA7600] font-bold hover:underline cursor-pointer"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-3.5">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 space-y-2">
            <p className="text-sm font-bold text-[#001B44]">
              Nenhum trabalho encontrado para os filtros selecionados.
            </p>
            <p className="text-xs">
              Tente alterar os termos de busca ou remover os filtros de eixo e modalidade.
            </p>
          </div>
        ) : (
          filtered.map((sub) => {
            const isExpanded = expandedSubmissionId === sub.id;

            return (
              <div
                key={sub.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs transition overflow-hidden"
              >
                {/* Main Card Row */}
                <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#001B44] text-white">
                        {sub.thematicAxis}
                      </span>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        sub.slotOrder <= 10 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        Vaga #{sub.slotOrder} de 10
                      </span>

                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 flex items-center gap-1">
                        {sub.modality === 'RELATO_EXPERIENCIA' ? (
                          <>
                            <BookOpen className="w-3 h-3 text-[#3498FE]" />
                            Relato de Experiência (Oral)
                          </>
                        ) : (
                          <>
                            <Palette className="w-3 h-3 text-[#EA7600]" />
                            Produção Artística ({sub.artisticProduction?.artisticCategory})
                          </>
                        )}
                      </span>

                      <span className="text-[11px] font-mono text-slate-400">
                        {sub.protocolNumber}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-extrabold text-[#001B44] leading-snug">
                      {sub.title}
                    </h3>

                    {/* Author and Health Unit Details */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                      <span className="flex items-center gap-1 font-semibold text-slate-800">
                        <User className="w-3.5 h-3.5 text-[#EA7600]" />
                        {sub.mainAuthor.fullName}
                      </span>

                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-[#3498FE]" />
                        {sub.mainAuthor.workLocation}
                      </span>

                      {sub.coAuthors.length > 0 && (
                        <span className="flex items-center gap-1 text-slate-500">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          +{sub.coAuthors.length} coautor(es)
                        </span>
                      )}

                      <span className="text-slate-400">
                        Desenvolvido em: <strong>{sub.developmentPeriod}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Actions on Card */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => setExpandedSubmissionId(isExpanded ? null : sub.id)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition cursor-pointer flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#3498FE]" />
                      {isExpanded ? 'Recolher' : 'Ver Detalhes'}
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectSubmission(sub)}
                      className="px-3.5 py-1.5 rounded-lg bg-[#001B44] hover:bg-[#0A2D6C] text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#EA7600]" />
                      Comprovante
                    </button>

                    {onDeleteSubmission && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Confirma a exclusão definitiva do trabalho "${sub.title}" (Protocolo: ${sub.protocolNumber})?`)) {
                            onDeleteSubmission(sub.id);
                          }
                        }}
                        className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 transition cursor-pointer"
                        title="Excluir este trabalho individualmente"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Full Details View */}
                {isExpanded && (
                  <div className="border-t border-slate-200 bg-slate-50 p-5 space-y-4 text-xs text-slate-700 leading-relaxed animate-in fade-in duration-200">
                    {/* Authors breakdown */}
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                      <span className="font-extrabold uppercase tracking-wider text-[11px] text-[#001B44] block">
                        Equipe de Autoria ({1 + sub.coAuthors.length} participantes):
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2 rounded bg-slate-50 border border-slate-200">
                          <strong>Autor Principal:</strong> {sub.mainAuthor.fullName} ({sub.mainAuthor.professionalBackground})<br />
                          <span className="text-slate-500">CPF: {sub.mainAuthor.cpf} • Cargo: {sub.mainAuthor.roleOrFunction}</span>
                        </div>
                        {sub.coAuthors.map((c, i) => (
                          <div key={c.id} className="p-2 rounded bg-slate-50 border border-slate-200">
                            <strong>Coautor #{i + 1}:</strong> {c.fullName} ({c.professionalBackground})<br />
                            <span className="text-slate-500">Cargo: {c.roleOrFunction} ({c.workLocation})</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Report text contents */}
                    {sub.modality === 'RELATO_EXPERIENCIA' && sub.experienceReport && (
                      <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
                        <div>
                          <strong className="text-[#001B44] block mb-0.5">1. O que foi realizado e por quê?</strong>
                          <p className="text-slate-600">{sub.experienceReport.whatAndWhy}</p>
                        </div>
                        <div>
                          <strong className="text-[#001B44] block mb-0.5">2. Como foi desenvolvida a experiência?</strong>
                          <p className="text-slate-600">{sub.experienceReport.howDeveloped}</p>
                        </div>
                        <div>
                          <strong className="text-[#001B44] block mb-0.5">3. O que aprendeu com a experiência?</strong>
                          <p className="text-slate-600">{sub.experienceReport.whatLearned}</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                          <div>
                            <strong className="text-[#001B44] block mb-0.5">4. Desafios:</strong>
                            <p className="text-slate-600">{sub.experienceReport.challenges}</p>
                          </div>
                          <div>
                            <strong className="text-[#001B44] block mb-0.5">5. Gostou / Não gostou:</strong>
                            <p className="text-slate-600">{sub.experienceReport.likedAndDisliked}</p>
                          </div>
                          <div>
                            <strong className="text-[#001B44] block mb-0.5">6. O que mais pode ser feito:</strong>
                            <p className="text-slate-600">{sub.experienceReport.whatCanBeDone}</p>
                          </div>
                        </div>

                        {sub.experienceReport.references && (
                          <div className="pt-2 border-t border-slate-200">
                            <strong className="text-[#001B44] block mb-0.5">Referências (Item Obrigatório):</strong>
                            <p className="text-slate-600 font-mono text-[11px] whitespace-pre-line bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                              {sub.experienceReport.references}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {sub.modality === 'PRODUCAO_ARTISTICA' && sub.artisticProduction && (
                      <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
                        <div>
                          <strong className="text-[#001B44] block mb-0.5">Contexto de Criação:</strong>
                          <p className="text-slate-600">{sub.artisticProduction.creationContext}</p>
                        </div>
                        {sub.artisticProduction.textContent && (
                          <div>
                            <strong className="text-[#001B44] block mb-0.5">Texto / Cordel / Poesia:</strong>
                            <p className="text-slate-600 font-serif whitespace-pre-line bg-slate-50 p-3 rounded-lg border border-slate-200">
                              {sub.artisticProduction.textContent}
                            </p>
                          </div>
                        )}
                        {sub.attachedFile?.previewUrl && (
                          <div>
                            <strong className="text-[#001B44] block mb-1">Fotografia / Imagem Anexada:</strong>
                            <img 
                              src={sub.attachedFile.previewUrl} 
                              alt="Fotografia" 
                              className="max-h-48 rounded-lg border border-slate-200"
                            />
                          </div>
                        )}
                        {sub.artisticProduction.references && (
                          <div className="pt-2 border-t border-slate-200">
                            <strong className="text-[#001B44] block mb-0.5">Referências (Item Obrigatório):</strong>
                            <p className="text-slate-600 font-mono text-[11px] whitespace-pre-line bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                              {sub.artisticProduction.references}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {sub.mediaLink && (
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                            Link Externo (Áudio / Vídeo)
                          </span>
                          <a
                            href={sub.mediaLink.startsWith('http') ? sub.mediaLink : `https://${sub.mediaLink}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-[#3498FE] hover:underline inline-flex items-center gap-1.5"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            {sub.mediaLink}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Confirmation Modal to Clear All Data */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-[#001B44]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-black text-[#001B44] font-display">
                Zerar Todos os Trabalhos?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Esta ação excluirá permanentemente todos os <strong>{submissions.length}</strong> trabalhos cadastrados até o momento e liberará todas as vagas nos 3 Eixos Temáticos.
              </p>
              <p className="text-[11px] font-bold text-rose-600">
                Esta operação não pode ser desfeita.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowClearConfirm(false);
                  if (onClearAllSubmissions) {
                    onClearAllSubmissions();
                  }
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition cursor-pointer shadow-md flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Sim, Zerar Tudo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Configuração e Diagnóstico de E-mails */}
      <EmailSettingsModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
      />
    </div>
  );
};
