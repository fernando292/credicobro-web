import {
  collection,
  getDocs
} from "firebase/firestore";

import { db } from "../../../../config/firebase";





// Obtener créditos de un cliente

export async function getClientCredits(

  companyId,

  clientId

){


  const creditsRef = collection(

    db,

    "companies",

    String(companyId),

    "credits"

  );



  const snapshot = await getDocs(

    creditsRef

  );





  return snapshot.docs

    .map(item => ({


      id:item.id,

      ...item.data()


    }))


    .filter(credit =>


      String(credit.clientId) === String(clientId)


    );



}











// Obtener pagos realizados por un cliente

export async function getClientPayments(

  companyId,

  clientId

){



  const credits = await getClientCredits(

    String(companyId),

    String(clientId)

  );



  const payments = [];





  for(const credit of credits){



    const paymentsRef = collection(

      db,

      "companies",

      String(companyId),

      "credits",

      String(credit.id),

      "payments"

    );





    const snapshot = await getDocs(

      paymentsRef

    );





    snapshot.forEach(paymentDoc => {



      payments.push({


        id:paymentDoc.id,


        creditId:String(credit.id),


        ...paymentDoc.data()


      });



    });



  }






  return payments;



}











// Resumen financiero del cliente

export async function getClientFinancialSummary(

  companyId,

  clientId

){



  const credits = await getClientCredits(

    String(companyId),

    String(clientId)

  );




  const payments = await getClientPayments(

    String(companyId),

    String(clientId)

  );







  const totalCredits = credits.length;






  const activeCredits = credits.filter(


    credit =>


      credit.status === "Activo"


  ).length;







  // Capital prestado

  const totalBorrowed = credits.reduce(


    (total,credit)=>


      total +

      Number(

        credit.amount || 0

      ),



    0


  );








  // Saldo pendiente real incluyendo intereses

  const pendingBalance = credits.reduce(


    (total,credit)=>


      total +


      Math.max(


        Number(

          credit.total || 0

        )

        -

        Number(

          credit.paidAmount || 0

        ),


        0


      ),



    0


  );









  // Total pagado desde historial

  let totalPaid = payments.reduce(


    (total,payment)=>


      total +

      Number(

        payment.value || 0

      ),



    0


  );









  // Respaldo si el crédito tiene actualización

  // pero todavía no tiene movimientos de pago

  if(


    totalPaid === 0 &&

    credits.length > 0


  ){



    totalPaid = credits.reduce(


      (total,credit)=>



        total +


        Math.max(


          Number(

            credit.total || 0

          )

          -

          Number(

            credit.balance || 0

          ),


          0

        ),



      0


    );



  }









  return {


    totalCredits,


    activeCredits,


    totalBorrowed,


    pendingBalance,


    totalPaid,


    paymentsCount:payments.length


  };



}