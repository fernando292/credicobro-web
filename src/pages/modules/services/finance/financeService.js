import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc
} from "firebase/firestore";

import { db } from "../../../../config/firebase";


/* ======================================================
   REFERENCIAS
====================================================== */

function getCreditsRef(
  companyId
) {

  return collection(
    db,
    "companies",
    companyId,
    "credits"
  );

}


function getPaymentsRef(
  companyId,
  creditId
) {

  return collection(
    db,
    "companies",
    companyId,
    "credits",
    creditId,
    "payments"
  );

}


function getExpensesRef(
  companyId
) {

  return collection(
    db,
    "companies",
    companyId,
    "expenses"
  );

}


/* ======================================================
   ESTADO FINANCIERO DEL CAPITAL

   Documento:

   companies/{companyId}/settings/finance
====================================================== */

function getFinanceSettingsRef(
  companyId
) {

  return doc(
    db,
    "companies",
    companyId,
    "settings",
    "finance"
  );

}


/* ======================================================
   NORMALIZAR FECHA
====================================================== */

function normalizeDate(
  value
) {

  if (!value) {

    return "";

  }


  if (
    typeof value === "string"
  ) {

    return value
      .trim()
      .split("T")[0];

  }


  if (value?.toDate) {

    return value
      .toDate()
      .toISOString()
      .split("T")[0];

  }


  return "";

}


/* ======================================================
   OBTENER ESTADO FINANCIERO
====================================================== */

export async function getFinanceSettings(
  companyId
) {

  if (!companyId) {

    throw new Error(
      "companyId es obligatorio."
    );

  }


  const snapshot =
    await getDoc(
      getFinanceSettingsRef(
        companyId
      )
    );


  if (!snapshot.exists()) {

    return {

      initialCapital:
        0,

      capitalAvailable:
        0,

      capitalPlaced:
        0,

      interestCollected:
        0,

      interestPending:
        0

    };

  }


  const data =
    snapshot.data();


  return {

    initialCapital:
      Number(
        data.initialCapital || 0
      ),

    capitalAvailable:
      Number(
        data.capitalAvailable || 0
      ),

    capitalPlaced:
      Number(
        data.capitalPlaced || 0
      ),

    interestCollected:
      Number(
        data.interestCollected || 0
      ),

    interestPending:
      Number(
        data.interestPending || 0
      )

  };

}


/* ======================================================
   CONFIGURAR CAPITAL INICIAL

   REGLA:

   Capital disponible =
   Capital inicial
   - Capital colocado
   - Egresos

   No utilizamos el capitalAvailable anterior
   para calcular el nuevo disponible.

   Esto evita duplicaciones cuando el usuario
   modifica el capital inicial.
====================================================== */

export async function setInitialCapital(
  companyId,
  amount
) {

  if (!companyId) {

    throw new Error(
      "companyId es obligatorio."
    );

  }


  const capital =
    Number(
      amount || 0
    );


  if (capital <= 0) {

    throw new Error(
      "El capital debe ser mayor que cero."
    );

  }


  const current =
    await getFinanceSettings(
      companyId
    );


  /* ====================================================
     OBTENER EGRESOS ACTUALES
  ==================================================== */

  const expensesSnapshot =
    await getDocs(
      getExpensesRef(
        companyId
      )
    );


  const totalExpenses =
    expensesSnapshot.docs.reduce(

      (
        total,
        expenseDocument
      ) => {

        const expense =
          expenseDocument.data();


        return (
          total +
          Number(
            expense.amount || 0
          )
        );

      },

      0

    );


  /* ====================================================
     CAPITAL ACTUALMENTE COLOCADO
  ==================================================== */

  const capitalPlaced =
    Number(
      current.capitalPlaced || 0
    );


  /* ====================================================
     CALCULAR CAPITAL DISPONIBLE REAL

     Capital inicial
     - capital colocado
     - egresos
  ==================================================== */

  const calculatedAvailable =
    capital -
    capitalPlaced -
    totalExpenses;


  const capitalAvailable =
    Math.max(
      calculatedAvailable,
      0
    );


  const newFinance = {

    initialCapital:
      capital,

    capitalAvailable,

    capitalPlaced,

    interestCollected:
      current.interestCollected,

    interestPending:
      current.interestPending

  };


  await setDoc(

    getFinanceSettingsRef(
      companyId
    ),

    newFinance,

    {
      merge: true
    }

  );


  return newFinance;

}


/* ======================================================
   COLOCAR CAPITAL EN UN CRÉDITO
====================================================== */

