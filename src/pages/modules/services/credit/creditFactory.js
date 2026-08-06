export function buildCredit({

  form,

  summary,

  selectedClient,

  creditToEdit

}) {

  const installments = Number(
    form.installments
  );

  return {

    id: creditToEdit
      ? creditToEdit.id
      : Date.now(),

    clientId: form.clientId,

    client: selectedClient
      ? selectedClient.name
      : "",

    amount: Number(
      form.amount
    ),

    interest: Number(
      form.interest
    ),

    installments,

    frequency: form.frequency,

    startDate: form.startDate,

    firstPayment: form.firstPayment,

    // NUEVO
    nextPaymentDate: creditToEdit
      ? creditToEdit.nextPaymentDate
      : form.firstPayment,

    notes: form.notes,

    capital: summary.capital,

    totalInterest: summary.interest,

    total: summary.total,

    installmentValue: summary.installment,

    balance: creditToEdit
      ? creditToEdit.balance
      : summary.total,

    paidAmount: creditToEdit
      ? creditToEdit.paidAmount || 0
      : 0,

    paidInstallments: creditToEdit
      ? creditToEdit.paidInstallments || 0
      : 0,

    pendingInstallments: creditToEdit
      ? creditToEdit.pendingInstallments
      : installments,

    status: creditToEdit
      ? creditToEdit.status
      : "Activo",

    createdAt: creditToEdit
      ? creditToEdit.createdAt
      : new Date()

  };

}