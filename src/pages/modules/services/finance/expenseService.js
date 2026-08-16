import {
  collection,
  getDocs,
  doc,
  runTransaction
} from "firebase/firestore";

import { db } from "../../../../config/firebase";


/* ======================================================
   REFERENCIA DE EGRESOS
====================================================== */

function getExpensesRef(companyId) {
  return collection(
    db,
    "companies",
    companyId,
    "expenses"
  );
}


/* ======================================================
   REFERENCIA FINANCIERA
====================================================== */

function getFinanceRef(companyId) {
  return doc(
    db,
    "companies",
    companyId,
    "settings",
    "finance"
  );
}


/* ======================================================
   OBTENER EGRESOS
====================================================== */

export async function getExpenses(companyId) {
  if (!companyId) {
    throw new Error(
      "companyId es obligatorio."
    );
  }

  const snapshot = await getDocs(
    getExpensesRef(companyId)
  );

  return snapshot.docs.map(
    expenseDocument => ({
      id: expenseDocument.id,
      ...expenseDocument.data()
    })
  );
}


/* ======================================================
   CREAR EGRESO
====================================================== */

export async function createExpense(
  companyId,
  expense
) {

  if (!companyId) {
    throw new Error(
      "companyId es obligatorio."
    );
  }

  if (!expense) {
    throw new Error(
      "La información del egreso es obligatoria."
    );
  }

  const amount = Number(
    expense.amount || 0
  );

  if (amount <= 0) {
    throw new Error(
      "El valor del egreso debe ser mayor que cero."
    );
  }


  console.log(
    "CREATE EXPENSE EJECUTADO",
    {
      companyId,
      amount,
      financePath:
        `companies/${companyId}/settings/finance`
    }
  );


  const expenseRef = doc(
    getExpensesRef(companyId)
  );

  const financeRef =
    getFinanceRef(companyId);


  const expenseData = {

    description:
      expense.description || "",

    category:
      expense.category || "Otros",

    amount,

    paymentMethod:
      expense.paymentMethod ||
      expense.method ||
      "Efectivo",

    method:
      expense.method ||
      expense.paymentMethod ||
      "Efectivo",

    date:
      expense.date ||
      new Date()
        .toISOString()
        .split("T")[0],

    notes:
      expense.notes || "",

    type:
      "expense",

    createdAt:
      new Date()

  };


  await runTransaction(
    db,
    async transaction => {

      const financeSnapshot =
        await transaction.get(
          financeRef
        );


      if (!financeSnapshot.exists()) {
        throw new Error(
          "No existe la configuración financiera de la empresa."
        );
      }


      const finance =
        financeSnapshot.data();


      const capitalAvailable =
        Number(
          finance.capitalAvailable || 0
        );


      console.log(
        "CAPITAL LEÍDO EN TRANSACTION:",
        capitalAvailable
      );


      console.log(
        "EGRESO A DESCONTAR:",
        amount
      );


      if (
        capitalAvailable < amount
      ) {

        throw new Error(
          `Capital insuficiente. Capital disponible: $${capitalAvailable.toLocaleString(
            "es-CO"
          )}.`
        );

      }


      const newCapitalAvailable =
        capitalAvailable - amount;


      console.log(
        "CAPITAL NUEVO:",
        newCapitalAvailable
      );


      /*
       * Guardar egreso
       */

      transaction.set(
        expenseRef,
        expenseData
      );


      /*
       * Descontar egreso del capital disponible
       */

      transaction.update(
        financeRef,
        {
          capitalAvailable:
            newCapitalAvailable
        }
      );

    }
  );


  console.log(
    "EGRESO GUARDADO CORRECTAMENTE",
    {
      expenseId: expenseRef.id,
      amount
    }
  );


  return {

    id:
      expenseRef.id,

    ...expenseData

  };

}


/* ======================================================
   ACTUALIZAR EGRESO
====================================================== */

