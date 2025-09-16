import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Inserir empresa
      const empresaResult = await client.query(
        'INSERT INTO empresas (nome, responsavel) VALUES ($1, $2) RETURNING id',
        [data.empresa, data.responsavel]
      );
      const empresaId = empresaResult.rows[0].id;

      // Inserir pesquisa
      const pesquisaResult = await client.query(
        'INSERT INTO pesquisas (empresa_id, nps, quer_indicar) VALUES ($1, $2, $3) RETURNING id',
        [empresaId, data.nps, data.querIndicar]
      );
      const pesquisaId = pesquisaResult.rows[0].id;

      // Inserir avaliações
      for (const avaliacao of data.avaliacoes) {
        await client.query(
          'INSERT INTO avaliacoes (pesquisa_id, area, nota, nao_se_aplica, feedback_positivo, feedback_melhoria) VALUES ($1, $2, $3, $4, $5, $6)',
          [
            pesquisaId,
            avaliacao.area,
            avaliacao.nota,
            avaliacao.naoSeAplica,
            avaliacao.feedbackPositivo || '',
            avaliacao.feedbackMelhoria || ''
          ]
        );
      }

      // Inserir indicações se houver
      if (data.querIndicar && data.indicacoes && data.indicacoes.length > 0) {
        for (const indicacao of data.indicacoes) {
          await client.query(
            'INSERT INTO indicacoes (pesquisa_id, nome, empresa, email, telefone) VALUES ($1, $2, $3, $4, $5)',
            [pesquisaId, indicacao.nome, indicacao.empresa, indicacao.email, indicacao.telefone]
          );
        }
      }

      await client.query('COMMIT');
      return NextResponse.json({ success: true, id: pesquisaId });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erro ao salvar pesquisa:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dataInicio = searchParams.get('dataInicio');
    const dataFim = searchParams.get('dataFim');

    const client = await pool.connect();

    try {
      // Construir condições de filtro
      let whereClause = '';
      let params: any[] = [];
      
      if (dataInicio && dataFim) {
        whereClause = 'WHERE p.created_at >= $1 AND p.created_at <= $2';
        params = [dataInicio + ' 00:00:00', dataFim + ' 23:59:59'];
      }

      // Estatísticas gerais
      const statsQuery = `
        SELECT 
          COUNT(*) as total_pesquisas,
          AVG(p.nps) as nps_medio,
          COUNT(CASE WHEN p.nps >= 9 THEN 1 END) as promotores,
          COUNT(CASE WHEN p.nps >= 7 AND p.nps <= 8 THEN 1 END) as neutros,
          COUNT(CASE WHEN p.nps <= 6 THEN 1 END) as detratores,
          (COUNT(CASE WHEN p.nps >= 9 THEN 1 END) * 100.0 / COUNT(*)) - 
          (COUNT(CASE WHEN p.nps <= 6 THEN 1 END) * 100.0 / COUNT(*)) as nps_score
        FROM pesquisas p 
        JOIN empresas e ON p.empresa_id = e.id
        ${whereClause}
      `;

      const statsResult = await client.query(statsQuery, params);
      const stats = statsResult.rows[0];

      // Dados por área
      const areasQuery = `
        SELECT 
          a.area,
          AVG(a.nota) as media_nota,
          COUNT(*) as total_avaliacoes,
          COUNT(CASE WHEN a.feedback_melhoria != '' THEN 1 END) as feedbacks_melhoria,
          COUNT(CASE WHEN a.feedback_positivo != '' THEN 1 END) as feedbacks_positivos
        FROM avaliacoes a
        JOIN pesquisas p ON a.pesquisa_id = p.id
        JOIN empresas e ON p.empresa_id = e.id
        ${whereClause.replace('p.created_at', 'p.created_at')}
        GROUP BY a.area
        ORDER BY media_nota DESC
      `;

      const areasResult = await client.query(areasQuery, params);
      const areas = areasResult.rows;

      // Pesquisas recentes
      const pesquisasQuery = `
        SELECT 
          p.id,
          e.nome as empresa,
          e.responsavel,
          p.nps,
          p.created_at as data_criacao
        FROM pesquisas p
        JOIN empresas e ON p.empresa_id = e.id
        ${whereClause}
        ORDER BY p.created_at DESC
        LIMIT 50
      `;

      const pesquisasResult = await client.query(pesquisasQuery, params);
      const recent = pesquisasResult.rows;

      // Timeline (dados por dia)
      let timelineQuery = '';
      let timelineParams: any[] = [];

      if (dataInicio && dataFim) {
        timelineQuery = `
          SELECT 
            DATE(p.created_at) as data,
            COUNT(*) as pesquisas,
            AVG(p.nps) as nps_medio
          FROM pesquisas p
          JOIN empresas e ON p.empresa_id = e.id
          WHERE p.created_at >= $1 AND p.created_at <= $2
          GROUP BY DATE(p.created_at)
          ORDER BY DATE(p.created_at)
        `;
        timelineParams = [dataInicio + ' 00:00:00', dataFim + ' 23:59:59'];
      } else {
        // Últimos 30 dias se não houver filtro
        timelineQuery = `
          SELECT 
            DATE(p.created_at) as data,
            COUNT(*) as pesquisas,
            AVG(p.nps) as nps_medio
          FROM pesquisas p
          JOIN empresas e ON p.empresa_id = e.id
          WHERE p.created_at >= NOW() - INTERVAL '30 days'
          GROUP BY DATE(p.created_at)
          ORDER BY DATE(p.created_at)
        `;
      }

      const timelineResult = await client.query(timelineQuery, timelineParams);
      const timeline = timelineResult.rows.map(row => ({
        ...row,
        data: new Date(row.data).toLocaleDateString('pt-BR'),
        nps_medio: parseFloat(row.nps_medio || 0).toFixed(1)
      }));

      return NextResponse.json({
        success: true,
        data: {
          stats: {
            total_pesquisas: parseInt(stats.total_pesquisas),
            nps_medio: parseFloat(stats.nps_medio || 0),
            promotores: parseInt(stats.promotores),
            neutros: parseInt(stats.neutros),
            detratores: parseInt(stats.detratores),
            nps_score: parseFloat(stats.nps_score || 0).toFixed(1)
          },
          areas,
          recent,
          timeline,
          filtro: dataInicio && dataFim ? { dataInicio, dataFim } : null
        }
      });

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
