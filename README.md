# 🏡 Pontenx — Maison des cousins
Application PWA familiale de gestion de la maison de vacances à Pontenx-les-Forges.

---

## Fonctionnalités

- 🔐 **Connexion sécurisée** — accès email/mot de passe, réinitialisation possible
- 📅 **Calendrier des séjours** — réservations simultanées, choix des chambres (9 chambres), visualisation par famille
- 📋 **Consignes** — fiches détaillées éditables par les admins (accès, piscine, Wi-Fi…)
- 🏃 **Activités** — lieux et balades autour de Pontenx, commentaires, photos/vidéos
- 💬 **Messagerie** — fil familial unique, photos/vidéos, notifications push
- 👨‍👩‍👧 **Famille** — gestion des membres, rôles admin/membre
- 📱 **PWA installable** — fonctionne comme une app iPhone depuis Safari

---

## Déploiement en 4 étapes

### Étape 1 — Créer un projet Firebase

1. Allez sur [https://console.firebase.google.com](https://console.firebase.google.com)
2. Cliquez **"Ajouter un projet"** → donnez un nom (ex: `pontenx-cousins`)
3. Désactivez Google Analytics (non nécessaire) → Créer
4. Dans le menu gauche → **Authentication** → Commencer → Email/Mot de passe → Activer
5. Dans le menu gauche → **Firestore Database** → Créer → Mode production → Choisir une région (europe-west1)
6. Dans le menu gauche → **Storage** → Commencer → Mode production
7. Allez dans **Paramètres du projet** (roue dentée) → **Vos applications** → icône Web `</>`
8. Donnez un nom → Enregistrer → **Copiez la configuration firebaseConfig**

### Étape 2 — Configurer le code

Ouvrez le fichier `src/firebase.js` et remplacez les valeurs par votre configuration :

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",           // votre clé
  authDomain: "pontenx-cousins.firebaseapp.com",
  projectId: "pontenx-cousins",
  storageBucket: "pontenx-cousins.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### Étape 3 — Appliquer les règles de sécurité

**Firestore :**
1. Firebase Console → Firestore → Règles
2. Copiez-collez le contenu de `firestore.rules`
3. Publier

**Storage :**
1. Firebase Console → Storage → Règles
2. Copiez-collez le contenu de `storage.rules`
3. Publier

### Étape 4 — Créer le premier administrateur

1. Firebase Console → Authentication → Utilisateurs → Ajouter un utilisateur
2. Entrez votre email et un mot de passe
3. Firebase Console → Firestore → Ajouter une collection `users`
4. Ajoutez un document avec votre UID (copié depuis Authentication) :
   ```
   uid: "votre-uid-firebase"
   displayName: "Votre Nom"
   email: "votre@email.fr"
   role: "admin"
   ```

### Étape 5 — Déployer sur Vercel

1. Créez un compte sur [https://vercel.com](https://vercel.com)
2. Installez Git si nécessaire : [https://git-scm.com](https://git-scm.com)
3. Dans le dossier du projet, exécutez :
   ```bash
   npm install
   git init
   git add .
   git commit -m "Initial commit"
   ```
4. Allez sur Vercel → **Add New Project** → Importez votre repo GitHub
   (ou utilisez `npx vercel` en ligne de commande)
5. Vercel détecte automatiquement React → Déployez
6. Votre app est en ligne à une URL `https://pontenx-cousins.vercel.app`

### Optionnel — Nom de domaine personnalisé

1. Achetez un domaine sur [OVH](https://ovh.com) ou [Namecheap](https://namecheap.com) (ex: `pontenx-cousins.fr`, ~10€/an)
2. Dans Vercel → Settings → Domains → Ajoutez votre domaine
3. Suivez les instructions DNS

---

## Installation sur iPhone (PWA)

1. Ouvrez l'URL de l'app dans **Safari** sur iPhone
2. Appuyez sur l'icône **Partager** (carré avec flèche)
3. Faites défiler → **"Sur l'écran d'accueil"**
4. Nommez l'app "Pontenx" → Ajouter
5. L'app apparaît avec son icône sur votre écran d'accueil !

---

## Structure du projet

```
pontenx/
├── public/
│   ├── index.html          # HTML avec balises PWA
│   └── manifest.json       # Config PWA (icône, couleurs)
├── src/
│   ├── context/
│   │   └── AuthContext.js  # Gestion authentification
│   ├── pages/
│   │   ├── Login.js        # Page de connexion
│   │   ├── Calendrier.js   # Réservations + chambres
│   │   ├── Consignes.js    # Fiches d'utilisation
│   │   ├── Activites.js    # Activités locales
│   │   ├── Messagerie.js   # Chat familial
│   │   └── Famille.js      # Gestion membres
│   ├── App.js              # Navigation principale
│   ├── firebase.js         # Config Firebase
│   └── index.css           # Thème chaleureux/rustique
├── firestore.rules         # Règles sécurité Firestore
├── storage.rules           # Règles sécurité Storage
├── vercel.json             # Config déploiement Vercel
└── package.json
```

---

## Chambres disponibles

1. Chambre Principale
2. Chambre Rez-de-Chaussée
3. Chambre Jaune
4. Chambre Laura Ashley
5. Chambre Grecque
6. Chambre aux Baldaquins
7. Chambre aux Lits Anciens
8. Chambre Bleue
9. Pavillon

---

## Coûts estimés

| Service | Coût |
|---------|------|
| Firebase (jusqu'à 50 utilisateurs actifs) | Gratuit |
| Vercel (hébergement) | Gratuit |
| Nom de domaine (.fr) | ~10 €/an |
| Firebase Storage (si beaucoup de photos/vidéos) | ~5–15 €/mois |

---

## Support

En cas de problème, vous pouvez :
- Consulter la [documentation Firebase](https://firebase.google.com/docs)
- Consulter la [documentation Vercel](https://vercel.com/docs)
- Demander de l'aide à Claude sur claude.ai 😊
