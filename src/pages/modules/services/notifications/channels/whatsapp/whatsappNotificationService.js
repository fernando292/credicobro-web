import {
  sendWhatsAppMessage,
  isWhatsAppProviderReady
} from "../../../communications/providers/whatsapp/whatsappProvider";


/* ======================================================
   SERVICIO DE NOTIFICACIONES WHATSAPP

   Responsabilidad:

   - Recibir la solicitud de notificación.
   - Validar los datos necesarios.
   - Delegar el envío al proveedor de WhatsApp.

   Este servicio NO conoce la lógica de créditos,
   pagos ni cobranza.

   Tampoco depende directamente de un proveedor externo.

   Flujo:

   notificationDispatcher
          ↓
   communicationGateway
          ↓
   whatsappNotificationService
          ↓
   whatsappProvider
====================================================== */


/* ======================================================
   ESTADO DEL CANAL
====================================================== */

export function isWhatsAppConfigured() {

  return isWhatsAppProviderReady();

}


/* ======================================================
   ENVIAR NOTIFICACIÓN POR WHATSAPP
====================================================== */

export async function sendWhatsAppNotification({

  companyId,

  phone,

  message,

  type = "info",

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


  if (!phone) {

    throw new Error(
      "El número de WhatsApp es obligatorio."
    );

  }


  if (!message) {

    throw new Error(
      "El mensaje de WhatsApp es obligatorio."
    );

  }


  /* ====================================================
     ENVIAR AL PROVEEDOR
  ==================================================== */

  try {

    const result =
      await sendWhatsAppMessage({

        phone,

        message

      });


    return {

      ...result,

      channel:
        "whatsapp",

      companyId,

      type,

      referenceId

    };


  } catch (error) {

    console.error(
      "Error en servicio de WhatsApp:",
      error
    );


    return {

      success:
        false,

      status:
        "error",

      channel:
        "whatsapp",

      companyId,

      type,

      referenceId,

      error:
        error?.message ||
        "Error desconocido."

    };

  }

}