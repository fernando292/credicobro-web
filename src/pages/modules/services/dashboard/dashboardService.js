import { getClients } from "../clients/clientService";
import { getCredits } from "../credit/creditService";
import { getAllCompanyPayments } from "../payment/paymentGlobalService";


export async function getDashboardSummary(companyId) {

  try {


    const [
      clients,
      credits,
      payments
    ] = await Promise.all([

      getClients(companyId),

      getCredits(companyId),

      getAllCompanyPayments(companyId)

    ]);





    const today = new Date();

    const currentMonth = today.getMonth();

    const currentYear = today.getFullYear();





    const totalClients = clients.length;





    const activeClients = clients.filter(

      (client) => client.status === "Activo"

    ).length;





    const activeCredits = credits.filter(

      (credit) => credit.status === "Activo"

    ).length;





    const capital = credits.reduce(

      (total, credit) =>

        total + Number(credit.capital || 0),

      0

    );





    const recovered = credits.reduce(

      (total, credit) =>

        total + Number(credit.paidAmount || 0),

      0

    );





    const pending = credits.reduce(

      (total, credit) =>

        total + Number(credit.balance || 0),

      0

    );





    const totalPortfolio = credits.reduce(

      (total, credit) =>

        total + Number(credit.total || 0),

      0

    );





    const recoveryRate = capital > 0

      ? Number(((recovered / capital) * 100).toFixed(1))

      : 0;







    const overdueCreditsList = credits.filter(

      (credit) => {


        if (!credit.firstPayment) return false;


        const paymentDate = new Date(

          credit.firstPayment

        );


        return (

          paymentDate < today &&

          Number(credit.balance || 0) > 0

        );


      }

    );





    const overdueAmount = overdueCreditsList.reduce(

      (total, credit) =>

        total + Number(credit.balance || 0),

      0

    );







    const paymentsToday = payments.filter(

      (payment) => {


        const date = payment.createdAt?.toDate

          ? payment.createdAt.toDate()

          : new Date(

              payment.createdAt || payment.date

            );



        return (

          date.getDate() === today.getDate() &&

          date.getMonth() === today.getMonth() &&

          date.getFullYear() === today.getFullYear()

        );


      }

    );







    const paymentsThisMonth = payments.filter(

      (payment) => {


        const date = payment.createdAt?.toDate

          ? payment.createdAt.toDate()

          : new Date(

              payment.createdAt || payment.date

            );



        return (

          date.getMonth() === currentMonth &&

          date.getFullYear() === currentYear

        );


      }

    );







    const recoveredToday = paymentsToday.reduce(

      (total, payment) =>

        total +

        Number(

          payment.amount ||

          payment.value ||

          payment.paymentAmount ||

          0

        ),

      0

    );







    const recoveredThisMonth = paymentsThisMonth.reduce(

      (total, payment) =>

        total +

        Number(

          payment.amount ||

          payment.value ||

          payment.paymentAmount ||

          0

        ),

      0

    );









    const recentActivities = [


      ...clients.map((client)=>(

        {

          text:

            `Nuevo cliente registrado: ${
              client.name ||
              client.clientName ||
              "Cliente"
            }`,

          date: client.createdAt

        }

      )),


      ...credits.map((credit)=>(

        {

          text:

            `Nuevo crédito creado: $${Number(
              credit.capital || 0
            ).toLocaleString()}`,

          date: credit.createdAt

        }

      )),


      ...payments.map((payment)=>(

        {

          text:

            `Pago recibido: $${Number(
              payment.amount ||
              payment.value ||
              0
            ).toLocaleString()}`,

          date: payment.createdAt

        }

      ))


    ]

    .sort((a,b)=>{


      const dateA = a.date?.toDate

        ? a.date.toDate()

        : new Date(a.date || 0);



      const dateB = b.date?.toDate

        ? b.date.toDate()

        : new Date(b.date || 0);



      return dateB - dateA;


    })

    .slice(0,5);









    return {


      totalClients,

      activeClients,

      activeCredits,


      capital,

      recovered,

      pending,

      totalPortfolio,

      recoveryRate,



      overdueCredits: overdueCreditsList.length,

      overdueAmount,



      paymentsToday: paymentsToday.length,

      recoveredToday,

      recoveredThisMonth,



      recentActivities,



      clients,

      credits,

      payments


    };



  } catch(error) {


    console.error(

      "Error cargando Dashboard:",

      error

    );


    throw error;


  }


}