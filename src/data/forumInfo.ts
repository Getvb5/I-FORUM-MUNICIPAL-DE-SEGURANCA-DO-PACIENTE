import { ForumProgramItem, ThematicAxis } from '../types';

export const THEMATIC_AXES: ThematicAxis[] = [
  {
    id: 'EIXO_1',
    number: 1,
    title: 'Eixo 1 – Gestão da Qualidade, Cultura de Segurança e Notificação de Incidentes',
    description: 'Experiências focadas na estruturação de NSPs, protocolos municipais, cultura justa, gestão de riscos assistenciais e notificação/aprendizado com incidentes.',
    maxSlots: 12
  },
  {
    id: 'EIXO_2',
    number: 2,
    title: 'Eixo 2 – Boas Práticas Assistenciais e Segurança do Cuidado na Rede SUS Recife',
    description: 'Práticas seguras na Atenção Primária, Média e Alta Complexidade, maternidades, urgências/SAMU, segurança medicamentosa, cirúrgica e prevenção de infecções.',
    maxSlots: 12
  },
  {
    id: 'EIXO_3',
    number: 3,
    title: 'Eixo 3 – Formação, Integração Ensino-Serviço, Participação Social e Engajamento do Paciente',
    description: 'Iniciativas de educação permanente, residências em saúde, envolvimento comunitário, direitos do usuário e produções criativas/artísticas.',
    maxSlots: 12
  }
];

export const SUBMISSION_RULES = {
  maxAuthorsPerWork: 8,
  maxWorksAsMainAuthor: 2,
  maxWorksAsCoAuthor: 5,
  slotsPerAxis: 12,
  totalSlots: 36,
  periodMinYear: 2023,
  periodMaxYear: 2026,
  limits: {
    titleWords: 15,
    reportWhatWhyWords: 200,
    reportHowDevelopedWords: 300,
    reportWhatLearnedWords: 200,
    reportChallengesWords: 100,
    reportLikedDislikedWords: 100,
    reportWhatCanBeDoneWords: 100,
    reportTotalWords: 1000,
    artisticContextWords: 300,
    artisticTextWords: 1000,
    minPhotoResolution: '1080x1080'
  }
};

export const PROFESSIONAL_BACKGROUND_OPTIONS = [
  'Enfermagem (Enfermeiro/a, Técnico/a ou Auxiliar)',
  'Medicina',
  'Farmácia / Bioquímica',
  'Fisioterapia / Terapia Ocupacional',
  'Nutrição',
  'Psicologia',
  'Serviço Social',
  'Odontologia',
  'Fonoaudiologia',
  'Biomedicina / Análises Clínicas',
  'Saúde Coletiva / Sanitarista',
  'Gestão e Administração em Saúde',
  'Agente Comunitário de Saúde / ACE',
  'Estudante de Graduação em Saúde',
  'Outra Área da Saúde'
];

export const FORUM_INFO = {
  title: 'Submissão de Trabalhos na Oficina - I Fórum Municipal de Qualidade e Segurança do Paciente',
  fullTitle: 'Inscrição e Submissão de Trabalhos na Oficina do I Fórum Municipal de Qualidade e Segurança do Paciente da Secretaria de Saúde do Recife',
  subtitle: 'Relatos de Experiência e Produções Artísticas na Rede SUS Recife (2023 a 2026)',
  year: '2026',
  organizer: 'Núcleo Municipal de Segurança do Paciente do Recife (NMSPR) - SERMAC/SEAB',
  organizerShort: 'NMSPR / SERMAC / SEAB',
  partnership: 'Escola de Saúde do Recife (ESR), vinculada à Secretaria Executiva de Gestão do Trabalho e Educação na Saúde (SEGTES)',
  partnershipShort: 'ESR / SEGTES',
  city: 'Recife/PE',
  dates: '30 de setembro de 2026',
  dateFormatted: '30/09/2026',
  time: '08h00 às 17h00',
  location: 'Interne, Rua Marques Amorim, 356, Boa Vista, Recife/PE',
  locationVenue: 'Interne Educação e Saúde',
  locationAddress: 'Rua Marques Amorim, 356, Boa Vista, Recife/PE',
  modality: 'Presencial',
  hoursWorkload: '8 (oito) horas',
  hoursWorkloadNumber: 8,
  targetAudience: 'Trabalhadores/as da assistência e da gestão em saúde, profissionais residentes e estudantes de graduação na área da saúde, atuantes na Rede SUS Recife, em especial os Núcleos de Segurança do Paciente (NSP)',
  mapsUrl: 'https://maps.google.com/?q=Rua+Marques+Amorim,+356,+Boa+Vista,+Recife+-+PE',
};

