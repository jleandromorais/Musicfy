// src/services/dateService.ts

/**
 * Adiciona um número específico de dias úteis a uma data.
 * @param date A data inicial.
 * @param days O número de dias úteis a adicionar.
 * @returns A nova data.
 */
function addBusinessDays(date: Date, days: number): Date {
  const newDate = new Date(date);
  let addedDays = 0;
  while (addedDays < days) {
    newDate.setDate(newDate.getDate() + 1);
    const dayOfWeek = newDate.getDay();
    // 0 = Domingo, 6 = Sábado. Não conta fins de semana.
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      addedDays++;
    }
  }
  return newDate;
}

/**
 * Calcula a data de entrega estimada com base numa string de tempo.
 * Ex: "5-7 dias úteis"
 * @param orderDate A data em que o pedido foi feito.
 * @param estimatedTimeString A string com o tempo estimado.
 * @returns Uma string formatada com a data de entrega, ex: "08/07 - 10/07".
 */
export const calculateEstimatedDelivery = (orderDate: string, estimatedTimeString: string): string => {
  const date = new Date(orderDate);
  
  // Extrai os números da string (ex: "5-7" -> [5, 7])
  const daysMatch = estimatedTimeString.match(/\d+/g);
  if (!daysMatch) {
    return "Não especificado";
  }

  const minDays = parseInt(daysMatch[0], 10);
  const maxDays = daysMatch.length > 1 ? parseInt(daysMatch[1], 10) : minDays;

  const minDeliveryDate = addBusinessDays(date, minDays);
  const maxDeliveryDate = addBusinessDays(new Date(orderDate), maxDays); // Recalcular a partir da data original

  const formatDate = (d: Date) => `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;

  if (minDays === maxDays) {
    return `Estimado para ${formatDate(minDeliveryDate)}`;
  }
  
  return `Estimado entre ${formatDate(minDeliveryDate)} e ${formatDate(maxDeliveryDate)}`;
};