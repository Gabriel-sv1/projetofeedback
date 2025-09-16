# 🚀 Guia Completo: Deploy no Vercel

## 📋 Pré-requisitos
- Conta no GitHub
- Conta no Vercel (gratuita)
- Projeto funcionando localmente

## 🔧 Passo 1: Preparar o Projeto

### 1.1 Criar repositório no GitHub
```bash
# No diretório do projeto
git init
git add .
git commit -m "Initial commit - Sistema de Feedback Venturini"

# Criar repositório no GitHub e conectar
git remote add origin https://github.com/SEU_USUARIO/sistema-feedback-venturini.git
git branch -M main
git push -u origin main
```

### 1.2 Verificar arquivos necessários
✅ package.json - OK
✅ next.config.js - OK  
✅ vercel.json - OK
✅ .env.local (não commitado)

## 🌐 Passo 2: Deploy no Vercel

### 2.1 Acessar Vercel
1. Vá para https://vercel.com
2. Faça login com GitHub
3. Clique em "New Project"

### 2.2 Importar Projeto
1. Selecione seu repositório GitHub
2. Configure as settings:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: .next
   - Install Command: `npm install`

### 2.3 Configurar Variáveis de Ambiente
No painel do Vercel, vá em Settings > Environment Variables:

```
PGUSER=seu_usuario_postgres
PGPASSWORD=sua_senha_postgres
PGHOST=seu_host_postgres
PGPORT=5432
PGDATABASE=feedback_system
```

## 🗄️ Passo 3: Configurar Banco de Dados

### Opção A: Vercel Postgres (Recomendado)
1. No dashboard do Vercel, vá em Storage
2. Clique em "Create Database"
3. Selecione "Postgres"
4. As variáveis serão criadas automaticamente

### Opção B: PostgreSQL Externo
Use serviços como:
- Supabase (gratuito)
- Railway (gratuito)
- Neon (gratuito)
- AWS RDS (pago)

## 📊 Passo 4: Migrar Banco de Dados

### 4.1 Criar tabelas no novo banco
```sql
-- Executar no novo banco PostgreSQL

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

## 🌍 Passo 5: Configurar Domínio Personalizado

### 5.1 No painel do Vercel
1. Vá em Settings > Domains
2. Adicione seu domínio (ex: pesquisa.venturini.com.br)
3. Configure os DNS conforme instruções

### 5.2 Configuração DNS
No seu provedor de domínio, adicione:
```
Type: CNAME
Name: pesquisa (ou subdomínio desejado)
Value: cname.vercel-dns.com
```

## ⚡ Passo 6: Deploy Automático

### 6.1 Configurar GitHub Integration
- Cada push na branch main = deploy automático
- Pull requests = preview deployments
- Rollback fácil via interface

### 6.2 Comandos úteis
```bash
# Deploy manual via CLI
npm i -g vercel
vercel --prod

# Ver logs
vercel logs

# Ver deployments
vercel ls
```

## 🔒 Passo 7: Configurações de Produção

### 7.1 Variáveis de ambiente adicionais
```
NODE_ENV=production
NEXTAUTH_URL=https://seudominio.com
NEXTAUTH_SECRET=sua_chave_secreta_longa
```

### 7.2 Otimizações
- Compressão automática ✅
- CDN global ✅
- SSL automático ✅
- Cache otimizado ✅

## 📈 Passo 8: Monitoramento

### 8.1 Analytics do Vercel
- Pageviews
- Performance metrics
- Error tracking

### 8.2 Logs e Debug
- Function logs em tempo real
- Error boundaries
- Performance insights

## 🚨 Troubleshooting

### Erro comum: Build failed
```bash
# Verificar se build funciona localmente
npm run build

# Verificar dependências
npm install
```

### Erro: Database connection
- Verificar variáveis de ambiente
- Testar conexão com banco
- Verificar firewall/whitelist

### Erro: 404 em rotas
- Verificar next.config.js
- Verificar estrutura de pastas app/

## 📞 Suporte

### Links úteis:
- Documentação Vercel: https://vercel.com/docs
- Suporte Vercel: https://vercel.com/support
- Status Page: https://vercel-status.com

### Comandos de emergência:
```bash
# Rollback para versão anterior
vercel rollback

# Ver status do projeto
vercel inspect

# Redeployar
vercel --prod --force
```

---

## ✅ Checklist Final

- [ ] Repositório GitHub criado
- [ ] Projeto importado no Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados criado e migrado
- [ ] Deploy realizado com sucesso
- [ ] Domínio personalizado configurado (opcional)
- [ ] Testes realizados em produção
- [ ] Monitoramento ativo

**🎉 Seu sistema estará online em poucos minutos!**
