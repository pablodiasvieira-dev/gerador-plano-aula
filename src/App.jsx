import { useState } from 'react'
import './App.css'
import { Layout } from './components/Layout';

function App() {
  const dadosFormInit = {
    disciplina: '',
    etapa_ensino: '',
    tempo_aula: '50',
    tema_aula: '',
  }

  const [formData, setFormData] = useState(dadosFormInit);
  const [planoAulaResposta, setPlanoAulaResposta] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Validações
    if (!formData.disciplina) {
        alert("Por favor, selecione uma disciplina.");
        return;
    }
    if (formData.tema_aula.length < 3) {
        alert("O tema da aula deve ter pelo menos 3 caracteres.");
        return;
    }
    if (!formData.etapa_ensino) {
        alert("Por favor, selecione a etapa de ensino.");
        return;
    }
    const tempo = parseInt(formData.tempo_aula);
    if (isNaN(tempo) || tempo <= 0) {
        alert("O tempo de aula deve ser um número positivo.");
        return;
    }

    setIsLoading(true);
    setPlanoAulaResposta(null);
    setError('');

    try {
      const bodyReq = { ...formData, "tempo_aula": parseInt(formData.tempo_aula) }

      const response = await fetch(import.meta.env.VITE_SUPABASE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_KEY}`,
        },
        body: JSON.stringify(bodyReq),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPlanoAulaResposta(data);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleReset = () => {
    setFormData(dadosFormInit);
    setPlanoAulaResposta(null);
    setError('');
  }


  return (
    <div className="min-h-screen p-4 sm:p-8">
      <main className="max-w-7xl mx-auto flex gap-8">

        <div className="w-5/12">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
            Gerador de Plano de Aula com IA
          </h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6 bg-white rounded-lg shadow-md">
            <div>
              <label htmlFor="disciplina" className="block font-bold text-gray-700">Disciplina:</label>
              <select id="disciplina" name="disciplina" value={formData.disciplina} onChange={handleInputChange} required className="w-full p-2 mt-1 border rounded-md">
                <option value="">Selecione uma disciplina</option>
                <option value="Língua Portuguesa">Língua Portuguesa</option>
                <option value="Matemática">Matemática</option>
                <option value="Arte">Arte</option>
                <option value="História">História</option>
                <option value="Geografia">Geografia</option>
                <option value="Educação Física">Educação Física</option>
              </select>
            </div>

            <div>
              <label htmlFor="etapa_ensino" className="block font-bold text-gray-700">Etapa de Ensino:</label>
              <select id="etapa_ensino" name="etapa_ensino" value={formData.etapa_ensino} onChange={handleInputChange} required className="w-full p-2 mt-1 border rounded-md">
                <option value="">Selecione a etapa de ensino</option>
                <option value="">Selecione a etapa de ensino</option>
                    <option>1º ano - Ensino Fundamental</option>
                    <option>2º ano - Ensino Fundamental</option>
                    <option>3º ano - Ensino Fundamental</option>
                    <option>4º ano - Ensino Fundamental</option>
                    <option>5º ano - Ensino Fundamental</option>
                    <option>6º ano - Ensino Fundamental</option>
                    <option>7º ano - Ensino Fundamental</option>
                    <option>8º ano - Ensino Fundamental</option>
                    <option>9º ano - Ensino Fundamental</option>
                    <option>1º ano - Ensino Médio</option>
                    <option>2º ano - Ensino Médio</option>
                    <option>3º ano - Ensino Médio</option>
              </select>
            </div>

            <div>
              <label htmlFor="tempo_aula" className="block font-bold text-gray-700">Tempo de Aula (minutos):</label>
              <input type="number" id="tempo_aula" name="tempo_aula" value={formData.tempo_aula} onChange={handleInputChange} min="1" required className="w-full p-2 mt-1 border rounded-md" />
            </div>

            <div>
              <label htmlFor="tema_aula" className="block font-bold text-gray-700">Tema da Aula:</label>
              <input type="text" id="tema_aula" name="tema_aula" value={formData.tema_aula} onChange={handleInputChange} minLength="3" placeholder="Digite o tema da aula" required className="w-full p-2 mt-1 border rounded-md" />
            </div>

            <div className="flex justify-between gap-4 mt-4">
              <button type="submit" disabled={isLoading} className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-gray-400">
                {isLoading ? 'Gerando...' : 'Gerar Plano de Aula'}
              </button>
              <button type="button" onClick={handleReset} className="w-full py-2 px-4 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300">
                Limpar
              </button>
            </div>
          </form>
        </div>

        <div className="w-7/12 mt-0">
          {isLoading && <div className="text-center p-6 bg-white rounded-lg shadow-md">Gerando...</div>}
          {error && <div className="text-center p-6 bg-red-100 text-red-700 rounded-lg shadow-md">Erro: {error}</div>}
          {planoAulaResposta && <Layout planoAulaResposta={planoAulaResposta} />}
        </div>
      </main>
    </div>
  )
}

export default App
