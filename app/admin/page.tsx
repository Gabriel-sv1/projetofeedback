'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Download, Users, Star, TrendingUp, Calendar, Filter, RefreshCw } from 'lucide-react';
import Image from 'next/image';

interface Pesquisa {
  id: number;
  empresa: string;
  responsavel: string;
  nps: number;
  data_criacao: string;
}

interface Stats {
  total_pesquisas: number;
  nps_medio: number;
  promotores: number;
  neutros: number;
  detratores: number;
  nps_score: number;
}

interface AreaData {
  area: string;
  media_nota: number;
  total_avaliacoes: number;
  feedbacks_melhoria: number;
  feedbacks_positivos: number;
}

interface TimelineData {
  data: string;
  pesquisas: number;
  nps_medio: number;
}

const SENHA_ADMIN = 'venturini2024';

// Componente Badge simples
const Badge = ({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'success' | 'warning' | 'destructive' }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    destructive: 'bg-red-100 text-red-800'
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
};

// Componente de Filtro de Datas
const DateFilter = ({ 
  dataInicio, 
  dataFim, 
  onDataInicioChange, 
  onDataFimChange, 
  onFiltrar, 
  onLimpar,
  carregando 
}: {
  dataInicio: string;
  dataFim: string;
  onDataInicioChange: (data: string) => void;
  onDataFimChange: (data: string) => void;
  onFiltrar: () => void;
  onLimpar: () => void;
  carregando: boolean;
}) => {
  const hoje = new Date().toISOString().split('T')[0];
  const trintaDiasAtras = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const aplicarFiltroRapido = (dias: number) => {
    const fim = new Date().toISOString().split('T')[0];
    const inicio = new Date(Date.now() - dias * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    onDataInicioChange(inicio);
    onDataFimChange(fim);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filtro por Período
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <Label htmlFor="dataInicio">Data Início</Label>
            <Input
              id="dataInicio"
              type="date"
              value={dataInicio}
              onChange={(e) => onDataInicioChange(e.target.value)}
              max={hoje}
            />
          </div>
          <div>
            <Label htmlFor="dataFim">Data Fim</Label>
            <Input
              id="dataFim"
              type="date"
              value={dataFim}
              onChange={(e) => onDataFimChange(e.target.value)}
              max={hoje}
              min={dataInicio}
            />
          </div>
          <div className="flex items-end gap-2">
            <Button 
              onClick={onFiltrar} 
              disabled={carregando}
              className="bg-slate-900 hover:bg-slate-800"
            >
              {carregando ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Filter className="w-4 h-4 mr-2" />}
              Filtrar
            </Button>
            <Button 
              onClick={onLimpar} 
              variant="outline"
              disabled={carregando}
            >
              Limpar
            </Button>
          </div>
        </div>
        
        {/* Filtros Rápidos */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-slate-600 mr-2">Filtros rápidos:</span>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => aplicarFiltroRapido(7)}
            className="text-xs"
          >
            Últimos 7 dias
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => aplicarFiltroRapido(30)}
            className="text-xs"
          >
            Últimos 30 dias
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => aplicarFiltroRapido(90)}
            className="text-xs"
          >
            Últimos 90 dias
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => {
              const inicioAno = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
              onDataInicioChange(inicioAno);
              onDataFimChange(hoje);
            }}
            className="text-xs"
          >
            Este ano
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function AdminPage() {
  const [autenticado, setAutenticado] = useState(false);
  const [senha, setSenha] = useState('');
  const [pesquisas, setPesquisas] = useState<Pesquisa[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [areas, setAreas] = useState<AreaData[]>([]);
  const [timeline, setTimeline] = useState<TimelineData[]>([]);
  const [carregando, setCarregando] = useState(false);
  
  // Estados do filtro de data
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [filtroAtivo, setFiltroAtivo] = useState(false);

  // Inicializar datas padrão (últimos 30 dias)
  useEffect(() => {
    const hoje = new Date().toISOString().split('T')[0];
    const trintaDiasAtras = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setDataInicio(trintaDiasAtras);
    setDataFim(hoje);
  }, []);

  const handleLogin = () => {
    if (senha === SENHA_ADMIN) {
      setAutenticado(true);
      carregarDados();
    } else {
      alert('Senha incorreta!');
    }
  };

  const carregarDados = async (inicio?: string, fim?: string) => {
    setCarregando(true);
    try {
      let url = '/api/pesquisa';
      const params = new URLSearchParams();
      
      if (inicio && fim) {
        params.append('dataInicio', inicio);
        params.append('dataFim', fim);
        url += `?${params.toString()}`;
        setFiltroAtivo(true);
      } else {
        setFiltroAtivo(false);
      }

      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data.stats);
        setAreas(data.data.areas);
        setPesquisas(data.data.recent);
        setTimeline(data.data.timeline || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados do dashboard');
    } finally {
      setCarregando(false);
    }
  };

  const aplicarFiltro = () => {
    if (dataInicio && dataFim) {
      carregarDados(dataInicio, dataFim);
    }
  };

  const limparFiltro = () => {
    setDataInicio('');
    setDataFim('');
    setFiltroAtivo(false);
    carregarDados();
  };

  const exportarCSV = () => {
    if (pesquisas.length === 0) {
      alert('Não há dados para exportar');
      return;
    }

    const headers = ['ID', 'Empresa', 'Responsável', 'NPS', 'Data'];
    const csvContent = [
      headers.join(','),
      ...pesquisas.map(p => [
        p.id,
        `"${p.empresa}"`,
        `"${p.responsavel}"`,
        p.nps,
        new Date(p.data_criacao).toLocaleDateString('pt-BR')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    const nomeArquivo = filtroAtivo 
      ? `pesquisas_${dataInicio}_${dataFim}.csv`
      : `pesquisas_${new Date().toISOString().split('T')[0]}.csv`;
    
    link.setAttribute('download', nomeArquivo);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getNPSColor = (nps: number) => {
    if (nps >= 9) return 'text-green-600';
    if (nps >= 7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getNPSBadge = (nps: number) => {
    if (nps >= 9) return <Badge variant="success">Promotor</Badge>;
    if (nps >= 7) return <Badge variant="warning">Neutro</Badge>;
    return <Badge variant="destructive">Detrator</Badge>;
  };

  if (!autenticado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-slate-900">
              Área Administrativa
            </CardTitle>
            <p className="text-slate-600">Digite a senha para acessar o dashboard</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite a senha"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <Button onClick={handleLogin} className="w-full bg-slate-900 hover:bg-slate-800">
              Entrar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (carregando && !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  const npsData = stats ? [
    { name: 'Promotores', value: parseInt(stats.promotores.toString()), color: '#10b981' },
    { name: 'Neutros', value: parseInt(stats.neutros.toString()), color: '#f59e0b' },
    { name: 'Detratores', value: parseInt(stats.detratores.toString()), color: '#ef4444' }
  ] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/venturini-logo.png"
              alt="Venturini&Co"
              width={120}
              height={40}
              className="h-8 w-auto"
            />
            <div>
              <h1 className="text-2xl font-bold">Dashboard Administrativo</h1>
              <p className="text-slate-300">
                Sistema de Feedback - Venturini&Co
                {filtroAtivo && (
                  <span className="ml-2 text-yellow-300">
                    📅 Filtrado: {new Date(dataInicio).toLocaleDateString('pt-BR')} - {new Date(dataFim).toLocaleDateString('pt-BR')}
                  </span>
                )}
              </p>
            </div>
          </div>
          <Button
            onClick={exportarCSV}
            variant="outline"
            className="bg-white text-slate-900 hover:bg-slate-100"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Filtro de Datas */}
      <DateFilter
        dataInicio={dataInicio}
        dataFim={dataFim}
        onDataInicioChange={setDataInicio}
        onDataFimChange={setDataFim}
        onFiltrar={aplicarFiltro}
        onLimpar={limparFiltro}
        carregando={carregando}
      />

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total de Pesquisas</p>
                <p className="text-3xl font-bold text-slate-900">{stats?.total_pesquisas || 0}</p>
              </div>
              <Users className="w-8 h-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">NPS Médio</p>
                <p className="text-3xl font-bold text-slate-900">
                  {stats?.nps_medio ? parseFloat(stats.nps_medio.toString()).toFixed(1) : '0.0'}
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Score NPS</p>
                <p className={`text-3xl font-bold ${stats?.nps_score && stats.nps_score > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats?.nps_score || 0}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Promotores</p>
                <p className="text-3xl font-bold text-green-600">{stats?.promotores || 0}</p>
              </div>
              <div className="text-2xl">😍</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs com Conteúdo */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="areas">Avaliação por Área</TabsTrigger>
          <TabsTrigger value="pesquisas">Pesquisas Recentes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Pizza NPS */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição NPS</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={npsData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {npsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Informações Gerais */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo Geral</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Total de Respostas:</span>
                  <span className="font-semibold">{stats?.total_pesquisas || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">NPS Médio:</span>
                  <span className="font-semibold">{stats?.nps_medio ? parseFloat(stats.nps_medio.toString()).toFixed(1) : '0.0'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Score NPS:</span>
                  <span className={`font-semibold ${stats?.nps_score && stats.nps_score > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats?.nps_score || 0}
                  </span>
                </div>
                <div className="pt-4 border-t">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-green-600">{stats?.promotores || 0}</p>
                      <p className="text-sm text-slate-600">Promotores</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-yellow-600">{stats?.neutros || 0}</p>
                      <p className="text-sm text-slate-600">Neutros</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-600">{stats?.detratores || 0}</p>
                      <p className="text-sm text-slate-600">Detratores</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Evolução Temporal</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={timeline}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="data" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 10]} />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="pesquisas" fill="#0f172a" name="Pesquisas" />
                  <Line yAxisId="right" type="monotone" dataKey="nps_medio" stroke="#ef4444" strokeWidth={2} name="NPS Médio" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="areas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Avaliação por Área de Serviço</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={areas}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="area" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Bar dataKey="media_nota" fill="#0f172a" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {areas.map((area) => (
              <Card key={area.area}>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-slate-900 mb-2">{area.area}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Média:</span>
                      <span className="font-medium">{parseFloat(area.media_nota.toString()).toFixed(1)}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Avaliações:</span>
                      <span className="font-medium">{area.total_avaliacoes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600">Feedbacks +:</span>
                      <span className="font-medium">{area.feedbacks_positivos}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-600">Melhorias:</span>
                      <span className="font-medium">{area.feedbacks_melhoria}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pesquisas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pesquisas {filtroAtivo ? 'Filtradas' : 'Recentes'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">ID</th>
                      <th className="text-left p-2">Empresa</th>
                      <th className="text-left p-2">Responsável</th>
                      <th className="text-left p-2">NPS</th>
                      <th className="text-left p-2">Categoria</th>
                      <th className="text-left p-2">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pesquisas.map((pesquisa) => (
                      <tr key={pesquisa.id} className="border-b hover:bg-slate-50">
                        <td className="p-2">{pesquisa.id}</td>
                        <td className="p-2 font-medium">{pesquisa.empresa}</td>
                        <td className="p-2">{pesquisa.responsavel}</td>
                        <td className={`p-2 font-bold ${getNPSColor(pesquisa.nps)}`}>
                          {pesquisa.nps}
                        </td>
                        <td className="p-2">{getNPSBadge(pesquisa.nps)}</td>
                        <td className="p-2 text-slate-600">
                          {new Date(pesquisa.data_criacao).toLocaleDateString('pt-BR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
