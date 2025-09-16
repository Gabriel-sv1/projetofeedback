'use client';

import { useState, useCallback, useMemo, Suspense, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, CheckCircle } from 'lucide-react';
import dynamic from 'next/dynamic';

// Lazy loading dos componentes pesados
const LazyImage = dynamic(() => import('@/components/optimized/LazyImage'), {
  loading: () => <div className="h-12 w-32 bg-slate-200 animate-pulse rounded" />
});

const OptimizedForm = dynamic(() => import('@/components/optimized/OptimizedForm'), {
  loading: () => <div className="h-64 bg-slate-100 animate-pulse rounded-xl" />
});

interface FormData {
  empresa: string;
  responsavel: string;
  nps: number | null;
  querIndicar: boolean;
  indicacoes: Array<{
    nome: string;
    empresa: string;
    email: string;
    telefone: string;
  }>;
  avaliacoes: {
    [key: string]: {
      nota: number;
      naoSeAplica: boolean;
      feedbackPositivo: string;
      feedbackMelhoria: string;
    };
  };
}

const areas = [
  'Atendimento',
  'Gestão de Tráfego', 
  'Design',
  'Copywriting',
  'Tecnologia',
  'Vendas'
];

// Componente de animação NPS otimizado e corrigido
const NPSAnimation = ({ show, onComplete }: { show: boolean; onComplete: () => void }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onComplete();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
    >
      <div className="text-6xl">
        <motion.div
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 1,
            repeat: 2,
            ease: "easeInOut"
          }}
        >
          🎉
        </motion.div>
      </div>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 opacity-20"
        animate={{ opacity: [0, 0.3, 0] }}
        transition={{ duration: 1, repeat: 2 }}
      />
    </motion.div>
  );
};

// Componente de progresso otimizado e centralizado
const ProgressIndicator = ({ currentStep }: { currentStep: number }) => {
  const steps = useMemo(() => [
    { number: 1, title: 'Informações Básicas' },
    { number: 2, title: 'Avaliação por Área' },
    { number: 3, title: 'Finalização' }
  ], []);

  return (
    <motion.div 
      className="mb-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      {/* Indicador de progresso centralizado */}
      <div className="flex justify-center items-center mb-6">
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <motion.div 
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                  currentStep >= step.number 
                    ? 'bg-slate-900 text-white shadow-lg' 
                    : 'bg-slate-200 text-slate-500'
                }`}
                whileHover={{ scale: 1.05 }}
              >
                {currentStep > step.number ? <CheckCircle className="w-6 h-6" /> : step.number}
              </motion.div>
              {index < steps.length - 1 && (
                <div className={`h-1 w-20 mx-4 transition-all duration-300 ${
                  currentStep > step.number ? 'bg-slate-900' : 'bg-slate-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Título da etapa centralizado */}
      <div className="text-center">
        <p className="text-slate-600 font-medium text-lg">
          Etapa {currentStep} de 3 - {steps[currentStep - 1]?.title}
        </p>
      </div>
    </motion.div>
  );
};

// Componente de sucesso otimizado
const SuccessScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md w-full text-center"
    >
      <div className="bg-white rounded-2xl p-8 shadow-xl">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="text-6xl mb-4"
        >
          ✅
        </motion.div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Pesquisa Enviada com Sucesso!
        </h2>
        <p className="text-slate-600 mb-6">
          Obrigado pelo seu feedback. Suas respostas são muito importantes para nós!
        </p>
        <Button 
          onClick={() => window.location.reload()} 
          className="bg-slate-900 hover:bg-slate-800"
        >
          Nova Pesquisa
        </Button>
      </div>
    </motion.div>
  </div>
);

