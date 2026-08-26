import {
  createInternalNotification
} from "../channels/internal/internalNotificationService";

import {
  sendCommunication
} from "../../communications/communicationGateway";


/* ======================================================
   CANALES SOPORTADOS
====================================================== */

const SUPPORTED_CHANNELS = [
  "internal",
  "whatsapp",
  "sms"
];


/* ======================================================
   NORMALIZAR CANALES
====================================================== */

function normalizeChannels(
  channels
) {

  if (
    !Array.isArray(channels) ||
    channels.length === 0
  ) {

    return [
      "internal"
    ];

  }


  return [
    ...new Set(

      channels

        .map(
          channel =>
            String(
              channel
            )
              .trim()
              .toLowerCase()
        )

        .filter(
          Boolean
        )

    )
  ];

}


/* ======================================================
   ENVIAR NOTIFICACIÓN
====================================================== */

export async function sendNotification({

  companyId,

  title,

  message,

  type = "info",

  module = "general",

  referenceId = null,

  channels = [
    "internal"
  ],

  phone = null

}) {

  /* ====================================================
     VALIDACIONES
  ==================================================== */

  if (
    !companyId ||
    typeof companyId !== "string"
  ) {

    throw new Error(
      "companyId es obligatorio."
    );

  }


  if (
    !title ||
    typeof title !== "string"
  ) {

    throw new Error(
      "title es obligatorio."
    );

  }


  if (
    !message ||
    typeof message !== "string"
  ) {

    throw new Error(
      "message es obligatorio."
    );

  }


  /* ====================================================
     NORMALIZAR CANALES
  ==================================================== */

  let selectedChannels =
    normalizeChannels(
      channels
    );


  /*
   * Internal siempre debe estar disponible.
   */

  if (
    !selectedChannels.includes(
      "internal"
    )
  ) {

    selectedChannels = [
      "internal",
      ...selectedChannels
    ];

  }


  const results = {};


  /* ====================================================
     CANAL INTERNO
  ==================================================== */

  if (
    selectedChannels.includes(
      "internal"
    )
  ) {

    try {

      const notificationId =
        await createInternalNotification({

          companyId,

          title,

          message,

          type,

          module,

          referenceId

        });


      results.internal = {

        success:
          Boolean(
            notificationId
          ),

        notificationId:
          notificationId || null,

        status:
          notificationId
            ? "sent"
            : "failed"

      };


    } catch (error) {

      console.error(
        "Error enviando notificación interna:",
        error
      );


      results.internal = {

        success:
          false,

        status:
          "error",

        error:
          error?.message ||
          "Error desconocido."

      };

    }

  }


  /* ====================================================
     CANALES EXTERNOS
  ==================================================== */

  const externalChannels =
    selectedChannels.filter(

      channel =>

        channel === "whatsapp" ||

        channel === "sms"

    );


  if (
    externalChannels.length > 0
  ) {

    try {

      const communicationResult =
        await sendCommunication({

          channels:
            externalChannels,

          companyId,

          phone,

          message,

          type,

          module,

          referenceId

        });


      if (
        communicationResult?.results
      ) {

        Object.assign(

          results,

          communicationResult.results

        );

      } else {

        externalChannels.forEach(
          channel => {

            results[channel] = {

              success:
                communicationResult?.success === true,

              status:
                communicationResult?.status ||
                "processed"

            };

          }
        );

      }


    } catch (error) {

      console.error(
        "Error enviando comunicación:",
        error
      );


      externalChannels.forEach(
        channel => {

          results[channel] = {

            success:
              false,

            status:
              "error",

            error:
              error?.message ||
              "Error desconocido."

          };

        }
      );

    }

  }


  /* ====================================================
     CANALES NO SOPORTADOS
  ==================================================== */

  selectedChannels

    .filter(

      channel =>
        !SUPPORTED_CHANNELS.includes(
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

          error:
            `Canal "${channel}" no está disponible.`

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


  return {

    success:
      successful,

    partial:
      successful &&
      failed,

    failed,

    results

  };

}