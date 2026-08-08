import { getClients } from "../clients/clientService";
import { getCredits } from "../credit/creditService";
import { getAllCompanyPayments } from "../payment/paymentGlobalService";



function normalize(value) {

  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

}



function createClientResult(client) {

  return {

    id: `client-${client.id}`,

    type: "client",

    title: client.name || "Cliente sin nombre",

    subtitle: "Cliente",

    description:
      client.phone ||
      client.document ||
      client.email ||
      "",

    data: client

  };

}



function createCreditResult(credit) {

  return {

    id: `credit-${credit.id}`,

    type: "credit",

    title:
      `Crédito de ${credit.client || "Cliente"}`,

    subtitle: "Crédito",

    description:
      `$${Number(
        credit.balance || 0
      ).toLocaleString()} · ${
        credit.status || "Sin estado"
      }`,

    data: credit

  };

}



function createPaymentResult(payment) {

  const value = Number(

    payment.value ||

    payment.amount ||

    payment.paymentAmount ||

    0

  );



  return {

    id: `payment-${payment.id}`,

    type: "payment",

    title:
      `Pago de ${payment.client || "Cliente"}`,

    subtitle: "Pago",

    description:
      `$${value.toLocaleString()}`,

    data: payment

  };

}



export async function searchCompanyData(

  companyId,

  searchTerm

) {

  if (!companyId) {

    return [];

  }



  const term = normalize(searchTerm);



  if (!term) {

    return [];

  }



  const [

    clients,

    credits,

    payments

  ] = await Promise.all([

    getClients(companyId),

    getCredits(companyId),

    getAllCompanyPayments(companyId)

  ]);



  const clientResults = clients

    .filter(client => {

      const values = [

        client.name,

        client.document,

        client.phone,

        client.email

      ];



      return values.some(value =>

        normalize(value).includes(term)

      );

    })

    .map(createClientResult);



  const creditResults = credits

    .filter(credit => {

      const values = [

        credit.client,

        credit.clientId,

        credit.id,

        credit.status,

        credit.frequency

      ];



      return values.some(value =>

        normalize(value).includes(term)

      );

    })

    .map(createCreditResult);



  const paymentResults = payments

    .filter(payment => {

      const values = [

        payment.client,

        payment.clientId,

        payment.id,

        payment.creditId,

        payment.date

      ];



      return values.some(value =>

        normalize(value).includes(term)

      );

    })

    .map(createPaymentResult);



  return [

    ...clientResults,

    ...creditResults,

    ...paymentResults

  ].slice(0, 15);

}