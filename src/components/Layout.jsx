import { useState } from 'react';

const textoFormatado = (resposta) => {
    return (
        <div>
        {resposta.introducao && (
            <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 border-b-2 pb-1 mb-2">Introdução</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{resposta.introducao}</p>
            </div>
        )}
        {resposta.objetivo && (
            <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 border-b-2 pb-1 mb-2">Objetivo de Aprendizagem (BNCC)</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{resposta.objetivo}</p>
            </div>
        )}
        {Array.isArray(resposta.roteiro) && (
            <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 border-b-2 pb-1 mb-2">Roteiro da Atividade</h2>
            <ul className="list-disc list-inside space-y-2">
                {resposta.roteiro.map((r, index) => (
                <li key={index}>
                    <strong className="font-semibold">{r.etapa}:</strong>
                    <p className="pl-4 text-gray-700 whitespace-pre-wrap">{r.descricao}</p>
                </li>
                ))}
            </ul>
            </div>
        )}
        {Array.isArray(resposta.rubrica) && (
            <div>
            <h2 className="text-xl font-bold text-gray-800 border-b-2 pb-1 mb-2">Rubrica de Avaliação</h2>
            <div className="space-y-4">
                {resposta.rubrica.map((r, index) => (
                <div key={index}>
                    <strong className="font-semibold text-gray-800">{r.criterio}</strong>
                    <ul className="list-disc list-inside pl-4 mt-1 space-y-1 text-gray-700">
                    <li><b>Excelente:</b> {r.avaliacao.excelente}</li>
                    <li><b>Bom:</b> {r.avaliacao.bom}</li>
                    <li><b>Precisa Melhorar:</b> {r.avaliacao.precisa_melhorar}</li>
                    </ul>
                </div>
                ))}
            </div>
            </div>
        )}
        </div>
    );
};

export const Layout = ({ planoAulaResposta }) => {
    const [isJSON, setIsJSON] = useState(false);
    const filterdadosVisiveis = (data) => {
        const { id, solicitacao_id, created_at, ...dadosVisiveis } = data;
        return dadosVisiveis;
    };
    const dadosVisiveis = filterdadosVisiveis(planoAulaResposta);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-right mb-4">
            <button
            onClick={() => setIsJSON(!isJSON)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
            {isJSON ? 'Ver Texto' : 'Ver JSON'}
            </button>
        </div>
        <div className=" max-w-none">
            {isJSON ? (
            <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-wrap text-[.7rem]">
                {JSON.stringify(dadosVisiveis, null, 2)}
            </pre>
            ) : (
            textoFormatado(dadosVisiveis)
            )}
        </div>
        </div>
    )
}