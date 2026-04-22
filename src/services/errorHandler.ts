export class AppError extends Error {
  constructor(
    public readonly userMessage: string,
    public readonly status?: number,
    public readonly debugInfo?: unknown,
  ) {
    super(userMessage);
    this.name = 'AppError';
  }
}

// Mensagens genéricas por status HTTP
const HTTP_MESSAGES: Record<number, string> = {
  400: 'Requisição inválida. Verifique os dados enviados.',
  401: 'Sessão expirada, faça login novamente.',
  403: 'Você não tem permissão para realizar esta ação.',
  404: 'Recurso não encontrado.',
  408: 'Tempo de requisição esgotado. Tente novamente.',
  409: 'Conflito: este registro já existe.',
  422: 'Dados inválidos. Verifique as informações.',
  429: 'Muitas requisições. Aguarde um momento e tente novamente.',
  500: 'Erro interno do servidor. Tente novamente mais tarde.',
  502: 'Serviço temporariamente indisponível.',
  503: 'Serviço em manutenção. Tente novamente em breve.',
  504: 'Tempo de resposta esgotado. Tente novamente.',
};

// Sobrescritas específicas por contexto de operação
const CONTEXT_MESSAGES: Record<string, Partial<Record<number, string>>> = {
  carrinho: {
    404: 'Carrinho não encontrado.',
    401: 'Sessão expirada, faça login novamente.',
    500: 'Erro ao processar o carrinho. Tente novamente.',
  },
  item: {
    404: 'Produto não encontrado.',
    409: 'Este produto já está no carrinho.',
    422: 'Quantidade inválida para este produto.',
  },
  auth: {
    401: 'Email ou senha incorretos.',
    403: 'Sua conta não tem permissão de acesso.',
    404: 'Conta não encontrada.',
  },
  pedido: {
    404: 'Pedido não encontrado.',
    409: 'Este pedido já foi processado.',
    422: 'Não foi possível finalizar o pedido. Verifique os dados.',
  },
};

export const categorizeHttpError = (status: number, context?: string): string => {
  if (context && CONTEXT_MESSAGES[context]?.[status]) {
    return CONTEXT_MESSAGES[context][status]!;
  }
  return HTTP_MESSAGES[status] ?? `Erro inesperado (código ${status}). Tente novamente.`;
};

// Substitui os `if (!response.ok) throw new Error(...)` e o handleApiResponse do cartApi
export const handleApiResponse = async (response: Response, context?: string): Promise<unknown> => {
  if (!response.ok) {
    let debugInfo: unknown = response.statusText;
    try {
      const body = await response.json();
      debugInfo = body.message ?? body;
    } catch {
      try { debugInfo = await response.text(); } catch { /* sem body */ }
    }

    console.error('[API Error]', {
      status: response.status,
      url: response.url,
      context,
      details: debugInfo,
    });

    throw new AppError(
      categorizeHttpError(response.status, context),
      response.status,
      debugInfo,
    );
  }

  try {
    const text = await response.text();
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
};

// Para usar em blocos catch: normaliza qualquer erro para AppError e relança
export const handleError = (error: unknown): never => {
  if (error instanceof AppError) throw error;

  const message = error instanceof Error ? error.message : String(error);
  console.error('[Unexpected Error]', error);
  throw new AppError(
    'Ocorreu um erro inesperado. Tente novamente.',
    undefined,
    message,
  );
};
