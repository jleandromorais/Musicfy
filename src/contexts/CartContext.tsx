import React, { createContext, useState, useContext, useCallback, useMemo, useEffect } from 'react';
import type { ReactNode } from 'react'; // Importa o tipo 'ReactNode' para tipar os filhos do componente

// --- 1. Definição de Tipagens (TypeScript) ---
// Essas interfaces definem a "forma" dos dados que vamos usar, garantindo segurança de tipo.

// Tipo base para um produto simples
 export type Product = {
  id: number;      // Identificador único do produto
  name: string;    // Nome do produto
  price: number;   // Preço do produto
  img: string;  
  quantity:number;   // URL ou caminho da imagem do produto
};

// Tipo para um item no carrinho: é um Produto, mas com uma quantidade adicional
export type CartItem = Product & {// Extende o tipo Product para incluir a quantidade
  quantity: number; // Quantidade deste produto no carrinho
};

// Tipo para o Contexto do Carrinho: define quais dados e funções estarão disponíveis
export type CartContextType = {
  cartItems: CartItem[];                           // Array de todos os itens no carrinho
  addToCart: (product: Product) => void;           // Função para adicionar um produto ao carrinho
  removeFromCart: (productId: number) => void;     // Função para remover um produto pelo ID
  updateQuantity: (productId: number, newQuantity: number) => void; // NOVO: Função para atualizar a quantidade de um item
  clearCart: () => void;                           // Função para esvaziar o carrinho
  cartCount: number;                               // Número total de itens (contagem de unidades) no carrinho
  totalPrice: number;                              // Preço total de todos os itens no carrinho
  isInCart: (productId: number) => boolean;        // NOVO: Função para verificar se um produto já está no carrinho
    changeCartItemQuantity: (product: Product, newQuantity: number) => void; // NOVO: Função para alterar a quantidade de um item no carrinho
};

// --- 2. Criação do Contexto React ---
// 'createContext' cria um objeto Contexto. Quando um componente "consome" este contexto,
// ele terá acesso aos valores fornecidos por um 'Provider' correspondente.
const CartContext = createContext<CartContextType | undefined>(undefined);

// --- 3. Hook Personalizado para Consumir o Contexto ---
// Este é um "atalho" para usar o contexto.
export const useCart = () => {
  const context = useContext(CartContext); // Tenta obter o valor do CartContext
  if (!context) { // Se o contexto não for encontrado (ou seja, useCart foi chamado fora de um CartProvider)
    throw new Error('useCart must be used within a CartProvider'); // Lança um erro para avisar o desenvolvedor
  }
  return context; // Retorna o objeto de contexto com todas as funções e dados do carrinho
};

// --- 4. Chave para Persistência no LocalStorage ---
// Uma constante para a chave que será usada para armazenar e recuperar dados do carrinho no localStorage.
const STORAGE_KEY = 'cartItems';

