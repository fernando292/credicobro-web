import {
  createNotification
} from "./notificationService";

import {
  NOTIFICATION_TYPES
} from "./notificationTypes";

import {
  notificationTemplates
} from "./notificationTemplates";

import {
  filterAllowedCommunicationChannels
} from "../communications/communicationRules";


/* ======================================================
   RESOLVER CANALES DE COMUNICACIÓN
====================================================== */

/*
  Determina los canales solicitados según las
  preferencias de comunicación.

  IMPORTANTE:

  Las preferencias del cliente/empresa NO tienen
  autoridad sobre la política.

  Ejemplo:

    whatsappEnabled = true

  NO significa que cualquier notificación pueda
  enviarse por WhatsApp.

  La política central de communicationRules.js
  determina finalmente qué canales están permitidos.
*/

function resolveNotificationChannels({

  communicationPreferences = {},

  type

}) {

  const {

    whatsappEnabled = false,

    smsEnabled = false,

    emailEnabled = false

  } = communicationPreferences;


  const requestedChannels = [

    "internal"

  ];


  if (whatsappEnabled) {

    requestedChannels.push(
      "whatsapp"
    );

  }


  if (smsEnabled) {

    requestedChannels.push(
      "sms"
    );

  }


  if (emailEnabled) {

    requestedChannels.push(
      "email"
    );

  }


  /*
    Aplicamos la política central.

    El resultado solamente contiene canales
    autorizados para ese tipo de comunicación.
  */

  return filterAllowedCommunicationChannels({

    channels:
      requestedChannels,

    type

  });

}


/* ======================================================
   CRÉDITO CREADO
====================================================== */

export async function notifyCreditCreated({

  companyId,

  client,

  amount,

  referenceId = null,

  communicationPreferences = {}

}) {

  const type =
    NOTIFICATION_TYPES.CREDIT_CREATED;


  const notification =
    notificationTemplates.creditCreated({

      client,

      amount

    });


  const resolvedChannels =
    resolveNotificationChannels({

      communicationPreferences,

      type

    });


  return await createNotification({

    companyId,

    ...notification,

    type,

    referenceId,

    channels:
      resolvedChannels

  });

}


/* ======================================================
   PAGO REGISTRADO
====================================================== */

export async function notifyPaymentRegistered({

  companyId,

  client,

  amount,

  phone = null,

  referenceId = null,

  communicationPreferences = {}

}) {

  const type =
    NOTIFICATION_TYPES.PAYMENT_RECEIVED;


  const notification =
    notificationTemplates.paymentCreated({

      client,

      amount

    });


  /*
    Resolver canales antes de crear la notificación.

    Este log es TEMPORAL y sirve para comprobar
    si WhatsApp está siendo solicitado y autorizado.
  */

  const resolvedChannels =
    resolveNotificationChannels({

      communicationPreferences,

      type

    });


  console.log(

    "NOTIFICACIÓN PAGO - CANALES RESUELTOS",

    {

      type,

      communicationPreferences,

      resolvedChannels,

      phone

    }

  );


  return await createNotification({

    companyId,

    ...notification,

    type,

    referenceId,

    phone,

    channels:
      resolvedChannels

  });

}


/* ======================================================
   CLIENTE EN MORA
====================================================== */

export async function notifyClientOverdue({

  companyId,

  client,

  referenceId = null,

  communicationPreferences = {}

}) {

  const type =
    NOTIFICATION_TYPES.PAYMENT_OVERDUE;


  const notification =
    notificationTemplates.overdueCredit({

      client

    });


  const resolvedChannels =
    resolveNotificationChannels({

      communicationPreferences,

      type

    });


  return await createNotification({

    companyId,

    ...notification,

    type,

    referenceId,

    channels:
      resolvedChannels

  });

}


/* ======================================================
   COBRANZA PARA HOY
====================================================== */

export async function notifyTodayCollection({

  companyId,

  client,

  referenceId = null,

  communicationPreferences = {}

}) {

  const type =
    NOTIFICATION_TYPES.PAYMENT_DUE;


  const resolvedChannels =
    resolveNotificationChannels({

      communicationPreferences,

      type

    });


  return await createNotification({

    companyId,

    type,

    title:
      "Cobro programado",

    message:
      `Hoy corresponde cobrar a ${
        client || "Cliente"
      }.`,

    module:
      "collections",

    referenceId,

    channels:
      resolvedChannels

  });

}


/* ======================================================
   SEGUIMIENTO CREADO
====================================================== */

export async function notifyFollowUp({

  companyId,

  client,

  date,

  referenceId = null,

  communicationPreferences = {}

}) {

  const type =
    NOTIFICATION_TYPES.FOLLOWUP_CREATED;


  const notification =
    notificationTemplates.collectionVisit({

      client,

      date

    });


  const resolvedChannels =
    resolveNotificationChannels({

      communicationPreferences,

      type

    });


  return await createNotification({

    companyId,

    ...notification,

    type,

    referenceId,

    channels:
      resolvedChannels

  });

}