export async function updateExpense(
  companyId,
  expenseId,
  data
) {

  if (
    !companyId ||
    !expenseId
  ) {
    throw new Error(
      "companyId y expenseId son obligatorios."
    );
  }

  if (!data) {
    throw new Error(
      "La información del egreso es obligatoria."
    );
  }


  const expenseRef = doc(
    db,
    "companies",
    companyId,
    "expenses",
    expenseId
  );


  const financeRef =
    getFinanceRef(companyId);


  await runTransaction(
    db,
    async transaction => {

      const expenseSnapshot =
        await transaction.get(
          expenseRef
        );


      if (!expenseSnapshot.exists()) {
        throw new Error(
          "El egreso no existe."
        );
      }


      const financeSnapshot =
        await transaction.get(
          financeRef
        );


      if (!financeSnapshot.exists()) {
        throw new Error(
          "No existe la configuración financiera de la empresa."
        );
      }


      const previousExpense =
        expenseSnapshot.data();


      const finance =
        financeSnapshot.data();


      const previousAmount =
        Number(
          previousExpense.amount || 0
        );


      const newAmount =
        Number(
          data.amount !== undefined
            ? data.amount
            : previousAmount
        );


      if (newAmount <= 0) {
        throw new Error(
          "El valor del egreso debe ser mayor que cero."
        );
      }


      const difference =
        newAmount -
        previousAmount;


      const capitalAvailable =
        Number(
          finance.capitalAvailable || 0
        );


      /*
       * Si aumenta el egreso,
       * descontamos la diferencia.
       *
       * Si disminuye,
       * devolvemos la diferencia.
       */

      if (
        difference > 0 &&
        capitalAvailable < difference
      ) {

        throw new Error(
          `Capital insuficiente. Capital disponible: $${capitalAvailable.toLocaleString(
            "es-CO"
          )}. Diferencia requerida: $${difference.toLocaleString(
            "es-CO"
          )}.`
        );

      }


      const newCapitalAvailable =
        capitalAvailable -
        difference;


      const updatedData = {

        ...data,

        amount:
          newAmount,

        paymentMethod:
          data.paymentMethod ||
          data.method ||
          previousExpense.paymentMethod ||
          "Efectivo",

        method:
          data.method ||
          data.paymentMethod ||
          previousExpense.method ||
          previousExpense.paymentMethod ||
          "Efectivo"

      };


      transaction.update(
        expenseRef,
        updatedData
      );


      transaction.update(
        financeRef,
        {
          capitalAvailable:
            newCapitalAvailable
        }
      );

    }
  );


  return {

    id:
      expenseId,

    ...data,

    amount:
      Number(
        data.amount || 0
      )

  };

}


/* ======================================================
   ELIMINAR EGRESO
====================================================== */

export async function removeExpense(
  companyId,
  expenseId
) {

  if (
    !companyId ||
    !expenseId
  ) {
    throw new Error(
      "companyId y expenseId son obligatorios."
    );
  }


  const expenseRef = doc(
    db,
    "companies",
    companyId,
    "expenses",
    expenseId
  );


  const financeRef =
    getFinanceRef(companyId);


  await runTransaction(
    db,
    async transaction => {

      const expenseSnapshot =
        await transaction.get(
          expenseRef
        );


      if (!expenseSnapshot.exists()) {
        throw new Error(
          "El egreso no existe."
        );
      }


      const financeSnapshot =
        await transaction.get(
          financeRef
        );


      if (!financeSnapshot.exists()) {
        throw new Error(
          "No existe la configuración financiera de la empresa."
        );
      }


      const expense =
        expenseSnapshot.data();


      const finance =
        financeSnapshot.data();


      const expenseAmount =
        Number(
          expense.amount || 0
        );


      const capitalAvailable =
        Number(
          finance.capitalAvailable || 0
        );


      const newCapitalAvailable =
        capitalAvailable +
        expenseAmount;


      transaction.delete(
        expenseRef
      );


      transaction.update(
        financeRef,
        {
          capitalAvailable:
            newCapitalAvailable
        }
      );

    }
  );


  return true;

}