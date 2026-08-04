import {
  useEffect,
  useState
} from "react";

import {
  X
} from "lucide-react";

import CreditSummary from "./tabs/CreditSummary";
import CreditPaymentsTab from "./tabs/CreditPaymentsTab";
import PaymentSchedule from "./tabs/PaymentSchedule";

import "./CreditDetails.css";


function CreditDetails({

  credit,

  onClose,

  onCreditUpdated

}) {


  const [activeTab,setActiveTab] = useState(
    "summary"
  );


  const [currentCredit,setCurrentCredit] = useState(
    credit
  );



  useEffect(()=>{

    setCurrentCredit(
      credit
    );

  },[credit]);




  if(!currentCredit){

    return null;

  }




  function handleCreditUpdated(updatedCredit){


    const newCredit = {

      ...currentCredit,

      ...updatedCredit

    };



    console.log(
      "CREDITO ACTUALIZADO:",
      newCredit
    );



    setCurrentCredit(
      newCredit
    );



    if(onCreditUpdated){

      onCreditUpdated(
        newCredit
      );

    }


  }





  return (

    <div className="credit-details-overlay">


      <section className="credit-details">



        <button

          className="credit-details__close"

          onClick={onClose}

        >

          <X size={20}/>

        </button>




        <h2>
          Detalle del crédito
        </h2>





        <div className="credit-details__tabs">


          <button

            className={
              activeTab==="summary"
              ? "active"
              : ""
            }

            onClick={()=>setActiveTab("summary")}

          >

            Resumen

          </button>





          <button

            className={
              activeTab==="payments"
              ? "active"
              : ""
            }

            onClick={()=>setActiveTab("payments")}

          >

            Pagos

          </button>






          <button

            className={
              activeTab==="calendar"
              ? "active"
              : ""
            }

            onClick={()=>setActiveTab("calendar")}

          >

            Calendario

          </button>



        </div>







        <div className="credit-details__body">



          {
            activeTab==="summary" && (

              <CreditSummary

                credit={currentCredit}

              />

            )
          }






          {
            activeTab==="payments" && (

              <CreditPaymentsTab

                credit={currentCredit}

                onCreditUpdated={handleCreditUpdated}

              />

            )
          }






          {
            activeTab==="calendar" && (

              <PaymentSchedule

                credit={currentCredit}

              />

            )
          }





        </div>




      </section>


    </div>


  );


}


export default CreditDetails;