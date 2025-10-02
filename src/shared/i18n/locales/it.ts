export const it = {
  common: {
    appName: "TalentALB",
    actions: {
      createAccount: "Crea un account",
      explore: "Inizia ad esplorare",
      registerNow: "Registrati ora",
      registerToContinue: "Registrati per continuare",
      createProfile: "Crea profilo",
      signIn: "Accedi",
      retry: "Riprova",
      searchJobs: "Cerca offerte",
      resetFilters: "Azzera filtri",
      saveDraft: "Salva bozza",
      applyNow: "Candidati ora",
      saveForLater: "Salva per dopo",
      cancel: "Annulla",
      submitApplication: "Invia candidatura",
      receiveUpdates: "Ricevi aggiornamenti",
      clearFilters: "Rimuovi filtri",
      logout: "Esci",
    },
    status: {
      publication: "Pubblicazione",
    },
    placeholders: {
      searchKeyword: "es. product manager, sviluppatore, marketing",
      searchCountry: "es. Albania",
      searchCity: "es. Tirana",
      candidateName: "Il tuo nome completo",
      candidateEmail: "nome@dominio.com",
      candidatePhone: "(+355) 123 456 789",
      candidateResume: "https://",
      candidateMessage: "Parlaci di te, delle tue motivazioni e dei risultati più importanti.",
      search: "Cerca...",
    },
    info: {
      none: "nessuno",
    },

    language: {
      label: "Lingua",
      options: {
        it: "Italiano",
        en: "Inglese",
        sq: "Albanese",
      },
    },

  },
  landing: {
    eyebrow: "Anteprima piattaforma",
    welcomeTitle: "Benvenuto in TalentALB",
    welcomeDescription:
      "Accedi all'anteprima della piattaforma anche senza un account: esplora le funzionalità, consulta la ricerca talenti e scopri come gestire le candidature. Quando sarai pronto potrai creare l'account in qualsiasi momento.",
    candidates: {
      title: "Per i candidati",
      description: "Compila il profilo, carica CV e allegati e gestisci le candidature in maniera semplice.",
      demoCta: "Guarda il profilo demo",
    },
    companies: {
      title: "Per le aziende",
      description: "Crea e gestisci il tuo profilo aziendale, invita i recruiter e pubblica le offerte di lavoro.",
      demoCta: "Scopri l'area azienda",
    },
    guest: {
      title: "Candidati solo quando vuoi",
      description:
        "Stai navigando come ospite. Quando vorrai candidarti ad una posizione o salvare le tue preferenze ti chiederemo di registrarti. Fino ad allora puoi continuare a muoverti liberamente nella piattaforma.",
    },
  },
  appShell: {
    menu: {
      candidate: {
        dashboard: "Dashboard",
        profile: "Il mio profilo",
        attachments: "CV & Allegati",
        skills: "Competenze",
      },
      company: {
        dashboard: "Dashboard",
        profile: "Profilo azienda",
        users: "Utenti",
        jobs: "Offerte di lavoro",
      },
      common: {
        search: "Cerca talenti",
        settings: "Impostazioni",
      },
    },
    sections: {
      candidate: "Area candidato",
      company: "Area azienda",
      common: "Area piattaforma",
    },
    session: {
      guest: "Accesso come ospite",
    },
  },
  candidateDashboard: {
    greeting: "Ciao, {email}",
    intro: "Benvenuto nella tua area candidato.",
    cards: {
      profile: {
        title: "Completamento profilo",
        description: "Aggiungi headline, about, città e competenze.",
        cta: "Completa profilo",
      },
      attachments: {
        title: "CV & Allegati",
        description: "Carica il tuo CV e altri documenti.",
        cta: "Vai alla sezione",
      },
    },
  },
  companyDashboard: {
    greeting: "Benvenuto, {email}",
    intro: "Area azienda: riepilogo rapido.",
    cards: {
      profile: {
        title: "Profilo azienda",
        description: "Completa descrizione, sito e logo.",
        cta: "Modifica profilo",
      },
      team: {
        title: "Team",
        description: "Gestisci gli utenti aziendali (Owner/Admin/Recruiter).",
        cta: "Gestisci utenti",
      },
    },
  },
  candidateProfile: {
    title: "Modifica profilo candidato",
    saveSuccess: "Bozza salvata (localStorage).",
    draftNotice: "⚠️ Solo mock locale. Quando esporrai le API candidate, collegheremo GET/PUT reali.",
    form: {
      firstName: "Nome",
      lastName: "Cognome",
      headline: "Headline",
      phone: "Telefono",
      city: "Città",
      region: "Regione",
      country: "Paese",
      about: "Biografia",
      visibility: "Visibilità",
      visibilityPublic: "PUBBLICO",
      visibilityPrivate: "PRIVATO",
    },
  },
  companyProfile: {
    title: "Profilo azienda",
    saveSuccess: "Bozza salvata (localStorage).",
    draftNotice: "⚠️ Mock locale. Collegheremo le API `/api/company/me` quando pronte.",
    form: {
      name: "Nome",
      legalName: "Ragione sociale",
      website: "Sito web",
      size: "Dimensione",
      industry: "Settore",
      city: "Città",
      region: "Regione",
      country: "Paese",
      description: "Descrizione",
      logoUrl: "Logo URL",
      status: "Stato",
    },
  },
  companyJobs: {
    title: "Crea una nuova offerta di lavoro",
    description:
      "Invia una POST a `/api/job-posts`: compila i campi obbligatori, aggiungi i dettagli facoltativi e premi \"Crea offerta\".",
    form: {
      companyId: "ID azienda",
      title: "Titolo",
      description: "Descrizione",
      requirements: "Requisiti (opzionale)",
      employmentType: "Tipo di contratto",
      seniority: "Seniority",
      distanceType: "Modalità di lavoro",
      city: "Città (opzionale)",
      region: "Regione (opzionale)",
      countryCode: "Codice paese (es. IT)",
      currency: "Valuta (es. EUR)",
      salaryMin: "Salario minimo",
      salaryMax: "Salario massimo",
      salaryVisible: "Rendi visibile la fascia salariale",
    },
    placeholders: {
      selectOption: "Seleziona…",
      optional: "Opzionale",
      requirements: "Bullet list, responsabilità, tech stack…",
    },
    actions: {
      submit: "Crea offerta",
      submitting: "Invio in corso…",
      reset: "Svuota campi",
    },
    feedback: {
      successTitle: "Offerta creata",
      successMessage: "ID generato: {id}",
      status: "Stato: {status}",
      publishedAt: "Pubblicata il: {date}",
      errorTitle: "Errore",
      errorMessage: "Impossibile creare l'offerta.",
    },
    validation: {
      companyId: "Inserisci l'ID aziendale.",
      title: "Inserisci il titolo dell'offerta.",
      description: "Aggiungi una descrizione.",
    },
  },
  talentSearch: {
    title: "Cerca talenti",
    description: "Quando abiliterai le API, qui useremo i tuoi repository per visibilità/nome/città.",
    placeholder: "Cerca per nome/cognome/città…",
    demoLabel: "Demo statica.",
  },
  auth: {
    signup: {
      badge: "Auth · Sign up",
      title: "Crea il tuo account",
      description: "Bozza piattaforma: nessuna sicurezza, sessione mock su localStorage.",
      tabs: {
        candidate: "Candidate",
        company: "Company",
      },
      processing: "Elaborazione…",
      fields: {
        email: "Email",
        password: "Password",
        firstName: "First name",
        lastName: "Last name",
        city: "City",
        companyName: "Company name",
        website: "Website",
      },
      candidateSuccessTitle: "Registrazione completata",
      candidateSuccessBody: "Benvenuto! Ti reindirizzo…",
      companySuccessTitle: "Azienda registrata",
      companySuccessBody: "Ti porto alla piattaforma…",
      errorTitle: "Errore",
      cityOptional: "City (opz.)",
      websiteOptional: "Website (opz.)",
      submitCandidate: "Sign up as Candidate",
      submitCompany: "Sign up as Company",
      passwordLabel: "Password",
      passwordShow: "Show",
      passwordHide: "Hide",
    },
  },
  router: {
    comingSoon: {
      candidateAttachments: "CV & Allegati (coming soon)",
      candidateSkills: "Competenze (coming soon)",
      companyUsers: "Utenti azienda (coming soon)",
      companyJobs: "Offerte di lavoro (coming soon)",
      accountSettings: "Impostazioni account (coming soon)",
    },
  },
  jobBoard: {
    nav: {
      offers: "Offerte",
      applications: "Candidature",
      createProfile: "Crea profilo",
      signIn: "Accedi",
    },
    hero: {
      eyebrow: "Job board TalentALB",
      title: "Tutte le opportunità, subito disponibili",
      description:
        "Sfoglia le posizioni aperte senza effettuare l'accesso: ogni offerta è consultabile e candidabile in pochi passaggi. Quando troverai il ruolo giusto, potrai inviare la tua candidatura direttamente da qui.",
      primaryCta: "Esplora le offerte",
      secondaryCta: "Scopri TalentALB"
    },
    filters: {
      keywordLabel: "Parola chiave",
      countryLabel: "Paese",
      cityLabel: "Città",
      active: "Filtri attivi: {summary}",
      summaryKeyword: "chiave: \"{value}\"",
      summaryCity: "città: \"{value}\"",
      summaryCountry: "paese: \"{value}\"",
      workMode: "Modalità",
      seniority: "Seniority",
      employmentType: "Contratto",
      sortBy: "Ordina",
      clearRefinements: "Pulisci",
      all: "Tutte",
      allTypes: "Tutti",
      relevance: "Rilevanza",
      newest: "Più recenti",
      salaryHigh: "Retribuzione alta",
      salaryLow: "Retribuzione bassa",
    },
    feedback: {
      loadError: "Impossibile caricare le offerte",
      applicationSuccess: "Candidatura inviata per \"{title}\"",
    },
    list: {
      showing: "Mostrando {current} di {total} offerte",
      page: "Pagina {page} di {total}",
    },
    errors: {
      generic: "Si è verificato un problema",
      applicationRequired: "Nome e email sono obbligatori",
    },
    jobCard: {
      salaryHidden: "Retribuzione riservata",
      requirementsTitle: "Requisiti principali",
      publishedAt: "Pubblicato {relativeTime}",
      expiresAt: "Scade {relativeTime}",
      salary: {
        between: "{min} - {max}",
        from: "da {value}",
        to: "fino a {value}",
        unspecified: "Retribuzione non specificata",
      },
      locationFallback: "Località non indicata",
      employerFallback: "Azienda del network TalentALB",
    },
    applications: {
      title: "Le tue candidature",
      description: "Salviamo in locale le posizioni che scegli di candidare così puoi ritrovarle rapidamente.",
      empty: "Nessuna candidatura inviata al momento. Seleziona \"{cta}\" per salvarla qui.",
      submittedAt: "Inviata il {date}",
      phoneLabel: "Telefono",
      resumeLabel: "CV",
    },
    dialog: {
      title: "Candidatura rapida",
      close: "Chiudi",
      subtitleFallback: "Azienda del network TalentALB",
      submit: "Invia candidatura",
      fields: {
        name: "Nome e cognome",
        email: "Email",
        phone: "Telefono",
        resume: "Link al CV (opzionale)",
        message: "Messaggio di presentazione",
      },
    },
    pagination: {
      label: "Pagina {page} di {total}",
      previous: "Precedente",
      next: "Successiva",
    },
    emptyState: {
      title: "Nessuna offerta trovata",
      description:
        "Modifica i filtri di ricerca oppure torna più tardi: il job board viene aggiornato di frequente con nuove posizioni.",
    },
  },
} as const;

type DeepString<T> = T extends string
  ? string
  : { [K in keyof T]: DeepString<T[K]> };

export type TranslationSchema = DeepString<typeof it>;
