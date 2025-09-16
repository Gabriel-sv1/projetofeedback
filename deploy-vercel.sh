#!/bin/bash

echo "🚀 Script de Deploy para Vercel - Sistema de Feedback Venturini"
echo "================================================================"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para print colorido
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    print_error "package.json não encontrado. Execute este script no diretório do projeto."
    exit 1
fi

print_status "Verificando arquivos do projeto..."

# Verificar arquivos necessários
files=("package.json" "next.config.js" "vercel.json")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        print_status "$file encontrado"
    else
        print_warning "$file não encontrado - será criado"
    fi
done

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    print_info "Instalando dependências..."
    npm install
fi

# Testar build local
print_info "Testando build local..."
if npm run build; then
    print_status "Build local bem-sucedido"
else
    print_error "Falha no build local. Corrija os erros antes de continuar."
    exit 1
fi

# Verificar se Git está inicializado
if [ ! -d ".git" ]; then
    print_info "Inicializando repositório Git..."
    git init
    git add .
    git commit -m "Initial commit - Sistema de Feedback Venturini"
    print_status "Repositório Git inicializado"
else
    print_info "Adicionando mudanças ao Git..."
    git add .
    git commit -m "Update: $(date '+%Y-%m-%d %H:%M:%S')" || print_warning "Nenhuma mudança para commit"
fi

# Verificar se Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    print_info "Instalando Vercel CLI..."
    npm install -g vercel
fi

print_info "Iniciando deploy no Vercel..."
print_warning "Você precisará fazer login no Vercel se ainda não estiver logado."

# Deploy no Vercel
vercel --prod

print_status "Deploy concluído!"
print_info "Próximos passos:"
echo "1. Configure as variáveis de ambiente no painel do Vercel"
echo "2. Configure o banco de dados PostgreSQL"
echo "3. Execute as migrations SQL no novo banco"
echo "4. Configure domínio personalizado (opcional)"

echo ""
print_info "Links úteis:"
echo "- Dashboard Vercel: https://vercel.com/dashboard"
echo "- Documentação: https://vercel.com/docs"
echo "- Guia completo: ./VERCEL_DEPLOY_GUIDE.md"

echo ""
print_status "Script concluído! 🎉"
