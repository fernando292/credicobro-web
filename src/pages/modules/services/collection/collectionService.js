import { 
  collection,
  getDocs,
  query,
  where
} from "firebase/firestore";


import { db } from "../../../../config/firebase";





// Obtener todos los créditos de la empresa

async function getCompanyCredits(companyId) {


  const creditsRef = collection(

    db,

    "companies",

    companyId,

    "credits"

  );


  const snapshot = await getDocs(

    creditsRef

  );


  return snapshot.docs.map(doc => ({


    id:doc.id,

    ...doc.data()


  }));

}





// Obtener cobranza pendiente

export async function getPendingCollections(companyId) {


  const credits = await getCompanyCredits(

    companyId

  );



  return credits

    .filter(credit =>

      credit.status === "Activo"

    )

    .map(credit => ({


      id:credit.id,


      clientId:credit.clientId,


      client:credit.client,


      amount:credit.installmentValue || 0,


      balance:credit.balance || 0,


      installments:credit.installments || 0,


      paidInstallments:

        credit.paidInstallments || 0,


      pendingInstallments:

        credit.pendingInstallments || 0,


      nextPaymentDate:

        credit.nextPaymentDate || credit.firstPayment,


      status:

        credit.status


    }));

}





// Obtener cobros vencidos

export async function getOverdueCollections(companyId) {


  const collections = await getPendingCollections(

    companyId

  );



  const today = new Date();



  return collections.filter(item => {


    if(!item.firstPayment) return false;



    const date = new Date(

      item.firstPayment

    );



    return (

      date < today &&

      item.balance > 0

    );


  });


}





// Obtener cobros del día

export async function getTodayCollections(companyId) {


  const collections = await getPendingCollections(

    companyId

  );



  const today = new Date();



  return collections.filter(item => {


    if(!item.firstPayment) return false;



    const date = new Date(

      item.firstPayment

    );



    return (

      date.getDate() === today.getDate() &&

      date.getMonth() === today.getMonth() &&

      date.getFullYear() === today.getFullYear()

    );


  });


}