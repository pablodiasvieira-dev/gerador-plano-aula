// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// import { corsHeaders } from '../_shared/cors.ts';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
// definicao do prompt
function constructPrompt(disciplina, tema_aula, etapa_ensino, tempo_aula) {
  const modeloJson = `{
    "introducao": "string (máx. 300 caracteres, criativa e engajadora)",
    "objetivo": "string (código BNCC + descrição do objetivo)",
    "roteiro": [ 
      { 
        "etapa": "string (número ou nome da etapa)", 
        "descricao": "string (detalhamento da atividade)" 
      }
    ] (roteiro detalhado para execução),
    "rubrica": [{ 
      "criterio": "string (nome do critério de avaliação)", 
      "avaliacao": {
        "excelente": "string (descrição do desempenho esperado no nível excelente)", 
        "bom": "string (descrição do desempenho esperado no nível bom)", 
        "precisa_melhorar": "string (descrição do desempenho esperado no nível que precisa melhorar)"
      }
    }]
  }`;
  return `
    Você é uma API especializada em gerar planos de aula educacionais baseado na BNCC. 
    Sua única resposta deve ser um objeto JSON válido, sem formatação markdown, comentários ou texto explicativo antes ou depois.

    O JSON deve seguir estritamente a seguinte estrutura: ${modeloJson}

    com base nesse estrutura, gere um plano de aula com o tema: "${tema_aula}" para a disciplina de "${disciplina}" referente a etapa de ensino do: "${etapa_ensino}", para uma duração de aula de aproximadamente: ${tempo_aula} minutos.
  `;
}
Deno.serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    const { disciplina, tema_aula, etapa_ensino, tempo_aula } = await req.json();
    if (!tema_aula) {
      // validando o tema, caso nao existir o tema retonar erro
      return new Response(JSON.stringify({
        error: 'O campo "tema" é obrigatório.'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      });
    }
    const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
    // envia a solicitação para o supa
    const { data: requestData, error: requestError } = await supabaseAdmin.from('plano_aula_solicitacao').insert({
      disciplina,
      tema_aula,
      etapa_ensino,
      tempo_aula
    }).select().single();
    if (requestError) {
      throw new Error(`Erro ao salvar requisição: ${requestError.message}`);
    }
    // Construir o prompt e chamar a API do Gemini
    const prompt = constructPrompt(disciplina, tema_aula, etapa_ensino, tempo_aula);
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    });
    if (!geminiResponse.ok) {
      const errorBody = await geminiResponse.text();
      throw new Error(`Erro na API do Gemini: ${geminiResponse.status} ${errorBody}`);
    }
    const geminiResult = await geminiResponse.json();
    // const generatedText = geminiResult.candidates.content.parts.text;
    const generatedText = geminiResult.candidates?.[0]?.content?.parts?.[0]?.text;
    // realiza o Parse da resposta JSON 
    let lessonPlan;
    try {
      lessonPlan = JSON.parse(generatedText);
    } catch (e) {
      throw new Error(`A IA retornou um JSON inválido: ${e.message}`);
    }
    // envia o plano de aula gerado para o supa
    const { data: planData, error: planError } = await supabaseAdmin.from('plano_aula_gerado').insert({
      solicitacao_id: requestData.id,
      introducao: lessonPlan.introducao,
      objetivo: lessonPlan.objetivo,
      roteiro: lessonPlan.roteiro,
      rubrica: lessonPlan.rubrica
    }).select().single();
    if (planError) {
      throw new Error(`Erro ao salvar plano de aula: ${planError.message}`);
    }
    return new Response(JSON.stringify(planData), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});
