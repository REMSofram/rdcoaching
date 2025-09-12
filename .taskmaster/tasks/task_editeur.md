# Intégration d'un éditeur de texte riche dans l'application RD Coaching

## Vue d'ensemble
Ce guide vous explique comment intégrer un éditeur de texte riche (WYSIWYG) dans votre application pour permettre la mise en forme des contenus nutritionnels et des programmes de musculation.

## Étape 1: Choix de l'éditeur de texte

### Option recommandée: Quill.js
Quill est un éditeur moderne, léger et facile à intégrer.

**Avantages:**
- Interface utilisateur intuitive
- Support des liens hypertextes
- Formatage texte (gras, souligné, italique)
- API simple
- Taille raisonnable (~43kb minifié)

### Alternatives possibles:
- **TinyMCE** (plus complet mais plus lourd)
- **CKEditor** (très professionnel)
- **Draft.js** (pour React)

## Étape 2: Installation et configuration

### Installation via CDN (solution rapide)
Ajoutez ces lignes dans le `<head>` de vos pages:

```html
<!-- Thème Quill Snow -->
<link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">

<!-- Librairie Quill -->
<script src="https://cdn.quilljs.com/1.3.6/quill.min.js"></script>
```

### Installation via npm (solution recommandée)
```bash
npm install quill
```

## Étape 3: Structure HTML

### Modification du template existant
Remplacez vos zones de texte actuelles par cette structure:

```html
<!-- Zone d'édition -->
<div class="editor-container">
    <label for="content-editor">Contenu du jour</label>
    
    <!-- Toolbar personnalisée (optionnel) -->
    <div id="toolbar">
        <button class="ql-bold">Gras</button>
        <button class="ql-underline">Souligné</button>
        <button class="ql-italic">Italique</button>
        <button class="ql-link">Lien</button>
        <select class="ql-size">
            <option value="small">Petit</option>
            <option selected>Normal</option>
            <option value="large">Grand</option>
        </select>
    </div>
    
    <!-- Zone d'édition principale -->
    <div id="editor-content" style="height: 300px;">
        <!-- Le contenu existant sera injecté ici -->
    </div>
    
    <!-- Champ caché pour stocker le HTML -->
    <input type="hidden" id="content-html" name="content">
</div>
```

## Étape 4: Initialisation JavaScript

### Script d'initialisation
```javascript
// Initialisation de l'éditeur
const quill = new Quill('#editor-content', {
    theme: 'snow',
    modules: {
        toolbar: [
            ['bold', 'underline', 'italic'],
            ['link'],
            [{ 'size': ['small', false, 'large'] }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['clean'] // bouton pour nettoyer le formatage
        ]
    },
    placeholder: 'Saisissez le contenu de votre programme...',
    readOnly: false
});

// Synchronisation avec le formulaire
const form = document.querySelector('#program-form');
const hiddenInput = document.querySelector('#content-html');

// Mise à jour du champ caché quand le contenu change
quill.on('text-change', function() {
    hiddenInput.value = quill.root.innerHTML;
});

// Soumission du formulaire
form.addEventListener('submit', function(e) {
    // S'assurer que le contenu est à jour
    hiddenInput.value = quill.root.innerHTML;
});
```

## Étape 5: Chargement du contenu existant

### Pour charger un contenu déjà sauvegardé
```javascript
// Supposons que vous récupérez le contenu depuis votre base de données
const existingContent = `
    <p><strong>PETIT-DÉJEUNER</strong></p>
    <p>Flocons d'avoine – 100 g</p>
    <p>Galettes de riz – 30 g</p>
    <p><a href="https://exemple.com/beurre-amande">Beurre d'amande</a> – 10 g</p>
    <p><u>Whey ISO</u> – 25 g</p>
`;

// Injection dans l'éditeur
quill.root.innerHTML = existingContent;

// Mise à jour du champ caché
document.querySelector('#content-html').value = existingContent;
```

## Étape 6: Styles CSS personnalisés

### Personnalisation de l'apparence
```css
/* Conteneur de l'éditeur */
.editor-container {
    margin: 20px 0;
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
}

/* Barre d'outils */
.ql-toolbar {
    border-bottom: 1px solid #ddd;
    background-color: #f8f9fa;
    padding: 8px;
}

/* Zone d'édition */
.ql-editor {
    font-family: 'Arial', sans-serif;
    font-size: 14px;
    line-height: 1.6;
    min-height: 200px;
    padding: 15px;
}

/* Personnalisation des liens */
.ql-editor a {
    color: #007bff;
    text-decoration: none;
}

.ql-editor a:hover {
    text-decoration: underline;
}

/* Style pour les listes */
.ql-editor ul, .ql-editor ol {
    padding-left: 20px;
}
```

