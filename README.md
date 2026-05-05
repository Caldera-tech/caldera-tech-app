# Equipe Caldera Tech

## Objectif du projet

Nexora est une plateforme d'apprentissage en ligne assistée par IA.

Ce projet s'inscrit dans un contexte de hackathon autour de la question :

"Comment l'IA et la gamification peuvent changer les methodes d'enseignement ?"

L'objectif est de proposer une experience d'apprentissage plus engageante et personnalisée par des mecaniques de progression (XP, quetes, suivi des performances).

## Vision produit

- Parcours pédagogiques adaptés au niveau de l'apprenant grâce à l'IA.
- Génération de quêtes/questions par thème.
- Système de progression (XP, niveau, feedback).
- Suivi des résultats pour mesurer la montée en compétences.

## Architecture des branches (workflow par rôle)

### Côté back-end (les fondations)

#### back/db-setup

- Initialisation de Prisma.
- Configuration de `prisma/schema.prisma` avec les tables `User` et `Progress`.
- Lancement de la première migration PostgreSQL.

#### back/groq-config

- Installation du SDK Groq.
- Création du fichier `src/lib/groq.ts`.
- Mise en place du system prompt de base pour le domaine DEV.

#### back/api-auth

- Route POST pour l'inscription (enregistrement en base).
- Logique de hashage des mots de passe.

#### back/api-quest-engine

- Route pour récupérer 5 questions par thème.
- Logique de vérification des réponses et calcul de l'XP.

## Exemple de workflow GitHub Actions (idée)

- Énclenchement sur push/pull request sur les branches `back/*`.
- Vérification de la qualité du code (lint + type-check).
- Vérification des migrations Prisma.
- Build du projet pour valider l'intégration continue.

## Setup PostgreSQL avec Docker

Créer le fichier `.env` à partir de l'exemple :

```bash
cp .env.example .env
```

Modifier ensuite `.env` avec les vrais identifiants.

Lancer PostgreSQL :

```bash
docker compose up -d
```

Voir les conteneurs :

```bash
docker ps
```

Se connecter a PostgreSQL :

```bash
docker compose exec db psql -U caldera_admin -d caldera_tech_db
```

## Informations PostgreSQL

- Container : `caldera-tech-db`
- Host depuis la machine : `localhost`
- Host depuis un autre conteneur Docker : `db`
- Port : `5432`
- Database : `caldera_tech_db`
- User : `caldera_admin`

## DATABASE_URL Prisma

Depuis un conteneur Docker :

```env
DATABASE_URL="postgresql://caldera_admin:MOT_DE_PASSE@db:5432/caldera_tech_db?schema=public"
```

Depuis la machine locale / VM :

```env
DATABASE_URL="postgresql://caldera_admin:MOT_DE_PASSE@localhost:5432/caldera_tech_db?schema=public"
```
