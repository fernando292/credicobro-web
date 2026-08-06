export const notificationTemplates = {

  creditCreated(data) {

    return {

      title: "Nuevo crédito",

      message: `${data.client} recibió un crédito por $${Number(
        data.amount || 0
      ).toLocaleString()}`,

      type: "success",

      module: "credits"

    };

  },



  paymentCreated(data) {

    return {

      title: "Pago registrado",

      message: `${data.client} realizó un pago por $${Number(
        data.amount || 0
      ).toLocaleString()}`,

      type: "success",

      module: "payments"

    };

  },



  overdueCredit(data) {

    return {

      title: "Crédito vencido",

      message: `${data.client} presenta mora.`,

      type: "warning",

      module: "collections"

    };

  },



  collectionVisit(data) {

    return {

      title: "Seguimiento creado",

      message: `${data.client} tiene gestión para ${data.date}.`,

      type: "info",

      module: "collections"

    };

  }

};