export const TARGET_PROFILE_OPTIONS = [
  'Membro de Núcleo de Segurança do Paciente (NSP)',
  'Trabalhador(a) da Assistência em Saúde - Rede SUS Recife',
  'Trabalhador(a) da Gestão em Saúde - SESAU / Distritos / Unidades',
  'Profissional Residente (Residência Médica / Multiprofissional)',
  'Estudante de Graduação na área da saúde (com atuação/estágio na Rede SUS Recife)',
  'Docente / Preceptor(a) na Rede de Saúde',
  'Outro perfil profissional'
];

export const INSTITUTIONAL_OPTIONS = [
  'Núcleo de Segurança do Paciente (NSP) - Hospitalar / Atenção Básica',
  'SESAU Recife - Sede / Gestão Central (SERMAC / SEAB / SEGTES)',
  'Distrito Sanitário (DS I, II, III, IV, V, VI, VII ou VIII)',
  'Atenção Básica - Unidade de Saúde da Família (USF) / UBS',
  'Atenção Especializada - Policlínica Municipal (Recife)',
  'Hospital Municipal do Recife (HMR)',
  'Hospital da Mulher do Recife (HMR Dra. Mercês Pontes Cunha)',
  'Maternidade Municipal (Prof. Barros Lima, Bandeira Filho, Arnaldo Marques)',
  'Rede de Urgência e Emergência - SAMU 192 Recife',
  'Rede de Urgência e Emergência - UPA Municipal',
  'Centro de Atenção Psicossocial (CAPS Recife)',
  'Vigilância em Saúde / Vigilância Sanitária (VISA Recife)',
  'Escola de Saúde do Recife (ESR / SEGTES)',
  'Programa de Residência Médica ou Multiprofissional em Saúde',
  'Instituição de Ensino Superior conveniada (Estágio/Graduação)',
  'Rede Estadual de Saúde de Pernambuco (SES-PE)',
  'Hospital Universitário / EBSERH',
  'Rede Conveniada / Filantrópica / Suplementar',
  'Outro Vínculo Institucional'
];

export const CNES_HEALTH_UNITS = [
  'US 159 POLICLINICA AGAMENON MAGALHAES',
  'US 163 HOSPITAL DE PEDIATRIA HELENA MOURA',
  'US 169 POLICLINICA AMAURY COUTINHO',
  'US 164 CENTRO DE REIDRATACAO E URG PED M CRAVO GAMA',
  'US 165 MATERNIDADE BANDEIRA FILHO',
  'US 153 POLICLINICA E MATERNIDADE ARNALDO MARQUES',
  'US 167 POLICLINICA E MATERNIDADE PROFESSOR BARROS LIMA',
  'US 144 POLICLINICA CLEMENTINO FRAGA',
  'US 162 POLICLINICA ALBERT SABIN',
  'US 166 POLICLINICA CENTRO',
  'US 128 POLICLINICA LESSA DE ANDRADE',
  'US 160 POLICLINICA GOUVEIA DE BARROS',
  'US 376 POLICLINICA SALOMAO KELNER',
  'US 321 CENTRAL DE ALERGOLOGIA',
  'US 293 POLICLINICA DO PINA',
  'US 101 POLICLINICA PROF WALDEMAR DE OLIVEIRA',
  'US 217 CENTRO MEDICO SEN JOSE ERMIRIO DE MORAES',
  'US 180 CENTRAL DE REGULACAO MEDICA SAMU METROPOLITANO RECIFE',
  'US 143 LABORATORIO MUNICIPAL DO RECIFE e  NIVEL CENTRAL',
  'Outra Unidade de Saúde / Estabelecimento SUS Recife',
  'Não se aplica / Outro órgão ou instituição'
];

