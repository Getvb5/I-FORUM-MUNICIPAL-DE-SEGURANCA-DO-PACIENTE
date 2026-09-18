import { ForumProgramItem, ThematicAxis } from '../types';

export const THEMATIC_AXES: ThematicAxis[] = [
  {
    id: 'EIXO_1',
    number: 1,
    title: 'Eixo 1 – Segurança do Paciente: Cultura, Gestão de Riscos e Prevenção de Eventos Adversos',
    description: 'Cultura de segurança, gestão de riscos assistenciais, notificação de incidentes, análise de causa raiz e gerenciamento de eventos adversos, incluindo prevenção de IRAS, erros de medicação, quedas, lesão por pressão e demais incidentes, com estratégias, protocolos e indicadores.',
    maxSlots: 10
  },
  {
    id: 'EIXO_2',
    number: 2,
    title: 'Eixo 2 – Integração do Cuidado, Condições Crônicas e Participação do Paciente',
    description: 'Continuidade e integração do cuidado entre níveis e pontos de atenção, e segurança no manejo de condições crônicas, com especial interesse no cuidado seguro às pessoas com DCNT (Campanha OMS 2026), além de comunicação efetiva, escuta ativa e participação do paciente e da família.',
    maxSlots: 10
  },
  {
    id: 'EIXO_3',
    number: 3,
    title: 'Eixo 3 – Educação Permanente para o Fortalecimento da Cultura de Segurança do Paciente e da Melhoria Contínua da Qualidade',
    description: 'Programas e estratégias de Educação Permanente voltados ao desenvolvimento de competências, à disseminação da cultura de segurança e à sustentação de processos de melhoria contínua.',
    maxSlots: 10
  }
];

export const SUBMISSION_RULES = {
  maxAuthorsPerWork: 8,
  maxWorksAsMainAuthor: 2,
  maxWorksAsCoAuthor: 5,
  slotsPerAxis: 10,
  totalSlots: 30,
  periodMinYear: 2025,
  periodMaxYear: 2026,
  officialTemplateUrl: 'https://drive.google.com/drive/folders/16zkWdZCD0aVKy7AbxmMM8pnQPej13NaO?usp=drive_link',
  artisticTemplateUrl: 'https://drive.google.com/drive/folders/1hpvywu3Mqx8GNBOlrWq6gOAwiY6hO4Js?usp=drive_link',
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
  title: 'Inscrição de Trabalhos na Oficina - I Fórum Municipal de Qualidade e Segurança do Paciente',
  fullTitle: 'Inscrição de Trabalhos na Oficina do I Fórum Municipal de Qualidade e Segurança do Paciente da Secretaria de Saúde do Recife',
  subtitle: 'Relatos de Experiência e Produções Artísticas na Rede SUS Recife (2025 a 2026)',
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
    time: '8h00 – 8h30',
    title: 'Credenciamento e acolhimento',
    category: 'Credenciamento'
  },
  {
    time: '8h30 – 9h00',
    title: 'Mesa de abertura e apresentação da Campanha Mundial da Segurança do Paciente 2026',
    category: 'Mesa de Abertura'
  },
  {
    time: '9h00 – 9h50',
    title: 'Palestra 1 (Atenção Básica): Condições crônicas e segurança do paciente: organização do cuidado contínuo, integrado e centrado na pessoa',
    category: 'Palestra 1'
  },
  {
    time: '9h50 – 10h10',
    title: 'Debate',
    category: 'Debate'
  },
  {
    time: '10h10 – 10h30',
    title: 'Intervalo',
    category: 'Intervalo'
  },
  {
    time: '10h30 – 11h20',
    title: 'Palestra 2 (Saúde da Pessoa Idosa): Envelhecimento com cuidado seguro: prevenção de eventos adversos no acompanhamento das condições crônicas',
    speaker: 'Bárbara Letícia de Castro Silva',
    role: 'Psicóloga, Especialista em Saúde da Família e em Psicologia Hospitalar e da Saúde. / Atualmente na Coordenação de Saúde da Pessoa Idosa do Recife',
    category: 'Palestra 2'
  },
  {
    time: '11h20 – 11h40',
    title: 'Debate',
    category: 'Debate'
  },
  {
    time: '12h00 – 13h00',
    title: 'Intervalo para almoço',
    category: 'Almoço'
  },
  {
    time: '13h00 – 13h40',
    title: 'Palestra 3 (Média e Alta Complexidade): Segurança do paciente com condições crônicas na atenção especializada e hospitalar: riscos, transições e continuidade do cuidado',
    category: 'Palestra 3'
  },
  {
    time: '13h40 – 14h00',
    title: 'Debate',
    category: 'Debate'
  },
  {
    time: '14h00 – 16h00',
    title: 'Oficina Formativa em Compartilhamento de Experiências Exitosas (3 salas simultâneas, uma por eixo)',
    category: 'Oficina Formativa'
  },
  {
    time: '16h00 – 16h30',
    title: 'Apuração das avaliações e preparação do encerramento',
    category: 'Apuração'
  },
  {
    time: '16h30 – 17h00',
    title: 'Encerramento e premiação',
    category: 'Encerramento e Premiação'
  }
];