export async function placeCapital(
  companyId,
  amount
) {

  if (!companyId) {

    throw new Error(
      "companyId es obligatorio."
    );

  }


  const capital =
    Number(
      amount || 0
    );


  if (capital <= 0) {

    throw new Error(
      "El monto del crédito debe ser mayor que cero."
    );

  }


  const current =
    await getFinanceSettings(
      companyId
    );


  if (
    capital >
    current.capitalAvailable
  ) {

    throw new Error(

      `Capital insuficiente. Disponible: $${current.capitalAvailable.toLocaleString(
        "es-CO"
      )}`

    );

  }


  const newFinance = {

    initialCapital:
      current.initialCapital,

    capitalAvailable:
      current.capitalAvailable -
      capital,

    capitalPlaced:
      current.capitalPlaced +
      capital,

    interestCollected:
      current.interestCollected,

    interestPending:
      current.interestPending

  };


  await setDoc(

    getFinanceSettingsRef(
      companyId
    ),

    newFinance,

    {
      merge: true
    }

  );


  return newFinance;

}


/* ======================================================
   REGRESAR CAPITAL RECUPERADO
====================================================== */

export async function returnCapital(
  companyId,
  amount
) {

  if (!companyId) {

    throw new Error(
      "companyId es obligatorio."
    );

  }


  const capital =
    Number(
      amount || 0
    );


  if (capital <= 0) {

    return getFinanceSettings(
      companyId
    );

  }


  const current =
    await getFinanceSettings(
      companyId
    );


  const newCapitalPlaced =
    Math.max(

      current.capitalPlaced -
      capital,

      0

    );


  const newFinance = {

    initialCapital:
      current.initialCapital,

    capitalAvailable:
      current.capitalAvailable +
      capital,

    capitalPlaced:
      newCapitalPlaced,

    interestCollected:
      current.interestCollected,

    interestPending:
      current.interestPending

  };


  await setDoc(

    getFinanceSettingsRef(
      companyId
    ),

    newFinance,

    {
      merge: true
    }

  );


  return newFinance;

}


/* ======================================================
   REGISTRAR INTERÉS COBRADO
====================================================== */

export async function registerInterest(
  companyId,
  amount
) {

  if (!companyId) {

    throw new Error(
      "companyId es obligatorio."
    );

  }


  const interest =
    Number(
      amount || 0
    );


  if (interest <= 0) {

    return getFinanceSettings(
      companyId
    );

  }


  const current =
    await getFinanceSettings(
      companyId
    );


  const newPending =
    Math.max(

      current.interestPending -
      interest,

      0

    );


  const newFinance = {

    initialCapital:
      current.initialCapital,

    capitalAvailable:
      current.capitalAvailable,

    capitalPlaced:
      current.capitalPlaced,

    interestCollected:
      current.interestCollected +
      interest,

    interestPending:
      newPending

  };


  await setDoc(

    getFinanceSettingsRef(
      companyId
    ),

    newFinance,

    {
      merge: true
    }

  );


  return newFinance;

}


/* ======================================================
   REGISTRAR INTERÉS PENDIENTE
====================================================== */

export async function registerPendingInterest(
  companyId,
  amount
) {

  if (!companyId) {

    throw new Error(
      "companyId es obligatorio."
    );

  }


  const interest =
    Number(
      amount || 0
    );


  if (interest <= 0) {

    return getFinanceSettings(
      companyId
    );

  }


  const current =
    await getFinanceSettings(
      companyId
    );


  const newFinance = {

    initialCapital:
      current.initialCapital,

    capitalAvailable:
      current.capitalAvailable,

    capitalPlaced:
      current.capitalPlaced,

    interestCollected:
      current.interestCollected,

    interestPending:
      current.interestPending +
      interest

  };


  await setDoc(

    getFinanceSettingsRef(
      companyId
    ),

    newFinance,

    {
      merge: true
    }

  );


  return newFinance;

}


/* ======================================================
   OBTENER INGRESOS REALES
====================================================== */

