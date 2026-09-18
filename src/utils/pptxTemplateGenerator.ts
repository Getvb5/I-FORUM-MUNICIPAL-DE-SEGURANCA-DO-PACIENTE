import pptxgen from 'pptxgenjs';

/**
 * Gera o template oficial em PowerPoint (.pptx) para o Relato de Experiência
 * rigorosamente com os 14 slides definidos pela organização do:
 * "DIA MUNDIAL DA SEGURANÇA DO PACIENTE 2026"
 * I Fórum Municipal de Qualidade e Segurança do Paciente - SUS Recife
 */
export async function generateOfficialPptxTemplate(axisTitle?: string): Promise<void> {
  const pres = new pptxgen();

  // Widescreen 16:9 (10" x 5.625")
  pres.layout = 'LAYOUT_16x9';

  const COLOR_NAVY = '001B44';
  const COLOR_NAVY_LIGHT = '0A2D6C';
  const COLOR_ORANGE = 'EA7600';
  const COLOR_SKY = '3498FE';
  const COLOR_GRAY_DARK = '334155';
  const COLOR_GRAY_MUTED = '64748B';
  const COLOR_LIGHT_BG = 'F8FAFC';
  const COLOR_BORDER = 'CBD5E1';

  // Helper para adicionar rodapé padrão com numeração do slide
  const addStandardFooter = (slide: pptxgen.Slide, slideNum: number, isDark = false) => {
    slide.addText('Dia Mundial da Segurança do Paciente 2026 • I Fórum Municipal de Qualidade e Segurança do Paciente • SUS Recife', {
      x: 0.6,
      y: 5.25,
      w: 8.0,
      h: 0.3,
      fontSize: 8,
      fontFace: 'Arial',
      color: isDark ? '94A3B8' : COLOR_GRAY_MUTED,
      align: 'left'
    });

    // Número do Slide destacado
    slide.addShape(pres.ShapeType.ellipse, {
      x: 9.15,
      y: 5.15,
      w: 0.38,
      h: 0.38,
      fill: { color: isDark ? COLOR_ORANGE : COLOR_NAVY },
      line: { color: isDark ? 'FFFFFF' : COLOR_ORANGE, width: 1 }
    });

    slide.addText(`${slideNum}`, {
      x: 9.15,
      y: 5.15,
      w: 0.38,
      h: 0.38,
      fontSize: 9,
      fontFace: 'Arial',
      bold: true,
      color: 'FFFFFF',
      align: 'center',
      valign: 'middle'
    });
  };

  // Helper para cabeçalho institucional em slides de conteúdo claro
  const addStandardHeader = (slide: pptxgen.Slide, titleText: string, categoryTag = 'RELATO DE EXPERIÊNCIA • ANEXO A') => {
    slide.addShape(pres.ShapeType.rect, {
      x: 0,
      y: 0,
      w: '100%',
      h: 0.9,
      fill: { color: COLOR_NAVY }
    });

    slide.addText(categoryTag, {
      x: 0.6,
      y: 0.12,
      w: 8.8,
      h: 0.22,
      fontSize: 8,
      fontFace: 'Arial',
      bold: true,
      color: COLOR_ORANGE
    });

    slide.addText(titleText, {
      x: 0.6,
      y: 0.35,
      w: 8.8,
      h: 0.45,
      fontSize: 15,
      fontFace: 'Arial',
      bold: true,
      color: 'FFFFFF',
      valign: 'middle'
    });
  };

  // ==========================================
  // SLIDE 1: Capa Oficial do Dia Mundial
  // ==========================================
  const slide1 = pres.addSlide();
  slide1.background = { color: COLOR_NAVY };

  slide1.addShape(pres.ShapeType.rect, {
    x: 0.6,
    y: 0.5,
    w: 8.8,
    h: 0.08,
    fill: { color: COLOR_ORANGE }
  });

  slide1.addText('PREFEITURA DA CIDADE DO RECIFE • SECRETARIA DE SAÚDE • NMSPR', {
    x: 0.6,
    y: 0.7,
    w: 8.8,
    h: 0.3,
    fontSize: 10,
    fontFace: 'Arial',
    bold: true,
    color: COLOR_ORANGE
  });

  slide1.addText('DIA MUNDIAL DA SEGURANÇA DO PACIENTE 2026', {
    x: 0.6,
    y: 1.15,
    w: 8.8,
    h: 1.2,
    fontSize: 26,
    fontFace: 'Arial',
    bold: true,
    color: 'FFFFFF',
    align: 'left',
    valign: 'middle'
  });

  slide1.addShape(pres.ShapeType.roundRect, {
    x: 0.6,
    y: 2.5,
    w: 8.8,
    h: 1.5,
    fill: { color: COLOR_NAVY_LIGHT },
    line: { color: COLOR_SKY, width: 1.5 }
  });

  slide1.addText(
    'I Fórum Municipal de Qualidade e Segurança do Paciente\n' +
    'Oficina de Compartilhamento de Experiências da Rede SUS Recife',
    {
      x: 0.9,
      y: 2.65,
      w: 8.2,
      h: 0.7,
      fontSize: 14,
      fontFace: 'Arial',
      bold: true,
      color: 'FFFFFF',
      align: 'left'
    }
  );

  slide1.addText(
    `Eixo Temático: ${axisTitle || '[Selecione o Eixo 1, 2 ou 3]'}\n` +
    'Data de Realização: 16 de Abril de 2026 • Local: Auditório da Interne Educação',
    {
      x: 0.9,
      y: 3.35,
      w: 8.2,
      h: 0.55,
      fontSize: 11,
      fontFace: 'Arial',
      color: 'BAE6FD',
      align: 'left'
    }
  );

  addStandardFooter(slide1, 1, true);

  // ==========================================
  // SLIDE 2: Apresentação (Dados dos Autores)
  // ==========================================
  const slide2 = pres.addSlide();
  slide2.background = { color: 'FFFFFF' };
  addStandardHeader(slide2, 'Apresentação');

  // Box 1: Dados Pessoais
  slide2.addShape(pres.ShapeType.roundRect, {
    x: 0.6,
    y: 1.15,
    w: 8.8,
    h: 1.8,
    fill: { color: COLOR_LIGHT_BG },
    line: { color: COLOR_BORDER, width: 1 }
  });

  slide2.addText('Dados Pessoais dos/as Autores/as', {
    x: 0.9,
    y: 1.25,
    w: 8.2,
    h: 0.35,
    fontSize: 12,
    fontFace: 'Arial',
    bold: true,
    color: COLOR_NAVY
  });

  slide2.addText(
    '• Nome completo\n' +
    '• CPF\n' +
    '• E-mail e Telefone para contato\n' +
    '• Matrícula SESAU (quando houver vínculo com a Prefeitura do Recife)\n' +
    '• Formação profissional (ex.: Enfermagem, Medicina, Farmácia, Odontologia, etc.)',
    {
      x: 0.9,
      y: 1.65,
      w: 8.2,
      h: 1.2,
      fontSize: 11,
      fontFace: 'Arial',
      color: COLOR_GRAY_DARK
    }
  );

  // Box 2: Dados Institucionais
  slide2.addShape(pres.ShapeType.roundRect, {
    x: 0.6,
    y: 3.1,
    w: 8.8,
    h: 1.95,
    fill: { color: COLOR_LIGHT_BG },
    line: { color: COLOR_BORDER, width: 1 }
  });

  slide2.addText('Dados Institucionais', {
    x: 0.9,
    y: 3.2,
    w: 8.2,
    h: 0.35,
    fontSize: 12,
    fontFace: 'Arial',
    bold: true,
    color: COLOR_NAVY
  });

  slide2.addText(
    '• Cargo / Função desempenhada no serviço\n' +
    '• Local de atuação (serviço, gestão ou unidade de saúde da Rede Municipal, Distrito Sanitário etc.)\n' +
    '• Código/Nome da Unidade conforme Cadastro Nacional de Estabelecimentos de Saúde (CNES), quando aplicável\n' +
    '• Vínculo institucional (Rede Própria SESAU, Residência em Saúde ou Instituição de Ensino Superior)',
    {
      x: 0.9,
      y: 3.6,
      w: 8.2,
      h: 1.35,
      fontSize: 11,
      fontFace: 'Arial',
      color: COLOR_GRAY_DARK
    }
  );

  addStandardFooter(slide2, 2);

  // ==========================================
  // SLIDE 3: Relato de experiência (Transição)
  // ==========================================
  const slide3 = pres.addSlide();
  slide3.background = { color: COLOR_NAVY };

  slide3.addShape(pres.ShapeType.rect, {
    x: 0.6,
    y: 1.8,
    w: 1.2,
    h: 0.1,
    fill: { color: COLOR_ORANGE }
  });

  slide3.addText('OFICINA DE COMPARTILHAMENTO DE EXPERIÊNCIAS • ANEXO A', {
    x: 0.6,
    y: 2.05,
    w: 8.8,
    h: 0.3,
    fontSize: 11,
    fontFace: 'Arial',
    bold: true,
    color: COLOR_ORANGE
  });

  slide3.addText('Relato de\nexperiência', {
    x: 0.6,
    y: 2.4,
    w: 8.8,
    h: 1.8,
    fontSize: 40,
    fontFace: 'Arial',
    bold: true,
    color: 'FFFFFF',
    lineSpacing: 44
  });

  addStandardFooter(slide3, 3, true);

  // ==========================================
  // SLIDE 4: Título do Trabalho e Autores (Opção 1)
  // ==========================================
  const slide4 = pres.addSlide();
  slide4.background = { color: 'FFFFFF' };
  addStandardHeader(slide4, 'Identificação do Relato de Experiência');

  slide4.addShape(pres.ShapeType.roundRect, {
    x: 0.6,
    y: 1.15,
    w: 8.8,
    h: 1.5,
    fill: { color: COLOR_LIGHT_BG },
    line: { color: COLOR_ORANGE, width: 2 }
  });

  slide4.addText('Título do trabalho (até 15 palavras)', {
    x: 0.8,
    y: 1.25,
    w: 8.4,
    h: 0.3,
    fontSize: 10,
    fontFace: 'Arial',
    bold: true,
    color: COLOR_ORANGE
  });

  slide4.addText('[Insira aqui o Título Oficial do Relato de Experiência]', {
    x: 0.8,
    y: 1.6,
    w: 8.4,
    h: 0.9,
    fontSize: 17,
    fontFace: 'Arial',
    bold: true,
    color: COLOR_NAVY,
    align: 'center',
    valign: 'middle'
  });

  // Autoria
  slide4.addShape(pres.ShapeType.roundRect, {
    x: 0.6,
    y: 2.85,
    w: 8.8,
    h: 2.15,
    fill: { color: 'FFFFFF' },
    line: { color: COLOR_BORDER, width: 1 }
  });

  slide4.addText('Relação de Autores/as (até 08 autores/as):', {
    x: 0.8,
    y: 3.0,
    w: 8.4,
    h: 0.3,
    fontSize: 11,
    fontFace: 'Arial',
    bold: true,
    color: COLOR_NAVY
  });

  slide4.addText(
    'Primeiro Autor¹; Segundo Coautor²; Terceiro Coautor³; Quarto Coautor⁴; ' +
    'Quinto Coautor⁵; Sexto Coautor⁶; Sétimo Coautor⁷; Oitavo Coautor⁸',
    {
      x: 0.8,
      y: 3.35,
      w: 8.4,
      h: 0.65,
      fontSize: 12,
      fontFace: 'Arial',
      bold: true,
      color: COLOR_GRAY_DARK
    }
  );

  slide4.addText(
    '¹ Afiliação institucional do primeiro autor;\n' +
    '² Afiliação institucional do segundo Coautor;\n' +
    '³,⁴,⁵,⁶,⁷,⁸ Afiliação institucional dos Coautores (até 08 autores/as).',
    {
      x: 0.8,
      y: 4.05,
      w: 8.4,
      h: 0.85,
      fontSize: 10,
      fontFace: 'Arial',
      italic: true,
      color: COLOR_GRAY_MUTED
    }
  );

  addStandardFooter(slide4, 4);

  // ==========================================
  // SLIDE 5: Título do Trabalho e Autores (Opção 2 / Detalhamento)
  // ==========================================
  const slide5 = pres.addSlide();
  slide5.background = { color: 'FFFFFF' };
  addStandardHeader(slide5, 'Identificação do Relato de Experiência (Continuação)');

  slide5.addShape(pres.ShapeType.roundRect, {
    x: 0.6,
    y: 1.15,
    w: 8.8,
    h: 1.5,
    fill: { color: COLOR_LIGHT_BG },
    line: { color: COLOR_ORANGE, width: 2 }
  });

  slide5.addText('Título do trabalho (até 15 palavras)', {
    x: 0.8,
    y: 1.25,
    w: 8.4,
    h: 0.3,
    fontSize: 10,
    fontFace: 'Arial',
    bold: true,
    color: COLOR_ORANGE
  });

  slide5.addText('[Insira aqui o Título Oficial do Relato de Experiência]', {
    x: 0.8,
    y: 1.6,
    w: 8.4,
    h: 0.9,
    fontSize: 17,
    fontFace: 'Arial',
    bold: true,
    color: COLOR_NAVY,
    align: 'center',
    valign: 'middle'
  });

  // Autoria e Afiliação Expandida
  slide5.addShape(pres.ShapeType.roundRect, {
    x: 0.6,
    y: 2.85,
    w: 8.8,
    h: 2.15,
    fill: { color: 'FFFFFF' },
    line: { color: COLOR_BORDER, width: 1 }
  });

  slide5.addText('Relação de Autores/as e Afiliações Institucionais:', {
    x: 0.8,
    y: 3.0,
    w: 8.4,
    h: 0.3,
    fontSize: 11,
    fontFace: 'Arial',
    bold: true,
    color: COLOR_NAVY
  });

  slide5.addText(
    'Primeiro Autor¹; Segundo Coautor²; Terceiro Coautor³; Quarto Coautor⁴; ' +
    'Quinto Coautor⁵; Sexto Coautor⁶; Sétimo Coautor⁷; Oitavo Coautor⁸',
    {
      x: 0.8,
      y: 3.35,
      w: 8.4,
      h: 0.65,
      fontSize: 12,
      fontFace: 'Arial',
      bold: true,
      color: COLOR_GRAY_DARK
    }
  );

  slide5.addText(
    '¹ Afiliação institucional do primeiro autor;\n' +
    '² Afiliação institucional do segundo Coautor;\n' +
    '³,⁴,⁵,⁶,⁷,⁸ Afiliação institucional dos Coautores (até 08 autores/as).',
    {
      x: 0.8,
      y: 4.05,
      w: 8.4,
      h: 0.85,
      fontSize: 10,
      fontFace: 'Arial',
      italic: true,
      color: COLOR_GRAY_MUTED
    }
  );

  addStandardFooter(slide5, 5);

  // ==========================================
  // Helper para os slides de conteúdo (6 a 11)
  // ==========================================
  const addQuestionContentSlide = (
    slideNum: number,
    title: string,
    guidelineText: string,
    wordLimitTag: string,
    placeholderText: string
  ) => {
    const slide = pres.addSlide();
    slide.background = { color: 'FFFFFF' };
    addStandardHeader(slide, title);

    // Box com a orientação oficial do Edital (Anexo A)
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.6,
      y: 1.1,
      w: 8.8,
      h: 1.35,
      fill: { color: 'FFF7ED' }, // soft amber/orange
      line: { color: 'FDBA74', width: 1 }
    });

    slide.addText(`ORIENTAÇÃO DO EDITAL (ANEXO A) • LIMITE: ${wordLimitTag.toUpperCase()}`, {
      x: 0.8,
      y: 1.18,
      w: 8.4,
      h: 0.22,
      fontSize: 8.5,
      fontFace: 'Arial',
      bold: true,
      color: COLOR_ORANGE
    });

    slide.addText(guidelineText, {
      x: 0.8,
      y: 1.42,
      w: 8.4,
      h: 0.95,
      fontSize: 10.5,
      fontFace: 'Arial',
      color: COLOR_GRAY_DARK,
      lineSpacing: 14
    });

    // Box para inserção do conteúdo do autor
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.6,
      y: 2.6,
      w: 8.8,
      h: 2.45,
      fill: { color: COLOR_LIGHT_BG },
      line: { color: COLOR_BORDER, width: 1 }
    });

    slide.addText(
      placeholderText,
      {
        x: 0.9,
        y: 2.8,
        w: 8.2,
        h: 2.05,
        fontSize: 12,
        fontFace: 'Arial',
        color: COLOR_GRAY_MUTED,
        valign: 'top',
        lineSpacing: 18
      }
    );

    addStandardFooter(slide, slideNum);
  };

  // ==========================================
  // SLIDE 6: O que foi realizado e por quê?
  // ==========================================
  addQuestionContentSlide(
    6,
    'O que foi realizado e por quê?',
    'Informações iniciais sobre a experiência a ser comunicada. Deve ser breve e conter, no máximo, 200 palavras. ' +
    'O texto deverá contemplar uma breve apresentação sobre a atividade desenvolvida, o contexto geral do trabalho no âmbito da ' +
    'Qualidade e Segurança do Paciente e as justificativas de sua realização.',
    'Até 200 palavras',
    '[Clique aqui para inserir o texto da sua experiência: apresente a atividade desenvolvida, o contexto da unidade de saúde na Rede SUS Recife, a justificativa e os objetivos principais...]'
  );

  // ==========================================
  // SLIDE 7: Como foi desenvolvida a experiência?
  // ==========================================
  addQuestionContentSlide(
    7,
    'Como foi desenvolvida a experiência?',
    'Deve-se indicar a forma como o trabalho foi realizado (metodologia), de modo a atingir os objetivos propostos em termos de ' +
    'segurança do paciente ou melhoria da qualidade assistencial. A descrição deve ser concisa, mas suficientemente clara, para que o ' +
    'leitor entenda e possa aplicar os procedimentos utilizados em outros contextos semelhantes. Não deve exceder 300 palavras.',
    'Até 300 palavras',
    '[Clique aqui para inserir a metodologia da experiência: detalhe o planejamento, as etapas de execução, estratégias adotadas, ferramentas da qualidade e como os procedimentos podem ser aplicados...]'
  );

  // ==========================================
  // SLIDE 8: O que você e sua equipe aprenderam com essa experiência?
  // ==========================================
  addQuestionContentSlide(
    8,
    'O que você e sua equipe aprenderam com essa experiência?',
    'Indicar de forma sucinta os principais aprendizados obtidos com a experiência, destacando mudanças de prática, impactos na cultura ' +
    'de segurança ou na qualidade do cuidado. Até 200 palavras.',
    'Até 200 palavras',
    '[Clique aqui para inserir os aprendizados da equipe: mudanças observadas na prática profissional, fortalecimento da cultura de segurança e melhorias na qualidade da assistência aos usuários...]'
  );

  // ==========================================
  // SLIDE 9: Quais os desafios encontrados para o seu desenvolvimento?
  // ==========================================
  addQuestionContentSlide(
    9,
    'Quais os desafios encontrados para o seu desenvolvimento?',
    'Nesta seção, os autores devem apresentar os principais desafios e limitações enfrentadas na realização da experiência, ' +
    'sinalizando as medidas tomadas para a sua superação. Não exceder 100 palavras.',
    'Até 100 palavras',
    '[Clique aqui para apresentar os desafios e limitações enfrentados durante a implementação e as medidas adotadas pela equipe para superá-los...]'
  );

  // ==========================================
  // SLIDE 10: O que você mais gostou e o que você não gostou da experiência desenvolvida?
  // ==========================================
  addQuestionContentSlide(
    10,
    'O que você mais gostou e o que não gostou da experiência?',
    'Incluir uma apreciação pessoal/coletiva acerca do trabalho desenvolvido, destacando seus aspectos positivos e negativos. ' +
    'Não deve exceder 100 palavras.',
    'Até 100 palavras',
    '[Clique aqui para inserir a apreciação crítica: o que a equipe mais gostou (pontos fortes e satisfatórios) e o que não gostou (dificuldades e aspectos a aprimorar)...]'
  );

  // ==========================================
  // SLIDE 11: Pensando no que você escreveu sobre sua experiência, o que mais ainda pode ser feito?
  // ==========================================
  addQuestionContentSlide(
    11,
    'O que mais ainda pode ser feito?',
    'Pensando no que você escreveu sobre sua experiência, o que mais ainda pode ser feito? Indicar possíveis desdobramentos da ' +
    'experiência desenvolvida, incluindo possibilidades de continuidade, expansão e propostas para sua readequação ou replicação em outros ' +
    'serviços da Rede de Atenção à Saúde. Até 100 palavras.',
    'Até 100 palavras',
    '[Clique aqui para indicar propostas de continuidade, expansão, sustentabilidade da ação e possibilidades de replicação em outras unidades de saúde da Rede SUS Recife...]'
  );

  // ==========================================
  // SLIDE 12: Referências
  // ==========================================
  const slide12 = pres.addSlide();
  slide12.background = { color: 'FFFFFF' };
  addStandardHeader(slide12, 'Referências');

  slide12.addShape(pres.ShapeType.roundRect, {
    x: 0.6,
    y: 1.1,
    w: 8.8,
    h: 1.45,
    fill: { color: 'FFF7ED' },
    line: { color: 'FDBA74', width: 1 }
  });

  slide12.addText('NORMAS PARA REFERÊNCIAS (ITEM OBRIGATÓRIO • SEM LIMITE DE PALAVRAS)', {
    x: 0.8,
    y: 1.18,
    w: 8.4,
    h: 0.22,
    fontSize: 8.5,
    fontFace: 'Arial',
    bold: true,
    color: COLOR_ORANGE
  });

  slide12.addText(
    'Não há limite de palavras ou quantitativo mínimo e/ou máximo de referências. Devem ser listados os trabalhos mencionados ' +
    'no texto deste Relato, em ordem alfabética do sobrenome pelo primeiro autor. Dois ou mais autores: separar por ponto e vírgula. ' +
    'Os títulos dos periódicos não devem ser abreviados. A ordem dos itens em cada referência deve obedecer às normas vigentes da ' +
    'Associação Brasileira de Normas Técnicas (ABNT).',
    {
      x: 0.8,
      y: 1.42,
      w: 8.4,
      h: 1.05,
      fontSize: 10,
      fontFace: 'Arial',
      color: COLOR_GRAY_DARK,
      lineSpacing: 13
    }
  );

  slide12.addShape(pres.ShapeType.roundRect, {
    x: 0.6,
    y: 2.7,
    w: 8.8,
    h: 2.35,
    fill: { color: COLOR_LIGHT_BG },
    line: { color: COLOR_BORDER, width: 1 }
  });

  slide12.addText(
    '[Insira aqui as referências bibliográficas, legislações, protocolos da OMS/ANVISA ou manuais do Ministério da Saúde utilizados, ' +
    'em ordem alfabética e formatados pelas normas da ABNT...]',
    {
      x: 0.9,
      y: 2.9,
      w: 8.2,
      h: 1.95,
      fontSize: 11,
      fontFace: 'Arial',
      color: COLOR_GRAY_MUTED,
      valign: 'top',
      lineSpacing: 16
    }
  );

  addStandardFooter(slide12, 12);

  // ==========================================
  // SLIDE 13: Obrigado!
  // ==========================================
  const slide13 = pres.addSlide();
  slide13.background = { color: COLOR_NAVY };

  slide13.addText('DIA MUNDIAL DA SEGURANÇA DO PACIENTE 2026', {
    x: 0.6,
    y: 1.2,
    w: 8.8,
    h: 0.35,
    fontSize: 12,
    fontFace: 'Arial',
    bold: true,
    color: COLOR_ORANGE,
    align: 'center'
  });

  slide13.addText('Obrigado!', {
    x: 0.6,
    y: 1.65,
    w: 8.8,
    h: 1.2,
    fontSize: 48,
    fontFace: 'Arial',
    bold: true,
    color: 'FFFFFF',
    align: 'center'
  });

  slide13.addShape(pres.ShapeType.roundRect, {
    x: 1.5,
    y: 3.1,
    w: 7.0,
    h: 1.7,
    fill: { color: COLOR_NAVY_LIGHT },
    line: { color: COLOR_SKY, width: 1 }
  });

  slide13.addText(
    'I Fórum Municipal de Qualidade e Segurança do Paciente • SUS Recife\n' +
    'Secretaria de Saúde da Cidade do Recife • NMSPR\n\n' +
    'E-mail dos/as Autores/as: [inserir e-mail institucional para contato]\n' +
    'E-mail da Organização: nsp.ggai@gmail.com',
    {
      x: 1.8,
      y: 3.25,
      w: 6.4,
      h: 1.4,
      fontSize: 11,
      fontFace: 'Arial',
      color: 'E2E8F0',
      align: 'center',
      lineSpacing: 16
    }
  );

  addStandardFooter(slide13, 13, true);

  // ==========================================
  // SLIDE 14: Obrigada!
  // ==========================================
  const slide14 = pres.addSlide();
  slide14.background = { color: COLOR_NAVY };

  slide14.addText('DIA MUNDIAL DA SEGURANÇA DO PACIENTE 2026', {
    x: 0.6,
    y: 1.2,
    w: 8.8,
    h: 0.35,
    fontSize: 12,
    fontFace: 'Arial',
    bold: true,
    color: COLOR_ORANGE,
    align: 'center'
  });

  slide14.addText('Obrigada!', {
    x: 0.6,
    y: 1.65,
    w: 8.8,
    h: 1.2,
    fontSize: 48,
    fontFace: 'Arial',
    bold: true,
    color: 'FFFFFF',
    align: 'center'
  });

  slide14.addShape(pres.ShapeType.roundRect, {
    x: 1.5,
    y: 3.1,
    w: 7.0,
    h: 1.7,
    fill: { color: COLOR_NAVY_LIGHT },
    line: { color: COLOR_SKY, width: 1 }
  });

  slide14.addText(
    'I Fórum Municipal de Qualidade e Segurança do Paciente • SUS Recife\n' +
    'Secretaria de Saúde da Cidade do Recife • NMSPR\n\n' +
    'E-mail dos/as Autores/as: [inserir e-mail institucional para contato]\n' +
    'E-mail da Organização: nsp.ggai@gmail.com',
    {
      x: 1.8,
      y: 3.25,
      w: 6.4,
      h: 1.4,
      fontSize: 11,
      fontFace: 'Arial',
      color: 'E2E8F0',
      align: 'center',
      lineSpacing: 16
    }
  );

  addStandardFooter(slide14, 14, true);

  // Download do arquivo com nome oficial
  await pres.writeFile({ 
    fileName: 'Modelo_Oficial_Relato_Experiencia_Dia_Mundial_Seguranca_Paciente_2026.pptx' 
  });
}