export const ACCESSIBILITY_OPTIONS = [
  'Nenhuma necessidade específica',
  'Acessibilidade física / Mobilidade reduzida (Cadeirante / Andador)',
  'Tradução e Interpretação em LIBRAS',
  'Assento reservado próximo ao palco (Baixa visão / Dificuldade auditiva)',
  'Material em fonte ampliada / Leitor de tela',
  'Outra necessidade específica'
];

export const FORUM_PROGRAM: ForumProgramItem[] = [
  {
    time: '08h00 - 08h45',
    title: 'Credenciamento Presencial, Recepção dos Participantes e Welcome Coffee',
    speaker: 'Comissão Organizadora NMSPR / ESR / SEGTES',
    role: 'Secretaria e Acolhimento',
    category: 'Abertura Oficial'
  },
  {
    time: '08h45 - 09h30',
    title: 'Mesa de Abertura Institucional: O Fortalecimento da Qualidade e Segurança do Paciente na Rede SUS Recife',
    speaker: 'SESAU, SERMAC, SEAB, SEGTES, ESR e Coordenação do NMSPR',
    role: 'Abertura Solene',
    category: 'Abertura Oficial'
  },
  {
    time: '09h30 - 10h45',
    title: 'Conferência Magna: Cultura de Segurança Justa e o Papel Estratégico dos Núcleos de Segurança do Paciente (NSP)',
    speaker: 'Especialista Convidado de Referência em Gestão da Qualidade e Segurança em Saúde',
    role: 'Palestrante Convidado',
    category: 'Conferência Magna'
  },
  {
    time: '11h00 - 12h30',
    title: 'Mesa Redonda: Integração da Gestão e Assistência — Práticas Seguras da Atenção Primária à Média e Alta Complexidade',
    speaker: 'Representantes dos Núcleos de Segurança do Paciente (NSP) da Atenção Básica, Policlínicas e Hospitais Municipais',
    role: 'Painelistas Técnicos',
    category: 'Mesa Redonda'
  },
  {
    time: '12h30 - 14h00',
    title: 'Intervalo de Almoço Livre',
    speaker: 'Todos os Participantes',
    role: 'Intervalo',
    category: 'Painel Temático'
  },
  {
    time: '14h00 - 15h30',
    title: 'Painel Interativo: Notificação de Incidentes, Gestão de Riscos e Aprendizado Contínuo sem Punição',
    speaker: 'Equipe Técnica NMSPR - SERMAC/SEAB e Vigilância Sanitária Municipal',
    role: 'Apresentação e Discussão Prática',
    category: 'Painel Temático'
  },
  {
    time: '15h30 - 16h45',
    title: 'Mesa Redonda: O Envolvimento do Residente, Estudante e Profissional da Ponta na Transformação do Cuidado Seguro',
    speaker: 'Comissão de Residência, Representantes dos Estudantes da Saúde e Equipes Assistenciais do SUS Recife',
    role: 'Debatedores',
    category: 'Mesa Redonda'
  },
  {
    time: '16h45 - 17h00',
    title: 'Pactuações Municipais, Encerramento e Orientações para Emissão de Certificado de 8 Horas',
    speaker: 'Núcleo Municipal de Segurança do Paciente (NMSPR) e Escola de Saúde do Recife (ESR)',
    role: 'Encerramento Oficial',
    category: 'Encerramento'
  }
];
