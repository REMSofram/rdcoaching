# Task Notes - Implémentation Onglet Notes Client

## Objectif
Ajouter un nouvel onglet "Notes" à côté de l'onglet "Calendrier" dans la page client côté coach, permettant de prendre et modifier des notes spécifiques à chaque client avec un éditeur de texte riche.

## Fonctionnalités requises
- **Onglet Notes** : Nouvel onglet dans l'interface client (côté coach uniquement)
- **Éditeur de texte riche** : Similaire aux éditeurs des onglets Programme et Nutrition
- **Sauvegarde automatique** : Notes liées à l'ID du client
- **Accès restreint** : Visible uniquement pour les coachs, pas pour les clients

---

## 1. Modifications Base de Données

### Créer une nouvelle table `client_notes`
```sql
CREATE TABLE client_notes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    client_id INT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES profiles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_client (client_id)
);
```

*Table dédiée uniquement aux notes, liée simplement à l'ID du client*

---

## 2. Backend - API Routes

### Créer le contrôleur `NotesController.php`
```php
<?php
class NotesController {
    
    // GET /api/clients/{client_id}/notes
    public function getNotes($client_id) {
        // Vérifier que l'utilisateur est un coach
        // Récupérer les notes du client
        // Retourner JSON
    }
    
    // POST/PUT /api/clients/{client_id}/notes
    public function saveNotes($client_id) {
        // Vérifier que l'utilisateur est un coach
        // Valider les données
        // Sauvegarder/mettre à jour les notes
        // Retourner succès/erreur
    }
    
    // DELETE /api/clients/{client_id}/notes
    public function deleteNotes($client_id) {
        // Vérifier permissions coach
        // Supprimer les notes
        // Retourner confirmation
    }
}
```

### Routes à ajouter
```php
// Dans routes/api.php ou équivalent
Route::middleware(['auth', 'coach'])->group(function () {
    Route::get('/clients/{client_id}/notes', [NotesController::class, 'getNotes']);
    Route::post('/clients/{client_id}/notes', [NotesController::class, 'saveNotes']);
    Route::put('/clients/{client_id}/notes', [NotesController::class, 'saveNotes']);
    Route::delete('/clients/{client_id}/notes', [NotesController::class, 'deleteNotes']);
});
```

---

## 3. Frontend - Interface Utilisateur

### Modifier la navigation des onglets
**Fichier : `ClientDetailPage.vue` (ou équivalent)**

```javascript
// Ajouter "Notes" aux onglets existants
const tabs = [
    { id: 'suivi', label: 'Suivi', icon: 'chart' },
    { id: 'programme', label: 'Programme', icon: 'dumbbell' },
    { id: 'nutrition', label: 'Nutrition', icon: 'utensils' },
    { id: 'calendrier', label: 'Calendrier', icon: 'calendar' },
    { id: 'notes', label: 'Notes', icon: 'file-text' } // NOUVEAU
];
```

### Créer le composant `NotesTab.vue`
```vue
<template>
  <div class="notes-tab">
    <div class="notes-header">
      <h3>Notes pour {{ clientName }}</h3>
      <div class="notes-actions">
        <button @click="saveNotes" :disabled="saving">
          <i class="icon-save"></i>
          {{ saving ? 'Sauvegarde...' : 'Sauvegarder' }}
        </button>
      </div>
    </div>
    
    <div class="notes-editor">
      <TextEditor
        v-model="notes"
        :config="editorConfig"
        @input="onNotesChange"
        placeholder="Tapez vos notes concernant ce client..."
      />
    </div>
    
    <div class="notes-info" v-if="lastSaved">
      Dernière sauvegarde : {{ formatDate(lastSaved) }}
    </div>
  </div>
</template>

<script>
import TextEditor from '@/components/TextEditor.vue';

export default {
  name: 'NotesTab',
  components: { TextEditor },
  props: {
    clientId: {
      type: Number,
      required: true
    },
    clientName: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      notes: '',
      originalNotes: '',
      saving: false,
      lastSaved: null,
      editorConfig: {
        toolbar: [
          'bold', 'italic', 'underline', '|',
          'bulletedList', 'numberedList', '|',
          'heading', 'blockQuote', '|',
          'undo', 'redo'
        ],
        placeholder: 'Tapez vos notes concernant ce client...'
      }
    };
  },
  computed: {
    hasUnsavedChanges() {
      return this.notes !== this.originalNotes;
    }
  },
  methods: {
    async loadNotes() {
      try {
        const response = await this.$api.get(`/clients/${this.clientId}/notes`);
        this.notes = response.data.notes || '';
        this.originalNotes = this.notes;
        this.lastSaved = response.data.updated_at;
      } catch (error) {
        console.error('Erreur lors du chargement des notes:', error);
        this.$toast.error('Impossible de charger les notes');
      }
    },
    
    async saveNotes() {
      if (this.saving) return;
      
      this.saving = true;
      try {
        const response = await this.$api.post(`/clients/${this.clientId}/notes`, {
          notes: this.notes
        });
        
        this.originalNotes = this.notes;
        this.lastSaved = new Date();
        this.$toast.success('Notes sauvegardées');
        
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        this.$toast.error('Erreur lors de la sauvegarde des notes');
      } finally {
        this.saving = false;
      }
    },
    
    onNotesChange() {
      // Auto-save après 3 secondes d'inactivité
      clearTimeout(this.autoSaveTimeout);
      this.autoSaveTimeout = setTimeout(() => {
        if (this.hasUnsavedChanges) {
          this.saveNotes();
        }
      }, 3000);
    },
    
    formatDate(date) {
      return new Date(date).toLocaleString('fr-FR');
    }
  },
  
  mounted() {
    this.loadNotes();
  },
  
  beforeDestroy() {
    clearTimeout(this.autoSaveTimeout);
    
    // Demander confirmation si modifications non sauvegardées
    if (this.hasUnsavedChanges) {
      const confirmLeave = confirm('Vous avez des modifications non sauvegardées. Voulez-vous les sauvegarder ?');
      if (confirmLeave) {
        this.saveNotes();
      }
    }
  }
};
</script>

<style scoped>
.notes-tab {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.notes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 15px;
}

.notes-header h3 {
  margin: 0;
  color: #333;
}

.notes-actions button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.notes-actions button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.notes-editor {
  min-height: 400px;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.notes-info {
  margin-top: 10px;
  font-size: 12px;
  color: #666;
  text-align: right;
}
</style>
```

