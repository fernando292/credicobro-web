const PRIORITY = {
  HIGH: "Alta",
  MEDIUM: "Media",
  LOW: "Baja"
};


function toDate(value) {

  if (!value) {
    return null;
  }

  if (value?.toDate) {
    return value.toDate();
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? null
    : date;
}


function startOfDay(date) {

  const result = new Date(date);

  result.setHours(
    0,
    0,
    0,
    0
  );

  return result;
}


function differenceInDays(
  from,
  to
) {

  const milliseconds =
    startOfDay(to) -
    startOfDay(from);

  return Math.floor(
    milliseconds /
    (1000 * 60 * 60 * 24)
  );

}


function getPaymentAmount(payment) {

  return Number(
    payment?.value ??
    payment?.amount ??
    payment?.paymentAmount ??
    0
  );

}


function getCreditPayments(
  creditId,
  payments
) {

  return payments.filter(
    payment =>
      String(payment.creditId) ===
      String(creditId)
  );

}


function calculatePaymentBehavior(
  credit,
  payments
) {

  const creditPayments =
    getCreditPayments(
      credit.id,
      payments
    );

  if (
    creditPayments.length === 0
  ) {

    return {
      paymentsCount: 0,
      totalPaid: 0,
      averagePayment: 0,
      lastPaymentDate: null
    };

  }

  const totalPaid =
    creditPayments.reduce(
      (total, payment) =>
        total +
        getPaymentAmount(payment),
      0
    );

  const averagePayment =
    totalPaid /
    creditPayments.length;

  const dates =
    creditPayments
      .map(payment =>
        toDate(
          payment.createdAt ||
          payment.date
        )
      )
      .filter(Boolean)
      .sort(
        (a, b) => b - a
      );

  return {

    paymentsCount:
      creditPayments.length,

    totalPaid,

    averagePayment,

    lastPaymentDate:
      dates[0] || null

  };

}


function calculatePriority({
  credit,
  nextPaymentDate,
  today,
  behavior
}) {

  let score = 0;

  const balance =
    Number(
      credit.balance || 0
    );

  if (balance <= 0) {
    return {
      priority: null,
      score: 0,
      reason: "Crédito pagado"
    };
  }

  const daysUntilPayment =
    nextPaymentDate
      ? differenceInDays(
          today,
          nextPaymentDate
        )
      : null;

  /*
   * Crédito vencido
   */

  if (
    daysUntilPayment !== null &&
    daysUntilPayment < 0
  ) {

    const overdueDays =
      Math.abs(
        daysUntilPayment
      );

    score += 40;

    if (overdueDays >= 7) {
      score += 20;
    }

    if (overdueDays >= 15) {
      score += 15;
    }

    if (overdueDays >= 30) {
      score += 15;
    }

  }

  /*
   * Vence hoy
   */

  else if (
    daysUntilPayment === 0
  ) {

    score += 35;

  }

  /*
   * Próximo vencimiento
   */

  else if (
    daysUntilPayment !== null &&
    daysUntilPayment <= 3
  ) {

    score += 20;

  }

  /*
   * Sin fecha próxima
   */

  if (
    daysUntilPayment === null
  ) {

    score += 15;

  }

  /*
   * Saldo pendiente
   */

  if (balance >= 1000000) {
    score += 20;
  }

  else if (balance >= 500000) {
    score += 12;
  }

  else if (balance >= 200000) {
    score += 6;
  }

  /*
   * Sin pagos registrados
   */

  if (
    behavior.paymentsCount === 0
  ) {

    score += 15;

  }

  /*
   * Último pago muy antiguo
   */

  if (
    behavior.lastPaymentDate
  ) {

    const daysSincePayment =
      differenceInDays(
        behavior.lastPaymentDate,
        today
      );

    if (
      daysSincePayment >= 15
    ) {

      score += 10;

    }

  }

  /*
   * Clasificación
   */

  let priority =
    PRIORITY.LOW;

  if (score >= 60) {

    priority =
      PRIORITY.HIGH;

  }

  else if (score >= 30) {

    priority =
      PRIORITY.MEDIUM;

  }

  /*
   * Motivo
   */

  let reason =
    "Seguimiento normal";

  if (
    daysUntilPayment !== null &&
    daysUntilPayment < 0
  ) {

    reason =
      `Vencido hace ${Math.abs(
        daysUntilPayment
      )} días`;

  }

  else if (
    daysUntilPayment === 0
  ) {

    reason =
      "Vence hoy";

  }

  else if (
    daysUntilPayment !== null &&
    daysUntilPayment <= 3
  ) {

    reason =
      `Vence en ${daysUntilPayment} días`;

  }

  if (
    behavior.paymentsCount === 0
  ) {

    reason +=
      " · Sin pagos registrados";

  }

  return {

    priority,
    score,
    reason

  };

}


/* ======================================================
   ANALIZAR CARTERA
====================================================== */

export function analyzeCollectionPortfolio({

  credits = [],
  payments = [],
  clients = []

}) {

  const today =
    startOfDay(
      new Date()
    );

  const clientsById =
    new Map(
      clients.map(
        client => [
          String(client.id),
          client
        ]
      )
    );

  const analysis =
    credits
      .map(credit => {

        const client =
          clientsById.get(
            String(
              credit.clientId
            )
          );

        const nextPaymentDate =
          toDate(
            credit.nextPaymentDate ||
            credit.firstPayment
          );

        const behavior =
          calculatePaymentBehavior(
            credit,
            payments
          );

        const priority =
          calculatePriority({
            credit,
            nextPaymentDate,
            today,
            behavior
          });

        const daysUntilPayment =
          nextPaymentDate
            ? differenceInDays(
                today,
                nextPaymentDate
              )
            : null;

        return {

          creditId:
            credit.id,

          clientId:
            credit.clientId,

          clientName:
            client?.name ||
            credit.client ||
            "Cliente",

          phone:
            client?.phone ||
            "",

          balance:
            Number(
              credit.balance || 0
            ),

          installmentValue:
            Number(
              credit.installmentValue || 0
            ),

          nextPaymentDate:
            credit.nextPaymentDate ||
            credit.firstPayment ||
            null,

          daysUntilPayment,

          overdueDays:
            daysUntilPayment !== null &&
            daysUntilPayment < 0
              ? Math.abs(
                  daysUntilPayment
                )
              : 0,

          paymentsCount:
            behavior.paymentsCount,

          totalPaid:
            behavior.totalPaid,

          averagePayment:
            behavior.averagePayment,

          lastPaymentDate:
            behavior.lastPaymentDate,

          priority:
            priority.priority,

          score:
            priority.score,

          reason:
            priority.reason,

          status:
            credit.status

        };

      })

      .filter(
        item =>
          item.balance > 0
      )
      .sort(
        (a, b) =>
          b.score - a.score
      );

  const highPriority =
    analysis.filter(
      item =>
        item.priority ===
        PRIORITY.HIGH
    );

  const mediumPriority =
    analysis.filter(
      item =>
        item.priority ===
        PRIORITY.MEDIUM
    );

  const lowPriority =
    analysis.filter(
      item =>
        item.priority ===
        PRIORITY.LOW
    );

  const overdue =
    analysis.filter(
      item =>
        item.overdueDays > 0
    );

  const dueSoon =
    analysis.filter(
      item =>
        item.daysUntilPayment !== null &&
        item.daysUntilPayment >= 0 &&
        item.daysUntilPayment <= 3
    );

  const totalPending =
    analysis.reduce(
      (total, item) =>
        total +
        item.balance,
      0
    );

  const overdueAmount =
    overdue.reduce(
      (total, item) =>
        total +
        item.balance,
      0
    );

  return {

    analysis,

    priorities: {

      high: highPriority,

      medium: mediumPriority,

      low: lowPriority

    },

    overdue,

    dueSoon,

    totals: {

      pending:
        totalPending,

      overdue:
        overdueAmount,

      highPriority:
        highPriority.length,

      mediumPriority:
        mediumPriority.length,

      lowPriority:
        lowPriority.length,

      overdueCount:
        overdue.length,

      dueSoonCount:
        dueSoon.length

    }

  };

}