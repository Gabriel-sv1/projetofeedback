import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        SELECT 
          e.nome as empresa,
          e.responsavel,
          p.nps,
          p.quer_indicar,
          p.created_at as data_pesquisa,
          a.area,
          a.nota as nota_area,
          a.feedback_positivo,
          a.feedback_melhoria,
          a.nao_se_aplica,
          i.nome as indicacao_nome,
          i.empresa as indicacao_empresa,
          i.email as indicacao_email,
          i.telefone as indicacao_telefone
        FROM pesquisas p
        JOIN empresas e ON p.empresa_id = e.id
        LEFT JOIN avaliacoes a ON p.id = a.pesquisa_id
        LEFT JOIN indicacoes i ON p.id = i.pesquisa_id
        ORDER BY p.created_at DESC, a.area, i.nome
      `);
      
      // Cabeçalho CSV
      const headers = [
        'Empresa',
        'Responsável',
        'NPS',
        'Quer Indicar',
        'Data da Pesquisa',
        'Área Avaliada',
        'Nota da Área',
        'Feedback Positivo',
        'Feedback de Melhoria',
        'Não Se Aplica',
        'Nome da Indicação',
        'Empresa da Indicação',
        'Email da Indicação',
        'Telefone da Indicação'
      ];
      
      // Converter dados para CSV
      const csvContent = [
        headers.join(','),
        ...result.rows.map(row => [
          `"${row.empresa || ''}"`,
          `"${row.responsavel || ''}"`,
          row.nps || '',
          row.quer_indicar ? 'Sim' : 'Não',
          row.data_pesquisa ? new Date(row.data_pesquisa).toLocaleDateString('pt-BR') : '',
          `"${row.area || ''}"`,
          row.nota_area || '',
          `"${row.feedback_positivo || ''}"`,
          `"${row.feedback_melhoria || ''}"`,
          row.nao_se_aplica ? 'Sim' : 'Não',
          `"${row.indicacao_nome || ''}"`,
          `"${row.indicacao_empresa || ''}"`,
          `"${row.indicacao_email || ''}"`,
          `"${row.indicacao_telefone || ''}"`
        ].join(','))
      ].join('\n');
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="pesquisas-feedback-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erro ao exportar CSV:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
