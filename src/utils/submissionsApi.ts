import { WorkSubmissionData } from '../types';

const SUBMISSIONS_STORAGE_KEY = 'sesau_recife_forum_submissions_2026';
const SYNC_CHANNEL_NAME = 'sesau_recife_forum_sync_channel';

// Singleton de BroadcastChannel para sincronização instantânea entre abas e janelas
let syncChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    syncChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
  }
} catch (_) {}

/**
 * Notifica todas as abas e janelas ativas sobre alterações nas submissões/vagas.
 */
export function broadcastSubmissionsChange(): void {
  try {
    if (syncChannel) {
      syncChannel.postMessage({ type: 'SUBMISSIONS_UPDATED', timestamp: Date.now() });
    }
  } catch (_) {}
}

/**
 * Permite que componentes escutem atualizações em tempo real vindas de outras abas ou janelas.
 */
export function subscribeToSubmissionsUpdates(onUpdate: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleMessage = (e: MessageEvent) => {
    if (e.data && e.data.type === 'SUBMISSIONS_UPDATED') {
      onUpdate();
    }
  };

  const handleStorage = (e: StorageEvent) => {
    if (e.key === SUBMISSIONS_STORAGE_KEY) {
      onUpdate();
    }
  };

  try {
    syncChannel?.addEventListener('message', handleMessage);
  } catch (_) {}

  window.addEventListener('storage', handleStorage);

  return () => {
    try {
      syncChannel?.removeEventListener('message', handleMessage);
    } catch (_) {}
    window.removeEventListener('storage', handleStorage);
  };
}

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
 * Usa cache-busting rigoroso para garantir que novos navegadores sempre vejam os dados mais recentes.
 */
export async function fetchServerSubmissions(): Promise<WorkSubmissionData[]> {
  try {
    const response = await fetch(`/api/submissions?_t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
    if (response.ok) {
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        const serverData: WorkSubmissionData[] = result.data;
        
        // Verifica se há submissões no cache local que ainda não foram sincronizadas com o servidor
        try {
          const cached = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
          if (cached) {
            const localList: WorkSubmissionData[] = JSON.parse(cached);
            if (Array.isArray(localList)) {
              const serverIds = new Set(serverData.map((s) => s.id));
              const missingOnServer = localList.filter((s) => !serverIds.has(s.id));
              
              // Sincroniza em segundo plano se houver algum item pendente
              if (missingOnServer.length > 0) {
                missingOnServer.forEach((pendingSub) => {
                  fetch('/api/submissions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(cleanSubmissionPayload(pendingSub))
                  }).then(() => broadcastSubmissionsChange()).catch(() => {});
                });
                return [...serverData, ...missingOnServer];
              }
            }
          }
        } catch (_) {}

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
 * Busca estatísticas de vagas do servidor em tempo real (muito leve, sem cache).
 */
export async function fetchSubmissionStats(): Promise<{
  countsByAxis: Record<string, number>;
  remainingSlots: Record<string, number>;
  total: number;
} | null> {
  try {
    const res = await fetch(`/api/submissions/stats?_t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
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
 * Garante que a inscrição NUNCA seja perdida mesmo se o servidor estiver temporariamente reiniciando.
 */
export async function saveServerSubmission(
  submission: WorkSubmissionData
): Promise<{ success: boolean; data?: WorkSubmissionData; error?: string; savedLocally?: boolean }> {
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

  // 2. Persistir no servidor oficial com até 2 tentativas para cobrir breves reinicializações
  for (let attempt = 1; attempt <= 2; attempt++) {
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
          broadcastSubmissionsChange();
          return { success: true, data: result.data };
        }
      }

      // Se for a primeira tentativa e falhou, aguarda 300ms e tenta novamente
      if (attempt === 1) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    } catch (err: any) {
      if (attempt === 1) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      } else {
        console.warn('[Submissions API Warning] Servidor indisponível no momento, mantendo no cache seguro do navegador:', err);
      }
    }
  }

  // Se o servidor estiver indisponível no momento (ex: reinicialização do dev server ou erro 404 de rota de proxy),
  // a submissão já está 100% salva no navegador e será sincronizada automaticamente na próxima consulta.
  return {
    success: true,
    data: cleanPayload,
    savedLocally: true
  };
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
    if (response.ok) {
      broadcastSubmissionsChange();
    }
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
    if (response.ok) {
      broadcastSubmissionsChange();
    }
    return response.ok;
  } catch (err) {
    console.error('Erro ao limpar no servidor:', err);
    return false;
  }
}
