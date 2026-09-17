import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { EventVisualBanner } from './components/EventVisualBanner';
import { SubmissionForm } from './components/SubmissionForm';
import { SubmissionSuccess } from './components/SubmissionSuccess';
import { RulesEditalModal } from './components/RulesEditalModal';
import { ConsultSubmissionModal } from './components/ConsultSubmissionModal';
import { ProgramacaoModal } from './components/ProgramacaoModal';
import { Footer } from './components/Footer';
import { WorkSubmissionData } from './types';

const SUBMISSIONS_STORAGE_KEY = 'sesau_recife_forum_submissions_2026';

// Seed sample initial submissions to demonstrate axis distribution and consultation
const INITIAL_SAMPLE_SUBMISSIONS: WorkSubmissionData[] = [
  {
    id: 'sub_seed_1',
    protocolNumber: 'SUB-NMSPR-2026-E1-001',
    submittedAt: '2026-09-10T14:30:00.000Z',
    thematicAxis: 'EIXO_1',
    thematicAxisLabel: 'Eixo 1 – Segurança do Paciente e Gestão de Riscos nos Serviços de Saúde do Recife',
    modality: 'RELATO_EXPERIENCIA',
    title: 'Implantação da Notificação Ativa de Quase-Falhas na US 159 Policlínica Agamenon Magalhães',
    developmentPeriod: '2024',
    mainAuthor: {
      id: 'author_seed_1',
      fullName: 'Dra. Mariana Albuquerque Lima',
      cpf: '123.456.789-00',
      email: 'mariana.albuquerque@recife.pe.gov.br',
      phone: '(81) 98765-4321',
      sesauMatricula: '384912-1',
      professionalBackground: 'Enfermagem',
      roleOrFunction: 'Coordenadora do NSP',
      workLocation: 'US 159 POLICLINICA AGAMENON MAGALHAES',
      cnesUnit: 'US 159 POLICLINICA AGAMENON MAGALHAES',
      authorType: 'PROFISSIONAL_GESTOR',
      isMainAuthor: true
    },
    coAuthors: [
      {
        id: 'co_seed_1_1',
        fullName: 'Carlos Eduardo Mendes',
        cpf: '234.567.890-11',
        email: 'carlos.mendes@recife.pe.gov.br',
        phone: '(81) 99123-4567',
        sesauMatricula: '401293-2',
        professionalBackground: 'Medicina',
        roleOrFunction: 'Médico Clínico',
        workLocation: 'US 159 POLICLINICA AGAMENON MAGALHAES',
        cnesUnit: 'US 159 POLICLINICA AGAMENON MAGALHAES',
        authorType: 'PROFISSIONAL_GESTOR',
        isMainAuthor: false
      }
    ],
    experienceReport: {
      whatAndWhy: 'Implementamos a cultura de notificação anônima e sem caráter punitivo para eventos adversos e quase-falhas no ambulatório e emergência da policlínica.',
      howDeveloped: 'Realizamos oficinas mensais com as equipes multiprofissionais, fluxogramas de resposta rápida e painéis de monitoramento nos postos de enfermagem.',
      whatLearned: 'A adesão às notificações aumentou em 140% no primeiro semestre após a desmistificação do erro como falha processual e não individual.',
      challenges: 'Superar o receio inicial de punição e padronizar o preenchimento entre diferentes turnos.',
      likedAndDisliked: 'Destacou-se o engajamento dos técnicos; a infraestrutura física de informática ainda exige melhorias.',
      whatCanBeDone: 'Expandir o modelo de rondas de segurança para todas as salas de medicação e imunização.'
    },
    status: 'SUBMETIDO',
    slotOrder: 1,
    accessibilityNeed: 'Nenhuma'
  },
  {
    id: 'sub_seed_2',
    protocolNumber: 'SUB-NMSPR-2026-E2-002',
    submittedAt: '2026-09-12T09:15:00.000Z',
    thematicAxis: 'EIXO_2',
    thematicAxisLabel: 'Eixo 2 – Educação Permanente, Pesquisa e Inovação para Qualidade do Cuidado',
    modality: 'RELATO_EXPERIENCIA',
    title: 'Simulação Realística na Prevenção de Quedas Pediátricas no Hospital Helena Moura',
    developmentPeriod: '2025',
    mainAuthor: {
      id: 'author_seed_2',
      fullName: 'Beatriz Cristina Rocha',
      cpf: '345.678.901-22',
      email: 'beatriz.rocha@recife.pe.gov.br',
      phone: '(81) 98877-6655',
      sesauMatricula: '512048-3',
      professionalBackground: 'Fisioterapia',
      roleOrFunction: 'Preceptora de Residência em Saúde da Criança',
      workLocation: 'US 163 HOSPITAL DE PEDIATRIA HELENA MOURA',
      cnesUnit: 'US 163 HOSPITAL DE PEDIATRIA HELENA MOURA',
      authorType: 'PROFISSIONAL_GESTOR',
      isMainAuthor: true
    },
    coAuthors: [
      {
        id: 'co_seed_2_1',
        fullName: 'Lucas Vasconcelos de Melo',
        cpf: '456.789.012-33',
        email: 'lucas.melo@recife.pe.gov.br',
        phone: '(81) 97766-5544',
        sesauMatricula: '',
        professionalBackground: 'Enfermagem',
        roleOrFunction: 'Residente em Enfermagem Pediátrica',
        workLocation: 'US 163 HOSPITAL DE PEDIATRIA HELENA MOURA',
        cnesUnit: 'US 163 HOSPITAL DE PEDIATRIA HELENA MOURA',
        authorType: 'RESIDENTE',
        isMainAuthor: false
      }
    ],
    experienceReport: {
      whatAndWhy: 'Capacitação prática interprofissional sobre protocolos de prevenção de quedas e uso de pulseiras de identificação em leitos de pediatria.',
      howDeveloped: 'Criamos estações de simulação in situ com cenários reais de internação, envolvendo cuidadores, residentes e equipes de enfermagem.',
      whatLearned: 'O treinamento prático baseado em vivências acelerou a resposta das equipes e reduziu incidentes a zero no trimestre avaliado.',
      challenges: 'Conciliar horários de capacitação sem desfalcar as escalas assistenciais ativas.',
      likedAndDisliked: 'A receptividade das mães acompanhantes foi excepcional; o tempo de preparação dos bonecos foi desafiador.',
      whatCanBeDone: 'Criar um gibi ilustrado para distribuição às famílias no momento da admissão hospitalar.'
    },
    status: 'SUBMETIDO',
    slotOrder: 1,
    accessibilityNeed: 'Nenhuma'
  },
  {
    id: 'sub_seed_3',
    protocolNumber: 'SUB-NMSPR-2026-E3-003',
    submittedAt: '2026-09-14T16:45:00.000Z',
    thematicAxis: 'EIXO_3',
    thematicAxisLabel: 'Eixo 3 – Experiência do Paciente, Comunicação e Cuidado Centrado na Pessoa',
    modality: 'PRODUCAO_ARTISTICA',
    title: 'Cordel da Segurança: A Voz do Paciente no SUS do Recife',
    developmentPeriod: '2024',
    mainAuthor: {
      id: 'author_seed_3',
      fullName: 'Sebastião Vicente de Souza',
      cpf: '567.890.123-44',
      email: 'sebastiao.souza@recife.pe.gov.br',
      phone: '(81) 98111-2233',
      sesauMatricula: '298711-4',
      professionalBackground: 'Agente Comunitário de Saúde / Gestão',
      roleOrFunction: 'Membro do Conselho Local de Saúde',
      workLocation: 'US 128 POLICLINICA LESSA DE ANDRADE',
      cnesUnit: 'US 128 POLICLINICA LESSA DE ANDRADE',
      authorType: 'PROFISSIONAL_GESTOR',
      isMainAuthor: true
    },
    coAuthors: [],
    artisticProduction: {
      artisticCategory: 'Cordel',
      creationContext: 'Produzido em maio de 2024 nas salas de espera da Policlínica Lessa de Andrade para dialogar com os usuários sobre o direito de perguntar sobre sua medicação e identificação.',
      textContent: `No Recife dos manguezais,\nO cuidado tem valor,\nSegurança do paciente\nÉ dever do servidor,\nPerguntar não ofende,\nE protege com amor!\n\nSeja na Policlínica,\nNo posto ou no hospital,\nConferir o seu nome\nÉ o passo principal,\nPra que o SUS floresça\nCom respeito sem igual!`
    },
    status: 'SUBMETIDO',
    slotOrder: 1,
    accessibilityNeed: 'Nenhuma'
  }
];