export async function getFinancialIncome(
  companyId
) {

  if (!companyId) {

    throw new Error(
      "companyId es obligatorio."
    );

  }


  const creditsSnapshot =
    await getDocs(
      getCreditsRef(
        companyId
      )
    );


  const income = [];


  await Promise.all(

    creditsSnapshot.docs.map(

      async creditDocument => {

        const creditId =
          creditDocument.id;


        const credit =
          creditDocument.data();


        const paymentsSnapshot =
          await getDocs(
            getPaymentsRef(
              companyId,
              creditId
            )
          );


        paymentsSnapshot.docs.forEach(

          paymentDocument => {

            const payment =
              paymentDocument.data();


            income.push({

              id:
                paymentDocument.id,

              type:
                "income",

              source:
                "credit_payment",

              creditId,

              clientId:
                payment.clientId ||
                credit.clientId ||
                null,

              client:
                payment.client ||
                credit.client ||
                "Cliente",

              amount:
                Number(
                  payment.value || 0
                ),

              capitalPaid:
                Number(
                  payment.capitalPaid ||
                  payment.paidCapital ||
                  0
                ),

              interestPaid:
                Number(
                  payment.interestPaid ||
                  payment.paidInterest ||
                  0
                ),

              method:
                payment.method ||
                "Efectivo",

              date:
                normalizeDate(
                  payment.date
                ),

              installmentNumber:
                Number(
                  payment.installmentNumber ||
                  0
                ),

              createdAt:
                payment.createdAt ||
                null

            });

          }

        );

      }

    )

  );


  return income;

}


/* ======================================================
   OBTENER EGRESOS
====================================================== */

export async function getFinancialExpenses(
  companyId
) {

  if (!companyId) {

    throw new Error(
      "companyId es obligatorio."
    );

  }


  const snapshot =
    await getDocs(
      getExpensesRef(
        companyId
      )
    );


  return snapshot.docs.map(

    item => {

      const expense =
        item.data();


      return {

        id:
          item.id,

        type:
          "expense",

        source:
          "expense",

        description:
          expense.description ||
          "",

        category:
          expense.category ||
          "Otros",

        amount:
          Number(
            expense.amount || 0
          ),

        method:
          expense.paymentMethod ||
          expense.method ||
          "Efectivo",

        date:
          normalizeDate(
            expense.date
          ),

        notes:
          expense.notes ||
          "",

        createdAt:
          expense.createdAt ||
          null

      };

    }

  );

}


/* ======================================================
   OBTENER MOVIMIENTOS
====================================================== */

export async function getFinancialMovements(
  companyId
) {

  if (!companyId) {

    throw new Error(
      "companyId es obligatorio."
    );

  }


  const [

    income,

    expenses

  ] = await Promise.all([

    getFinancialIncome(
      companyId
    ),

    getFinancialExpenses(
      companyId
    )

  ]);


  return [

    ...income,

    ...expenses

  ];

}


/* ======================================================
   RESUMEN FINANCIERO
====================================================== */

export async function getFinancialSummary(
  companyId
) {

  if (!companyId) {

    throw new Error(
      "companyId es obligatorio."
    );

  }


  const [

    settings,

    movements

  ] = await Promise.all([

    getFinanceSettings(
      companyId
    ),

    getFinancialMovements(
      companyId
    )

  ]);


  /* ====================================================
     INGRESOS TOTALES
  ==================================================== */

  const totalIncome =
    movements
      .filter(

        movement =>
          movement.type ===
          "income"

      )
      .reduce(

        (
          total,
          movement
        ) =>

          total +
          Number(
            movement.amount || 0
          ),

        0

      );


  /* ====================================================
     EGRESOS TOTALES
  ==================================================== */

  const totalExpenses =
    movements
      .filter(

        movement =>
          movement.type ===
          "expense"

      )
      .reduce(

        (
          total,
          movement
        ) =>

          total +
          Number(
            movement.amount || 0
          ),

        0

      );


  /* ====================================================
     INTERESES COBRADOS
  ==================================================== */

  const interestCollected =
    movements
      .filter(

        movement =>
          movement.type ===
          "income"

      )
      .reduce(

        (
          total,
          movement
        ) =>

          total +
          Number(
            movement.interestPaid || 0
          ),

        0

      );


  /* ====================================================
     INTERESES PENDIENTES
  ==================================================== */

  /*
    Los intereses pendientes deben salir
    del estado financiero interno porque todavía
    no son ingresos realizados.
  */

  const interestPending =
    settings.interestPending;


  /* ====================================================
     UTILIDAD REAL
  ==================================================== */

  /*
    Los pagos contienen:

    capital + intereses

    Por eso NO usamos:

    totalIncome - totalExpenses

    para calcular utilidad.

    La utilidad real es:

    intereses cobrados - egresos
  */

  const netFlow =
    interestCollected -
    totalExpenses;


  return {

    initialCapital:
      settings.initialCapital,

    capitalAvailable:
      settings.capitalAvailable,

    capitalPlaced:
      settings.capitalPlaced,

    totalIncome,

    totalExpenses,

    interestCollected,

    interestPending,

    netFlow,

    movements

  };

}