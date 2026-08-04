import useCreditForm from "../../../hooks/useCreditForm";

import ClientSection from "./sections/ClientSection";
import FinancialSection from "./sections/FinancialSection";
import PaymentSection from "./sections/PaymentSection";
import NotesSection from "./sections/NotesSection";

import SummaryCard from "./SummaryCard";

import {
  buildCredit
} from "../../../pages/modules/services/credit/creditFactory";

import "./CreditForm.css";



function CreditForm({

  onSave,

  creditToEdit,

  clients

}) {


  const {

    form,

    handleChange,

    summary

  } = useCreditForm(creditToEdit);






  function handleSubmit(e){


    e.preventDefault();




    const selectedClient = clients.find(

      client =>

        client.id === form.clientId

    );





    const credit = buildCredit({

      form,

      summary,

      selectedClient,

      creditToEdit

    });





    onSave(credit);


  }







  return (


    <form

      className="credit-form"

      onSubmit={handleSubmit}

    >



      <div className="credit-form__left">



        <ClientSection

          form={form}

          handleChange={handleChange}

          clients={clients}

        />





        <FinancialSection

          form={form}

          handleChange={handleChange}

        />





        <PaymentSection

          form={form}

          handleChange={handleChange}

        />





        <NotesSection

          form={form}

          handleChange={handleChange}

        />






        <button

          type="submit"

          className="credit-form__button"

        >

          {

            creditToEdit

              ? "Actualizar crédito"

              : "Guardar crédito"

          }


        </button>



      </div>







      <div className="credit-form__right">


        <SummaryCard

          summary={summary}

        />


      </div>





    </form>


  );

}



export default CreditForm;