# Caldera Tech

## Lancer PostgreSQL avec Docker

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

Se connecter à PostgreSQL :

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
