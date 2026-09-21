import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { EventVisualBanner } from './components/EventVisualBanner';
import { SubmissionForm } from './components/SubmissionForm';
import { SubmissionSuccess } from './components/SubmissionSuccess';
import { SubmissionsDashboard } from './components/SubmissionsDashboard';
import { AdminLoginModal } from './components/AdminLoginModal';
import { RulesEditalModal } from './components/RulesEditalModal';
import { ConsultSubmissionModal } from './components/ConsultSubmissionModal';
import { ProgramacaoModal } from './components/ProgramacaoModal';
import { EmailSettingsModal } from './components/EmailSettingsModal';
import { Footer } from './components/Footer';
import { WorkSubmissionData, AdminUser } from './types';
import { getCurrentAdmin, logoutAdmin } from './utils/authService';
import {
  fetchServerSubmissions,
  saveServerSubmission,
  deleteServerSubmission,
  clearAllServerSubmissions,
  subscribeToSubmissionsUpdates
} from './utils/submissionsApi';
import { FileEdit, FolderKanban, PlusCircle, Lock, ShieldAlert, Search, Mail } from 'lucide-react';

export default function App() {
  const [submissions, setSubmissions] = useState<WorkSubmissionData[]>([]);
  const [currentSubmission, setCurrentSubmission] = useState<WorkSubmissionData | null>(null);
  const [activeView, setActiveView] = useState<'FORM' | 'DASHBOARD'>('FORM');
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(getCurrentAdmin());
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isConsultOpen, setIsConsultOpen] = useState(false);
  const [isEmailSettingsOpen, setIsEmailSettingsOpen] = useState(false);
  const [isProgramOpen, setIsProgramOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  // Sincronizar submissões em tempo real com o servidor oficial
  useEffect(() => {
    let isMounted = true;

    const loadSubmissions = async () => {
      try {
        const data = await fetchServerSubmissions();
        if (isMounted && Array.isArray(data)) {
          setSubmissions(data);
        }
      } catch (e) {
        console.warn('Erro ao sincronizar com servidor:', e);
      }
    };

    loadSubmissions();

    // Sincronização instantânea entre abas e janelas (BroadcastChannel)
    const unsubscribe = subscribeToSubmissionsUpdates(loadSubmissions);

    // Atualização periódica para sincronizar com múltiplos navegadores em tempo real (a cada 3s)
    const interval = setInterval(loadSubmissions, 3000);

    // Atualização imediata ao focar na janela/aba
    const handleFocus = () => loadSubmissions();
    window.addEventListener('focus', handleFocus);

    return () => {
      isMounted = false;
      unsubscribe();
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleClearAllSubmissions = async () => {
    setSubmissions([]);
    setCurrentSubmission(null);
    try {
      await clearAllServerSubmissions();
    } catch (e) {
      console.warn('Erro ao limpar dados no servidor:', e);
    }
  };

  const handleDeleteSubmission = async (id: string) => {
    const updated = submissions.filter((s) => s.id !== id);
    setSubmissions(updated);
    if (currentSubmission?.id === id) {
      setCurrentSubmission(null);
    }
    try {
      await deleteServerSubmission(id);
    } catch (e) {
      console.warn('Erro ao excluir trabalho no servidor:', e);
    }
  };

  const handleSubmissionSubmit = async (newSubmission: WorkSubmissionData) => {
    const updated = [newSubmission, ...submissions.filter((s) => s.id !== newSubmission.id)];
    setSubmissions(updated);
    setCurrentSubmission(newSubmission);
    try {
      await saveServerSubmission(newSubmission);
    } catch (e) {
      console.warn('Erro ao persistir submissão no servidor:', e);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSubmission = (sub: WorkSubmissionData) => {
    setCurrentSubmission(sub);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewSubmission = () => {
    setCurrentSubmission(null);
    setActiveView('FORM');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenDashboard = () => {
    if (!currentAdmin) {
      setIsAdminLoginOpen(true);
      return;
    }
    setCurrentSubmission(null);
    setActiveView('DASHBOARD');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (user: AdminUser) => {
    setCurrentAdmin(user);
    setCurrentSubmission(null);
    setActiveView('DASHBOARD');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    logoutAdmin();
    setCurrentAdmin(null);
    setActiveView('FORM');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 selection:bg-[#EA7600] selection:text-white font-sans text-slate-800">
      {/* Institutional Header */}
      <Header
        onOpenConsult={() => setIsConsultOpen(true)}
        onOpenProgram={() => setIsProgramOpen(true)}
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenDashboard={handleOpenDashboard}
        onOpenLogin={() => setIsAdminLoginOpen(true)}
        onLogout={handleLogout}
        currentAdmin={currentAdmin}
        submissionCount={submissions.length}
        activeView={activeView}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 sm:py-8">
        {/* Official Visual Banner based on provided image palette */}
        {!currentSubmission && (
          <EventVisualBanner
            onOpenProgram={() => setIsProgramOpen(true)}
            onOpenConsult={() => setIsConsultOpen(true)}
            onOpenRules={() => setIsRulesOpen(true)}
            onOpenDashboard={handleOpenDashboard}
            submissionCount={submissions.length}
            isAdminLoggedIn={currentAdmin !== null}
          />
        )}

        {/* View Switcher Tabs (Only visible when not viewing single success receipt) */}
        {!currentSubmission && (
          <div className="bg-white rounded-2xl border border-slate-200 p-1.5 shadow-2xs mb-6 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-1">
              <button
                type="button"
                onClick={() => setActiveView('FORM')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeView === 'FORM'
                    ? 'bg-[#001B44] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <FileEdit className="w-4 h-4 text-[#EA7600]" />
                <span>Formulário de Inscrição</span>
              </button>

              <button
                type="button"
                onClick={handleOpenDashboard}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeView === 'DASHBOARD'
                    ? 'bg-[#001B44] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {currentAdmin ? (
                  <>
                    <FolderKanban className="w-4 h-4 text-[#3498FE]" />
                    <span>Trabalhos Inscritos</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      activeView === 'DASHBOARD' ? 'bg-[#EA7600] text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {submissions.length}
                    </span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-amber-500" />
                    <span>Trabalhos Inscritos (Acesso Restrito)</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center gap-2 pr-1">
              <button
                type="button"
                onClick={() => setIsConsultOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-[#EA7600] text-[#EA7600] hover:text-white border border-[#EA7600]/30 text-xs font-bold transition cursor-pointer shadow-2xs"
                title="Consultar comprovante por protocolo ou CPF"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Consultar Inscrição</span>
              </button>

              <button
                type="button"
                onClick={() => setIsEmailSettingsOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-[#001B44] text-[#001B44] hover:text-white border border-sky-200 text-xs font-bold transition cursor-pointer shadow-2xs"
                title="Configurar envio automático de e-mails para qualquer endereço (Gmail SMTP)"
              >
                <Mail className="w-3.5 h-3.5 text-[#3498FE]" />
                <span className="hidden sm:inline">Configurar E-mails</span>
                <span className="sm:hidden">E-mails</span>
              </button>

              {currentAdmin && (
                <span className="hidden sm:flex text-emerald-700 font-bold items-center gap-1 text-[11px] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  {currentAdmin.name}
                </span>
              )}
            </div>
          </div>
        )}

        {currentSubmission ? (
          <SubmissionSuccess
            submission={currentSubmission}
            onNewSubmission={handleNewSubmission}
            onOpenConsult={() => setIsConsultOpen(true)}
          />
        ) : activeView === 'DASHBOARD' ? (
          currentAdmin ? (
            <SubmissionsDashboard
              submissions={submissions}
              onSelectSubmission={handleSelectSubmission}
              onNewSubmission={handleNewSubmission}
              currentAdmin={currentAdmin}
              onLogout={handleLogout}
              onClearAllSubmissions={handleClearAllSubmissions}
              onDeleteSubmission={handleDeleteSubmission}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center space-y-4 max-w-lg mx-auto shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 mx-auto flex items-center justify-center">
                <ShieldAlert className="w-8 h-8 text-[#EA7600]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-[#001B44] font-display">
                  Acesso Restrito à Comissão e Avaliadores
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Para proteger os dados pessoais (LGPD), números de CPF, contatos institucionais e conteúdos inéditos dos trabalhos, o acesso à listagem consolidada é protegido por login institucional.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAdminLoginOpen(true)}
                className="px-6 py-2.5 rounded-xl bg-[#001B44] hover:bg-[#0A2D6C] text-white text-xs font-bold transition cursor-pointer shadow-md inline-flex items-center gap-2"
              >
                <Lock className="w-3.5 h-3.5 text-[#EA7600]" />
                Entrar com Login e Senha Institucional
              </button>
            </div>
          )
        ) : (
          <SubmissionForm
            onSubmit={handleSubmissionSubmit}
            onOpenRules={() => setIsRulesOpen(true)}
            existingSubmissions={submissions}
          />
        )}
      </main>

      {/* Modals */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <RulesEditalModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      <ConsultSubmissionModal
        isOpen={isConsultOpen}
        onClose={() => setIsConsultOpen(false)}
        submissions={submissions}
        onSelectSubmission={handleSelectSubmission}
        onOpenDashboard={handleOpenDashboard}
      />

      <ProgramacaoModal
        isOpen={isProgramOpen}
        onClose={() => setIsProgramOpen(false)}
      />

      <EmailSettingsModal
        isOpen={isEmailSettingsOpen}
        onClose={() => setIsEmailSettingsOpen(false)}
      />

      {/* Institutional Footer */}
      <Footer />
    </div>
  );
}

