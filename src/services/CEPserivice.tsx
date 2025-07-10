// services/CEPservice.ts
interface Endereco {
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  // outros campos que seu endereço tiver
}

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

export const criarEndereco = async (endereco: Endereco) => {
  try {
    const response = await fetch('https://back-musicfy-origin-3.onrender.com/enderecos', {
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
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof (error as any).message === 'string'
    ) {
      if (
        (error as any).message.includes('Failed to fetch') ||
        (error as any).message.includes('NetworkError')
      ) {
        throw new Error('Erro de conexão: Não foi possível conectar ao servidor.');
      }
      throw error;
    }
    throw new Error('Erro desconhecido');
  }
};
