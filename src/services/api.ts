// Define a interface Product com os campos esperados para um produto
export interface Product{
    id: number;           // Identificador único do produto
    title: string;         // Nome do produto
    price: number;        // Preço do produto
    image: string;        // URL da imagem do produto
    description: string;  // Descrição do produto
}

// Função assíncrona para buscar produtos de uma API externa
// Promise<Product[]> significa que a função retorna uma promessa que resolve para um array de produtos
export const fetchProducts = async (): Promise<Product[]> => {
    try {
        // Faz uma requisição HTTP para a API de produtos
       const response = await fetch('https://fakestoreapi.com/products/category/electronics');
        
        // Verifica se a resposta foi bem-sucedida (status HTTP 200-299)
        if (!response.ok){
            // Se não for, lança um erro com o status da resposta
            throw new Error(`Erro na requisição: ${response.statusText}`);
        }

        // Converte a resposta para JSON
        const data = await response.json();
        // Retorna os dados dos produtos
        return data;
    }catch(error){
        // Loga o erro no console para depuração
        console.error("Erro na fetchApi",error);
        // Lança um erro com uma mensagem apropriada
        throw new Error(`Erro ao buscar produtos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
};