---

## 4. Sécurité et Permissions

### Middleware de vérification coach
```php
// Middleware CoachMiddleware.php
public function handle($request, Closure $next) {
    $user = auth()->user();
    
    if (!$user || $user->role !== 'coach') {
        return response()->json(['error' => 'Accès refusé'], 403);
    }
    
    return $next($request);
}
```

### Vérification accès coach uniquement
```php
// Dans NotesController
private function verifyCoachAccess() {
    $user = auth()->user();
    
    if (!$user || $user->role !== 'coach') {
        throw new UnauthorizedException('Seuls les coachs peuvent accéder aux notes');
    }
    
    return $user;
}
```

---

## 5. Tests à implémenter

### Tests Backend
- **Test d'authentification** : Seuls les coachs peuvent accéder aux notes
- **Test CRUD** : Création, lecture, mise à jour, suppression des notes  
- **Test de validation** : Validation des données d'entrée
- **Test d'intégrité** : Suppression en cascade si client supprimé

### Tests Frontend
- **Test de chargement** : Affichage correct des notes existantes
- **Test de sauvegarde** : Sauvegarde manuelle et automatique
- **Test d'interface** : Navigation entre onglets, éditeur de texte
- **Test de confirmation** : Avertissement avant fermeture avec modifications non sauvées

---

## 6. Considérations techniques

### Performance
- **Pagination** : Si les notes deviennent très longues, considérer une limitation de caractères
- **Cache** : Mettre en cache les notes fréquemment consultées
- **Optimisation des requêtes** : Utiliser un index sur client_id

### UX/UI
- **Indicateur de sauvegarde** : Status visuel (sauvegardé/en cours/erreur)
- **Historique des versions** : Optionnel - garder un historique des modifications
- **Recherche dans les notes** : Optionnel - fonction de recherche texte
- **Export** : Optionnel - possibilité d'exporter les notes en PDF

### Sécurité additionnelle
- **Chiffrement** : Considérer le chiffrement des notes sensibles
- **Audit trail** : Logger les accès et modifications des notes
- **Backup** : Sauvegarde automatique des notes importantes

---

## 7. Plan d'implémentation

1. **Phase 1** : Base de données et API backend
2. **Phase 2** : Interface frontend de base
3. **Phase 3** : Éditeur de texte riche et sauvegarde auto
4. **Phase 4** : Tests et sécurité
5. **Phase 5** : Optimisations et fonctionnalités avancées

---

## 8. Fichiers à modifier/créer

### Backend
- `database/migrations/create_client_notes_table.php`
- `app/Http/Controllers/NotesController.php`
- `app/Http/Middleware/CoachMiddleware.php`
- `routes/api.php`
- `app/Models/ClientNote.php`

### Frontend
- `components/NotesTab.vue` (nouveau)
- `pages/ClientDetailPage.vue` (modification)
- `components/TextEditor.vue` (réutilisation ou adaptation)
- `api/notesApi.js` (nouveau)

### Tests
- `tests/Feature/NotesControllerTest.php`
- `tests/Unit/ClientNoteModelTest.php`
- `cypress/integration/notes-tab.spec.js`

---

*Cette implémentation respecte l'architecture existante et s'intègre naturellement avec les fonctionnalités Programme et Nutrition déjà en place.*