# 🎬 Popcorn Roulette API

[Português](#português) | [English](#english)

---

## Português

### 📖 Sobre o Projeto

Este é um **projeto pessoal** de uma API de roleta de filmes construída com TypeScript. A ideia é simples: você define seus filtros (gênero, classificação etária, país, etc.) e o sistema escolhe um filme aleatório para você assistir!

**🎮 Experimente aqui:** [https://lmangrich.github.io/Popcorn-Roulette/](https://lmangrich.github.io/Popcorn-Roulette/)

**📊 Fonte dos Dados:** Todos os dados de filmes são fornecidos pela [The Movie Database (TMDB)](https://www.themoviedb.org/), uma plataforma colaborativa com informações detalhadas sobre milhares de filmes.

### 🚀 Tecnologias Utilizadas

- **[Bun](https://bun.sh)** - Runtime JavaScript/TypeScript extremamente rápido
- **[Hono](https://hono.dev)** - Framework web minimalista e performático
- **[Zod](https://zod.dev)** - Validação de schemas com TypeScript
- **[Drizzle ORM](https://orm.drizzle.team)** - ORM type-safe para SQL
- **[PostgreSQL](https://www.postgresql.org/)** - Banco de dados relacional
- **[TMDB API](https://www.themoviedb.org/documentation/api)** - API para dados de filmes

### ✨ Funcionalidades

- 🎲 **Roleta de Filmes**: Receba um filme aleatório baseado em seus filtros
- 🔍 **Filtros Avançados**: País, classificação etária, gênero, avaliação, duração, ano, plataformas de streaming
- 📊 **Contagem de Resultados**: Saiba quantos filmes correspondem aos seus filtros antes de girar
- 🎬 **Dados Completos**: Elenco, diretores, sinopse, pôsteres e onde assistir

### 📁 Estrutura do Projeto

```
popcorn-roulette-back/
├── src/
│   ├── db/
│   │   ├── schema.ts          # Schema Drizzle com tabela de filmes
│   │   └── index.ts           # Conexão com banco de dados
│   ├── routes/
│   │   └── movies.routes.ts   # Endpoints de filmes (roleta, CRUD)
│   ├── services/
│   │   └── tmdb.service.ts    # Integração com API do TMDB
│   ├── scripts/
│   │   └── scraper.ts         # Script de importação de filmes
│   ├── types/
│   │   └── tmdb.ts            # Tipos da API do TMDB
│   ├── validators/
│   │   └── movie.validator.ts # Schemas Zod
│   └── index.ts               # Aplicação principal
├── drizzle.config.ts          # Configuração do Drizzle
├── package.json
├── tsconfig.json
└── .env.example
```

### 🛠️ Instalação

#### 1. Pré-requisitos

- [Bun](https://bun.sh) instalado
- Banco de dados PostgreSQL rodando
- Chave de API do TMDB ([Obtenha gratuitamente](https://www.themoviedb.org/settings/api))

#### 2. Instalar Dependências

```bash
bun install
```

#### 3. Variáveis de Ambiente

Copie `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite `.env` com suas credenciais:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/seu_db_aqui
TMDB_API_KEY=sua_chave_aqui
TMDB_API_BASE_URL=https://api.themoviedb.org/3
PORT=3000
```

#### 4. Configuração do Banco de Dados

Gere e execute as migrations:

```bash
# Gerar arquivos de migration
bun run db:generate

# Executar migrations
bun run db:migrate
```

Ou aplique o schema diretamente (para desenvolvimento):

```bash
bun run db:push
```

Use o Drizzle Studio para gerenciar seu banco de dados:

```bash
bun run db:studio
```

#### 5. Importar Filmes

Execute o scraper para importar filmes do TMDB:

```bash
# Filmes recentes e populares (2021-2026)
    bun run scrape recent

# Filmes dessa década (2020-2026)
    bun run scrape decade

# Filmes desde 2000
    bun run scrape all

# Filmes modernos (1990-1999)
    bun run scrape modern

# Filmes Era de Ouro (1940-1989)
    bun run scrape golden-era
```

O scraper irá:
- Buscar filmes do TMDB
- Extrair classificações etárias (Brasil → EUA → País Original → Outros → Padrão)
- Mapear países de produção
- Obter elenco, diretores e plataformas de streaming
- Salvar no seu banco de dados
- Pular filmes que não correspondem aos países suportados

### 🎯 Endpoints da API

#### Verificação de Saúde

```http
GET /
```

Retorna informações da API e endpoints disponíveis.

#### 🎲 Roleta

```http
GET /movies/roulette?countries=Brazil&ageRating=14+&genres=Action&minRating=7
```

**Parâmetros de Query** (todos opcionais):
- `countries`: Array de países (USA, Brazil, South Korea, UK, France, Japan, Canada, etc.)
- `ageRating`: Classificação etária (L, 10+, 12+, 14+, 16+, 18+)
- `genres`: Array de gêneros (Action, Comedy, Drama, etc.)
- `minRating`: Avaliação mínima IMDB (0-10)
- `maxRating`: Avaliação máxima IMDB (0-10)
- `minDuration`: Duração mínima em minutos
- `maxDuration`: Duração máxima em minutos
- `minYear`: Ano mínimo de lançamento
- `maxYear`: Ano máximo de lançamento
- `whereToWatch`: Array de plataformas de streaming

**Resposta**: Um filme aleatório correspondente aos seus filtros!

```json
{
  "id": 42,
  "title": "The Matrix",
  "originalTitle": "The Matrix",
  "countries": ["USA"],
  "ageRating": "14+",
  "genres": ["Action", "Science Fiction"],
  "imdbRating": "8.7",
  "duration": 136,
  "year": 1999,
  "directors": ["Lana Wachowski", "Lilly Wachowski"],
  "cast": [
    { "name": "Keanu Reeves", "role": "Neo" },
    { "name": "Laurence Fishburne", "role": "Morpheus" }
  ],
  "whereToWatch": ["Netflix", "HBO Max"],
  "posterUrl": "https://image.tmdb.org/t/p/w500/...",
  "synopsis": "A computer hacker learns..."
}
```

#### Listar Filmes

```http
GET /movies?page=1&limit=20&genres=Comedy&minRating=7
```

Retorna lista paginada de filmes com filtros opcionais.

#### Obter Filme

```http
GET /movies/:id
```

Obter detalhes de um filme específico por ID.

#### Criar Filme

```http
POST /movies
Content-Type: application/json

{
  "title": "Inception",
  "countries": ["USA", "UK"],
  "ageRating": "12+",
  "genres": ["Action", "Science Fiction"],
  "duration": 148,
  "year": 2010
}
```

#### Atualizar Filme

```http
PATCH /movies/:id
Content-Type: application/json

{
  "ageRating": "14+"
}
```

#### Deletar Filme

```http
DELETE /movies/:id
```

### 🎬 Schema do Filme

```typescript
{
  id: number;              // Chave primária
  title: string;           // Título do filme
  titlePtBr?: string;      // Título em português brasileiro
  originalTitle?: string;  // Título original (se diferente)
  countries: string[];     // Países de produção (enum)
  ageRating: string;       // Classificação etária (enum: L, 10+, 12+, 14+, 16+, 18+)
  genres: string[];        // Gêneros
  imdbRating?: string;     // Avaliação IMDB (decimal)
  duration?: number;       // Duração em minutos
  year?: number;           // Ano de lançamento
  directors: string[];     // Nomes dos diretores
  cast: Array<{            // Membros do elenco (JSONB)
    name: string;
    role: string;
  }>;
  whereToWatch: string[];  // Plataformas de streaming
  posterUrl?: string;      // URL da imagem do pôster
  synopsis?: string;       // Sinopse do filme
}
```

### 🔑 Mapeamento de Classificação Etária

A API mapeia automaticamente classificações etárias de diferentes regiões:

#### Brasil (BR)
- L → L (Livre)
- 10 → 10+
- 12 → 12+
- 14 → 14+
- 16 → 16+
- 18 → 18+

#### EUA (US)
- G → L
- PG → 10+
- PG-13 → 12+
- R → 16+
- NC-17 → 18+

### 🚦 Rodando o Servidor

#### Desenvolvimento (com hot reload)

```bash
bun run dev
```

#### Produção

```bash
bun run start
```

Servidor roda em `http://localhost:3000` (ou sua PORT configurada).

### 📊 Gerenciamento do Banco de Dados

```bash
# Gerar arquivos de migration
bun run db:generate

# Executar migrations
bun run db:migrate

# Aplicar schema diretamente (sem arquivos de migration)
bun run db:push

# Abrir Drizzle Studio (GUI do banco de dados)
bun run db:studio
```

### 🎯 Exemplos de Uso

#### 1. Girar a Roleta para um Filme Familiar

```bash
curl "http://localhost:3000/movies/roulette?ageRating=L&genres=Animation&minRating=7"
```

#### 2. Encontrar Filmes de Ação dos Anos 2020

```bash
curl "http://localhost:3000/movies?genres=Action&minYear=2020&page=1&limit=10"
```

#### 3. Obter Filmes Disponíveis na Netflix

```bash
curl "http://localhost:3000/movies/roulette?whereToWatch=Netflix"
```

### 🔒 Limites da API do TMDB

O scraper inclui limitação de taxa integrada (250ms entre requisições) para respeitar os limites da API do TMDB. O nível gratuito permite ~40 requisições por 10 segundos.

### 📝 Observações

- O scraper importa apenas filmes com avaliação mínima de 6.0
- Apenas filmes dos 30+ países suportados são importados
- Classificações etárias priorizam Brasil (BR), voltando para EUA (US)
- Disponibilidade de streaming é buscada para o Brasil por padrão (configurável)

### 🙏 Créditos

Este produto usa a API do TMDB, mas não é endossado ou certificado pelo TMDB.

<a href="https://www.themoviedb.org/">
  <img src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg" alt="TMDB" width="200"/>
</a>

---

## English

### 📖 About the Project

This is a **personal project** for a movie roulette API built with TypeScript. The idea is simple: you set your filters (genre, age rating, country, etc.) and the system picks a random movie for you to watch!

**🎮 Try it here:** [https://lmangrich.github.io/Popcorn-Roulette/](https://lmangrich.github.io/Popcorn-Roulette/)

**📊 Data Source:** All movie data is provided by [The Movie Database (TMDB)](https://www.themoviedb.org/), a collaborative platform with detailed information about thousands of movies.

### 🚀 Tech Stack

- **[Bun](https://bun.sh)** - Extremely fast JavaScript/TypeScript runtime
- **[Hono](https://hono.dev)** - Minimalist and performant web framework
- **[Zod](https://zod.dev)** - TypeScript-first schema validation
- **[Drizzle ORM](https://orm.drizzle.team)** - Type-safe ORM for SQL
- **[PostgreSQL](https://www.postgresql.org/)** - Relational database

### ✨ Features

- 🎲 **Movie Roulette**: Get a random movie based on your filters
- 🔍 **Advanced Filters**: Country, age rating, genre, rating, duration, year, streaming platforms
- 🌐 **Multilingual Support**: Titles in English, Brazilian Portuguese, and original language
- 📊 **Result Counting**: Know how many movies match your filters before spinning
- 🎬 **Complete Data**: Cast, directors, synopsis, posters, and where to watch

### 📁 Project Structure

### 📁 Project Structure

```
popcorn-roulette-back/
├── src/
│   ├── db/
│   │   ├── schema.ts          # Drizzle schema with movies table
│   │   └── index.ts           # Database connection
│   ├── routes/
│   │   └── movies.routes.ts   # Movie endpoints (roulette, CRUD)
│   ├── services/
│   │   └── tmdb.service.ts    # TMDB API integration
│   ├── scripts/
│   │   └── scraper.ts         # Movie importer script
│   ├── types/
│   │   └── tmdb.ts            # TMDB API types
│   ├── validators/
│   │   └── movie.validator.ts # Zod schemas
│   └── index.ts               # Main application
├── drizzle.config.ts          # Drizzle configuration
├── package.json
├── tsconfig.json
└── .env.example
```

### 🛠️ Setup

#### 1. Prerequisites

- [Bun](https://bun.sh) installed
- PostgreSQL database running
- TMDB API key ([Get one free here](https://www.themoviedb.org/settings/api))

#### 2. Install Dependencies

```bash
bun install
```

#### 3. Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/popcorn_roulette
TMDB_API_KEY=your_tmdb_api_key_here
TMDB_API_BASE_URL=https://api.themoviedb.org/3
PORT=3000
```

#### 4. Database Setup

Generate and run migrations:

```bash
# Generate migration files
bun run db:generate

# Run migrations
bun run db:migrate
```

Or push schema directly (for development):

```bash
bun run db:push
```

Use Drizzle Studio to manage your database:

```bash
bun run db:studio
```

#### 5. Import Movies

Run the scraper to import movies from TMDB:

```bash
# Recent and popular movies (2021-2026)
    bun run scrape recent

# Movies from this decade (2020-2026)
    bun run scrape decade

# Movies from 2000+
    bun run scrape all

# Modern movies (1990-1999)
    bun run scrape modern

# Golden era movies (1940-1989)
    bun run scrape golden-era
```

The scraper will:
- Fetch movies from TMDB
- Extract age ratings (Brazil → USA → Original Country → Other → Default)
- Map production countries 
- Get cast, directors, and streaming providers
- Save to your database
- Skip movies that don't match any enum country gracefully

### 🎯 API Endpoints

#### Health Check

```http
GET /
```

Returns API information and available endpoints.

#### 🎲 Roulette (The Magic Endpoint!)

```http
GET /movies/roulette?countries=Brazil&ageRating=14+&genres=Action&minRating=7
```

**Query Parameters** (all optional):
- `countries`: Array of countries (USA, Brazil, South Korea, UK, France, Japan, Canada, etc.)
- `ageRating`: Age rating (L, 10+, 12+, 14+, 16+, 18+)
- `genres`: Array of genres (Action, Comedy, Drama, etc.)
- `minRating`: Minimum IMDB rating (0-10)
- `maxRating`: Maximum IMDB rating (0-10)
- `minDuration`: Minimum duration in minutes
- `maxDuration`: Maximum duration in minutes
- `minYear`: Minimum release year
- `maxYear`: Maximum release year
- `whereToWatch`: Array of streaming platforms

**Response**: A random movie matching your filters!

```json
{
  "id": 42,
  "title": "The Matrix",
  "originalTitle": "The Matrix",
  "countries": ["USA"],
  "ageRating": "14+",
  "genres": ["Action", "Science Fiction"],
  "imdbRating": "8.7",
  "duration": 136,
  "year": 1999,
  "directors": ["Lana Wachowski", "Lilly Wachowski"],
  "cast": [
    { "name": "Keanu Reeves", "role": "Neo" },
    { "name": "Laurence Fishburne", "role": "Morpheus" }
  ],
  "whereToWatch": ["Netflix", "HBO Max"],
  "posterUrl": "https://image.tmdb.org/t/p/w500/...",
  "synopsis": "A computer hacker learns..."
}
```

#### List Movies

```http
GET /movies?page=1&limit=20&genres=Comedy&minRating=7
```

Returns paginated list of movies with optional filters.

#### Get Movie

```http
GET /movies/:id
```

Get details of a specific movie by ID.

#### Create Movie

```http
POST /movies
Content-Type: application/json

{
  "title": "Inception",
  "countries": ["USA", "UK"],
  "ageRating": "12+",
  "genres": ["Action", "Science Fiction"],
  "duration": 148,
  "year": 2010
}
```

#### Update Movie

```http
PATCH /movies/:id
Content-Type: application/json

{
  "ageRating": "14+"
}
```

#### Delete Movie

```http
DELETE /movies/:id
```

### 🎬 Movie Schema

```typescript
{
  id: number;              // Primary key
  title: string;           // Movie title
  titlePtBr?: string;      // Brazilian Portuguese title
  originalTitle?: string;  // Original title (if different)
  countries: string[];     // Production countries (enum)
  ageRating: string;       // Age rating (enum: L, 10+, 12+, 14+, 16+, 18+)
  genres: string[];        // Genres
  imdbRating?: string;     // IMDB rating (decimal)
  duration?: number;       // Duration in minutes
  year?: number;           // Release year
  directors: string[];     // Director names
  cast: Array<{            // Cast members (JSONB)
    name: string;
    role: string;
  }>;
  whereToWatch: string[];  // Streaming platforms
  posterUrl?: string;      // Poster image URL
  synopsis?: string;       // Movie synopsis
}
```

### 🔑 Age Rating Mapping

The API automatically maps age ratings from different regions:

#### Brazil (BR)
- L → L (Livre/Free)
- 10 → 10+
- 12 → 12+
- 14 → 14+
- 16 → 16+
- 18 → 18+

#### USA (US)
- G → L
- PG → 10+
- PG-13 → 12+
- R → 16+
- NC-17 → 18+

### 🚦 Running the Server

#### Development (with hot reload)

```bash
bun run dev
```

#### Production

```bash
bun run start
```

Server runs on `http://localhost:3000` (or your configured PORT).

### 📊 Database Management

```bash
# Generate migration files
bun run db:generate

# Run migrations
bun run db:migrate

# Push schema directly (no migration files)
bun run db:push

# Open Drizzle Studio (database GUI)
bun run db:studio
```

### 🎯 Example Usage

#### 1. Spin the Roulette for a Family Movie

```bash
curl "http://localhost:3000/movies/roulette?ageRating=L&genres=Animation&minRating=7"
```

#### 2. Find Action Movies from 2020s

```bash
curl "http://localhost:3000/movies?genres=Action&minYear=2020&page=1&limit=10"
```

#### 3. Get Movies Available on Netflix

```bash
curl "http://localhost:3000/movies/roulette?whereToWatch=Netflix"
```

### 🔒 TMDB API Rate Limits

The scraper includes built-in rate limiting (250ms between requests) to respect TMDB API limits. Free tier allows ~40 requests per 10 seconds.

### 📝 Notes

- The scraper only imports movies with a minimum rating of 6.0
- Only movies from the 30+ supported countries are imported
- Age ratings prioritize Brazil (BR), falling back to USA (US)
- Streaming availability is fetched for Brazil by default (configurable)

### 🙏 Credits

This product uses the TMDB API but is not endorsed or certified by TMDB.

<a href="https://www.themoviedb.org/">
  <img src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg" alt="TMDB" width="200"/>
</a>

### 🤝 Contributing

Feel free to submit issues and enhancement requests!

### 📄 License

MIT
