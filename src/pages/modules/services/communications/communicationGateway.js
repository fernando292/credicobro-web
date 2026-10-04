import {
  sendWhatsAppMessage
} from "./providers/whatsapp/whatsappProvider";

import {
  sendSmsNotification
} from "../notifications/channels/sms/smsNotificationService";

import {
  filterAllowedCommunicationChannels,
  getBlockedCommunicationChannels
} from "./communicationRules";


/* ======================================================
   GATEWAY DE COMUNICACIONES
   CrediCobro
====================================================== */

/*
  Responsabilidad:

  - Recibir solicitudes de comunicación.
  - Validar canales.
  - Aplicar reglas centrales.
  - Delegar al provider correspondiente.
  - Devolver resultados normalizados.

  Este archivo NO contiene lógica de:

  - créditos
  - pagos
  - clientes
  - cobranza
  - notificaciones
*/


/* ======================================================
   ENVIAR COMUNICACIÓN
====================================================== */

export async function sendCommunication({

  channels = [],

  companyId,

  phone = null,

  message,

  type = "info",

  module = "general",

  referenceId = null

}) {

  /* ====================================================
     VALIDACIONES
  ==================================================== */

  if (!companyId) {

    throw new Error(
      "companyId es obligatorio."
    );

  }


  if (!message) {

    throw new Error(
      "message es obligatorio."
    );

  }


  /* ====================================================
     NORMALIZAR CANALES
  ==================================================== */

  const requestedChannels =

    Array.isArray(channels)

      ? [

          ...new Set(

            channels

              .map(
                channel =>
                  String(channel)
                    .trim()
                    .toLowerCase()
              )

              .filter(Boolean)

          )

        ]

      : [];


  /* ====================================================
     CANALES PERMITIDOS
  ==================================================== */

  const allowedChannels =
    filterAllowedCommunicationChannels({

      channels:
        requestedChannels,

      type

    });


  /* ====================================================
     CANALES BLOQUEADOS
  ==================================================== */

  const blockedChannels =
    getBlockedCommunicationChannels({

      channels:
        requestedChannels,

      type

    });


  /* ====================================================
     RESULTADOS
  ==================================================== */

  const results = {};


  /* ====================================================
     CANALES BLOQUEADOS
  ==================================================== */

  blockedChannels.forEach(
    channel => {

      results[channel] = {

        success:
          false,

        status:
          "blocked_by_policy",

        channel,

        companyId,

        type,

        module,

        referenceId,

        error:
          `El canal "${channel}" no está permitido para el tipo de comunicación "${type}".`

      };

    }
  );


  /* ====================================================
     WHATSAPP
  ==================================================== */

  if (
    allowedChannels.includes(
      "whatsapp"
    )
  ) {

    try {

      const result =
        await sendWhatsAppMessage({

          phone,

          message

        });


      results.whatsapp = {

        ...result,

        channel:
          "whatsapp",

        companyId,

        type,

        module,

        referenceId

      };


    } catch (error) {

      console.error(
        "Error enviando comunicación WhatsApp:",
        error
      );


      results.whatsapp = {

        success:
          false,

        status:
          "error",

        channel:
          "whatsapp",

        companyId,

        type,

        module,

        referenceId,

        error:
          error?.message ||
          "Error desconocido."

      };

    }

  }


  /* ====================================================
     SMS
  ==================================================== */

  if (
    allowedChannels.includes(
      "sms"
    )
  ) {

    try {

      const result =
        await sendSmsNotification({

          companyId,

          phone,

          message,

          type,

          referenceId

        });


      results.sms = {

        ...result,

        channel:
          "sms",

        companyId,

        type,

        module,

        referenceId

      };


    } catch (error) {

      console.error(
        "Error creando solicitud SMS:",
        error
      );


      results.sms = {

        success:
          false,

        status:
          "error",

        channel:
          "sms",

        companyId,

        type,

        module,

        referenceId,

        error:
          error?.message ||
          "Error desconocido."

      };

    }

  }


  /* ====================================================
     EMAIL
  ==================================================== */

  if (
    allowedChannels.includes(
      "email"
    )
  ) {

    /*
      Provider de email pendiente.

      La arquitectura queda preparada para
      incorporarlo posteriormente.
    */

    results.email = {

      success:
        false,

      status:
        "not_configured",

      channel:
        "email",

      companyId,

      type,

      module,

      referenceId,

      error:
        "El canal Email todavía no tiene un provider configurado."

    };

  }


  /* ====================================================
     CANALES NO SOPORTADOS
  ==================================================== */

  requestedChannels

    .filter(
      channel =>
        ![
          "internal",
          "whatsapp",
          "sms",
          "email"
        ].includes(
          channel
        )
    )

    .forEach(
      channel => {

        results[channel] = {

          success:
            false,

          status:
            "unsupported",

          channel,

          companyId,

          type,

          module,

          referenceId,

          error:
            `Canal de comunicación no soportado: ${channel}`

        };

      }
    );


  /* ====================================================
     RESULTADO GENERAL
  ==================================================== */

  const channelResults =
    Object.values(
      results
    );


  const successful =
    channelResults.some(
      result =>
        result?.success === true
    );


  const failed =
    channelResults.some(
      result =>
        result?.success === false
    );


  const processed =
    channelResults.length > 0;


  return {

    success:
      successful,

    partial:
      successful &&
      failed,

    processed,

    blocked:
      blockedChannels,

    allowed:
      allowedChannels,

    results

  };

}