'use client';

import { memo, useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ThumbsUp, Plus, X, ArrowRight, ArrowLeft, MessageSquare } from 'lucide-react';

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

interface OptimizedFormProps {
  etapa: number;
  formData: FormData;
  onFormDataChange: (data: Partial<FormData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const areas = [
  'Atendimento',
  'Gestão de Tráfego', 
  'Design',
  'Copywriting',
  'Tecnologia',
  'Vendas'
];

const notaLabels = ['', 'Péssimo', 'Ruim', 'Neutro', 'Satisfeito', 'Muito satisfeito'];

// Componente NPSSelector otimizado
const NPSSelector = memo(({ value, onChange }: { value: number | null; onChange: (nota: number) => void }) => {
  const npsButtons = useMemo(() => 
    Array.from({ length: 11 }, (_, i) => i).map((nota) => (
      <motion.button
        key={nota}
        type="button"
        onClick={() => onChange(nota)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`h-12 rounded-lg font-bold text-lg transition-all duration-200 ${
          value === nota
            ? 'bg-slate-900 text-white shadow-lg scale-110'
            : 'bg-white hover:bg-slate-100 text-slate-700 shadow-sm hover:shadow-md'
        }`}
      >
        {nota}
      </motion.button>
    )), [value, onChange]
  );

  return (
    <div className="bg-slate-50 rounded-xl p-6">
      <div className="grid grid-cols-11 gap-2 mb-4">
        {npsButtons}
      </div>
      <div className="flex justify-between text-sm text-slate-600">
        <span>😞 Não recomendaria</span>
        <span>😍 Recomendaria muito</span>
      </div>
    </div>
  );
});

NPSSelector.displayName = 'NPSSelector';

// Componente AreaEvaluation otimizado com feedback
const AreaEvaluation = memo(({ 
  area, 
  index, 
  value, 
  onChange 
}: { 
  area: string; 
  index: number; 
  value: { nota: number; naoSeAplica: boolean; feedbackPositivo: string; feedbackMelhoria: string } | undefined;
  onChange: (area: string, data: { nota?: number; naoSeAplica?: boolean; feedbackPositivo?: string; feedbackMelhoria?: string }) => void;
}) => {
  const handleRadioChange = useCallback((radioValue: string) => {
    if (radioValue === 'nao-se-aplica') {
      onChange(area, { nota: 0, naoSeAplica: true, feedbackPositivo: '', feedbackMelhoria: '' });
    } else {
      const nota = parseInt(radioValue);
      onChange(area, { nota, naoSeAplica: false });
    }
  }, [area, onChange]);

  const handleFeedbackChange = useCallback((field: 'feedbackPositivo' | 'feedbackMelhoria', text: string) => {
    onChange(area, { [field]: text });
  }, [area, onChange]);

  // Lógica corrigida para mostrar as caixas de feedback
  const currentValue = value || { nota: 0, naoSeAplica: false, feedbackPositivo: '', feedbackMelhoria: '' };
  const showFeedbackBox = !currentValue.naoSeAplica && currentValue.nota > 0;
  const needsImprovementFeedback = showFeedbackBox && currentValue.nota >= 1 && currentValue.nota <= 4;
  const needsPositiveFeedback = showFeedbackBox && currentValue.nota === 5;

  return (
    <motion.div 
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="bg-slate-50 rounded-xl p-6">
        <h3 className="text-lg font-medium text-slate-900 mb-4 flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {index + 1}
          </div>
          Como você avalia as entregas de {area}?
        </h3>
        
        <RadioGroup
          value={currentValue.naoSeAplica ? 'nao-se-aplica' : currentValue.nota > 0 ? currentValue.nota.toString() : ''}
          onValueChange={handleRadioChange}
          className="space-y-3"
        >
          {[5, 4, 3, 2, 1].map((nota) => (
            <motion.div 
              key={nota} 
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white transition-colors"
              whileHover={{ scale: 1.02 }}
            >
              <RadioGroupItem value={nota.toString()} id={`${area}-${nota}`} />
              <Label htmlFor={`${area}-${nota}`} className="cursor-pointer flex-1 flex items-center gap-3">
                <span className="font-bold text-slate-900">{nota}</span>
                <span className="text-slate-600">—</span>
                <span className="text-slate-700">{notaLabels[nota]}</span>
                <div className="flex">
                  {[...Array(nota)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </Label>
            </motion.div>
          ))}
          <motion.div 
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white transition-colors border-t border-slate-200 mt-4 pt-4"
            whileHover={{ scale: 1.02 }}
          >
            <RadioGroupItem value="nao-se-aplica" id={`${area}-na`} />
            <Label htmlFor={`${area}-na`} className="cursor-pointer text-slate-600">
              ❌ Não possuo este módulo / não se aplica
            </Label>
          </motion.div>
        </RadioGroup>

        {/* Caixa de Feedback para Melhorias (notas 1-4) */}
        <AnimatePresence>
          {needsImprovementFeedback && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <Label className="text-sm font-medium text-red-800 flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4" />
                O que podemos melhorar em {area}? *
              </Label>
              <Textarea
                value={currentValue.feedbackMelhoria}
                onChange={(e) => handleFeedbackChange('feedbackMelhoria', e.target.value)}
                placeholder="Conte-nos como podemos melhorar nossos serviços nesta área..."
                className="min-h-[80px] border-red-200 focus:border-red-400"
                required
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Caixa de Feedback Positivo (nota 5) */}
        <AnimatePresence>
          {needsPositiveFeedback && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg"
            >
              <Label className="text-sm font-medium text-green-800 flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4" />
                O que você mais gosta em nosso {area}? *
              </Label>
              <Textarea
                value={currentValue.feedbackPositivo}
                onChange={(e) => handleFeedbackChange('feedbackPositivo', e.target.value)}
                placeholder="Conte-nos o que considera nosso diferencial nesta área..."
                className="min-h-[80px] border-green-200 focus:border-green-400"
                required
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});

AreaEvaluation.displayName = 'AreaEvaluation';

export default function OptimizedForm({
  etapa,
  formData,
  onFormDataChange,
  onNext,
  onPrevious,
  onSubmit,
  isSubmitting
}: OptimizedFormProps) {
  const handleNPSChange = useCallback((nota: number) => {
    onFormDataChange({ 
      nps: nota,
      querIndicar: nota >= 7 ? formData.querIndicar : false,
      indicacoes: nota >= 7 ? formData.indicacoes : []
    });
  }, [formData.querIndicar, formData.indicacoes, onFormDataChange]);

  const handleAreaChange = useCallback((area: string, data: { nota?: number; naoSeAplica?: boolean; feedbackPositivo?: string; feedbackMelhoria?: string }) => {
    const currentArea = formData.avaliacoes[area] || { nota: 0, naoSeAplica: false, feedbackPositivo: '', feedbackMelhoria: '' };
    
    onFormDataChange({
      avaliacoes: {
        ...formData.avaliacoes,
        [area]: {
          nota: data.nota !== undefined ? data.nota : currentArea.nota,
          naoSeAplica: data.naoSeAplica !== undefined ? data.naoSeAplica : currentArea.naoSeAplica,
          feedbackPositivo: data.feedbackPositivo !== undefined ? data.feedbackPositivo : currentArea.feedbackPositivo,
          feedbackMelhoria: data.feedbackMelhoria !== undefined ? data.feedbackMelhoria : currentArea.feedbackMelhoria
        }
      }
    });
  }, [formData.avaliacoes, onFormDataChange]);

  const canProceed = useMemo(() => {
    return formData.empresa && formData.responsavel && formData.nps !== null;
  }, [formData.empresa, formData.responsavel, formData.nps]);

  const canProceedFromStep2 = useMemo(() => {
    // Verificar se todas as avaliações obrigatórias foram preenchidas
    return areas.every(area => {
      const avaliacao = formData.avaliacoes[area];
      if (!avaliacao || avaliacao.naoSeAplica) return true;
      
      // Se nota 1-4, precisa de feedback de melhoria
      if (avaliacao.nota >= 1 && avaliacao.nota <= 4) {
        return avaliacao.feedbackMelhoria && avaliacao.feedbackMelhoria.trim().length > 0;
      }
      
      // Se nota 5, precisa de feedback positivo
      if (avaliacao.nota === 5) {
        return avaliacao.feedbackPositivo && avaliacao.feedbackPositivo.trim().length > 0;
      }
      
      return true;
    });
  }, [formData.avaliacoes]);

  if (etapa === 1) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Label htmlFor="empresa" className="text-base font-medium flex items-center gap-2">
            🏢 Qual a sua empresa? *
          </Label>
          <Input
            id="empresa"
            value={formData.empresa}
            onChange={(e) => onFormDataChange({ empresa: e.target.value })}
            className="mt-2 h-12 text-lg"
            placeholder="Nome da sua empresa"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Label htmlFor="responsavel" className="text-base font-medium flex items-center gap-2">
            👤 Qual o seu nome? *
          </Label>
          <Input
            id="responsavel"
            value={formData.responsavel}
            onChange={(e) => onFormDataChange({ responsavel: e.target.value })}
            className="mt-2 h-12 text-lg"
            placeholder="Seu nome completo"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Label className="text-base font-medium mb-4 block flex items-center gap-2">
            📊 O quanto você recomendaria a V4 Venturini & Co para um amigo? *
          </Label>
          <NPSSelector value={formData.nps} onChange={handleNPSChange} />
        </motion.div>

        <div className="flex justify-between pt-6">
          <Button
            onClick={onPrevious}
            variant="outline"
            disabled={etapa === 1}
            className="px-8 py-3"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>
          <Button
            onClick={onNext}
            disabled={!canProceed}
            className="bg-slate-900 hover:bg-slate-800 px-8 py-3"
          >
            Próximo
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  if (etapa === 2) {
    return (
      <div className="space-y-8">
        {areas.map((area, index) => (
          <AreaEvaluation
            key={area}
            area={area}
            index={index}
            value={formData.avaliacoes[area]}
            onChange={handleAreaChange}
          />
        ))}

        <div className="flex justify-between pt-6">
          <Button
            onClick={onPrevious}
            variant="outline"
            className="px-8 py-3"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>
          <Button
            onClick={onNext}
            disabled={!canProceedFromStep2}
            className="bg-slate-900 hover:bg-slate-800 px-8 py-3"
          >
            Próximo
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  // Etapa 3 - Resumo
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-6 text-center">📋 Resumo da Pesquisa</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg p-4">
            <Label className="font-medium text-slate-700 flex items-center gap-2">
              🏢 Empresa:
            </Label>
            <p className="text-slate-900 font-semibold">{formData.empresa}</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <Label className="font-medium text-slate-700 flex items-center gap-2">
              👤 Responsável:
            </Label>
            <p className="text-slate-900 font-semibold">{formData.responsavel}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 mb-6 text-center">
          <Label className="font-medium text-slate-700 flex items-center justify-center gap-2 mb-2">
            📊 Sua avaliação NPS:
          </Label>
          <div className="flex items-center justify-center gap-2">
            <span className="text-4xl font-bold text-slate-900">{formData.nps}</span>
            <span className="text-2xl text-slate-600">/10</span>
            <div className="ml-2">
              {formData.nps! >= 9 ? '😍' : formData.nps! >= 7 ? '😊' : '😐'}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4">
          <Label className="font-medium text-slate-700 flex items-center gap-2 mb-3">
            📈 Avaliações por Área:
          </Label>
          <div className="space-y-3">
            {areas.map((area) => {
              const avaliacao = formData.avaliacoes[area];
              return (
                <div key={area} className="bg-slate-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{area}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-600">
                        {avaliacao?.naoSeAplica 
                          ? 'N/A' 
                          : avaliacao?.nota 
                            ? `${avaliacao.nota}/5`
                            : 'Não avaliado'
                        }
                      </span>
                      {avaliacao?.nota && !avaliacao?.naoSeAplica && (
                        <div className="flex">
                          {[...Array(avaliacao.nota)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {avaliacao?.feedbackMelhoria && (
                    <p className="text-xs text-red-700 bg-red-50 p-2 rounded mt-1">
                      <strong>Melhoria:</strong> {avaliacao.feedbackMelhoria}
                    </p>
                  )}
                  {avaliacao?.feedbackPositivo && (
                    <p className="text-xs text-green-700 bg-green-50 p-2 rounded mt-1">
                      <strong>Diferencial:</strong> {avaliacao.feedbackPositivo}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button
          onClick={onPrevious}
          variant="outline"
          className="px-8 py-3"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Anterior
        </Button>
        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="bg-slate-900 hover:bg-slate-800 px-8 py-3"
        >
          {isSubmitting ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 mr-2"
              >
                ⏳
              </motion.div>
              Enviando...
            </>
          ) : (
            'Enviar Pesquisa'
          )}
        </Button>
      </div>
    </div>
  );
}
