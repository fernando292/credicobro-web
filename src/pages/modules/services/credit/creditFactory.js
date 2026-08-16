export function buildCredit({

  form,

  summary,

  selectedClient,

  creditToEdit

}) {

  const installments =
    Number(
      form.installments || 0
    );


  const capital =
    Number(
      summary.capital || 0
    );


  const totalInterest =
    Number(
      summary.interest || 0
    );


  const total =
    Number(
      summary.total || 0
    );


  const installmentValue =
    Number(
      summary.installment || 0
    );


  /*
   * ======================================================
   * IDENTIFICACIÓN
   * ======================================================
   */

  const creditId =
    creditToEdit
      ? creditToEdit.id
      : Date.now();


  /*
   * ======================================================
   * DATOS BASE DEL CRÉDITO
   * ======================================================
   */

  const credit = {

    id:
      creditId,

    clientId:
      form.clientId,

    client:
      selectedClient
        ? selectedClient.name
        : "",


    /*
     * ====================================================
     * INFORMACIÓN FINANCIERA ORIGINAL
     * ====================================================
     */

    amount:
      Number(
        form.amount || 0
      ),

    interest:
      Number(
        form.interest || 0
      ),

    capital,

    totalInterest,

    total,

    installmentValue,


    /*
     * ====================================================
     * CONCEPTOS FINANCIEROS
     *
     * Estos valores permiten que Finanzas pueda
     * diferenciar posteriormente:
     *
     * capital recuperado
     * vs.
     * interés ganado
     * ====================================================
     */

    capitalPaid:
      creditToEdit
        ? Number(
            creditToEdit.capitalPaid || 0
          )
        : 0,


    interestPaid:
      creditToEdit
        ? Number(
            creditToEdit.interestPaid || 0
          )
        : 0,


    capitalBalance:
      creditToEdit
        ? Number(
            creditToEdit.capitalBalance ??
            capital
          )
        : capital,


    interestBalance:
      creditToEdit
        ? Number(
            creditToEdit.interestBalance ??
            totalInterest
          )
        : totalInterest,


    /*
     * ====================================================
     * PLAN DE PAGOS
     * ====================================================
     */

    installments,

    frequency:
      form.frequency,

    startDate:
      form.startDate,

    firstPayment:
      form.firstPayment,


    /*
     * ====================================================
     * PRÓXIMO PAGO
     * ====================================================
     */

    nextPaymentDate:
      creditToEdit
        ? (
            creditToEdit.nextPaymentDate ||
            form.firstPayment
          )
        : form.firstPayment,


    /*
     * ====================================================
     * SALDO GENERAL
     * ====================================================
     */

    balance:
      creditToEdit
        ? Number(
            creditToEdit.balance ??
            total
          )
        : total,


    /*
     * ====================================================
     * PAGOS
     * ====================================================
     */

    paidAmount:
      creditToEdit
        ? Number(
            creditToEdit.paidAmount || 0
          )
        : 0,


    paidInstallments:
      creditToEdit
        ? Number(
            creditToEdit.paidInstallments || 0
          )
        : 0,


    pendingInstallments:
      creditToEdit
        ? Number(
            creditToEdit.pendingInstallments ??
            installments
          )
        : installments,


    /*
     * ====================================================
     * ESTADO
     * ====================================================
     */

    status:
      creditToEdit
        ? creditToEdit.status
        : "Activo",


    /*
     * ====================================================
     * NOTAS
     * ====================================================
     */

    notes:
      form.notes || "",


    /*
     * ====================================================
     * FECHA DE CREACIÓN
     * ====================================================
     */

    createdAt:
      creditToEdit
        ? creditToEdit.createdAt
        : new Date()

  };


  return credit;

}