export default function App() {
  const [submissions, setSubmissions] = useState<WorkSubmissionData[]>(INITIAL_SAMPLE_SUBMISSIONS);
  const [currentSubmission, setCurrentSubmission] = useState<WorkSubmissionData | null>(null);
  const [isConsultOpen, setIsConsultOpen] = useState(false);
  const [isProgramOpen, setIsProgramOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  // Load persistent submissions from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSubmissions(parsed);
        }
      } else {
        localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_SUBMISSIONS));
      }
    } catch (e) {
      console.warn('Não foi possível carregar as submissões locais:', e);
    }
  }, []);

  const handleSubmissionSubmit = (newSubmission: WorkSubmissionData) => {
    const updated = [newSubmission, ...submissions.filter((s) => s.id !== newSubmission.id)];
    setSubmissions(updated);
    setCurrentSubmission(newSubmission);
    try {
      localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Erro ao persistir submissão:', e);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSubmission = (sub: WorkSubmissionData) => {
    setCurrentSubmission(sub);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewSubmission = () => {
    setCurrentSubmission(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 selection:bg-[#EA7600] selection:text-white font-sans text-slate-800">
      {/* Institutional Header */}
      <Header
        onOpenConsult={() => setIsConsultOpen(true)}
        onOpenProgram={() => setIsProgramOpen(true)}
        onOpenRules={() => setIsRulesOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 sm:py-8">
        {/* Official Visual Banner based on provided image palette */}
        {!currentSubmission && (
          <EventVisualBanner
            onOpenProgram={() => setIsProgramOpen(true)}
            onOpenConsult={() => setIsConsultOpen(true)}
            onOpenRules={() => setIsRulesOpen(true)}
            submissionCount={submissions.length}
          />
        )}

        {currentSubmission ? (
          <SubmissionSuccess
            submission={currentSubmission}
            onNewSubmission={handleNewSubmission}
            onOpenConsult={() => setIsConsultOpen(true)}
          />
        ) : (
          <SubmissionForm
            onSubmit={handleSubmissionSubmit}
            onOpenRules={() => setIsRulesOpen(true)}
            existingSubmissions={submissions}
          />
        )}
      </main>

      {/* Modals */}
      <RulesEditalModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      <ConsultSubmissionModal
        isOpen={isConsultOpen}
        onClose={() => setIsConsultOpen(false)}
        submissions={submissions}
        onSelectSubmission={handleSelectSubmission}
      />

      <ProgramacaoModal
        isOpen={isProgramOpen}
        onClose={() => setIsProgramOpen(false)}
      />

      {/* Institutional Footer */}
      <Footer />
    </div>
  );
}

