# Soul Into Art — Guide de déploiement complet

Ce guide explique comment mettre en ligne le site **Soul Into Art** depuis zéro, étape par étape. Il n'est pas nécessaire d'être développeuse pour suivre ces instructions — chaque action est détaillée.

---

## Comment fonctionne le site (vue d'ensemble)

Le site est composé de **3 parties** qui doivent chacune être configurées séparément :

```
[ Visiteur / Toi ]
        |
        v
  [ Netlify ]          ← Le site web que les visiteurs voient (le "front")
        |
        | (le site envoie des requêtes à l'API)
        v
  [ Render.com ]       ← Le serveur qui gère la logique (connexions, cours, etc.)
        |
        | (le serveur lit/écrit les données)
        v
  [ Supabase ]         ← La base de données (là où tout est stocké)
```

- **Supabase** : c'est comme une grande feuille Excel en ligne. Toutes les données (utilisateurs, cours, articles de blog, etc.) y sont stockées.
- **Render.com** : c'est le "cerveau" du site. Quand quelqu'un se connecte ou réserve un cours, c'est Render qui traite la demande et va chercher les données dans Supabase.
- **Netlify** : c'est ce que les visiteurs voient dans leur navigateur. Le site web en lui-même.

> **Important** : ces 3 services ont chacun un plan **gratuit** suffisant pour démarrer.

---

## ÉTAPE 1 — Créer la base de données sur Supabase

### 1.1 — Créer un compte

