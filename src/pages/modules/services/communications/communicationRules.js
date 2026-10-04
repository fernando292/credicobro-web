
import {
  NOTIFICATION_TYPES
} from "../notifications/notificationTypes";


/* ======================================================
   REGLAS CENTRALES DE COMUNICACIÓN
   CrediCobro
====================================================== */

/*
  Este archivo NO envía mensajes.

  Su responsabilidad es determinar qué canales están
  permitidos para cada tipo de notificación.

  Las preferencias indican qué canales desea utilizar
  la empresa, mientras que estas reglas determinan qué
  canales están realmente autorizados para cada evento.

  EVENTOS SMS ACTUALES:

  - Crédito creado                → BLOQUEADO
  - Pago registrado               → BLOQUEADO
  - Pago pendiente / cobro de hoy → PERMITIDO
  - Pago vencido / mora           → PERMITIDO
*/


/* ======================================================
   CANALES DE COMUNICACIÓN
====================================================== */

export const COMMUNICATION_CHANNELS = {

  INTERNAL:
    "internal",

  SMS:
    "sms",

  EMAIL:
    "email",

  WHATSAPP:
    "whatsapp"

};


/* ======================================================
   TIPOS DE NOTIFICACIÓN CON WHATSAPP PERMITIDO
====================================================== */

const WHATSAPP_ALLOWED_TYPES = [

  NOTIFICATION_TYPES.PAYMENT_RECEIVED,

  NOTIFICATION_TYPES.PAYMENT_DUE

];


/* ======================================================
   VERIFICAR WHATSAPP
====================================================== */

export function isWhatsAppAllowed(
  type
) {

  return WHATSAPP_ALLOWED_TYPES.includes(
    type
  );

}


/* ======================================================
   VERIFICAR CANAL
====================================================== */

export function isCommunicationChannelAllowed({

  channel,

  type

}) {

  if (!channel) {

    return false;

  }


  const normalizedChannel =
    String(channel)
      .trim()
      .toLowerCase();


  /* ==================================================
     NOTIFICACIÓN INTERNA
  ================================================== */

  if (
    normalizedChannel ===
    COMMUNICATION_CHANNELS.INTERNAL
  ) {

    return true;

  }


  /* ==================================================
     SMS
  ================================================== */

  if (
    normalizedChannel ===
    COMMUNICATION_CHANNELS.SMS
  ) {

    /*
      SMS está permitido únicamente para:

      - Pago pendiente / cobro de hoy.
      - Pago vencido / mora.

      SMS permanece bloqueado para:

      - Crédito creado.
      - Pago registrado.

      El envío real se realiza mediante la cola
      smsQueue y el Android CrediCobro SMS.
    */

    return (

      type ===
      NOTIFICATION_TYPES.PAYMENT_DUE

      ||

      type ===
      NOTIFICATION_TYPES.PAYMENT_OVERDUE

    );

  }


  /* ==================================================
     EMAIL
  ================================================== */

  if (
    normalizedChannel ===
    COMMUNICATION_CHANNELS.EMAIL
  ) {

    /*
      El canal está preparado para el futuro,
      pero todavía no existe un provider funcional.
    */

    return false;

  }


  /* ==================================================
     WHATSAPP
  ================================================== */

  if (
    normalizedChannel ===
    COMMUNICATION_CHANNELS.WHATSAPP
  ) {

    return isWhatsAppAllowed(
      type
    );

  }


  /* ==================================================
     CANAL DESCONOCIDO
  ================================================== */

  return false;

}


/* ======================================================
   FILTRAR CANALES PERMITIDOS
====================================================== */

export function filterAllowedCommunicationChannels({

  channels = [],

  type

}) {

  if (
    !Array.isArray(channels)
  ) {

    return [];

  }


  return [

    ...new Set(

      channels

        .map(
          channel =>
            String(channel)
              .trim()
              .toLowerCase()
        )

        .filter(
          channel =>
            isCommunicationChannelAllowed({

              channel,

              type

            })
        )

    )

  ];

}


/* ======================================================
   OBTENER CANALES BLOQUEADOS
====================================================== */

export function getBlockedCommunicationChannels({

  channels = [],

  type

}) {

  if (
    !Array.isArray(channels)
  ) {

    return [];

  }


  return [

    ...new Set(

      channels

        .map(
          channel =>
            String(channel)
              .trim()
              .toLowerCase()
        )

        .filter(
          channel =>
            !isCommunicationChannelAllowed({

              channel,

              type

            })
        )

    )

  ];

}

