export interface NutritionDay {
  /** Identifiant unique du jour de programme nutritionnel */
  id: string;
  
  /** ID du programme nutritionnel parent */
  nutrition_program_id: string;
  
  /** Titre du jour (ex: "Lundi - Jour 1") */
  day_title: string;
  
  /** Contenu détaillé du jour (repas, quantités, etc.) */
  content: string;
  
  /** Ordre d'affichage des jours */
  day_order: number;
  
  /** Date de création */
  created_at: string;
  
  /** Date de dernière mise à jour */
  updated_at: string;
}

export interface NutritionProgram {
  /** Identifiant unique du programme nutritionnel */
  id: string;
  
  /** ID du client à qui le programme est assigné */
  client_id: string;
  
  /** Titre du programme nutritionnel */
  title: string;
  
  /** Indique si le programme est actif */
  is_active: boolean;
  
  /** Date de création du programme */
  created_at: string;
  
  /** Date de dernière mise à jour du programme */
  updated_at: string;
  
  /** Liste des jours du programme nutritionnel */
  nutrition_days?: NutritionDay[];
}

export interface NutritionDayInput {
  /** Titre du jour nutritionnel */
  day_title: string;
  
  /** Contenu détaillé du jour */
  content: string;
  
  /** Ordre d'affichage */
  day_order: number;
}

export interface CreateNutritionProgramInput {
  /** ID du client */
  client_id: string;
  
  /** Titre du programme */
  title: string;
  
  /** Jours du programme */
  days: NutritionDayInput[];
}

export interface UpdateNutritionProgramInput {
  /** ID du programme à mettre à jour */
  id: string;
  
  /** Titre du programme */
  title?: string;
  
  /** Statut d'activation */
  is_active?: boolean;
  
  /** Jours à mettre à jour ou à créer */
  days?: Array<NutritionDayInput & { id?: string }>;
}
