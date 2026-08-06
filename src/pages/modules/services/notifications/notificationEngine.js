import { createNotification } from "./notificationService";



// Crédito creado

export async function notifyCreditCreated({

  companyId,
  client,
  amount

}) {

  await createNotification({

    companyId,

    type: "credit",

    title: "Nuevo crédito",

    message: `Se creó un crédito para ${client} por $${Number(amount).toLocaleString()}`

  });

}



// Pago registrado

export async function notifyPaymentRegistered({

  companyId,
  client,
  amount

}) {

  await createNotification({

    companyId,

    type: "payment",

    title: "Pago recibido",

    message: `${client} realizó un pago de $${Number(amount).toLocaleString()}`

  });

}



// Cliente en mora

export async function notifyClientOverdue({

  companyId,
  client

}) {

  await createNotification({

    companyId,

    type: "overdue",

    title: "Cliente en mora",

    message: `${client} presenta cuotas vencidas.`

  });

}



// Cobranza para hoy

export async function notifyTodayCollection({

  companyId,
  client

}) {

  await createNotification({

    companyId,

    type: "collection",

    title: "Cobro programado",

    message: `Hoy corresponde cobrar a ${client}.`

  });

}



// Seguimiento creado

export async function notifyFollowUp({

  companyId,
  client,
  date

}) {

  await createNotification({

    companyId,

    type: "followup",

    title: "Nuevo seguimiento",

    message: `${client} tiene seguimiento programado para ${date}.`

  });

}