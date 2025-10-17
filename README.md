# Teste Técnico: Gerador de Planos de Aula com IA

Este projeto é a implementação de um desafio técnico para a construção de um sistema que gera planos de aula personalizados, utilizando a API do Google Gemini e o Supabase. 

---

### **URL da Aplicação**
**[LINK]**

---

## Stack

* **Backend:** Supabase (PostgreSQL Database, Edge Functions)
* **Inteligência Artificial:** Google Gemini API (modelo `gemini-1.5-flash`)
* **Frontend:** React, Vite, Tailwind CSS

### **Passos para Execução**

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/seu-usuario/seu-repositorio.git](https://github.com/seu-usuario/seu-repositorio.git)
    cd seu-repositorio
    ```

2.  **Instale as dependências do frontend:**
    ```bash
    npm install
    ```

3.  **Configure as Variáveis de Ambiente:**
    No arquivo `src/App.jsx`, substitua o placeholder `SUA_SUPABASE_ANON_KEY_AQUI` pela sua chave anônima (public key) do projeto Supabase.
    
    Para o backend (Edge Function), siga as instruções do repositório original para configurar a `GEMINI_API_KEY` de forma segura.

4.  **Execute o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```
    Abra seu navegador e acesse `http://localhost:5173` (ou a porta indicada no terminal). A aplicação frontend estará rodando e pronta para se comunicar com sua Edge Function do Supabase.

---