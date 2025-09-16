# 🌐 Como Conectar com o Vercel - Passo a Passo

## 🎯 Método Mais Simples (Recomendado)

### 1️⃣ Via Interface Web do Vercel

1. **Acesse**: https://vercel.com
2. **Faça login** com sua conta GitHub
3. **Clique em "New Project"**
4. **Importe do GitHub**:
   - Conecte sua conta GitHub
   - Selecione o repositório do projeto
   - Clique em "Import"

### 2️⃣ Configurações Automáticas
O Vercel detectará automaticamente:
- ✅ Framework: Next.js
- ✅ Build Command: `npm run build`
- ✅ Output Directory: `.next`
- ✅ Install Command: `npm install`

### 3️⃣ Deploy Inicial
- Clique em **"Deploy"**
- Aguarde o build (2-3 minutos)
- Seu site estará online!

---

## ⚡ Método Via CLI (Alternativo)

### 1️⃣ Instalar Vercel CLI
```bash
npm install -g vercel
```

### 2️⃣ Login
```bash
vercel login
```

### 3️⃣ Deploy
```bash
# No diretório do projeto
vercel --prod
```

---

## 🗄️ Configurar Banco de Dados

### Opção A: Vercel Postgres (Mais Fácil)
1. No dashboard do Vercel, vá em **"Storage"**
2. Clique em **"Create Database"**
3. Selecione **"Postgres"**
4. As variáveis de ambiente serão criadas automaticamente

### Opção B: Banco Externo Gratuito

#### Supabase (Recomendado)
1. Acesse: https://supabase.com
2. Crie novo projeto
3. Vá em Settings > Database
4. Copie a connection string

#### Neon (Alternativa)
1. Acesse: https://neon.tech
2. Crie novo projeto
3. Copie as credenciais

---

## 🔧 Configurar Variáveis de Ambiente

### No Painel do Vercel:
1. Vá em **Settings > Environment Variables**
2. Adicione as seguintes variáveis:

```
PGUSER=seu_usuario
PGPASSWORD=sua_senha
PGHOST=seu_host
PGPORT=5432
PGDATABASE=feedback_system
```

### Para Vercel Postgres:
As variáveis são criadas automaticamente:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`

---

## 📊 Executar SQL no Novo Banco

### Conecte no seu banco e execute:

```sql
-- Criar tabelas
CREATE TABLE empresas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    responsavel VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pesquisas (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id),
    nps INTEGER NOT NULL,
    quer_indicar BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE avaliacoes (
    id SERIAL PRIMARY KEY,
    pesquisa_id INTEGER REFERENCES pesquisas(id),
    area VARCHAR(100) NOT NULL,
    nota INTEGER NOT NULL,
    nao_se_aplica BOOLEAN DEFAULT FALSE,
    feedback_positivo TEXT DEFAULT '',
    feedback_melhoria TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE indicacoes (
    id SERIAL PRIMARY KEY,
    pesquisa_id INTEGER REFERENCES pesquisas(id),
    nome VARCHAR(255) NOT NULL,
    empresa VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telefone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🌍 Configurar Domínio Personalizado (Opcional)

### 1️⃣ No Vercel:
1. Vá em **Settings > Domains**
2. Adicione seu domínio (ex: `pesquisa.venturini.com.br`)

### 2️⃣ No seu provedor de domínio:
Adicione um registro CNAME:
```
Nome: pesquisa
Valor: cname.vercel-dns.com
```

---

## ✅ Checklist de Deploy

- [ ] Conta no Vercel criada
- [ ] Repositório GitHub com o código
- [ ] Projeto importado no Vercel
- [ ] Build realizado com sucesso
- [ ] Banco de dados configurado
- [ ] Variáveis de ambiente definidas
- [ ] Tabelas SQL criadas
- [ ] Site funcionando
- [ ] Domínio personalizado (opcional)

---

## 🚨 Problemas Comuns

### Build Failed
```bash
# Teste localmente primeiro
npm run build
```

### Database Connection Error
- Verifique as variáveis de ambiente
- Teste a conexão com o banco
- Verifique se as tabelas foram criadas

### 404 Error
- Verifique se o `next.config.js` está correto
- Confirme a estrutura de pastas `app/`

---

## 📞 Suporte

### Links Úteis:
- **Dashboard**: https://vercel.com/dashboard
- **Documentação**: https://vercel.com/docs
- **Suporte**: https://vercel.com/support
- **Status**: https://vercel-status.com

### Comandos Úteis:
```bash
# Ver logs
vercel logs

# Listar deployments
vercel ls

# Rollback
vercel rollback

# Redeployar
vercel --prod --force
```

---

## 🎉 Resultado Final

Após seguir estes passos, você terá:
- ✅ Site online 24/7
- ✅ SSL automático (HTTPS)
- ✅ CDN global
- ✅ Deploy automático via Git
- ✅ Monitoramento integrado
- ✅ Backup automático

**Seu sistema de feedback estará disponível globalmente em poucos minutos!**
