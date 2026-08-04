import {
  collection,
  getDocs
} from "firebase/firestore";

import { db } from "../../../../config/firebase";



export async function getAllCompanyPayments(companyId){


  const creditsRef = collection(

    db,

    "companies",

    companyId,

    "credits"

  );



  const creditsSnapshot = await getDocs(

    creditsRef

  );



  const payments = [];





  for(const creditDoc of creditsSnapshot.docs){



    const credit = creditDoc.data();




    const paymentsRef = collection(

      db,

      "companies",

      companyId,

      "credits",

      creditDoc.id,

      "payments"

    );




    const paymentsSnapshot = await getDocs(

      paymentsRef

    );





    paymentsSnapshot.forEach(paymentDoc=>{



      const payment = paymentDoc.data();




      payments.push({



        id:paymentDoc.id,



        creditId:creditDoc.id,



        client:

          credit.client || "Sin cliente",



        clientId:

          credit.clientId || "",



        creditAmount:

          credit.amount || 0,



        creditTotal:

          credit.total || 0,



        frequency:

          credit.frequency || "",



        ...payment



      });



    });



  }






  return payments.sort(

    (a,b)=>

      new Date(b.date) -

      new Date(a.date)

  );


}