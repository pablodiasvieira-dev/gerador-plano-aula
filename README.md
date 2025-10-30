# Gerador de Planos de Aula com IA

Este projeto é a implementação de um desafio técnico para a construção de um sistema que gera **planos de aula** personalizados, utilizando a API do Google Gemini e o Supabase, com a seguinte estrutura:
* **Introdução lúdica**: Forma criativa e engajadora de apresentar o tema
* **Objetivo de aprendizagem da BNCC**: Alinhado à Base Nacional Comum Curricular
* **Passo a passo da atividade**: Roteiro detalhado para execução
* **Rubrica de avaliação**: Critérios para a professora avaliar o aprendizado

---

## Stack

* **Backend:** Supabase (PostgreSQL Database, Edge Functions)
* **Inteligência Artificial:** Google Gemini API (modelo `gemini-1.5-flash`)
* **Frontend:** React, Vite, Tailwind CSS

### **Passos para Execução**

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/pablodiasvieira-dev/gerador-plano-aula.git](https://github.com/pablodiasvieira-dev/gerador-plano-aula.git)
    cd seu-repositorio
    ```

2.  **Instale as dependências do frontend:**
    ```bash
    npm install
    ```

3.  **Configure as Variáveis de Ambiente:**
    Neste projeto, é necessário criar na raiz do projeto um arquivo `.env` com uma a chave anônima (public key) do projeto Supabase (`VITE_SUPABASE_KEY`).
    
    Para o backend (Edge Function), siga as instruções do repositório original para configurar a `GEMINI_API_KEY` de forma segura.

4.  **Execute o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```
    Abra seu navegador e acesse `http://localhost:5173` (ou a porta indicada no terminal). A aplicação frontend estará rodando e pronta para se comunicar com sua Edge Function do Supabase.

---

## Pesquisa e Escolha do Modelo

Para realização deste projeto utilizaremos um modelo de LLM para geração de texto. Entre os modelos disponíveis na Google AI Studio, podemos destacar os modelo 2.5 Pro e o 2.5 Flash para esse fim.
Conforme a [documentação do Gemini API](https://ai.google.dev/gemini-api/docs?hl=pt-br), os modelos são descritos assim:
- **[2.5 Pro](https://ai.google.dev/gemini-api/docs/models?hl=pt-br#gemini-2.5-pro)**: Modelo de raciocínio de última geração, capaz de resolver problemas complexos em programação, matemática e STEM, além de analisar grandes conjuntos de dados, bases de código e documentos usando contexto longo.
- **[2.5 Flash](https://ai.google.dev/gemini-api/docs/models?hl=pt-br#gemini-2.5-flash)**: Melhor modelo em termos de custo-benefício, com recursos abrangentes. O 2.5 Flash é ideal para processamento em grande escala, baixa latência, tarefas de alto volume que exigem raciocínio e casos de uso de agentes.

Ambos os modelos são excelentes escolhas, entretanto, para fins apenas de executar esse protótipo acredito que o modelo **Flash** é suficiente, mais rápido e com baixa latência, além de o limite de uso ser melhor. Em um projeto mais robusto o modelo pro poderia ser aplicado.

Para começar a usar a IA do Google, temos duas possibilidades: Instalando as bibliotecas ou Utilizando APIs REST. Exclusivamente para não instalar bibliotecas no supabase, será utilizada a segunda opção, cuja documentação seguida foi a [Gemini API reference](https://ai.google.dev/api?hl=pt-br).
O padrão da requisição é:

```bash
    curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent" \
    -H "x-goog-api-key: $GEMINI_API_KEY" \
    -H 'Content-Type: application/json' \
    -X POST \
    -d '{
        "contents": [
        {
            "parts": [
            {
                "text": "Explain how AI works in a few words"
            }
            ]
        }
        ]
    }'
```
Conforme a documentação, há dois endpoints para gerar conteúdo, sendo eles:
* **generateContent (REST)**: recebe uma solicitação e fornece uma única resposta depois que o modelo conclui toda a geração.
* **streamGenerateContent (SSE)**: recebe exatamente a mesma solicitação, mas o modelo transmite partes da resposta à medida que elas são geradas. Isso proporciona uma melhor experiência do usuário para aplicativos interativos, já que permite mostrar resultados parciais imediatamente.

Para esse projeto estamos interessados em mandar um série de requistos e receber uma informação pronta. Desta maneira, o método **generateContent** atende aos requisitos.

Outra parte importante é a autenticação do usuário, que é feita pela `GEMINI_API_KEY` que é obtida no Get API key do Gemini foi obtida no [Google AI Studio](https://aistudio.google.com/), conforme a [documentação](https://ai.google.dev/gemini-api/docs/api-key?hl=pt-br).

E agora a parte mais importante, o prompt. Para que a IA do Gemini consiga trazer o resultado esperado foi definido um prompt para fechar o escopo, exigindo que a mesma se adeque ao padrão. Este prompt foi interido na chave "text".
```js
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
```
No prompt acima, foi bem definido como deve ser o JSON de resposta e que essa estrutura é rígida, com base nos parâmetros que passamos na requição, sejam ele a disciplina, etapa de ensino, tempo de aula e o tema do plano de aula.


Aqui pode ser encontrado o arquivo completo da Edge Function criada via editor pelo browser diretamente na plataforma do supabase: [Edge Function de Gerar Plano de Aula com IA](supabase\edge-fun.js).


---
## Modelagem de Dados

Como já adiantamos, o usuário vai enviar para a IA a disciplina, etapa de ensino, tempo de aula e o tema e vai receber o plano de aula com a estrutura definida no objetivo, seja: 
* Introdução lúdica
* Objetivo de aprendizagem da BNCC
* Passo a passo da atividade
* Rubrica de avaliação

Para melhor organização, visando manter cada registro claro tanto da solicitação (formulário de requisição) quando da resposta (plano de aula), resolvemos dividir entao os dados em duas tabelas: 
* plano_aula_solicitacao: Armazena os parâmetros de entrada fornecidos pelo usuário;
* plano_aula_gerado: Armazena o plano de aula completo gerado pela IA.
Desta forma, entendo o registro histório em tabelas separadas permitiria a recuperação de dados para regeração de prompts como para exibir os planos já gerados em futuras implmentações.


### Script da Tabela: plano_aula_solicitacao (Formulario)

```sql
create table public.plano_aula_solicitacao (
  id bigint generated by default as identity not null,
  created_at timestamp with time zone not null default now(),
  disciplina public.disciplinas not null,
  tema_aula text not null,
  etapa_ensino public.etapas_ensino not null,
  tempo_aula bigint not null,
  constraint plano_aula_solicitacao_pkey primary key (id),
  constraint plano_aula_solicitacao_tempo_aula_check check (
    (
      (tempo_aula > 0)
      and (tempo_aula < 140)
    )
  )
) TABLESPACE pg_default;
```
Em resumo nesta tabela consta:
* id (int, Chave Primária): Identificador único para cada requisição.
* created_at (timestamp): Data e hora da requisição.
* disciplina (texto): nome da disciplina que se refere o tema, baseada no enum `disciplinas`.
* tema_aula (texto): O tema da aula solicitado.
* etapa-ensino (texto): série/ano da etapa de ensino (fundamental ou médio) que é o público-alvo do plano de aula, basiada no enum `etapas_ensino`
* tempo_aula (numero): tempo em minutos para dividir as etapas do plano de ensino.


### Script da Tabela: plano_aula_gerado (Plano de Aula)

```sql
create table public.plano_aula_gerado (
  id bigint generated by default as identity not null,
  created_at timestamp with time zone not null default now(),
  solicitacao_id bigint not null,
  introducao text not null,
  objetivo text not null,
  roteiro jsonb not null,
  rubrica jsonb not null,
  constraint plano_aula_gerado_pkey primary key (id),
  constraint plano_aula_gerado_solicitacao_id_fkey foreign KEY (solicitacao_id) references plano_aula_solicitacao (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;
```

Em resumo, nesta tabela consta:
* id (int, Chave Primária): Identificador único para cada requisição.
* created_at (timestamp): Data e hora da requisição.
* request_id (int, Chave Estrangeira para plano_aula_solicitacao): Vincula o plano gerado à sua requisição original.
* introducao (texto): A introdução lúdica.
* objetivo (texto): O objetivo de aprendizagem baseado na BNCC.
* roteiro (jsonb): O passo a passo da atividade. O tipo jsonb é ideal aqui, pois permite armazenar uma lista estruturada de passos de forma flexível.
* rubrica (jsonb): A rubrica de avaliação, também armazenada como um objeto JSON estruturado.

Estas tabelas também estão no arquivo: [tables.sql](supabase\tables.sql) e p diagrama segue abaixo:

![Diagrama EM do Supabase](/src/assets/Diagrama.png)

---

##  Implementação do Gerador 

Com tudo já comentado até aqui, a aplicação segue o seguinte fluxo:
1. usuário envia dados por um formulário, 
2. esses dados são validados (se é texto, se tem um número mínimo de caracteres e se há valores negativos),
3. os dados são submetidos ao end-point da edge function do supabase,
4. recebida a requisição, os dados são salvos na tabela de solicitacao e também enviados ao Gemini API,
5. a IA analisa o prompt e faz o parsing da resposta e devolve uma resposta no formato JSON,
6. a edge function interpreta o JSON recebido e realiza o salvamento na tabela de plano de aula gerados,
7. e por fim esse json é repassado para a aplicação front-ende que exibição do plano de aula gerado em JSON e texto formatado.
8. em caso de ocorrência de erros nesse processo, é avisado ao usuário.

### Views de Telas
1. Fomulario de Solicitação

O usuário pode selecionar uma disciplina e a etapa de ensino, inserir uma carga horária (em minutos) e escrever o nome do tema da aula para que a IA processe e gere o plano de aula.

![Tela de Resposta Textual](/src/assets/formulario.png)

2. Resposta em JSON
A resposta vem estritamente no formato JSON, seguindo o prompt. Caso algum outro sistema utilize o serviço, esse JSON já fica de fácil implantação.

![Tela de Resposta Textual](/src/assets/resposta_json.png)

3. Resposta em Texto Formatado
A resposta obtida pela geração na IA, recebida em JSON, foi transformada para texto de leitura, mais familiar ao usuário, firando desta maneira:

![Tela de Resposta Textual](/src/assets/resposta-texto.png)


---

## Decisões Técnicas 

* **Arquitetura de Segurança com Edge Function:** A lógica de chamar a API do Gemini por uma Supabase Edge Function, intermediando esse processo, permite proteger a `GEMINI_API_KEY` no lado do servidor.
* **Separação de Tabelas:** O banco de dados foi projetado com duas tabelas para registros independentes das solicitações dos usuários das respostas geradas pela IA. Isso pode facilitar futuras implementações históricos de planos de aula.
* **Modelo 2.5 Flash**: O modelo gemini-2.5-flash foi escolhido por oferecer o melhor equilíbrio entre desempenho, custo (gratuito na camada de entrada) e limites de uso para a tarefa de geração de texto estruturado. Ele é rápido e eficiente, ideal para uma aplicação interativa.
* **Engenharia de Prompt:** A estratégia de prompt robusta para garantir a consistência do JSON da IA é o pilar desse projeto.

---

## Desafios Encontrados e Soluções

O principal desafio foi definir onde rodar o serviço de conexão com a IA, por isso, optei por transferir essa responsabilidade para a Edge Function, já que se fosse rodada diretamente no front-end iria ter que expor a chave de api do Gemini.
Outro desafio, foi a definição do prompt ideal. Para isso, utilizando os comandos documento do teste técnico esse prompt foi passada pela a IA da OpenAI bem como pelo prórprio Gemini que forneceram excelentes ideias que culminaram no prompt apresentado após minha revisão. Sim, esse trabalho contou com a ajuda das IAs para refinar e melhorar códigos.

---

## Próximos Passos e Melhorias

* **Outras Validações:** Levantamento de outras validações como a de possíveis prompts injection.
* **Implantar Autenticação:** Importante criar usuários para o projeto, que assim terá um controle maior das requisções, bem como será possível manter o histórico.
* **Novas Políticas de Segurança (RLS):** Com a autenticação em funcionamento, podemos estabelecer como os usuários podem acessar e quais dados eles podem ver.
* **Histórico:** Implementação do histórico de planos gerados.
* **Geração de Arquivo:** Implantar a geração de arquivo PDF e JSON.