// --- 5. Componente Provedor do Carrinho (CartProvider) ---
// Este componente "fornece" o contexto do carrinho para todos os seus componentes filhos.
// Ele também lida com a lógica principal do carrinho, como adicionar/remover itens e persistência.
export const CartProvider = ({ children }: { children: ReactNode }) => {
  // Estado principal do carrinho: armazena os itens atualmente no carrinho.
  // A função de inicialização (() => ...) é executada apenas uma vez na montagem do componente.
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') { // Garante que estamos no ambiente do navegador (para Next.js, por exemplo)
      const saved = localStorage.getItem(STORAGE_KEY); // Tenta buscar dados salvos no localStorage
      return saved ? JSON.parse(saved) : [];          // Se encontrar, converte de JSON para objeto; senão, inicia vazio
    }
    return []; // Para renderização no servidor (SSR), inicia vazio
  });

  // --- 6. Persistência no LocalStorage com useEffect ---
  // Este efeito colateral é executado toda vez que 'cartItems' muda.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems)); // Salva o estado atual do carrinho no localStorage
  }, [cartItems]); // O efeito é re-executado apenas quando 'cartItems' (o array) muda

  // --- 7. Funções de Manipulação do Carrinho (usando useCallback para otimização) ---
  // 'useCallback' memoriza a função para que ela não seja recriada em cada renderização
  // do componente pai, o que pode melhorar a performance de componentes filhos que usam essas funções.

  // Adiciona um produto ao carrinho ou incrementa sua quantidade se já existir
  const addToCart = useCallback((product: Product) => {
    setCartItems(prevItems => { // Usa o estado anterior (prevItems) para garantir que as atualizações são baseadas no último estado
      const existingItem = prevItems.find(item => item.id === product.id); // Procura se o item já existe
      if (existingItem) {
        return prevItems.map(item => // Se existe, mapeia e atualiza a quantidade do item existente
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 } // Incrementa a quantidade
            : item // Mantém os outros itens inalterados
        );
      }
      return [...prevItems, { ...product, quantity: 1 }]; // Se não existe, adiciona o novo produto com quantidade 1
    });
  }, []); // Array de dependências vazio significa que a função só é criada uma vez

  // Remove um produto completamente do carrinho
  const removeFromCart = useCallback((productId: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId)); // Filtra, removendo o item com o ID especificado
  }, []); // Array de dependências vazio

  // Atualiza a quantidade de um item específico no carrinho
  const updateQuantity = useCallback((productId: number, newQuantity: number) => {
    if (newQuantity <= 0) { // Se a nova quantidade for zero ou negativa, remove o item
      removeFromCart(productId); // Reutiliza a função de remoção
      return;
    }
    setCartItems(prevItems => // Mapeia e atualiza a quantidade do item
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  }, [removeFromCart]); // Depende de removeFromCart, então é recriada se removeFromCart mudar (embora aqui não mude)

  // Limpa todos os itens do carrinho
  const clearCart = useCallback(() => {
    setCartItems([]); // Define o array de itens do carrinho como vazio
  }, []); // Array de dependências vazio

  // Verifica se um produto já está no carrinho
  const isInCart = useCallback((productId: number) => {
    return cartItems.some(item => item.id === productId); // Retorna true se encontrar algum item com o ID
  }, [cartItems]); // Depende de cartItems, então é recriada se cartItems mudar

  // --- 8. Cálculos Derivados (usando useMemo para otimização) ---
  // 'useMemo' memoriza o resultado de uma computação e só a recalcula se suas dependências mudarem.
  // Isso evita recálculos desnecessários em cada renderização.

  // Calcula o número total de unidades de todos os produtos no carrinho
  const cartCount = useMemo(() =>
    cartItems.reduce((count, item) => count + item.quantity, 0), // Soma a quantidade de todos os itens
    [cartItems] // Recalcula apenas quando 'cartItems' muda
  );

  // Calcula o preço total de todos os produtos no carrinho
  const totalPrice = useMemo(() =>
    cartItems.reduce((total, item) => total + item.price * item.quantity, 0), // Soma (preço * quantidade) para cada item
    [cartItems] // Recalcula apenas quando 'cartItems' muda
  );

  const changeCartItemQuantity= useCallback((product:Product, newQuantity :number) => {// Função para alterar a quantidade de um item no carrinho
    setCartItems(prevItems => {
      const existingItem=prevItems.find(item=> item.id===product.id);
      if(existingItem){
        return prevItems.map(item=>// Se o item já existe, atualiza a quantidade
          item.id ===product.id // Verifica se o ID do item é o mesmo do produto
          ? {...item,quantity :newQuantity}// Atualiza a quantidade do item existente
          : item // Mantém os outros itens inalterados
        )
        .filter(item => item.quantity > 0); // Remove itens com quantidade zero
      }
      return [...prevItems, {...product, quantity: newQuantity}];
    });
  },[]);// Função para alterar a quantidade de um item no carrinho, adicionando ou atualizando conforme necessário

  // --- 9. Valor a ser Fornecido pelo Contexto ---
  // Agrupa todos os dados e funções que serão expostos para os consumidores do contexto.
  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    totalPrice,
    isInCart,
    changeCartItemQuantity
  };

  // --- 10. Renderização do Provedor ---
  // O componente CartContext.Provider envolve os 'children' (os componentes que estarão dentro dele),
  // tornando o 'value' disponível para todos eles.
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};