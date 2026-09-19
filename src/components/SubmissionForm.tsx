import React, { useState, useId } from 'react';
import { 
  FileText, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  Building2, 
  User, 
  Mail, 
  Phone, 
  Plus, 
  Trash2, 
  Upload, 
  Image as ImageIcon, 
  HelpCircle, 
  Palette, 
  BookOpen, 
  Calendar,
  Sparkles,
  ChevronRight,
  Presentation,
  Download,
  Link2,
  Video,
  ExternalLink
} from 'lucide-react';
import { 
  WorkSubmissionData, 
  AuthorData, 
  SubmissionModality, 
  ThematicAxisId,
  ArtisticProductionType,
  SubmissionAttachment
} from '../types';
import { 
  THEMATIC_AXES, 
  SUBMISSION_RULES, 
  CNES_HEALTH_UNITS, 
  PROFESSIONAL_BACKGROUND_OPTIONS,
  ACCESSIBILITY_OPTIONS,
  FORUM_INFO 
} from '../data/forumInfo';
import { formatCPF, isValidCPF } from '../utils/cpfValidator';
import { countWords, getWordCountStatus } from '../utils/wordCounter';
import { sendSubmissionConfirmationEmail } from '../utils/emailConfirmation';
import { saveServerSubmission } from '../utils/submissionsApi';

interface SubmissionFormProps {
  onSubmit: (submission: WorkSubmissionData) => void;
  onOpenRules: () => void;
  existingSubmissions?: WorkSubmissionData[];
}

