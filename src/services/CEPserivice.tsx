// services/CEPservice.ts
export const buscarDadosCEP = async (cep: string) => {
  try {
    // Tenta BrasilAPI primeiro
    const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${cep}`);
    
    if (!response.ok) throw new Error("CEP não encontrado");
    
    const data = await response.json();
    return data;
  } catch (error) {
    // Fallback para ViaCEP
    const viaCepResponse = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (!viaCepResponse.ok) throw new Error("CEP não encontrado em nenhuma API");
    
    const viaCepData = await viaCepResponse.json();
    if (viaCepData.erro) throw new Error("CEP não existe");
    
    return viaCepData;
  }
};
export const criarEndereco = async (endereco) => {
  try {
    const response = await fetch('http://localhost:8080/enderecos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(endereco),
    });

    if (!response.ok) {
      let mensagem = 'Erro ao criar endereço';
      try {
        const errorData = await response.json();
        mensagem = errorData.message || mensagem;
      } catch {
        mensagem = `Erro HTTP ${response.status}`;
      }
      throw new Error(mensagem);
    }

    return await response.json();
  } catch (error) {
    // Erros de rede, como "Failed to fetch"
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Erro de conexão: Não foi possível conectar ao servidor.');
    }
    throw error;
  }
};
