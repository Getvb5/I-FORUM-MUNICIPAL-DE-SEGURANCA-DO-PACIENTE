export type AuthorType = 'PROFISSIONAL_GESTOR' | 'RESIDENTE' | 'ESTUDANTE';

export interface AuthorData {
  id: string;
  fullName: string;
  cpf: string;
  email: string;
  phone: string;
  sesauMatricula?: string;
  professionalBackground: string; // Formação profissional (ex: Enfermagem, Medicina, etc.)
  roleOrFunction: string; // Cargo ou função
  workLocation: string; // Local de atuação (serviço, gestão ou unidade de saúde, distrito sanitário etc.)
  cnesUnit?: string; // Unidade conforme CNES (se aplicável)
  authorType: AuthorType; // Tipo de participante para checagem de elegibilidade
  isMainAuthor: boolean;
}

export type SubmissionModality = 'RELATO_EXPERIENCIA' | 'PRODUCAO_ARTISTICA';

export type ThematicAxisId = 'EIXO_1' | 'EIXO_2' | 'EIXO_3';

export interface ThematicAxis {
  id: ThematicAxisId;
  number: number;
  title: string;
  description: string;
  maxSlots: number;
}

export interface ExperienceReportData {
  whatAndWhy: string; // até 200 palavras: O que foi realizado e por quê?
  howDeveloped: string; // até 300 palavras: Como foi desenvolvida a experiência?
  whatLearned: string; // até 200 palavras: O que você e a sua equipe aprenderam com essa experiência?
  challenges: string; // até 100 palavras: Que desafios foram encontrados para o seu desenvolvimento?
  likedAndDisliked: string; // até 100 palavras: O que você mais gostou e o que não gostou da experiência desenvolvida?
  whatCanBeDone: string; // até 100 palavras: Pensando no que você descreveu sobre a sua experiência, o que mais ainda pode ser feito?
}

export type ArtisticProductionType = 
  | 'Fotografia' 
  | 'Texto Literário' 
  | 'Cordel' 
  | 'Poesia' 
  | 'Outra manifestação artística';

export interface ArtisticProductionData {
  artisticCategory: ArtisticProductionType;
  customArtisticCategory?: string;
  creationContext: string; // até 300 palavras: Onde, quando e por que foi produzida
  textContent?: string; // até 1.000 palavras (para textos, cordéis e poesias)
}

export interface SubmissionAttachment {
  name: string;
  size: number;
  type: string;
  dataUrl?: string;
  previewUrl?: string;
  dimensions?: { width: number; height: number };
}

export interface WorkSubmissionData {
  id: string;
  protocolNumber: string;
  submittedAt: string;
  thematicAxis: ThematicAxisId;
  thematicAxisLabel: string;
  modality: SubmissionModality;
  title: string; // até 15 palavras
  developmentPeriod: string; // Desenvolvido entre 2023 e 2026
  mainAuthor: AuthorData;
  coAuthors: AuthorData[]; // até 7 coautores (total até 8 autores)
  experienceReport?: ExperienceReportData;
  artisticProduction?: ArtisticProductionData;
  attachedFile?: SubmissionAttachment;
  status: 'SUBMETIDO' | 'HOMOLOGADO';
  slotOrder: number;
  accessibilityNeed?: string;
}

// Retaining RegistrationData for backward compatibility
export interface RegistrationData {
  id: string;
  protocolNumber: string;
  fullName: string;
  cpf: string;
  email: string;
  institutionalLink: string;
  cnesUnit?: string;
  targetProfile?: string;
  institutionSpecific?: string;
  roleOrFunction?: string;
  phone?: string;
  accessibilityNeed: string;
  modality: string;
  registeredAt: string;
  status: 'CONFIRMADA' | 'PENDENTE';
}

export interface ForumProgramItem {
  time: string;
  title: string;
  speaker: string;
  role: string;
  category: 'Conferência Magna' | 'Mesa Redonda' | 'Painel Temático' | 'Abertura Oficial' | 'Encerramento';
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'COMISSAO_ORGANIZADORA' | 'AVALIADOR_CIENTIFICO' | 'GESTOR_SESAU';
  roleTitle: string;
  organization: string;
  avatarInitials: string;
}


