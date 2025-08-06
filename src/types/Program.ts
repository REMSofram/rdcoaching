export interface Program {
  /** Identifiant unique du programme */
  id: string;
  
  /** ID du client à qui le programme est assigné */
  client_id: string;
  
  /** Titre du programme d'entraînement */
  title: string;
  
  /** Contenu détaillé du programme d'entraînement */
  content: string;
  
  /** Indique si le programme est actif */
  is_active: boolean;
  
  /** Date de création du programme */
  created_at: string;
  
  /** Date de dernière mise à jour du programme */
  updated_at: string;
}

export interface CreateProgramInput {
  /** ID du client à qui le programme est assigné */
  client_id: string;
  
  /** Titre du programme d'entraînement */
  title: string;
  
  /** Contenu détaillé du programme d'entraînement */
  content: string;
}

export interface UpdateProgramInput extends Partial<CreateProgramInput> {
  /** Indique si le programme est actif */
  is_active?: boolean;
}
