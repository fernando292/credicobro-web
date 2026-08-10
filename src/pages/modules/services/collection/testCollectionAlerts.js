import { getCredits } from "../credit/creditService";
import { getAllCompanyPayments } from "../payment/paymentGlobalService";

import {
  generateCollectionAlerts,
  getAlertSummary
} from "./collectionAlertService";


export async function testCollectionAlerts(companyId) {

  try {

    console.log(
      "===================================="
    );

    console.log(
      "CENTRO DE ALERTAS - PRUEBA"
    );

    console.log(
      "===================================="
    );


    const [
      credits,
      payments
    ] = await Promise.all([

      getCredits(companyId),

      getAllCompanyPayments(companyId)

    ]);


    console.log(
      "Créditos encontrados:",
      credits
    );


    console.log(
      "Pagos encontrados:",
      payments
    );


    const alerts =
      generateCollectionAlerts({

        credits,

        payments

      });


    const summary =
      getAlertSummary(
        alerts
      );


    console.log(
      "===================================="
    );

    console.log(
      "ALERTAS GENERADAS:"
    );

    console.table(
      alerts
    );


    console.log(
      "RESUMEN:"
    );

    console.log(
      summary
    );


    console.log(
      "===================================="
    );


    return {

      credits,

      payments,

      alerts,

      summary

    };

  } catch (error) {

    console.error(
      "Error probando Centro de Alertas:",
      error
    );

    throw error;

  }

}