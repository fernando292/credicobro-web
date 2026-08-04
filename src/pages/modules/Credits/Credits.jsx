import {
  useState
} from "react";


import useCredits from "../../../hooks/useCredits";


import CreditTable from "../../../components/credits/CreditTable/CreditTable";

import CreditForm from "../../../components/credits/CreditForm/CreditForm";

import CreditDetails from "../../../components/credits/CreditDetails/CreditDetails";


import {
  formatCurrency
} from "../../../utils/currency";


import "./Credits.css";





function Credits(){



  const {

    clients,

    credits,

    saveCredit,

    deleteCredit,

    updateCreditState

  } = useCredits();





  const [showForm,setShowForm] = useState(false);


  const [selectedCredit,setSelectedCredit] = useState(null);


  const [editingCredit,setEditingCredit] = useState(null);








  async function handleSave(credit){


    await saveCredit(

      credit,

      editingCredit

    );


    setEditingCredit(null);


    setShowForm(false);


  }








  function handleView(credit){


    setSelectedCredit(

      credit

    );


  }








  function handleEdit(credit){


    setEditingCredit(

      credit

    );


    setShowForm(true);


  }








  async function handleDelete(id){


    const confirmDelete = window.confirm(

      "¿Deseas eliminar este crédito?"

    );


    if(!confirmDelete) return;



    await deleteCredit(

      id

    );



    if(

      selectedCredit?.id === id

    ){


      setSelectedCredit(null);


    }


  }








  function handleNewCredit(){


    setEditingCredit(null);


    setShowForm(prev => !prev);


  }










  function handleCreditUpdated(updatedCredit){



    console.log(

      "CREDITO FINAL EN MODULO:",

      updatedCredit

    );




    const refreshedCredit = {


      ...selectedCredit,


      ...updatedCredit


    };





    setSelectedCredit(

      refreshedCredit

    );





    updateCreditState(

      refreshedCredit

    );



  }










  const totalCredits = credits.length;





  const activeCredits = credits.filter(

    credit =>

      credit.status === "Activo"

  ).length;





  const paidCredits = credits.filter(

    credit =>

      credit.status === "Pagado"

  ).length;







  const pendingBalance = credits.reduce(

    (total,credit)=>

      total +

      Number(

        credit.balance || 0

      ),


    0

  );









  return (



    <section className="credits-page">





      <div className="credits-header">



        <div>


          <h1>

            Créditos

          </h1>



          <p>

            Gestiona préstamos, pagos y seguimiento financiero.

          </p>


        </div>





        <button

          onClick={handleNewCredit}

        >


          {

            showForm

              ? "Cerrar"

              : "Nuevo crédito"

          }


        </button>



      </div>









      <div className="credits-stats">





        <div className="credit-card">


          <span>

            Total créditos

          </span>


          <strong>

            {totalCredits}

          </strong>


        </div>








        <div className="credit-card">


          <span>

            Créditos activos

          </span>


          <strong>

            {activeCredits}

          </strong>


        </div>








        <div className="credit-card">


          <span>

            Créditos pagados

          </span>


          <strong>

            {paidCredits}

          </strong>


        </div>








        <div className="credit-card">


          <span>

            Saldo pendiente

          </span>


          <strong>

            {formatCurrency(

              pendingBalance

            )}

          </strong>


        </div>





      </div>









      {

        showForm && (


          <CreditForm

            onSave={handleSave}

            creditToEdit={editingCredit}

            clients={clients}

          />


        )

      }









      <div className="credits-main">



        <CreditTable

          credits={credits}

          onView={handleView}

          onEdit={handleEdit}

          onDelete={handleDelete}

        />



      </div>









      {

        selectedCredit && (



          <CreditDetails



            credit={selectedCredit}



            onClose={()=>


              setSelectedCredit(null)


            }



            onCreditUpdated={handleCreditUpdated}



          />


        )


      }






    </section>



  );


}





export default Credits;