export default function FeedbackForm() {
  const [etapa, setEtapa] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    empresa: '',
    responsavel: '',
    nps: null,
    querIndicar: false,
    indicacoes: [],
    avaliacoes: {}
  });
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [showNPSAnimation, setShowNPSAnimation] = useState(false);

  const handleFormDataChange = useCallback((newData: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
    
    // Trigger animação quando NPS for 10
    if (newData.nps === 10) {
      setShowNPSAnimation(true);
    }
  }, []);

  const proximaEtapa = useCallback(() => {
    if (etapa < 3) {
      setEtapa(etapa + 1);
    }
  }, [etapa]);

  const etapaAnterior = useCallback(() => {
    if (etapa > 1) {
      setEtapa(etapa - 1);
    }
  }, [etapa]);

  const enviarPesquisa = useCallback(async () => {
    setEnviando(true);
    try {
      // Converter avaliacoes para o formato esperado pela API
      const avaliacoesArray = areas.map(area => ({
        area,
        nota: formData.avaliacoes[area]?.nota || 0,
        feedbackPositivo: formData.avaliacoes[area]?.feedbackPositivo || '',
        feedbackMelhoria: formData.avaliacoes[area]?.feedbackMelhoria || '',
        naoSeAplica: formData.avaliacoes[area]?.naoSeAplica || false
      }));

      const dataToSend = {
        ...formData,
        avaliacoes: avaliacoesArray
      };

      const response = await fetch('/api/pesquisa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        setEnviado(true);
      } else {
        const errorData = await response.json();
        console.error('Erro do servidor:', errorData);
        alert('Erro ao enviar pesquisa. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao enviar pesquisa. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  }, [formData]);

  const stepTitle = useMemo(() => {
    switch (etapa) {
      case 1: return { title: 'Vamos começar!', subtitle: 'Conte-nos um pouco sobre você e sua experiência', icon: <Star className="w-6 h-6 text-yellow-500" /> };
      case 2: return { title: 'Avaliação por área', subtitle: 'Como você avalia nossos serviços em cada área?', icon: '📊' };
      case 3: return { title: 'Quase lá!', subtitle: 'Revise suas respostas antes de enviar', icon: <CheckCircle className="w-6 h-6 text-green-500" /> };
      default: return { title: '', subtitle: '', icon: null };
    }
  }, [etapa]);

  if (enviado) {
    return <SuccessScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AnimatePresence>
        {showNPSAnimation && (
          <NPSAnimation 
            show={showNPSAnimation}
            onComplete={() => setShowNPSAnimation(false)} 
          />
        )}
      </AnimatePresence>
      
      {/* Header Centralizado */}
      <div className="bg-slate-900 text-white py-8">
        <div className="max-w-4xl mx-auto text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <Suspense fallback={<div className="h-12 w-32 bg-slate-700 animate-pulse rounded" />}>
              <LazyImage
                src="/venturini-logo.png"
                alt="Venturini&Co"
                width={160}
                height={50}
                className="h-12 w-auto"
                priority
              />
            </Suspense>
            <div>
              <h1 className="text-3xl font-bold mb-2">Pesquisa de Satisfação</h1>
              <p className="text-slate-300 text-lg">Sua opinião é fundamental para nosso crescimento</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-6">
        {/* Indicador de progresso centralizado no topo */}
        <ProgressIndicator currentStep={etapa} />

        <AnimatePresence mode="wait">
          <motion.div
            key={etapa}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-6 text-center">
                <CardTitle className="text-2xl font-bold text-slate-900 flex items-center justify-center gap-2">
                  {stepTitle.icon}
                  {stepTitle.title}
                </CardTitle>
                <p className="text-slate-600">{stepTitle.subtitle}</p>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div className="h-64 bg-slate-100 animate-pulse rounded-xl" />}>
                  <OptimizedForm
                    etapa={etapa}
                    formData={formData}
                    onFormDataChange={handleFormDataChange}
                    onNext={proximaEtapa}
                    onPrevious={etapaAnterior}
                    onSubmit={enviarPesquisa}
                    isSubmitting={enviando}
                  />
                </Suspense>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <motion.div 
          className="text-center mt-8 text-sm text-slate-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="flex items-center justify-center gap-2">
            🔒 Os dados são utilizados para melhoria contínua do serviço.
          </p>
          <p>Ao enviar, você concorda com nossa política de privacidade.</p>
        </motion.div>
      </div>
    </div>
  );
}
