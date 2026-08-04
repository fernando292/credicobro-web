import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs
} from "firebase/firestore";

import { db } from "../../../../config/firebase";

import {
  createPayment,
  removePayment
} from "../payment/paymentService";





function calculateInstallments(
  paidAmount,
  installmentValue,
  totalInstallments
){


  if(
    !installmentValue ||
    installmentValue <= 0
  ){

    return 0;

  }



  const paid = Math.floor(

    paidAmount / installmentValue

  );



  return Math.min(

    paid,

    Number(totalInstallments || 0)

  );


}









export async function registerCreditPayment(

  companyId,

  creditId,

  payment

){



  const paymentsRef = collection(

    db,

    "companies",

    companyId,

    "credits",

    creditId,

    "payments"

  );





  const paymentsSnapshot = await getDocs(

    paymentsRef

  );






  const usedInstallments = paymentsSnapshot.docs.map(

    item =>

      Number(

        item.data().installmentNumber || 0

      )

  );






  const nextInstallment =

    Math.max(

      ...usedInstallments,

      0

    ) + 1;







  const paymentWithInstallment = {


    ...payment,


    installmentNumber:

      nextInstallment


  };







  const savedPayment = await createPayment(

    companyId,

    creditId,

    paymentWithInstallment

  );








  const creditRef = doc(

    db,

    "companies",

    companyId,

    "credits",

    creditId

  );







  const snapshot = await getDoc(

    creditRef

  );







  if(!snapshot.exists()){


    throw new Error(

      "Crédito no encontrado"

    );


  }








  const credit = snapshot.data();







  const paymentValue = Number(

    payment.value || 0

  );








  const paidAmount =


    Number(

      credit.paidAmount || 0

    )

    +

    paymentValue;








  const balance = Math.max(


    Number(

      credit.total || 0

    )

    -

    paidAmount,


    0


  );








  const paidInstallments = calculateInstallments(


    paidAmount,


    Number(

      credit.installmentValue || 0

    ),


    Number(

      credit.installments || 0

    )


  );








  const pendingInstallments = Math.max(


    Number(

      credit.installments || 0

    )

    -

    paidInstallments,


    0


  );









  const updatedCredit = {


    balance,


    paidAmount,


    paidInstallments,


    pendingInstallments,



    status:


      balance === 0


        ? "Pagado"


        : "Activo"



  };








  await updateDoc(

    creditRef,

    updatedCredit

  );








  return {


    payment:savedPayment,


    updatedCredit:{


      ...credit,


      ...updatedCredit,


      id:creditId


    }


  };



}












export async function deleteCreditPayment(

  companyId,

  creditId,

  paymentId

){





  await removePayment(

    companyId,

    creditId,

    paymentId

  );







  const creditRef = doc(

    db,

    "companies",

    companyId,

    "credits",

    creditId

  );








  const creditSnapshot = await getDoc(

    creditRef

  );








  if(!creditSnapshot.exists()){


    throw new Error(

      "Crédito no encontrado"

    );


  }







  const credit = creditSnapshot.data();








  const paymentsRef = collection(

    db,

    "companies",

    companyId,

    "credits",

    creditId,

    "payments"

  );







  const paymentsSnapshot = await getDocs(

    paymentsRef

  );








  const payments = paymentsSnapshot.docs.map(

    item => item.data()

  );








  const paidAmount = payments.reduce(


    (total,item)=>


      total +

      Number(

        item.value || 0

      ),


    0


  );









  const paidInstallments = calculateInstallments(


    paidAmount,


    Number(

      credit.installmentValue || 0

    ),


    Number(

      credit.installments || 0

    )


  );









  const pendingInstallments = Math.max(


    Number(

      credit.installments || 0

    )

    -

    paidInstallments,


    0


  );









  const balance = Math.max(


    Number(

      credit.total || 0

    )

    -

    paidAmount,


    0


  );









  const updatedCredit = {


    balance,


    paidAmount,


    paidInstallments,


    pendingInstallments,



    status:


      balance === 0


        ? "Pagado"

        : "Activo"



  };









  await updateDoc(


    creditRef,


    updatedCredit


  );









  return {


    updatedCredit:{


      ...credit,


      ...updatedCredit,


      id:creditId


    }


  };



}