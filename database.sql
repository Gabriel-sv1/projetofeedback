-- Tabela de empresas
CREATE TABLE IF NOT EXISTS empresas (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  responsavel VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de pesquisas
CREATE TABLE IF NOT EXISTS pesquisas (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER REFERENCES empresas(id),
  nps INTEGER NOT NULL CHECK (nps >= 0 AND nps <= 10),
  quer_indicar BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de avaliações por área
CREATE TABLE IF NOT EXISTS avaliacoes (
  id SERIAL PRIMARY KEY,
  pesquisa_id INTEGER REFERENCES pesquisas(id),
  area VARCHAR(100) NOT NULL,
  nota INTEGER NOT NULL CHECK (nota >= 1 AND nota <= 5),
  feedback_positivo TEXT,
  feedback_melhoria TEXT,
  nao_se_aplica BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de indicações
CREATE TABLE IF NOT EXISTS indicacoes (
  id SERIAL PRIMARY KEY,
  pesquisa_id INTEGER REFERENCES pesquisas(id),
  nome VARCHAR(255) NOT NULL,
  empresa VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefone VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
