/* =======================================================
   SERVICIO DE NOTIFICACIONES SMS

   IMPORTANTE:

   Este archivo NO realiza envíos todavía.

   Queda preparado para conectar posteriormente
   un proveedor de SMS.

   La lógica de créditos, pagos y cobranza NO debe
   conocer directamente este servicio.
======================================================= */


/* =======================================================
   ESTADO DEL CANAL
======================================================= */

export function isSmsConfigured() {

  return false;

}


/* =======================================================
   ENVIAR NOTIFICACIÓN POR SMS
======================================================= */

export async function sendSmsNotification({

  companyId,

  phone,

  message,

  type = "info",

  referenceId = null

}) {

  if (!companyId) {

    throw new Error(
      "companyId es obligatorio."
    );

  }


  if (!phone) {

    throw new Error(
      "El número de teléfono es obligatorio."
    );

  }


  if (!message) {

    throw new Error(
      "El mensaje SMS es obligatorio."
    );

  }


  /*
    Todavía no existe una conexión externa.

    No hacemos peticiones HTTP,
    no utilizamos proveedores externos
    y no enviamos ningún SMS real.
  */

  console.log(
    "SMS NOTIFICATION PREPARADA",
    {

      companyId,

      phone,

      message,

      type,

      referenceId

    }
  );


  return {

    success: false,

    status:
      "not_configured",

    channel:
      "sms",

    companyId,

    phone,

    type,

    referenceId,

    message:
      "SMS todavía no está configurado."

  };

}