/**
 * Utilitários para contagem e validação de limites de palavras
 * conforme o Edital / Item 7 do I Fórum Municipal de Qualidade e Segurança do Paciente - Recife.
 */

export function countWords(text: string | undefined | null): number {
  if (!text) return 0;
  const trimmed = text.trim();
  if (!trimmed) return 0;
  // Divide por espaços em branco, quebras de linha e pontuações de separação
  return trimmed.split(/\s+/).filter(Boolean).length;
}

export function getWordCountStatus(text: string | undefined | null, maxWords: number) {
  const count = countWords(text);
  const isOver = count > maxWords;
  const remaining = Math.max(0, maxWords - count);
  return {
    count,
    max: maxWords,
    isOver,
    remaining,
    percentage: Math.min(100, Math.round((count / maxWords) * 100))
  };
}
