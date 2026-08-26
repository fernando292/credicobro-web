export const notificationTemplates = {

  /* ======================================================
     CRÉDITO CREADO
  ====================================================== */

  creditCreated(data = {}) {

    return {

      title:
        "Nuevo crédito",

      message:
        `${data.client || "Cliente"} recibió un crédito por $${Number(
          data.amount || 0
        ).toLocaleString("es-CO")}`,

      type:
        "success",

      module:
        "credits"

    };

  },


  /* ======================================================
     PAGO REGISTRADO
  ====================================================== */

  paymentCreated(data = {}) {

    return {

      title:
        "Pago registrado",

      message:
        `${data.client || "Cliente"} realizó un pago por $${Number(
          data.amount || 0
        ).toLocaleString("es-CO")}`,

      type:
        "success",

      module:
        "payments"

    };

  },


  /* ======================================================
     CRÉDITO VENCIDO
  ====================================================== */

  overdueCredit(data = {}) {

    return {

      title:
        "Crédito vencido",

      message:
        `${data.client || "Cliente"} presenta mora.`,

      type:
        "warning",

      module:
        "collections"

    };

  },


  /* ======================================================
     SEGUIMIENTO CREADO
  ====================================================== */

  collectionVisit(data = {}) {

    return {

      title:
        "Seguimiento creado",

      message:
        `${data.client || "Cliente"} tiene gestión para ${
          data.date || "una fecha programada"
        }.`,

      type:
        "info",

      module:
        "collections"

    };

  }

};