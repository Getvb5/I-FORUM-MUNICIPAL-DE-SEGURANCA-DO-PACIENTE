export function generateGoogleCalendarUrl(): string {
  const title = encodeURIComponent('I Fórum Municipal de Qualidade e Segurança do Paciente - Recife 2026');
  const details = encodeURIComponent(
    'I Fórum Municipal de Qualidade e Segurança do Paciente da Secretaria de Saúde do Recife\n\n' +
    '• Realização: Núcleo Municipal de Segurança do Paciente do Recife (NMSPR) - SERMAC/SEAB\n' +
    '• Parceria: Escola de Saúde do Recife (ESR), vinculada à Secretaria Executiva de Gestão do Trabalho e Educação na Saúde (SEGTES)\n' +
    '• Modalidade: Presencial\n' +
    '• Carga horária: 8 (oito) horas\n' +
    '• Local: Interne Soluções em Saúde, Rua Marquês Amorim, 356, Boa Vista, Recife/PE\n' +
    '• Público-alvo: Trabalhadores/as da assistência e da gestão em saúde, profissionais residentes e estudantes de graduação na área da saúde, atuantes na Rede SUS Recife, em especial os Núcleos de Segurança do Paciente (NSP).'
  );
  const location = encodeURIComponent('Interne Soluções em Saúde, Rua Marquês Amorim, 356, Boa Vista, Recife - PE, 50070-330');
  
  // Data: 30 de setembro de 2026 (08:00 às 17:00 Horário de Brasília: UTC-3)
  // 2026-09-30 08:00 BRT = 11:00 UTC
  // 2026-09-30 17:00 BRT = 20:00 UTC
  const dates = '20260930T110000Z/20260930T200000Z';

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
}

export function downloadIcsFile(): void {
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Secretaria de Saude do Recife//NMSPR - ESR - SEGTES//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:forum-qualidade-recife-2026@saude.recife.pe.gov.br',
    'DTSTAMP:20260916T120000Z',
    'DTSTART:20260930T110000Z',
    'DTEND:20260930T200000Z',
    'SUMMARY:I Fórum Municipal de Qualidade e Segurança do Paciente - Recife 2026',
    'DESCRIPTION:I Fórum Municipal de Qualidade e Segurança do Paciente da Secretaria de Saúde do Recife. Realização: NMSPR - SERMAC/SEAB. Parceria: ESR - SEGTES. Modalidade: Presencial (8h).',
    'LOCATION:Interne Soluções em Saúde, Rua Marquês Amorim, 356, Boa Vista, Recife/PE',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'Forum_Seguranca_Paciente_Recife_30Set2026.ics');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
