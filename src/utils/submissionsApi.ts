import { WorkSubmissionData } from '../types';

const SUBMISSIONS_STORAGE_KEY = 'sesau_recife_forum_submissions_2026';

/**
 * Remove buffers pesados de base64 (dataUrl) do localStorage para não estourar a cota de 5MB do navegador.
 */
function sanitizeForLocalStorage(list: WorkSubmissionData[]): WorkSubmissionData[] {
  return list.map((item) => {
    if (item.attachedFile && item.attachedFile.dataUrl && item.attachedFile.dataUrl.length > 100000) {
      return {
        ...item,
        attachedFile: {
          name: item.attachedFile.name,
          size: item.attachedFile.size,
          type: item.attachedFile.type,
          dimensions: item.attachedFile.dimensions
        }
      };
    }
    return item;
  });
}

/**
 * Busca todas as submissões no servidor (fonte oficial da verdade).
 * Caso o servidor esteja temporariamente inacessível, recorre ao cache do localStorage.
 */
export async function fetchServerSubmissions(): Promise<WorkSubmissionData[]> {
  try {
    const response = await fetch('/api/submissions');
    if (response.ok) {
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        const serverData: WorkSubmissionData[] = result.data;
        // Atualiza cache local de forma leve
        try {
          localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(sanitizeForLocalStorage(serverData)));
        } catch (e) {
          console.warn('Falha ao atualizar cache local:', e);
        }
        return serverData;
      }
    }
  } catch (err) {
    console.warn('[Submissions API] Não foi possível obter submissões do servidor, usando cache:', err);
  }

  // Fallback para cache local se offline
  try {
    const cached = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Erro ao ler cache local:', e);
  }

  return [];
}

/**
 * Busca estatísticas de vagas do servidor em tempo real (muito leve e instantâneo).
 */
export async function fetchSubmissionStats(): Promise<{
  countsByAxis: Record<string, number>;
  remainingSlots: Record<string, number>;
  total: number;
} | null> {
  try {
    const res = await fetch('/api/submissions/stats');
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        return {
          countsByAxis: data.countsByAxis,
          remainingSlots: data.remainingSlots,
          total: data.total
        };
      }
    }
  } catch (e) {
    console.warn('[Submissions API] Falha ao consultar stats:', e);
  }
  return null;
}

/**
 * Cria uma versão ultraleve da submissão para transmissão pela rede e persistência no servidor.
 * Remove buffers brutos gigantescos de anexos (PDFs/PPTs de 10MB+) mantendo nome, tamanho, tipo e metadados.
 */
export function cleanSubmissionPayload(sub: WorkSubmissionData): WorkSubmissionData {
  return {
    ...sub,
    attachedFile: sub.attachedFile
      ? {
          name: sub.attachedFile.name,
          size: sub.attachedFile.size,
          type: sub.attachedFile.type,
          dimensions: sub.attachedFile.dimensions,
          previewUrl: (sub.attachedFile.previewUrl && sub.attachedFile.previewUrl.length < 100000) 
            ? sub.attachedFile.previewUrl 
            : undefined
        }
      : undefined
  };
}

/**
 * Salva a submissão de forma persistente no servidor e no cache local.
 */
export async function saveServerSubmission(
  submission: WorkSubmissionData
): Promise<{ success: boolean; data?: WorkSubmissionData; error?: string }> {
  const cleanPayload = cleanSubmissionPayload(submission);

  // 1. Atualizar cache local imediatamente para feedback instantâneo (sanitizado)
  try {
    const cached = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
    const list: WorkSubmissionData[] = cached ? JSON.parse(cached) : [];
    const updated = [cleanPayload, ...list.filter((s) => s.id !== cleanPayload.id)];
    localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Aviso ao salvar no cache local:', e);
  }

  // 2. Persistir no servidor oficial de forma ultraleve e confiável
  try {
    const response = await fetch('/api/submissions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cleanPayload)
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        return { success: true, data: result.data };
      }
      return { success: false, error: result.error || 'Erro retornado pelo servidor.' };
    }
    return { success: false, error: `Erro HTTP ${response.status} ao salvar no servidor.` };
  } catch (err: any) {
    console.error('[Submissions API Error] Falha de rede ao persistir:', err);
    return { success: false, error: err?.message || 'Falha de conexão com o servidor.' };
  }
}

/**
 * Exclui a submissão no servidor e no cache local.
 */
export async function deleteServerSubmission(id: string): Promise<boolean> {
  try {
    const cached = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
    if (cached) {
      const list: WorkSubmissionData[] = JSON.parse(cached);
      const updated = list.filter((s) => s.id !== id);
      localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(updated));
    }
  } catch (e) {
    console.warn('Erro ao atualizar cache após exclusão:', e);
  }

  try {
    const response = await fetch(`/api/submissions/${id}`, {
      method: 'DELETE'
    });
    return response.ok;
  } catch (err) {
    console.error('Erro ao excluir no servidor:', err);
    return false;
  }
}

/**
 * Limpa todas as submissões no servidor e no cache local.
 */
export async function clearAllServerSubmissions(): Promise<boolean> {
  try {
    localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify([]));
    localStorage.removeItem('nmspr_submission_email_logs_v1');
  } catch (e) {
    console.warn('Erro ao limpar cache local:', e);
  }

  try {
    const response = await fetch('/api/submissions', {
      method: 'DELETE'
    });
    return response.ok;
  } catch (err) {
    console.error('Erro ao limpar no servidor:', err);
    return false;
  }
}