export const SubmissionForm: React.FC<SubmissionFormProps> = ({
  onSubmit,
  onOpenRules,
  existingSubmissions = []
}) => {
  const formId = useId();

  // Basic Submission State
  const [thematicAxis, setThematicAxis] = useState<ThematicAxisId>('EIXO_1');
  const [modality, setModality] = useState<SubmissionModality>('RELATO_EXPERIENCIA');
  const [title, setTitle] = useState('');
  const [developmentPeriod, setDevelopmentPeriod] = useState('2025');
  const [accessibilityNeed, setAccessibilityNeed] = useState(ACCESSIBILITY_OPTIONS[0]);

  // Main Author State
  const [mainAuthor, setMainAuthor] = useState<AuthorData>({
    id: 'author_main',
    fullName: '',
    cpf: '',
    email: '',
    phone: '',
    sesauMatricula: '',
    professionalBackground: '',
    roleOrFunction: '',
    workLocation: '',
    cnesUnit: '',
    authorType: 'PROFISSIONAL_GESTOR',
    isMainAuthor: true
  });

  // Co-authors list (up to 7 coauthors, total 8 authors)
  const [coAuthors, setCoAuthors] = useState<AuthorData[]>([]);

  // Experience Report State (Anexo A)
  const [reportWhatWhy, setReportWhatWhy] = useState('');
  const [reportHowDeveloped, setReportHowDeveloped] = useState('');
  const [reportWhatLearned, setReportWhatLearned] = useState('');
  const [reportChallenges, setReportChallenges] = useState('');
  const [reportLikedDisliked, setReportLikedDisliked] = useState('');
  const [reportWhatCanBeDone, setReportWhatCanBeDone] = useState('');
  const [reportReferences, setReportReferences] = useState('');

  // Artistic Production State (Anexo B)
  const [artisticCategory, setArtisticCategory] = useState<ArtisticProductionType>('Fotografia');
  const [customArtisticCategory, setCustomArtisticCategory] = useState('');
  const [artisticCreationContext, setArtisticCreationContext] = useState('');
  const [artisticTextContent, setArtisticTextContent] = useState('');
  const [artisticReferences, setArtisticReferences] = useState('');

  // External Media Link (Áudio / Vídeo)
  const [mediaLink, setMediaLink] = useState('');

  // Attachment State
  const [attachedFile, setAttachedFile] = useState<SubmissionAttachment | undefined>(undefined);
  const [photoError, setPhotoError] = useState<string | null>(null);

  // Form Validation & Feedback
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingStep, setSubmittingStep] = useState<string>('');
  const [showCnesList, setShowCnesList] = useState(false);

  // Preenchimento de teste rápido com 1 clique (para testes e validação de homologação)
  const handleFillTestData = () => {
    setThematicAxis('EIXO_1');
    setModality('RELATO_EXPERIENCIA');
    setTitle('Implementação do Protocolo de Cirurgia Segura na Rede Municipal');
    setDevelopmentPeriod('2025');
    setMainAuthor({
      id: 'author_main',
      fullName: 'Getúlio Batista',
      cpf: '098.765.432-10',
      email: 'Getvb98@gmail.com',
      phone: '(81) 98765-4321',
      sesauMatricula: '12345-6',
      professionalBackground: 'Enfermagem',
      roleOrFunction: 'Coordenador(a) de Enfermagem',
      workLocation: 'Hospital da Restauração - SESAU Recife',
      cnesUnit: 'HOSPITAL DA RESTAURACAO',
      authorType: 'PROFISSIONAL_GESTOR',
      isMainAuthor: true
    });
    setCoAuthors([]);
    setReportWhatWhy('Implantação da lista de verificação de cirurgia segura do Ministério da Saúde e OMS no centro cirúrgico municipal.');
    setReportHowDeveloped('Oficinas com as equipes médica e de enfermagem com checagem dos três momentos cirúrgicos em todas as salas.');
    setReportWhatLearned('A padronização das etapas de identificação e contagem de materiais reduziu sensivelmente a ocorrência de quase-falhas.');
    setReportChallenges('Engajamento inicial de alguns cirurgiões à pausa cirúrgica antes da incisão da pele.');
    setReportLikedDisliked('Excelente acolhimento pela equipe assistencial e aumento da sensação de segurança entre os pacientes.');
    setReportWhatCanBeDone('Informatização do formulário em prontuário eletrônico e treinamento continuado para novos residentes.');
    setReportReferences('ORGANIZAÇÃO MUNDIAL DA SAÚDE. Segundo desafio global para a segurança do paciente: cirurgias seguras salvam vidas. Rio de Janeiro: OPAS, 2009. BRASIL. Ministério da Saúde. Portaria nº 529/2013.');
    setAttachedFile({
      name: 'Modelo_Oficial_Slides_Cirurgia_Segura.pptx',
      size: 245000,
      type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    });
    setTermsAccepted(true);
    setGeneralError(null);
  };

  // Word limits calculations
  const titleStatus = getWordCountStatus(title, SUBMISSION_RULES.limits.titleWords);
  const whatWhyStatus = getWordCountStatus(reportWhatWhy, SUBMISSION_RULES.limits.reportWhatWhyWords);
  const howDevelopedStatus = getWordCountStatus(reportHowDeveloped, SUBMISSION_RULES.limits.reportHowDevelopedWords);
  const whatLearnedStatus = getWordCountStatus(reportWhatLearned, SUBMISSION_RULES.limits.reportWhatLearnedWords);
  const challengesStatus = getWordCountStatus(reportChallenges, SUBMISSION_RULES.limits.reportChallengesWords);
  const likedDislikedStatus = getWordCountStatus(reportLikedDisliked, SUBMISSION_RULES.limits.reportLikedDislikedWords);
  const whatCanBeDoneStatus = getWordCountStatus(reportWhatCanBeDone, SUBMISSION_RULES.limits.reportWhatCanBeDoneWords);

  const totalReportWords = 
    whatWhyStatus.count + 
    howDevelopedStatus.count + 
    whatLearnedStatus.count + 
    challengesStatus.count + 
    likedDislikedStatus.count + 
    whatCanBeDoneStatus.count;
  
  const isReportTotalOver = totalReportWords > SUBMISSION_RULES.limits.reportTotalWords;

  const artisticContextStatus = getWordCountStatus(artisticCreationContext, SUBMISSION_RULES.limits.artisticContextWords);
  const artisticTextStatus = getWordCountStatus(artisticTextContent, SUBMISSION_RULES.limits.artisticTextWords);

  // Vacancy counts per Axis
  const axisCounts: Record<ThematicAxisId, number> = {
    EIXO_1: existingSubmissions.filter(s => s.thematicAxis === 'EIXO_1').length,
    EIXO_2: existingSubmissions.filter(s => s.thematicAxis === 'EIXO_2').length,
    EIXO_3: existingSubmissions.filter(s => s.thematicAxis === 'EIXO_3').length
  };

  // Eligibility check: If main author is resident or student, at least one coauthor must be professional/manager
  const mainAuthorIsStudentOrResident = mainAuthor.authorType === 'RESIDENTE' || mainAuthor.authorType === 'ESTUDANTE';
  const hasLinkedProfessional = 
    mainAuthor.authorType === 'PROFISSIONAL_GESTOR' || 
    coAuthors.some(co => co.authorType === 'PROFISSIONAL_GESTOR');

  // Co-author management
  const handleAddCoAuthor = () => {
    if (coAuthors.length >= 7) return; // total authors 1 + 7 = 8
    const newCoAuthor: AuthorData = {
      id: `coauthor_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      fullName: '',
      cpf: '',
      email: '',
      phone: '',
      sesauMatricula: '',
      professionalBackground: '',
      roleOrFunction: '',
      workLocation: '',
      cnesUnit: '',
      authorType: 'PROFISSIONAL_GESTOR',
      isMainAuthor: false
    };
    setCoAuthors([...coAuthors, newCoAuthor]);
  };

  const handleUpdateCoAuthor = (index: number, updatedFields: Partial<AuthorData>) => {
    setCoAuthors(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updatedFields };
      return copy;
    });
  };

  const handleRemoveCoAuthor = (index: number) => {
    setCoAuthors(prev => prev.filter((_, i) => i !== index));
  };

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError(null);

    // If photograph, validate resolution
    if (modality === 'PRODUCAO_ARTISTICA' && artisticCategory === 'Fotografia') {
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        setPhotoError('Fotografias devem estar no formato JPG ou PNG.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          if (img.width < 1080 || img.height < 1080) {
            setPhotoError(`A resolução da fotografia (${img.width}x${img.height} px) é inferior à mínima de 1080x1080 px exigida no item 7.7.e.`);
          }
          setAttachedFile({
            name: file.name,
            size: file.size,
            type: file.type,
            dataUrl: event.target?.result as string,
            previewUrl: event.target?.result as string,
            dimensions: { width: img.width, height: img.height }
          });
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      // General file (DOCX, PDF, etc.)
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachedFile({
          name: file.name,
          size: file.size,
          type: file.type,
          dataUrl: event.target?.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerError = (msg: string) => {
    setGeneralError(msg);
    setIsSubmitting(false);
    setSubmittingStep('');
    const el = document.getElementById('form-submissao-trabalho');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Form submission validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    // 1. Title validation
    if (!title.trim()) {
      triggerError('Por favor, informe o título do trabalho.');
      return;
    }
    if (titleStatus.isOver) {
      triggerError(`O título do trabalho excede o limite máximo de 15 palavras (${titleStatus.count} palavras informadas).`);
      return;
    }

    // 2. Main Author validation
    if (!mainAuthor.fullName.trim() || !mainAuthor.cpf.trim() || !mainAuthor.email.trim() || !mainAuthor.phone.trim()) {
      triggerError('Preencha todos os dados obrigatórios do(a) Autor(a) Principal.');
      return;
    }
    if (!isValidCPF(mainAuthor.cpf)) {
      triggerError('O CPF do(a) Autor(a) Principal é inválido.');
      return;
    }
    if (!mainAuthor.professionalBackground) {
      triggerError('Informe a formação profissional do(a) Autor(a) Principal.');
      return;
    }
    if (!mainAuthor.roleOrFunction.trim()) {
      triggerError('Informe o cargo ou função do(a) Autor(a) Principal.');
      return;
    }
    if (!mainAuthor.workLocation.trim()) {
      triggerError('Informe o local de atuação do(a) Autor(a) Principal.');
      return;
    }

    // 3. Limit of submissions per author (item 7.6)
    const formattedMainCpf = formatCPF(mainAuthor.cpf);
    const mainAuthorSubmissionsCount = existingSubmissions.filter(
      s => s.mainAuthor.cpf === formattedMainCpf
    ).length;

    if (mainAuthorSubmissionsCount >= SUBMISSION_RULES.maxWorksAsMainAuthor) {
      triggerError(`Limite de submissões excedido (Item 7.6): O CPF ${formattedMainCpf} já possui 2 trabalhos inscritos como autor principal.`);
      return;
    }

    // 4. Eligibility check (item 7.1)
    if (mainAuthorIsStudentOrResident && !hasLinkedProfessional) {
      triggerError('Conforme o item 7.1 do Edital, trabalhos submetidos por estudantes ou residentes devem conter ao menos um/a profissional ou gestor/a vinculado/a à Rede de Saúde do Recife na lista de coautores.');
      return;
    }

    // 5. Coauthors validation
    for (let i = 0; i < coAuthors.length; i++) {
      const co = coAuthors[i];
      if (!co.fullName.trim()) {
        triggerError(`Preencha o nome completo do coautor #${i + 1}.`);
        return;
      }
      if (!co.cpf.trim() || !isValidCPF(co.cpf)) {
        triggerError(`O CPF do coautor #${i + 1} (${co.fullName || 'Sem nome'}) é inválido.`);
        return;
      }
      if (!co.email.trim() || !co.phone.trim()) {
        triggerError(`Preencha o e-mail e telefone do coautor #${i + 1}.`);
        return;
      }
    }

    // 6. Modality-specific validations
    if (modality === 'RELATO_EXPERIENCIA') {
      if (!reportWhatWhy.trim() || !reportHowDeveloped.trim() || !reportWhatLearned.trim() || !reportChallenges.trim() || !reportLikedDisliked.trim() || !reportWhatCanBeDone.trim()) {
        triggerError('Preencha todos os 6 campos obrigatórios do Roteiro para Relatos de Experiência (Anexo A).');
        return;
      }

      if (!reportReferences.trim()) {
        triggerError('O campo de Referências é obrigatório para o Relato de Experiência (item obrigatório, sem limites de palavras).');
        return;
      }

      if (!attachedFile) {
        triggerError('O anexo dos slides do Relato de Experiência (PPT ou PDF) é obrigatório. Por favor, baixe o modelo oficial e anexe seu arquivo antes de prosseguir.');
        return;
      }

      if (whatWhyStatus.isOver || howDevelopedStatus.isOver || whatLearnedStatus.isOver || challengesStatus.isOver || likedDislikedStatus.isOver || whatCanBeDoneStatus.isOver) {
        triggerError('Um ou mais campos do Relato de Experiência ultrapassam o limite de palavras estipulado no Anexo A.');
        return;
      }

      if (isReportTotalOver) {
        triggerError(`O relato ultrapassa o limite total de 1.000 palavras (atual: ${totalReportWords} palavras). Reduza o texto antes de enviar.`);
        return;
      }
    } else {
      // Produção Artística
      if (!artisticCreationContext.trim()) {
        triggerError('Informe o contexto de criação da Produção Artística (Anexo B).');
        return;
      }
      if (artisticContextStatus.isOver) {
        triggerError(`O contexto de criação ultrapassa o limite máximo de 300 palavras (atual: ${artisticContextStatus.count} palavras).`);
        return;
      }

      if (!artisticReferences.trim()) {
        triggerError('O campo de Referências é obrigatório para a Produção Artística (item obrigatório, sem limites de palavras).');
        return;
      }

      if (['Texto Literário', 'Cordel', 'Poesia'].includes(artisticCategory)) {
        if (!artisticTextContent.trim() && !attachedFile) {
          triggerError('Digite o texto/cordel/poesia no campo correspondente ou anexe o arquivo (DOCX/PDF).');
          return;
        }
        if (artisticTextStatus.isOver) {
          triggerError(`O texto da produção artística ultrapassa o limite de 1.000 palavras (atual: ${artisticTextStatus.count} palavras).`);
          return;
        }
      }

      if (!attachedFile && !artisticTextContent.trim()) {
        triggerError('Anexe o arquivo da Produção Artística (PDF, JPG, PNG ou DOCX).');
        return;
      }
    }

    if (!termsAccepted) {
      triggerError('É necessário declarar a veracidade das informações e concordar com as normas do edital da oficina.');
      return;
    }

    // Build Submission Payload
    setIsSubmitting(true);
    setSubmittingStep('1/2 Gravando inscrição no servidor central...');

    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const axisIndex = thematicAxis === 'EIXO_1' ? 1 : thematicAxis === 'EIXO_2' ? 2 : 3;
    const protocolNumber = `INSC-NMSPR-2026-E${axisIndex}-${randomSuffix}`;
    const id = `sub_${Date.now()}_${randomSuffix}`;

    const selectedAxis = THEMATIC_AXES.find(a => a.id === thematicAxis);

    const submissionPayload: WorkSubmissionData = {
      id,
      protocolNumber,
      submittedAt: new Date().toISOString(),
      thematicAxis,
      thematicAxisLabel: selectedAxis?.title || `Eixo ${axisIndex}`,
      modality,
      title: title.trim(),
      developmentPeriod,
      mainAuthor: {
        ...mainAuthor,
        cpf: formatCPF(mainAuthor.cpf),
        fullName: mainAuthor.fullName.trim(),
        email: mainAuthor.email.trim().toLowerCase(),
        phone: mainAuthor.phone.trim(),
        roleOrFunction: mainAuthor.roleOrFunction.trim(),
        workLocation: mainAuthor.workLocation.trim()
      },
      coAuthors: coAuthors.map(co => ({
        ...co,
        cpf: formatCPF(co.cpf),
        fullName: co.fullName.trim(),
        email: co.email.trim().toLowerCase(),
        phone: co.phone.trim()
      })),
      experienceReport: modality === 'RELATO_EXPERIENCIA' ? {
        whatAndWhy: reportWhatWhy.trim(),
        howDeveloped: reportHowDeveloped.trim(),
        whatLearned: reportWhatLearned.trim(),
        challenges: reportChallenges.trim(),
        likedAndDisliked: reportLikedDisliked.trim(),
        whatCanBeDone: reportWhatCanBeDone.trim(),
        references: reportReferences.trim()
      } : undefined,
      artisticProduction: modality === 'PRODUCAO_ARTISTICA' ? {
        artisticCategory,
        customArtisticCategory: artisticCategory === 'Outra manifestação artística' ? customArtisticCategory : undefined,
        creationContext: artisticCreationContext.trim(),
        textContent: artisticTextContent.trim() || undefined,
        references: artisticReferences.trim()
      } : undefined,
      references: modality === 'RELATO_EXPERIENCIA' ? reportReferences.trim() : artisticReferences.trim(),
      mediaLink: mediaLink.trim() || undefined,
      attachedFile,
      status: 'INSCRITO',
      slotOrder: (axisCounts[thematicAxis] || 0) + 1,
      accessibilityNeed
    };

    // 1. Salvar no servidor permanente (banco de dados real do evento)
    const saveRes = await saveServerSubmission(submissionPayload);
    if (!saveRes.success) {
      triggerError(`Não foi possível salvar o trabalho no servidor oficial: ${saveRes.error || 'Erro de rede'}. Por favor, tente novamente.`);
      return;
    }

    // 2. Disparar envio de e-mail de confirmação aos participantes
    setSubmittingStep(`2/2 Despachando e-mail oficial para ${submissionPayload.mainAuthor.email}...`);
    try {
      await sendSubmissionConfirmationEmail(submissionPayload);
    } catch (err) {
      console.warn('Erro na comunicação de e-mail:', err);
    }

    setIsSubmitting(false);
    setSubmittingStep('');
    onSubmit(submissionPayload);
  };

  return (
    <form onSubmit={handleSubmit} id="form-submissao-trabalho" className="space-y-6">
      {/* Official Guidelines Alert & Fast Access */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#001B44] text-[#3498FE] flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-[#001B44] text-sm sm:text-base leading-tight">
              Regras do Item 7: Inscrição de Trabalhos na Oficina
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              10 vagas por eixo (30 no total por ordem de inscrição). Até 8 autores por trabalho. Trabalhos de 2025 a 2026.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleFillTestData}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 transition cursor-pointer shrink-0 shadow-xs"
            title="Preenche todos os campos obrigatórios com dados de teste válidos para agilizar a homologação"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#EA7600]" />
            Preencher Dados de Teste (1 Clique)
          </button>

          <button
            type="button"
            onClick={onOpenRules}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#001B44] bg-slate-100 hover:bg-slate-200 border border-slate-300 transition cursor-pointer shrink-0"
          >
            <Info className="w-3.5 h-3.5 text-[#EA7600]" />
            Ver Detalhes das Regras
          </button>
        </div>
      </div>

      {/* General Error Banner */}
      {generalError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-semibold">{generalError}</div>
        </div>
      )}

      {/* STEP 1: EIXO TEMÁTICO, MODALIDADE E TÍTULO */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <span className="w-7 h-7 rounded-lg bg-[#001B44] text-white flex items-center justify-center text-xs font-extrabold">
            1
          </span>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-[#001B44]">
              Identificação do Trabalho e Modalidade
            </h3>
            <p className="text-xs text-slate-500">
              Selecione o eixo temático, a modalidade de apresentação e o período de realização (2025-2026).
            </p>
          </div>
        </div>

        {/* Escolha do Eixo Temático */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Eixo Temático Escolhido <span className="text-[#EA7600]">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {THEMATIC_AXES.map((axis) => {
              const count = axisCounts[axis.id] || 0;
              const isSelected = thematicAxis === axis.id;
              const remaining = Math.max(0, axis.maxSlots - count);

              return (
                <div
                  key={axis.id}
                  onClick={() => setThematicAxis(axis.id)}
                  className={`p-4 rounded-xl border-2 transition cursor-pointer relative flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#EA7600] bg-orange-50/40 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className={`text-[11px] font-black uppercase tracking-wider ${isSelected ? 'text-[#EA7600]' : 'text-slate-500'}`}>
                        Eixo {axis.number}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {remaining} vagas disponíveis
                      </span>
                    </div>
                    <h4 className="font-extrabold text-xs text-[#001B44] leading-snug mb-2">
                      {axis.title}
                    </h4>
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

                  <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Ordem de inscrição:</span>
                    <span className="font-bold text-[#001B44]">
                      {count >= axis.maxSlots ? 'Lista de Espera' : `Vaga #${count + 1} de ${axis.maxSlots}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modalidade de Apresentação (Item 7.3) */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Modalidade de Apresentação <span className="text-[#EA7600]">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Modalidade 1: Relato de Experiência */}
            <div
              onClick={() => setModality('RELATO_EXPERIENCIA')}
              className={`p-4 rounded-xl border-2 transition cursor-pointer flex items-start gap-3 ${
                modality === 'RELATO_EXPERIENCIA'
                  ? 'border-[#3498FE] bg-sky-50/50 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                modality === 'RELATO_EXPERIENCIA' ? 'bg-[#3498FE] text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-xs sm:text-sm text-[#001B44] block">
                  Relato de Experiência (Apresentação Oral)
                </span>
                <span className="text-xs text-slate-600 block mt-0.5">
                  Roteiro de até 1.000 palavras orientado pelo <strong>Anexo A</strong>. Apresentação presencial na oficina.
                </span>
              </div>
            </div>

            {/* Modalidade 2: Produção Artística */}
            <div
              onClick={() => setModality('PRODUCAO_ARTISTICA')}
              className={`p-4 rounded-xl border-2 transition cursor-pointer flex items-start gap-3 ${
                modality === 'PRODUCAO_ARTISTICA'
                  ? 'border-[#EA7600] bg-orange-50/40 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                modality === 'PRODUCAO_ARTISTICA' ? 'bg-[#EA7600] text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-xs sm:text-sm text-[#001B44] block">
                  Produção Artística
                </span>
                <span className="text-xs text-slate-600 block mt-0.5">
                  Fotografia, texto literário, cordel, poesia ou outra manifestação artística conforme o <strong>Anexo B</strong>.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Período de Desenvolvimento & Título */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Ano de Realização <span className="text-[#EA7600]">*</span>
            </label>
            <select
              value={developmentPeriod}
              onChange={(e) => setDevelopmentPeriod(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#3498FE]/20 focus:border-[#3498FE]"
            >
              <option value="2026">2026 (Ano corrente)</option>
              <option value="2025">2025</option>
              <option value="2025-2026">Período Contínuo (2025-2026)</option>
            </select>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Item 7.2: realização entre 2025 e 2026.
            </span>
          </div>

          <div className="md:col-span-3">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Título do Trabalho <span className="text-[#EA7600]">*</span>
              </label>
              <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                titleStatus.isOver ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
              }`}>
                {titleStatus.count} / {titleStatus.max} palavras
              </span>
            </div>
            <input
              type="text"
              required
              placeholder="Ex: Implantação do Núcleo de Segurança do Paciente na Atenção Primária..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 ${
                titleStatus.isOver 
                  ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500' 
                  : 'border-slate-200 focus:ring-[#3498FE]/20 focus:border-[#3498FE]'
              }`}
            />
            {titleStatus.isOver && (
              <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Limite excedido: o título deve conter no máximo 15 palavras.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* STEP 2: AUTORES E COAUTORES (ITEM 7.6 & 7.7.b,c) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-[#001B44] text-white flex items-center justify-center text-xs font-extrabold">
              2
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-[#001B44]">
                Autoria do Trabalho (Item 7.6)
              </h3>
              <p className="text-xs text-slate-500">
                Até 8 autores no total (1 autor/a principal + até 7 coautores/as).
              </p>
            </div>
          </div>

          <div className="text-xs font-bold text-[#001B44] bg-sky-50 px-3 py-1 rounded-lg border border-[#3498FE]/30 shrink-0">
            Total de Autores: {1 + coAuthors.length} / 8
          </div>
        </div>

        {/* Lembrete de Elegibilidade (Item 7.1) */}
        {mainAuthorIsStudentOrResident && (
          <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
            hasLinkedProfessional 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
              : 'bg-amber-50 border-amber-300 text-amber-900'
          }`}>
            <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${hasLinkedProfessional ? 'text-emerald-600' : 'text-[#EA7600]'}`} />
            <div>
              <strong>Regra de Elegibilidade (Item 7.1):</strong> Residentes e estudantes participam como autores/as ou coautores/as, <em>desde que o trabalho tenha ao menos um/a profissional ou gestor/a vinculado/a à Rede de Saúde do Recife</em>.
              {hasLinkedProfessional ? (
                <span className="block mt-1 font-bold text-emerald-700">✓ Requisito atendido: há profissional/gestor vinculado no trabalho.</span>
              ) : (
                <span className="block mt-1 font-bold text-amber-800">⚠️ Adicione ao menos um coautor com perfil de Profissional / Gestor da Rede SUS Recife abaixo.</span>
              )}
            </div>
          </div>
        )}

        {/* Autor Principal */}
        <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#001B44] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#EA7600]" />
              Autor(a) Principal ( Responsável pela Inscrição do Trabalho )
            </span>
            <span className="text-[11px] font-bold text-slate-500 bg-white px-2.5 py-0.5 rounded border border-slate-200">
              Autor 1 de {1 + coAuthors.length}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {/* Nome Completo */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Nome Completo <span className="text-[#EA7600]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Nome completo do autor principal"
                value={mainAuthor.fullName}
                onChange={(e) => setMainAuthor({ ...mainAuthor, fullName: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#3498FE]/20 focus:border-[#3498FE]"
              />
            </div>

            {/* CPF */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                CPF <span className="text-[#EA7600]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="000.000.000-00"
                maxLength={14}
                value={mainAuthor.cpf}
                onChange={(e) => setMainAuthor({ ...mainAuthor, cpf: formatCPF(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white font-mono focus:outline-none focus:ring-2 focus:ring-[#3498FE]/20 focus:border-[#3498FE]"
              />
            </div>

            {/* E-mail */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                E-mail <span className="text-[#EA7600]">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="email@recife.pe.gov.br"
                value={mainAuthor.email}
                onChange={(e) => setMainAuthor({ ...mainAuthor, email: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#3498FE]/20 focus:border-[#3498FE]"
              />
            </div>

            {/* Telefone / WhatsApp */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Telefone / WhatsApp <span className="text-[#EA7600]">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="(81) 90000-0000"
                value={mainAuthor.phone}
                onChange={(e) => setMainAuthor({ ...mainAuthor, phone: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#3498FE]/20 focus:border-[#3498FE]"
              />
            </div>

            {/* Matrícula SESAU (se houver) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Matrícula SESAU <span className="text-slate-400 font-normal lowercase">(quando houver)</span>
              </label>
              <input
                type="text"
                placeholder="Ex: 123456-7"
                value={mainAuthor.sesauMatricula || ''}
                onChange={(e) => setMainAuthor({ ...mainAuthor, sesauMatricula: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#3498FE]/20 focus:border-[#3498FE]"
              />
            </div>

            {/* Perfil de Elegibilidade */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Perfil de Atuação <span className="text-[#EA7600]">*</span>
              </label>
              <select
                value={mainAuthor.authorType}
                onChange={(e) => setMainAuthor({ ...mainAuthor, authorType: e.target.value as any })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#3498FE]/20 focus:border-[#3498FE]"
              >
                <option value="PROFISSIONAL_GESTOR">Trabalhador(a) da Assistência ou Gestão SUS</option>
                <option value="RESIDENTE">Profissional Residente</option>
                <option value="ESTUDANTE">Estudante de Graduação em Saúde</option>
              </select>
            </div>

            {/* Formação Profissional */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Formação Profissional <span className="text-[#EA7600]">*</span>
              </label>
              <select
                required
                value={mainAuthor.professionalBackground}
                onChange={(e) => setMainAuthor({ ...mainAuthor, professionalBackground: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#3498FE]/20 focus:border-[#3498FE]"
              >
                <option value="">Selecione sua formação...</option>
                {PROFESSIONAL_BACKGROUND_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Cargo ou Função */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Cargo / Função <span className="text-[#EA7600]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Enfermeiro NSP, Médico, Residente, etc."
                value={mainAuthor.roleOrFunction}
                onChange={(e) => setMainAuthor({ ...mainAuthor, roleOrFunction: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#3498FE]/20 focus:border-[#3498FE]"
              />
            </div>

            {/* Local de Atuação e Unidade CNES */}
            <div className="sm:col-span-2 md:col-span-3">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Local de Atuação (Unidade de Saúde, Serviço ou Gestão) <span className="text-[#EA7600]">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowCnesList(!showCnesList)}
                  className="text-[11px] font-bold text-[#001B44] hover:text-[#EA7600] cursor-pointer"
                >
                  {showCnesList ? 'Ocultar Lista CNES' : 'Selecionar de Unidade CNES Oficial'}
                </button>
              </div>

              {showCnesList && (
                <div className="mb-2 p-2.5 rounded-lg bg-sky-50 border border-sky-200">
                  <span className="text-[11px] font-bold text-[#001B44] block mb-1">
                    Unidades Municipais Convocadas com NSP (Conforme CNES):
                  </span>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        setMainAuthor({
                          ...mainAuthor,
                          workLocation: e.target.value,
                          cnesUnit: e.target.value
                        });
                      }
                    }}
                    className="w-full p-2 text-xs bg-white rounded border border-slate-300 font-mono"
                  >
                    <option value="">Clique para preencher automaticamente com uma das 19 unidades...</option>
                    {CNES_HEALTH_UNITS.slice(0, 19).map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              )}

              <input
                type="text"
                required
                placeholder="Ex: US 159 POLICLINICA AGAMENON MAGALHAES, USF Vila Santa Luzia, Distrito Sanitário III..."
                value={mainAuthor.workLocation}
                onChange={(e) => setMainAuthor({ ...mainAuthor, workLocation: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#3498FE]/20 focus:border-[#3498FE]"
              />
            </div>
          </div>
        </div>

        {/* Coautores Adicionados */}
        {coAuthors.map((co, index) => (
          <div key={co.id} className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#001B44] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#3498FE]" />
                Coautor(a) #{index + 1}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveCoAuthor(index)}
                className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 px-2 py-1 rounded hover:bg-rose-50 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remover Coautor
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Nome Completo <span className="text-[#EA7600]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nome do coautor"
                  value={co.fullName}
                  onChange={(e) => handleUpdateCoAuthor(index, { fullName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#3498FE]/20 focus:border-[#3498FE]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  CPF <span className="text-[#EA7600]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="000.000.000-00"
                  maxLength={14}
                  value={co.cpf}
                  onChange={(e) => handleUpdateCoAuthor(index, { cpf: formatCPF(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white font-mono focus:outline-none focus:ring-2 focus:ring-[#3498FE]/20 focus:border-[#3498FE]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  E-mail <span className="text-[#EA7600]">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="email@exemplo.com"
                  value={co.email}
                  onChange={(e) => handleUpdateCoAuthor(index, { email: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#3498FE]/20 focus:border-[#3498FE]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Telefone / WhatsApp <span className="text-[#EA7600]">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="(81) 90000-0000"
                  value={co.phone}
                  onChange={(e) => handleUpdateCoAuthor(index, { phone: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#3498FE]/20 focus:border-[#3498FE]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Perfil de Atuação <span className="text-[#EA7600]">*</span>
                </label>
                <select
                  value={co.authorType}
                  onChange={(e) => handleUpdateCoAuthor(index, { authorType: e.target.value as any })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#3498FE]/20 focus:border-[#3498FE]"
                >
                  <option value="PROFISSIONAL_GESTOR">Trabalhador(a) da Assistência ou Gestão SUS</option>
                  <option value="RESIDENTE">Profissional Residente</option>
                  <option value="ESTUDANTE">Estudante de Graduação em Saúde</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Formação Profissional <span className="text-[#EA7600]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Medicina, Enfermagem..."
                  value={co.professionalBackground}
                  onChange={(e) => handleUpdateCoAuthor(index, { professionalBackground: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#3498FE]/20 focus:border-[#3498FE]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Cargo / Função <span className="text-[#EA7600]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Médico Preceptor, Residente, etc."
                  value={co.roleOrFunction}
                  onChange={(e) => handleUpdateCoAuthor(index, { roleOrFunction: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#3498FE]/20 focus:border-[#3498FE]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Local de Atuação / Unidade <span className="text-[#EA7600]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Hospital Helena Moura, Policlínica Pina..."
                  value={co.workLocation}
                  onChange={(e) => handleUpdateCoAuthor(index, { workLocation: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#3498FE]/20 focus:border-[#3498FE]"
                />
              </div>
            </div>
          </div>
        ))}

        {/* Botão Adicionar Coautor (limite 7 coautores = 8 autores totais) */}
        {coAuthors.length < 7 && (
          <button
            type="button"
            onClick={handleAddCoAuthor}
            className="w-full py-2.5 px-4 rounded-xl border-2 border-dashed border-[#001B44]/20 hover:border-[#EA7600] hover:bg-orange-50/30 text-[#001B44] text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#EA7600]" />
            Adicionar Coautor/a ({coAuthors.length + 1} de até 7 coautores)
          </button>
        )}
      </div>

      {/* STEP 3: ROTEIRO ESTRUTURADO (ANEXO A ou ANEXO B) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-[#001B44] text-white flex items-center justify-center text-xs font-extrabold">
              3
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-[#001B44]">
                {modality === 'RELATO_EXPERIENCIA' 
                  ? 'ANEXO A – Roteiro para Relatos de Experiência (Apresentação Oral)' 
                  : 'ANEXO B – Roteiro para Produções Artísticas'}
              </h3>
              <p className="text-xs text-slate-500">
                {modality === 'RELATO_EXPERIENCIA' 
                  ? 'Preencha cada campo respeitando os limites de palavras. Total máximo: 1.000 palavras.'
                  : 'Descreva a produção artística e anexe o arquivo com as especificações técnicas.'}
              </p>
            </div>
          </div>

          {modality === 'RELATO_EXPERIENCIA' && (
            <div className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border shrink-0 ${
              isReportTotalOver 
                ? 'bg-rose-100 text-rose-800 border-rose-300' 
                : 'bg-emerald-50 text-emerald-800 border-emerald-300'
            }`}>
              Total: {totalReportWords} / 1.000 palavras
            </div>
          )}
        </div>

        {/* MODALIDADE 1: RELATO DE EXPERIÊNCIA (ANEXO A) */}
        {modality === 'RELATO_EXPERIENCIA' && (
          <div className="space-y-5">
            {/* Template Oficial de Slides PPTX */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-sky-50 to-blue-50/50 border border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#001B44] text-[#EA7600] flex items-center justify-center shrink-0 shadow-2xs">
                  <Presentation className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-extrabold text-[#001B44]">
                      Template Oficial: Dia Mundial da Segurança do Paciente 2026 (14 Slides)
                    </h4>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-orange-100 text-[#EA7600] border border-orange-200">
                      14 Slides
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    Acesse o modelo oficial em PowerPoint (.pptx) estruturado com os 14 slides: Capa do Dia Mundial, Apresentação/Autores, Divisor, Título/Afiliações, as 6 seções do roteiro, Referências e slides finais de agradecimento.
                  </p>
                </div>
              </div>
              <a
                href={SUBMISSION_RULES.officialTemplateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-[#EA7600] hover:bg-[#D26500] text-white text-xs font-bold transition flex items-center justify-center gap-2 shrink-0 shadow-xs cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Acessar Modelo</span>
              </a>
            </div>

            {/* Campo 1 */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-[#001B44]">
                  1. O que foi realizado e por quê? <span className="text-[#EA7600]">*</span>
                </label>
                <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                  whatWhyStatus.isOver ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  {whatWhyStatus.count} / {whatWhyStatus.max} palavras
                </span>
              </div>
              <textarea
                required
                rows={3}
                placeholder="Descreva a ação ou projeto desenvolvido e a justificativa/motivação no serviço..."
                value={reportWhatWhy}
                onChange={(e) => setReportWhatWhy(e.target.value)}
                className={`w-full p-3 rounded-xl border text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 ${
                  whatWhyStatus.isOver ? 'border-rose-400 focus:ring-rose-500/20' : 'border-slate-200 focus:ring-[#3498FE]/20 focus:border-[#3498FE]'
                }`}
              />
            </div>

            {/* Campo 2 */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-[#001B44]">
                  2. Como foi desenvolvida a experiência? <span className="text-[#EA7600]">*</span>
                </label>
                <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                  howDevelopedStatus.isOver ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  {howDevelopedStatus.count} / {howDevelopedStatus.max} palavras
                </span>
              </div>
              <textarea
                required
                rows={4}
                placeholder="Apresente os métodos, etapas, articulações com a equipe e ferramentas utilizadas..."
                value={reportHowDeveloped}
                onChange={(e) => setReportHowDeveloped(e.target.value)}
                className={`w-full p-3 rounded-xl border text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 ${
                  howDevelopedStatus.isOver ? 'border-rose-400 focus:ring-rose-500/20' : 'border-slate-200 focus:ring-[#3498FE]/20 focus:border-[#3498FE]'
                }`}
              />
            </div>

            {/* Campo 3 */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-[#001B44]">
                  3. O que você e a sua equipe aprenderam com essa experiência? <span className="text-[#EA7600]">*</span>
                </label>
                <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                  whatLearnedStatus.isOver ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  {whatLearnedStatus.count} / {whatLearnedStatus.max} palavras
                </span>
              </div>
              <textarea
                required
                rows={3}
                placeholder="Destaque as principais lições aprendidas, mudanças na cultura de segurança e impactos..."
                value={reportWhatLearned}
                onChange={(e) => setReportWhatLearned(e.target.value)}
                className={`w-full p-3 rounded-xl border text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 ${
                  whatLearnedStatus.isOver ? 'border-rose-400 focus:ring-rose-500/20' : 'border-slate-200 focus:ring-[#3498FE]/20 focus:border-[#3498FE]'
                }`}
              />
            </div>

            {/* Campo 4, 5, 6 em grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Campo 4 */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[#001B44]">
                    4. Desafios encontrados <span className="text-[#EA7600]">*</span>
                  </label>
                  <span className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    challengesStatus.isOver ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {challengesStatus.count} / 100
                  </span>
                </div>
                <textarea
                  required
                  rows={3}
                  placeholder="Que desafios foram encontrados para o seu desenvolvimento?"
                  value={reportChallenges}
                  onChange={(e) => setReportChallenges(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 ${
                    challengesStatus.isOver ? 'border-rose-400' : 'border-slate-200 focus:ring-[#3498FE]/20'
                  }`}
                />
              </div>

              {/* Campo 5 */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[#001B44]">
                    5. O que mais e menos gostou <span className="text-[#EA7600]">*</span>
                  </label>
                  <span className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    likedDislikedStatus.isOver ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {likedDislikedStatus.count} / 100
                  </span>
                </div>
                <textarea
                  required
                  rows={3}
                  placeholder="O que você mais gostou e o que não gostou da experiência desenvolvida?"
                  value={reportLikedDisliked}
                  onChange={(e) => setReportLikedDisliked(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 ${
                    likedDislikedStatus.isOver ? 'border-rose-400' : 'border-slate-200 focus:ring-[#3498FE]/20'
                  }`}
                />
              </div>

              {/* Campo 6 */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[#001B44]">
                    6. O que ainda pode ser feito <span className="text-[#EA7600]">*</span>
                  </label>
                  <span className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    whatCanBeDoneStatus.isOver ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {whatCanBeDoneStatus.count} / 100
                  </span>
                </div>
                <textarea
                  required
                  rows={3}
                  placeholder="Pensando no que foi descrito, o que mais ainda pode ser feito?"
                  value={reportWhatCanBeDone}
                  onChange={(e) => setReportWhatCanBeDone(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 ${
                    whatCanBeDoneStatus.isOver ? 'border-rose-400' : 'border-slate-200 focus:ring-[#3498FE]/20'
                  }`}
                />
              </div>
            </div>

            {/* Campo de Referências do Relato de Experiência (Item Obrigatório - Sem Limites de Palavras) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-[#001B44]">
                  Referências <span className="text-[#EA7600]">*</span>{' '}
                  <span className="text-slate-500 font-normal lowercase">(item obrigatório, sem limite de palavras)</span>
                </label>
                <span className="text-[11px] font-mono text-slate-500 font-semibold">
                  {countWords(reportReferences)} palavras
                </span>
              </div>
              <textarea
                required
                rows={4}
                placeholder="Insira as referências técnico-científicas utilizadas (normas ABNT ou Vancouver, protocolos da OMS/ANVISA, manuais do Ministério da Saúde, legislações, artigos, etc.)..."
                value={reportReferences}
                onChange={(e) => setReportReferences(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3498FE]/20 focus:border-[#3498FE] font-mono"
              />
            </div>

            {/* Anexo Obrigatório do Relato de Experiência (Slides PPT ou PDF - Usar Modelo) */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#001B44]">
                    Anexo do Relato de Experiência (PPT ou PDF) <span className="text-[#EA7600]">* (obrigatório)</span>
                  </label>
                  <span className="text-[11px] text-slate-500 block">
                    Item 7.7.a: É obrigatório o envio dos slides da apresentação (PPT ou PDF). Acesse o modelo oficial do Dia Mundial 2026 (14 slides) no link ao lado.
                  </span>
                </div>

                <a
                  href={SUBMISSION_RULES.officialTemplateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-[#EA7600] border border-orange-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Acessar Modelo</span>
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <input
                  type="file"
                  id="file-relato"
                  accept=".pdf,.pptx,.ppt,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-powerpoint"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="file-relato"
                  className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                    attachedFile 
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-800' 
                      : 'border-orange-300 bg-orange-50/50 hover:bg-orange-100 text-[#001B44]'
                  }`}
                >
                  <Upload className="w-4 h-4 text-[#EA7600]" />
                  {attachedFile ? 'Trocar Arquivo Anexado' : 'Anexar Slides (PPTX ou PDF) *'}
                </label>
                {attachedFile ? (
                  <span className="text-xs text-emerald-800 font-semibold flex items-center gap-1 bg-emerald-100/70 px-2.5 py-1 rounded-lg">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {attachedFile.name} ({(attachedFile.size / 1024).toFixed(0)} KB)
                  </span>
                ) : (
                  <span className="text-xs text-rose-600 font-semibold">
                    * Arquivo não anexado (obrigatório)
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MODALIDADE 2: PRODUÇÃO ARTÍSTICA (ANEXO B) */}
        {modality === 'PRODUCAO_ARTISTICA' && (
          <div className="space-y-5">
            {/* Template / Orientações Produções Artísticas Banner */}
            <div className="p-4 rounded-xl bg-orange-50/70 border border-orange-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#EA7600] text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-xs uppercase tracking-wider text-[#001B44]">
                      Modelo e Orientações para Produções Artísticas
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-[#EA7600] text-white">
                      Anexo B
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    Acesse a pasta oficial no Google Drive com os modelos, diretrizes e orientações para submissão das produções artísticas (fotografia, texto, cordel, poesia ou outras linguagens).
                  </p>
                </div>
              </div>
              <a
                href={SUBMISSION_RULES.artisticTemplateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-[#EA7600] hover:bg-[#D26500] text-white text-xs font-bold transition flex items-center justify-center gap-2 shrink-0 shadow-xs cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Acessar Modelo</span>
              </a>
            </div>

            {/* Modalidade da Produção */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Linguagem / Categoria Artística <span className="text-[#EA7600]">*</span>
                </label>
                <select
                  value={artisticCategory}
                  onChange={(e) => setArtisticCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#EA7600]/20 focus:border-[#EA7600]"
                >
                  <option value="Fotografia">Fotografia (JPG ou PNG, mín. 1080x1080 px)</option>
                  <option value="Texto Literário">Texto Literário (DOCX/PDF ou digitado)</option>
                  <option value="Cordel">Cordel (DOCX/PDF ou digitado)</option>
                  <option value="Poesia">Poesia (DOCX/PDF ou digitado)</option>
                  <option value="Outra manifestação artística">Outra manifestação artística</option>
                </select>
              </div>

              {artisticCategory === 'Outra manifestação artística' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Especifique a Manifestação Artística <span className="text-[#EA7600]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Ilustração digital, colagem, paródia, etc."
                    value={customArtisticCategory}
                    onChange={(e) => setCustomArtisticCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2"
                  />
                </div>
              )}
            </div>

            {/* Contexto de Criação */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-[#001B44]">
                  Contexto de Criação (Onde, quando e por que foi produzida) <span className="text-[#EA7600]">*</span>
                </label>
                <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                  artisticContextStatus.isOver ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  {artisticContextStatus.count} / {artisticContextStatus.max} palavras
                </span>
              </div>
              <textarea
                required
                rows={3}
                placeholder="Descreva o contexto no qual a produção foi concebida, local de atuação e relação com a segurança do paciente..."
                value={artisticCreationContext}
                onChange={(e) => setArtisticCreationContext(e.target.value)}
                className={`w-full p-3 rounded-xl border text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 ${
                  artisticContextStatus.isOver ? 'border-rose-400' : 'border-slate-200 focus:ring-[#EA7600]/20 focus:border-[#EA7600]'
                }`}
              />
            </div>

            {/* Campo de Texto para Cordel, Poesia ou Texto Literário */}
            {['Texto Literário', 'Cordel', 'Poesia'].includes(artisticCategory) && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[#001B44]">
                    Conteúdo do Texto / Cordel / Poesia <span className="text-slate-400 font-normal lowercase">(ou anexe arquivo abaixo)</span>
                  </label>
                  <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                    artisticTextStatus.isOver ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {artisticTextStatus.count} / {artisticTextStatus.max} palavras
                  </span>
                </div>
                <textarea
                  rows={5}
                  placeholder="Digite ou cole aqui os versos do cordel, poesia ou narrativa textual..."
                  value={artisticTextContent}
                  onChange={(e) => setArtisticTextContent(e.target.value)}
                  className={`w-full p-3 rounded-xl border text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 font-serif ${
                    artisticTextStatus.isOver ? 'border-rose-400' : 'border-slate-200 focus:ring-[#EA7600]/20'
                  }`}
                />
              </div>
            )}

            {/* Campo de Referências da Produção Artística (Item Obrigatório - Sem Limites de Palavras) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-[#001B44]">
                  Referências <span className="text-[#EA7600]">*</span>{' '}
                  <span className="text-slate-500 font-normal lowercase">(item obrigatório, sem limite de palavras)</span>
                </label>
                <span className="text-[11px] font-mono text-slate-500 font-semibold">
                  {countWords(artisticReferences)} palavras
                </span>
              </div>
              <textarea
                required
                rows={3}
                placeholder="Insira as referências conceituais, teóricas, artísticas ou bibliográficas que fundamentaram ou inspiraram a produção..."
                value={artisticReferences}
                onChange={(e) => setArtisticReferences(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EA7600]/20 focus:border-[#EA7600] font-mono"
              />
            </div>

            {/* Upload de Arquivo da Produção Artística (Permite PDF, Imagens JPG/PNG ou DOCX/PPTX) */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#001B44] block">
                Arquivo da Produção Artística (Item 7.7.e) <span className="text-[#EA7600]">*</span>
              </span>

              {artisticCategory === 'Fotografia' ? (
                <div>
                  <p className="text-xs text-slate-600 mb-2">
                    Fotografias podem ser enviadas em formato de imagem (<strong>JPG ou PNG</strong>, resolução mínima de 1080x1080 px) ou arquivo compilado em <strong>PDF</strong>.
                  </p>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <input
                      type="file"
                      id="file-artistic-photo"
                      accept="image/jpeg,image/png,image/jpg,.pdf,application/pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="file-artistic-photo"
                      className="px-4 py-2.5 rounded-xl bg-[#EA7600] hover:bg-[#D26500] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition"
                    >
                      <ImageIcon className="w-4 h-4" />
                      {attachedFile ? 'Substituir Arquivo' : 'Carregar Fotografia ou PDF (JPG, PNG ou PDF)'}
                    </label>

                    {attachedFile?.previewUrl && (
                      <div className="flex items-center gap-2 text-xs text-slate-700 bg-white p-2 rounded-lg border border-slate-200">
                        <img 
                          src={attachedFile.previewUrl} 
                          alt="Preview" 
                          className="w-12 h-12 object-cover rounded-md border border-slate-200 shrink-0" 
                        />
                        <div>
                          <span className="font-bold block truncate max-w-xs">{attachedFile.name}</span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {attachedFile.dimensions ? `${attachedFile.dimensions.width}x${attachedFile.dimensions.height} px • ` : ''}
                            {(attachedFile.size / 1024).toFixed(0)} KB
                          </span>
                        </div>
                      </div>
                    )}
                    {attachedFile && !attachedFile.previewUrl && (
                      <span className="text-xs text-slate-700 font-semibold bg-white p-2 rounded-lg border border-slate-200 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-[#EA7600]" />
                        {attachedFile.name} ({(attachedFile.size / 1024).toFixed(0)} KB)
                      </span>
                    )}
                  </div>

                  {photoError && (
                    <div className="mt-2 text-xs text-rose-600 font-semibold flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {photoError}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-xs text-slate-600 mb-2">
                    Anexe o arquivo em formato <strong>PDF</strong>, <strong>PPTX</strong> ou <strong>DOCX</strong> (apresentação visual, textos, cordéis, poesias ou registro).
                  </p>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      id="file-artistic-doc"
                      accept=".pdf,application/pdf,.docx,.doc,.pptx,.ppt,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-powerpoint"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="file-artistic-doc"
                      className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-[#001B44] bg-white hover:bg-slate-100 transition cursor-pointer flex items-center gap-2"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#EA7600]" />
                      {attachedFile ? 'Substituir Arquivo' : 'Carregar Arquivo (PDF, PPTX ou DOCX)'}
                    </label>
                    {attachedFile && (
                      <span className="text-xs text-slate-600 font-medium">
                        {attachedFile.name} ({(attachedFile.size / 1024).toFixed(0)} KB)
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Link Externo para Áudio e Vídeo */}
            <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200 space-y-2">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-[#3498FE]" />
                <label className="text-xs font-bold text-[#001B44] uppercase tracking-wider">
                  Link para outros tipos de arquivos (Áudio e Vídeo) <span className="text-slate-400 font-normal lowercase">(opcional)</span>
                </label>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Disponibilize o link de compartilhamento caso seu trabalho utilize arquivos de áudio (podcast, música, declamação) ou vídeo (filme, registro cênico, animação). Exemplo: link público ou de visualização do Google Drive, YouTube, Vimeo, Spotify, SoundCloud, etc.
              </p>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <ExternalLink className="w-4 h-4 text-[#EA7600]" />
                </div>
                <input
                  type="url"
                  placeholder="https://drive.google.com/... ou https://youtube.com/..."
                  value={mediaLink}
                  onChange={(e) => setMediaLink(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#3498FE]/20 focus:border-[#3498FE]"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* STEP 4: ACESSIBILIDADE E TERMOS DE ENVIO */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <span className="w-7 h-7 rounded-lg bg-[#001B44] text-white flex items-center justify-center text-xs font-extrabold">
            4
          </span>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-[#001B44]">
              Acessibilidade e Declaração de Autoria
            </h3>
            <p className="text-xs text-slate-500">
              Condições para a apresentação presencial no Auditório da Interne Soluções em Saúde (Recife/PE).
            </p>
          </div>
        </div>

        {/* Acessibilidade */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Necessidade de Acessibilidade no Local Presencial
          </label>
          <select
            value={accessibilityNeed}
            onChange={(e) => setAccessibilityNeed(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#3498FE]/20 focus:border-[#3498FE]"
          >
            {ACCESSIBILITY_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Declaração de Autoria e Termos */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-slate-300 text-[#EA7600] focus:ring-[#EA7600]"
            />
            <span className="text-xs text-slate-700 leading-relaxed">
              Declaro que as informações prestadas são verídicas, que o trabalho foi desenvolvido no âmbito da Rede SUS Recife entre 2025 e 2026, e que todos os/as autores/as listados participaram da sua elaboração, estando cientes das normas do Item 7 do Edital do I Fórum Municipal de Qualidade e Segurança do Paciente.
            </span>
          </label>
        </div>

        {/* Informações pós-envio e Botão de Submissão */}
        <div className="pt-2 space-y-4">
          {generalError && (
            <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-900 text-xs sm:text-sm flex items-start gap-3 shadow-xs animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <strong className="block text-rose-900 font-bold mb-0.5 text-sm">Não foi possível concluir a inscrição:</strong>
                <span>{generalError}</span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-600 max-w-md">
              <div className="flex items-center gap-1.5 font-bold text-emerald-700 mb-0.5">
                <Mail className="w-3.5 h-3.5" />
                Após o envio, os/as participantes receberão e-mail de confirmação.
              </div>
              <span>
                Um <strong>protocolo oficial de inscrição</strong> será emitido para impressão e acompanhamento no sistema.
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#EA7600] hover:bg-[#D26500] disabled:bg-slate-400 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{submittingStep || 'Registrando e Enviando Confirmação...'}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Inscrever Trabalho na Oficina
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};
