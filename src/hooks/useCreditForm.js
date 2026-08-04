import {
  useEffect,
  useState
} from "react";


import {
  calculateCreditSummary
} from "../pages/modules/services/credit/creditCalculations";



function useCreditForm(creditToEdit){


  const [form,setForm] = useState({


    clientId:"",

    amount:"",

    interest:"",

    installments:"",

    frequency:"Semanal",

    startDate:"",

    firstPayment:"",

    notes:""


  });






  useEffect(()=>{


    if(creditToEdit){


      setForm({


        clientId:creditToEdit.clientId || "",


        amount:creditToEdit.amount || "",


        interest:creditToEdit.interest || "",


        installments:creditToEdit.installments || "",


        frequency:creditToEdit.frequency || "Semanal",


        startDate:creditToEdit.startDate || "",


        firstPayment:creditToEdit.firstPayment || "",


        notes:creditToEdit.notes || ""


      });


    }



  },[creditToEdit]);








  function handleChange(e){


    setForm({


      ...form,


      [e.target.name]:e.target.value


    });


  }








  const summary = calculateCreditSummary(

    form

  );






  return {


    form,


    setForm,


    handleChange,


    summary


  };


}



export default useCreditForm;