1. Va sur [supabase.com](https://supabase.com)
2. Clique sur **"Start your project"** ou **"Sign Up"**
3. Inscris-toi avec ton adresse e-mail GitHub (ou n'importe quelle adresse)
4. Confirme ton e-mail si demandé

### 1.2 — Créer un nouveau projet

1. Une fois connectée, clique sur **"New project"**
2. Choisis une **organisation** (la tienne, créée automatiquement)
3. Remplis les champs :
   - **Name** : `soul-into-art` (ou ce que tu veux)
   - **Database Password** : crée un mot de passe fort et **note-le précieusement** — tu en auras besoin plus tard. Exemple : `MonMotDePasse2024!`
   - **Region** : choisis **West EU (Ireland)** ou **Central EU (Frankfurt)** — la région la plus proche de la France
4. Clique sur **"Create new project"**
5. Attends environ 2 minutes que le projet soit prêt (une barre de progression s'affiche)

### 1.3 — Récupérer l'URL de connexion à la base de données

C'est l'information la plus importante de cette étape.

1. Dans ton projet Supabase, clique sur **"Project Settings"** (icône engrenage en bas à gauche)
2. Clique sur **"Database"** dans le menu de gauche
3. Fais défiler jusqu'à la section **"Connection string"**
4. Clique sur l'onglet **"Transaction pooler"** (pas "Session pooler", pas "Direct connection")
5. Tu verras une URL qui ressemble à ceci :
   ```
   postgres://postgres.abcdefghijkl:[YOUR-PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres
   ```
6. Clique sur le bouton **"Copy"** pour copier cette URL
7. **Remplace `[YOUR-PASSWORD]` par le mot de passe que tu as créé à l'étape 1.2**

L'URL finale ressemblera à :
```
postgres://postgres.abcdefghijkl:MonMotDePasse2024!@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require
```

> **Note** : si `?sslmode=require` n'est pas déjà à la fin de l'URL copiée, ajoute-le toi-même.

**Garde cette URL de côté** — tu en auras besoin à l'étape 2.

---

## ÉTAPE 2 — Déployer le serveur API sur Render.com

Le serveur API (`api/`) est le programme qui fait le lien entre le site web et la base de données.

### 2.1 — Créer un compte Render

1. Va sur [render.com](https://render.com)
2. Clique sur **"Get Started for Free"**
3. Inscris-toi **avec ton compte GitHub** (bouton "Continue with GitHub") — c'est le plus simple
4. Autorise Render à accéder à ton GitHub si demandé

### 2.2 — Créer un nouveau Web Service

1. Une fois connectée, clique sur le bouton **"New +"** en haut à droite
2. Choisis **"Web Service"**
3. Dans la section "Connect a repository", Render va lister tes repos GitHub
4. Cherche et sélectionne le repo **`sia-app`**
   - Si tu ne le vois pas, clique sur "Configure account" pour autoriser l'accès à ce repo spécifique
5. Clique sur **"Connect"**

### 2.3 — Configurer le service

Une page de configuration s'affiche. Remplis les champs suivants **exactement** comme indiqué :

| Champ | Valeur à mettre |
|-------|-----------------|
| **Name** | `sia-api` (ou ce que tu veux) |
| **Region** | Frankfurt EU Central (ou la plus proche) |
| **Branch** | `master` |
| **Root Directory** | `api` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm run db:migrate && npm start` |
| **Instance Type** | Free |

> **Pourquoi `Root Directory: api` ?** Le repo contient deux dossiers (`api/` et `soulIntoArtProject/`). On dit à Render de ne regarder que le dossier `api/` pour ce service.

> **Pourquoi `npm run db:migrate && npm start` ?** Au premier démarrage, cette commande crée automatiquement toutes les tables dans la base de données Supabase, puis lance le serveur.

### 2.4 — Ajouter les variables d'environnement

Avant de déployer, il faut donner au serveur ses "réglages secrets". Fais défiler la page jusqu'à la section **"Environment Variables"** et ajoute les variables suivantes, une par une (bouton **"Add Environment Variable"**) :

---

**Variable 1 :**
- Key : `PORT`
- Value : `10000`
> Render impose ce numéro de port. Ne mets pas autre chose.

---

**Variable 2 :**
- Key : `DATABASE_URL`
- Value : *(colle ici l'URL Supabase que tu as copiée à l'étape 1.3)*
> Exemple : `postgres://postgres.abcdefgh:MonMotDePasse2024!@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require`

---

**Variable 3 :**
- Key : `DATABASE_SSL`
- Value : `true`
> Obligatoire pour se connecter à Supabase de façon sécurisée.

---

**Variable 4 :**
- Key : `JWT_SECRET`
- Value : *(invente une longue suite de lettres et chiffres aléatoires)*
> C'est une "clé secrète" qui protège les connexions des utilisateurs. Exemple : `k9x2mPqR7vL4nY8wZ1tS6uB3jH5eA0dF`. Note-la quelque part mais ne la partage jamais.

---

**Variable 5 :**
- Key : `CORS_ORIGIN`
- Value : `*`
> Pour l'instant on met `*` (qui veut dire "tout autoriser"). On le changera à l'étape 4 une fois qu'on aura l'URL de Netlify.

---

**Variable 6 :**
- Key : `AUTO_SEED`
- Value : `false`
> En production, on ne veut pas remplir automatiquement la base avec des données de test.

---

**Variable 7 :**
- Key : `NODE_ENV`
- Value : `production`

---

### 2.5 — Lancer le déploiement

1. Fais défiler jusqu'en bas et clique sur **"Create Web Service"**
2. Render va démarrer le déploiement — cela prend **3 à 5 minutes**
3. Tu verras les logs (journaux) défiler en temps réel. C'est normal.
4. Attends de voir le message `Your service is live` ou que le statut passe à **"Live"** (point vert)

### 2.6 — Récupérer l'URL de l'API

Une fois le déploiement terminé :
1. En haut de la page de ton service Render, tu verras une URL bleue qui ressemble à :
   ```
   https://sia-api.onrender.com
   ```
2. **Copie cette URL** — tu en auras besoin à l'étape suivante.

> **Note** : l'URL exacte sera différente, générée automatiquement par Render.

---

## ÉTAPE 3 — Déployer le site web sur Netlify

Le frontend (`soulIntoArtProject/`) est la partie visible du site — ce que les visiteurs voient.

### 3.1 — Créer un compte Netlify

1. Va sur [netlify.com](https://netlify.com)
2. Clique sur **"Sign up"**
3. Inscris-toi **avec ton compte GitHub** — bouton "Sign up with GitHub"
4. Autorise Netlify si demandé

### 3.2 — Importer le projet

1. Sur le tableau de bord Netlify, clique sur **"Add new site"**
2. Choisis **"Import an existing project"**
3. Clique sur **"Deploy with GitHub"**
4. Cherche et sélectionne le repo **`sia-app`**
   - Si tu ne le vois pas, clique sur "Configure the Netlify app on GitHub" pour donner l'accès

### 3.3 — Configurer le déploiement

Une page de configuration s'affiche. Remplis exactement comme suit :

| Champ | Valeur à mettre |
|-------|-----------------|
| **Branch to deploy** | `master` |
| **Base directory** | `soulIntoArtProject` |
| **Build command** | `npm run build` |
| **Publish directory** | `soulIntoArtProject/dist` |

> **Pourquoi `Base directory: soulIntoArtProject` ?** Même raison que pour Render : le repo a deux dossiers, on dit à Netlify de ne regarder que le dossier du site web.

### 3.4 — Ajouter la variable d'environnement

Avant de déployer, clique sur **"Add environment variables"** (ou "Show advanced") et ajoute :

- Key : `VITE_API_URL`
- Value : *(colle ici l'URL Render de l'étape 2.6)*
> Exemple : `https://sia-api.onrender.com`
> **Attention** : pas de `/` à la fin de l'URL !

### 3.5 — Déployer

1. Clique sur **"Deploy site"** (ou "Deploy `sia-app`")
2. Netlify va builder et déployer le site — cela prend **1 à 3 minutes**
3. Une fois terminé, tu verras une URL verte qui ressemble à :
   ```
   https://amazing-name-123456.netlify.app
   ```
   (le nom est généré aléatoirement par Netlify)

4. **Copie cette URL** — on en a besoin pour l'étape 4.

> Tu peux renommer le site plus tard dans les réglages Netlify si tu veux une URL plus jolie.

---

## ÉTAPE 4 — Connecter le site et le serveur (CORS)

Le serveur API doit savoir que le site Netlify a le droit de lui parler. Pour l'instant on a mis `*` (tout le monde), mais il faut maintenant le restreindre à ton site.

1. Retourne sur [dashboard.render.com](https://dashboard.render.com)
2. Clique sur ton service `sia-api`
3. Dans le menu de gauche, clique sur **"Environment"**
4. Trouve la variable `CORS_ORIGIN`
5. Clique sur le crayon (éditer) à côté
6. Remplace `*` par l'URL exacte de ton site Netlify :
   ```
   https://amazing-name-123456.netlify.app
   ```
   > **Attention** : utilise exactement la même URL que celle de Netlify, sans `/` à la fin.
7. Clique sur **"Save Changes"**
8. Render va automatiquement redéployer le service avec la nouvelle configuration

---

## ÉTAPE 5 — Vérification finale

1. Ouvre l'URL de ton site Netlify dans le navigateur
2. Le site Soul Into Art doit s'afficher
3. Si le site s'affiche mais que la connexion ne fonctionne pas immédiatement, **attends 30 à 60 secondes** et réessaie — Render "endort" le serveur gratuit après 15 minutes d'inactivité, le premier appel prend du temps à le réveiller

### Problèmes courants

**Le site s'affiche blanc ou ne charge pas :**
- Vérifie que `VITE_API_URL` dans Netlify est bien l'URL Render (sans `/` à la fin)
- Vérifie que le déploiement Netlify s'est bien terminé (onglet "Deploys" sur Netlify)

**Erreur "CORS" ou "Access blocked" :**
- Vérifie que `CORS_ORIGIN` dans Render est exactement l'URL de ton site Netlify
- Vérifie qu'il n'y a pas de `/` à la fin des deux URLs

**L'API répond lentement (ou "timeout") :**
- Normal avec le plan gratuit de Render : le serveur dort après 15 min d'inactivité
- Attends 30 à 60 secondes et réessaie — il se réveille tout seul

**Erreur de base de données au démarrage :**
- Vérifie que `DATABASE_URL` dans Render est bien l'URL Supabase complète avec le mot de passe
- Vérifie que `DATABASE_SSL` est bien `true`
- Vérifie que `?sslmode=require` est à la fin de l'URL Supabase

**Le projet Supabase est "paused" :**
- Supabase met en pause les projets gratuits après **1 semaine d'inactivité**
- Va sur supabase.com → ton projet → clique sur "Restore project"

---

## Modifier le contenu du site

Tout le contenu éditorial du site se gère directement dans Supabase, sans avoir besoin de toucher au code.

### Comment accéder à l'éditeur

1. Va sur [supabase.com](https://supabase.com) et connecte-toi
2. Ouvre ton projet `soul-into-art`
3. Dans le menu de gauche, clique sur **"Table Editor"** (icône tableau)

### Tables à modifier

| Table | Contenu |
|-------|---------|
| `teacher_profiles` | Informations et biographies des professeurs (nom, photo, description) |
| `blog_posts` | Articles de blog publiés sur le site |
| `blog_categories` | Catégories des articles de blog |
| `announcements` | Annonces visibles aux élèves connectés |
| `site_content_entries` | Textes généraux du site (titres, descriptions de pages, etc.) |
| `courses` | Les cours proposés |
| `users` | Les comptes utilisateurs |

### Comment modifier une ligne existante

1. Clique sur la table que tu veux modifier (ex: `teacher_profiles`)
2. Les données s'affichent sous forme de tableau
3. Clique directement sur une cellule pour modifier son contenu
4. Appuie sur **Entrée** pour valider

### Comment ajouter une nouvelle entrée

1. Clique sur la table concernée
2. Clique sur le bouton **"Insert row"** (en haut à droite du tableau)
3. Remplis les champs du formulaire
4. Clique sur **"Save"**

---

## Mettre à jour le code après des modifications

Chaque fois que tu (ou la développeuse) pousses du nouveau code sur GitHub (`git push`), Netlify et Render se redéploient **automatiquement**. Tu n'as rien à faire manuellement.

Pour forcer un redéploiement manuel :
- **Netlify** : onglet "Deploys" → bouton "Trigger deploy" → "Deploy site"
- **Render** : page de ton service → bouton "Manual Deploy" → "Deploy latest commit"

---

## Récapitulatif des informations importantes

Garde ces informations en lieu sûr :

| Élément | Valeur |
|---------|--------|
| Site web (Netlify) | `https://....netlify.app` |
| Serveur API (Render) | `https://sia-api....onrender.com` |
| Base de données (Supabase) | Accessible sur supabase.com |
| Mot de passe Supabase | *(celui que tu as créé à l'étape 1.2)* |
| JWT_SECRET | *(celui que tu as inventé à l'étape 2.4)* |