## Étape 7: Intégration backend

### Côté serveur (exemple PHP)
```php
<?php
// Récupération et nettoyage du contenu HTML
$content = $_POST['content'] ?? '';

// Nettoyage basique du HTML (optionnel mais recommandé)
$content = strip_tags($content, '<p><br><strong><b><em><i><u><a><ul><ol><li>');

// Sauvegarde en base de données
$stmt = $pdo->prepare("UPDATE nutrition_programs SET content = ? WHERE id = ?");
$stmt->execute([$content, $programId]);
?>
```

### Affichage du contenu sauvegardé
```php
<?php
// Récupération depuis la base
$stmt = $pdo->prepare("SELECT content FROM nutrition_programs WHERE id = ?");
$stmt->execute([$programId]);
$program = $stmt->fetch();

// Affichage sécurisé (le HTML est déjà nettoyé à l'enregistrement)
echo $program['content'];
?>
```

## Étape 8: Fonctionnalités avancées

### Gestion personnalisée des liens
```javascript
// Personnalisation de la création de liens
quill.getModule('toolbar').addHandler('link', function(value) {
    if (value) {
        const href = prompt('Entrez l\'URL du lien:');
        if (href) {
            const range = quill.getSelection();
            if (range && range.length > 0) {
                quill.format('link', href);
            } else {
                const text = prompt('Entrez le texte du lien:');
                if (text) {
                    quill.insertText(range.index, text, 'link', href);
                }
            }
        }
    } else {
        quill.format('link', false);
    }
});
```

### Validation du contenu
```javascript
// Validation avant soumission
function validateContent() {
    const text = quill.getText().trim();
    if (text.length < 10) {
        alert('Le contenu doit contenir au moins 10 caractères.');
        return false;
    }
    return true;
}

// Ajout à la soumission du formulaire
form.addEventListener('submit', function(e) {
    if (!validateContent()) {
        e.preventDefault();
    }
});
```

## Étape 9: Responsive et mobile

### Adaptation mobile
```css
/* Responsive pour mobile */
@media (max-width: 768px) {
    .ql-toolbar {
        padding: 5px;
    }
    
    .ql-toolbar .ql-formats {
        margin-right: 8px;
    }
    
    .ql-editor {
        font-size: 16px; /* Évite le zoom automatique sur iOS */
    }
}

/* Toolbar simplifiée sur petit écran */
@media (max-width: 480px) {
    .ql-toolbar .ql-formats:nth-child(n+3) {
        display: none;
    }
}
```

## Étape 10: Tests et déploiement

### Checklist avant déploiement
- [ ] L'éditeur se charge correctement
- [ ] Le formatage (gras, souligné) fonctionne
- [ ] Les liens se créent et s'ouvrent correctement
- [ ] Le contenu se sauvegarde en base de données
- [ ] Le contenu sauvegardé se recharge correctement
- [ ] L'interface est responsive sur mobile
- [ ] Les caractères spéciaux sont bien gérés

### Script de test TypeScript
```typescript
// Interface pour les informations de test
interface EditorTestInfo {
  htmlContent: string;
  textContent: string;
  length: number;
}

// Fonction de test typée
const testEditor = (): EditorTestInfo => {
  const testInfo: EditorTestInfo = {
    htmlContent: quill.root.innerHTML,
    textContent: quill.getText(),
    length: quill.getText().length
  };
  
  console.log('Contenu HTML:', testInfo.htmlContent);
  console.log('Contenu texte:', testInfo.textContent);
  console.log('Longueur:', testInfo.length);
  
  return testInfo;
};

// Export pour les tests
export { testEditor };

// Appelez testEditor() dans la console pour vérifier
```

## Ressources supplémentaires

### Documentation officielle
- [Quill.js Documentation](https://quilljs.com/docs/)
- [Guide des modules Quill](https://quilljs.com/docs/modules/)

### Exemples d'intégration
- Sauvegarde automatique toutes les 30 secondes
- Import/export de contenu
- Intégration avec des systèmes de templates

---

**Note importante:** Pensez à tester l'intégration sur différents navigateurs et à prévoir une solution de fallback pour les navigateurs plus anciens.