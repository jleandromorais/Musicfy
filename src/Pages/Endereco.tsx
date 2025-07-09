// src/Pages/Endereco.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../contexts/CartContext';
import { buscarDadosCEP } from '../services/CEPserivice';
import { criarEndereco } from '../services/CEPserivice';

const opcoesEntrega = [
  { id: 'padrao', name: 'Envio Padrão', price: 15.00, estimatedTime: '5-7 dias úteis' },
  { id: 'expresso', name: 'Envio Expresso', price: 30.00, estimatedTime: '1-3 dias úteis' },
  { id: 'retirada', name: 'Retirada Local', price: 0.00, estimatedTime: 'Pronto em 24 horas' },
];

const tiposEndereco = [
  { id: 'casa', name: 'Casa' },
  { id: 'trabalho', name: 'Trabalho' },
  { id: 'outro', name: 'Outro' },
];

const PaginaDetalhesEntrega: React.FC = () => {
  const { currentUser, firebaseUser, loading: carregandoAuth, error: authError } = useAuth(); // Get firebaseUser
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const [carregandoCEP, setCarregandoCEP] = useState(false);

  // Estados do endereço
  const [cep, setCep] = useState<string>('');
  const [rua, setRua] = useState<string>('');
  const [numero, setNumero] = useState<string>('');
  const [complemento, setComplemento] = useState<string>('');
  const [bairro, setBairro] = useState<string>('');
  const [cidade, setCidade] = useState<string>('');
  const [estado, setEstado] = useState<string>('');
  const [tipoEndereco, setTipoEndereco] = useState<string>(tiposEndereco[0].id);
  const [metodoEntregaSelecionado, setMetodoEntregaSelecionado] = useState<string>(opcoesEntrega[0].id);

  useEffect(() => {
    if (!carregandoAuth && currentUser && cartCount === 0) {
      toast.info("Seu carrinho está vazio. Adicione produtos para continuar.");
      navigate('/cart');
    }

    if (!carregandoAuth && authError) {
      toast.error(`Erro de autenticação: ${authError}. Por favor, tente novamente ou faça login.`);
    }
  }, [currentUser, carregandoAuth, navigate, cartCount, authError]);

  useEffect(() => {
    const cepLimpo = cep.replace(/\D/g, '');

    if (cepLimpo.length === 8) {
      setCarregandoCEP(true);

      const buscarEndereco = async () => {
        try {
          const dados = await buscarDadosCEP(cepLimpo);

          setRua(dados.logradouro || dados.street || '');
          setBairro(dados.bairro || dados.neighborhood || '');
          setCidade(dados.localidade || dados.city || '');
          setEstado(dados.uf || dados.state || '');

          document.getElementById('numero')?.focus();

          toast.success("Endereço preenchido automaticamente!");
        } catch (error) {
          toast.error("CEP não encontrado. Preencha manualmente.");
          console.error("Erro na busca do CEP:", error);
        } finally {
          setCarregandoCEP(false);
        }
      };

      const timer = setTimeout(buscarEndereco, 800);
      return () => clearTimeout(timer);
    }
  }, [cep]);

  const continuarParaPagamento = async (e: React.FormEvent) => {
    e.preventDefault();

    if (carregandoAuth) {
      toast.warn("Aguarde a verificação do seu status de login.");
      return;
    }
    if (!currentUser) {
      toast.info("Você precisa estar logado para continuar.");
      navigate('/login');
      return;
    }
    if (authError) {
      toast.error(`Não é possível continuar devido a um erro de autenticação: ${authError}`);
      return;
    }

    if (cep.replace(/\D/g, '').length !== 8) {
      toast.error("Por favor, insira um CEP válido com 8 dígitos.");
      return;
    }

    if (!rua.trim() || !numero.trim() || !bairro.trim() || !cidade.trim() || !estado.trim()) {
      toast.error("Por favor, preencha todos os campos obrigatórios do endereço.");
      return;
    }

    if (!metodoEntregaSelecionado) {
      toast.error("Por favor, selecione um método de entrega.");
      return;
    }

    const detalhesEntregaParaEnvio = {
      cep,
      rua,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
      tipo: tipoEndereco,
      metodoEntrega: metodoEntregaSelecionado,
      userId: currentUser?.id, // Pass the backend user ID
      firebaseUid: firebaseUser?.uid // Pass the Firebase UID
    };

    try {
      const enderecoCriado = await criarEndereco(detalhesEntregaParaEnvio);
      console.log("Objeto enderecoCriado recebido do backend:", enderecoCriado);
      toast.success("Endereço salvo com sucesso!");

      const idDoEndereco = (typeof enderecoCriado === 'object' && enderecoCriado !== null && 'id' in enderecoCriado)
                             ? enderecoCriado.id
                             : undefined;

      if (idDoEndereco === undefined) {
          console.error("Erro: ID do endereço não encontrado no objeto retornado pelo backend.", enderecoCriado);
          toast.error("Erro ao salvar endereço: ID do endereço não recebido. Tente novamente.");
          return;
      }

      navigate('/checkout', {
        state: {
          detalhesEntrega: {
            ...detalhesEntregaParaEnvio,
            enderecoId: idDoEndereco,
          }
        }
      });
    } catch (error) {
      console.error("Erro ao criar endereço:", error);
      toast.error("Erro ao salvar o endereço. Tente novamente.");
    }
  };

  if (carregandoAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1A002F] text-white">
        Carregando informações de usuário...
      </div>
    );
  }

  return (
    <div className="bg-[#1A002F] text-white min-h-screen p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      <ToastContainer position="bottom-right" />
      <div className="absolute top-1/2 left-1/2 w-[1000px] h-[1000px] rounded-full bg-[#35589A] opacity-15 filter blur-3xl transform -translate-x-1/2 -translate-y-1/2 z-0"></div>

      <div className="relative z-10 max-w-2xl mx-auto bg-gray-800 rounded-lg shadow-xl p-6 space-y-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-orange-500 mb-8 text-center">
          Detalhes de Entrega
        </h1>

        <form onSubmit={continuarParaPagamento} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-300">Endereço de Entrega:</h3>

            <div>
              <label htmlFor="cep" className="block text-gray-300 text-sm font-bold mb-2">
                CEP:
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="cep"
                  className="w-full p-3 rounded-md bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Ex: 00000-000"
                  value={cep}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length > 5) {
                      value = `${value.substring(0, 5)}-${value.substring(5, 8)}`;
                    }
                    setCep(value);
                  }}
                  maxLength={9}
                  required
                />
                {carregandoCEP && (
                  <div className="absolute right-3 top-3.5">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="rua" className="block text-gray-300 text-sm font-bold mb-2">
                  Rua:
                </label>
                <input
                  type="text"
                  id="rua"
                  className="w-full p-3 rounded-md bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={rua}
                  onChange={(e) => setRua(e.target.value)}
                  required
                />
              </div>
              <div className="w-full sm:w-24">
                <label htmlFor="numero" className="block text-gray-300 text-sm font-bold mb-2">
                  Número:
                </label>
                <input
                  type="text"
                  id="numero"
                  className="w-full p-3 rounded-md bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="complemento" className="block text-gray-300 text-sm font-bold mb-2">
                Complemento: (Opcional)
              </label>
              <input
                type="text"
                id="complemento"
                className="w-full p-3 rounded-md bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={complemento}
                onChange={(e) => setComplemento(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="bairro" className="block text-gray-300 text-sm font-bold mb-2">
                Bairro:
              </label>
              <input
                  type="text"
                  id="bairro"
                  className="w-full p-3 rounded-md bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label htmlFor="cidade" className="block text-gray-300 text-sm font-bold mb-2">
                    Cidade:
                  </label>
                  <input
                    type="text"
                    id="cidade"
                    className="w-full p-3 rounded-md bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    required
                  />
                </div>
                <div className="w-full sm:w-24">
                  <label htmlFor="estado" className="block text-gray-300 text-sm font-bold mb-2">
                    Estado:
                  </label>
                  <input
                    type="text"
                    id="estado"
                    className="w-full p-3 rounded-md bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={estado}
                    onChange={(e) => setEstado(e.target.value.toUpperCase())}
                    maxLength={2}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="tipoEndereco" className="block text-gray-300 text-sm font-bold mb-2">
                  Tipo de Endereço:
                </label>
                <select
                  id="tipoEndereco"
                  className="w-full p-3 rounded-md bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={tipoEndereco}
                  onChange={(e) => setTipoEndereco(e.target.value)}
                  required
                >
                  {tiposEndereco.map(tipo => (
                    <option key={tipo.id} value={tipo.id}>{tipo.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-xl font-bold text-gray-300">Forma de Entrega:</h3>
              <select
                id="metodoEntrega"
                className="w-full p-3 rounded-md bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={metodoEntregaSelecionado}
                onChange={(e) => setMetodoEntregaSelecionado(e.target.value)}
                required
              >
                {opcoesEntrega.map(opcao => (
                  <option key={opcao.id} value={opcao.id}>
                    {opcao.name} (R${opcao.price.toFixed(2)}) - {opcao.estimatedTime}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg transition-colors mt-6"
            >
              Continuar para o Pagamento
            </button>
          </form>
        </div>
      </div>
    );
  };

  export default PaginaDetalhesEntrega;