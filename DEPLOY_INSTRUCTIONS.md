# 🚀 Como Mudar o Domínio do Site

## Opção 1: Vercel (Recomendado - Gratuito)

### Passo 1: Preparar o projeto
```bash
# Instalar Vercel CLI
npm i -g vercel

# No diretório do projeto
vercel login
vercel --prod
```

### Passo 2: Configurar domínio personalizado
1. Acesse https://vercel.com/dashboard
2. Selecione seu projeto
3. Vá em "Settings" > "Domains"
4. Adicione seu domínio personalizado (ex: pesquisa.venturini.com.br)
5. Configure os DNS conforme instruções da Vercel

### Passo 3: Configurar banco de dados
- Use Vercel Postgres ou configure PostgreSQL externo
- Adicione variáveis de ambiente no painel da Vercel

---

## Opção 2: Netlify

### Deploy
```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=.next
```

### Domínio personalizado
1. Acesse https://app.netlify.com
2. Site Settings > Domain management
3. Adicione seu domínio personalizado

---

## Opção 3: Servidor Próprio (VPS/Dedicado)

### Requisitos
- Servidor com Node.js 18+
- PostgreSQL
- Nginx (proxy reverso)
- SSL (Let's Encrypt)

### Deploy
```bash
# No servidor
git clone [seu-repositorio]
cd sistema-feedback-v2
npm install
npm run build
npm start
```

### Nginx Config
```nginx
server {
    listen 80;
    server_name seudominio.com.br;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Opção 4: Hostinger/cPanel

### Para hospedagem compartilhada
1. Faça build estático: `npm run build && npm run export`
2. Upload da pasta `out/` para public_html
3. Configure domínio no painel da hospedagem

---

## 🔧 Configurações Necessárias

### Variáveis de Ambiente (.env.local)
```
PGUSER=seu_usuario_db
PGPASSWORD=sua_senha_db
PGHOST=localhost
PGPORT=5432
PGDATABASE=feedback_system
```

### Para produção, configure:
- SSL/HTTPS
- Backup automático do banco
- Monitoramento
- CDN (opcional)

---

## 💡 Recomendação

**Para começar rapidamente**: Use Vercel
- Deploy automático via Git
- SSL gratuito
- Domínio personalizado fácil
- Banco PostgreSQL integrado

**Para controle total**: VPS próprio
- Mais configuração
- Controle completo
- Custos de servidor
