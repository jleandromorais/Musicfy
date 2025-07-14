import React from 'react';
import { FaBox, FaCheckCircle, FaClipboardCheck, FaRoute, FaTruck, FaTimesCircle } from 'react-icons/fa';

// Definimos os possíveis status e seus ícones correspondentes
const deliverySteps = [
  { name: 'Pedido recebido', icon: <FaClipboardCheck /> },
  { name: 'Em separação', icon: <FaBox /> },
  { name: 'Saiu para entrega', icon: <FaTruck /> },
  { name: 'A caminho', icon: <FaRoute /> },
  { name: 'Entregue', icon: <FaCheckCircle /> },
];

// Tipos para as propriedades do componente
interface DeliveryStatusProps {
  currentStatus: string;
  deliveryPerson: {
    name: string;
    avatar: string; // URL para a foto do entregador
  };
}

const DeliveryStatus: React.FC<DeliveryStatusProps> = ({ currentStatus, deliveryPerson }) => {
  // --- INÍCIO DA MODIFICAÇÃO ---

  // Se o pedido estiver cancelado, mostre uma mensagem específica e pare a execução aqui.
  if (currentStatus === 'Cancelado') {
    return (
      <div className="mt-6 flex flex-col items-center text-center p-4 border-t border-red-500/30">
        <FaTimesCircle className="text-red-500 text-5xl mb-3" />
        <h3 className="font-bold text-red-500 text-lg">Este pedido foi cancelado</h3>
      </div>
    );
  }

  // --- FIM DA MODIFICAÇÃO ---

  const currentStepIndex = deliverySteps.findIndex(step => step.name === currentStatus);

  return (
    <div className="mt-4 pt-4 border-t border-gray-700">
      <h3 className="font-bold text-gray-300 mb-4">Status da Entrega</h3>
      
      {/* Linha do Tempo do Status */}
      <div className="flex items-center justify-between">
        {deliverySteps.map((step, index) => {
          const isCompleted = index <= currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <React.Fragment key={step.name}>
              {/* Ícone da etapa */}
              <div className="flex flex-col items-center text-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300
                    ${isCompleted ? 'bg-orange-500 text-white' : 'bg-gray-600 text-gray-400'}
                    ${isCurrent ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-orange-400' : ''}
                  `}
                >
                  {step.icon}
                </div>
                <p className={`mt-2 text-xs font-medium ${isCompleted ? 'text-white' : 'text-gray-400'}`}>
                  {step.name}
                </p>
              </div>

              {/* Linha de conexão (não exibe após o último item) */}
              {index < deliverySteps.length - 1 && (
                <div className={`flex-1 h-1 mx-2 rounded
                  ${isCompleted ? 'bg-orange-500' : 'bg-gray-600'}`
                }></div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Informações do Entregador (aparece quando sai para entrega) */}
      {currentStepIndex >= 2 && (
        <div className="mt-6 p-3 bg-gray-700/50 rounded-lg flex items-center gap-4">
          <img src={deliveryPerson.avatar} alt={deliveryPerson.name} className="w-12 h-12 rounded-full object-cover" />
          <div>
            <p className="text-sm text-gray-400">Entregador:</p>
            <p className="font-bold text-white">{deliveryPerson.name}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryStatus;