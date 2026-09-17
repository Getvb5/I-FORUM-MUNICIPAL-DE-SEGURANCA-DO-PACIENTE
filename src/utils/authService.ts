import { AdminUser } from '../types';

const ADMIN_STORAGE_KEY = 'sesau_recife_forum_admin_auth';
const ADMIN_CREDENTIALS_KEY = 'sesau_recife_forum_admin_credentials';

export interface AdminCredential {
  email: string;
  passwordHash: string; // Stored as standard credential string
  user: AdminUser;
}

// Official authorized profiles for Recife Health Secretariat and Forum Committee
const DEFAULT_ACCOUNTS: AdminCredential[] = [
  {
    email: 'nsp.ggai@gmail.com',
    passwordHash: 'Sesau@2026',
    user: {
      id: 'usr_admin_nsp',
      name: 'NSP • GGAI (Recife)',
      email: 'nsp.ggai@gmail.com',
      role: 'COMISSAO_ORGANIZADORA',
      roleTitle: 'Núcleo de Segurança do Paciente • GGAI',
      organization: 'Secretaria de Saúde do Recife • SESAU',
      avatarInitials: 'NS'
    }
  },
  {
    email: 'getvb98@gmail.com',
    passwordHash: 'Sesau@2026',
    user: {
      id: 'usr_admin_getvb',
      name: 'Getúlio Batista',
      email: 'getvb98@gmail.com',
      role: 'COMISSAO_ORGANIZADORA',
      roleTitle: 'Comissão Organizadora do Fórum',
      organization: 'Secretaria de Saúde do Recife • SESAU',
      avatarInitials: 'GB'
    }
  },
  {
    email: 'getulio.batista@ufpe.br',
    passwordHash: 'Sesau@2026',
    user: {
      id: 'usr_admin_ufpe',
      name: 'Prof. Getúlio Batista',
      email: 'getulio.batista@ufpe.br',
      role: 'AVALIADOR_CIENTIFICO',
      roleTitle: 'Comissão Avaliadora Científica',
      organization: 'Universidade Federal de Pernambuco • UFPE',
      avatarInitials: 'UF'
    }
  }
];

export function getStoredCredentials(): AdminCredential[] {
  try {
    const stored = localStorage.getItem(ADMIN_CREDENTIALS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge with default accounts ensuring the 3 requested emails are always included
        const merged = [...DEFAULT_ACCOUNTS];
        parsed.forEach(item => {
          if (!merged.some(m => m.email.toLowerCase() === item.email.toLowerCase())) {
            merged.push(item);
          }
        });
        return merged;
      }
    }
  } catch (e) {
    console.warn('Erro ao carregar credenciais:', e);
  }
  return DEFAULT_ACCOUNTS;
}

export function getCurrentAdmin(): AdminUser | null {
  try {
    const stored = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as AdminUser;
    }
  } catch (e) {
    console.warn('Erro ao ler sessão de admin:', e);
  }
  return null;
}

export function loginAdmin(email: string, password: string): { success: boolean; user?: AdminUser; error?: string } {
  const cleanEmail = email.trim().toLowerCase();
  const credentials = getStoredCredentials();

  const found = credentials.find(
    c => c.email.toLowerCase() === cleanEmail && c.passwordHash === password
  );

  if (found) {
    try {
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(found.user));
    } catch (e) {
      console.warn('Erro ao salvar sessão de admin:', e);
    }
    return { success: true, user: found.user };
  }

  return { 
    success: false, 
    error: 'E-mail institucional ou senha incorretos. Verifique suas credenciais da comissão.' 
  };
}

export function logoutAdmin(): void {
  try {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
  } catch (e) {
    console.warn('Erro ao realizar logout:', e);
  }
}

export function isAuthenticated(): boolean {
  return getCurrentAdmin() !== null;
}

export const DEMO_ACCOUNTS = DEFAULT_ACCOUNTS;
