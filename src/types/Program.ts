export interface ProgramDay {
  /** Identifiant unique du jour de programme */
  id: string;
  
  /** ID du programme parent */
  program_id: string;
  
  /** Titre du jour d'entraînement (ex: "Jour 1 - Pecs") */
  day_title: string;
  
  /** Contenu détaillé du jour d'entraînement */
  content: string;
  
  /** Ordre d'affichage des jours */
  day_order: number;
  
  /** Date de création */
  created_at: string;
  
  /** Date de dernière mise à jour */
  updated_at: string;
}

export interface Program {
  /** Identifiant unique du programme */
  id: string;
  
  /** ID du client à qui le programme est assigné */
  client_id: string;
  
  /** Titre du programme d'entraînement */
  title: string;
  
  /** Indique si le programme est actif */
  is_active: boolean;
  
  /** Date de création du programme */
  created_at: string;
  
  /** Date de dernière mise à jour du programme */
  updated_at: string;
  
  /** Liste des jours du programme */
  program_days?: ProgramDay[];
}

export interface ProgramDayInput {
  /** Titre du jour d'entraînement */
  day_title: string;
  
  /** Contenu du jour d'entraînement */
  content: string;
  
  /** Ordre d'affichage */
  day_order: number;
}

export interface CreateProgramInput {
  /** ID du client à qui le programme est assigné */
  client_id: string;
  
  /** Titre du programme d'entraînement */
  title: string;
  
  /** Liste des jours du programme */
  days: ProgramDayInput[];
}

export interface UpdateProgramInput extends Omit<Partial<CreateProgramInput>, 'client_id'> {
  /** Indique si le programme est actif */
  is_active?: boolean;
  
  /** Liste des jours à mettre à jour */
  days?: Array<ProgramDayInput & { id?: string }>;
}
