import {
  useState
} from "react";


import "./CreateFollowUpModal.css";


function CreateFollowUpModal({

  clients = [],

  onClose,

  onSave

}) {


  const [client,setClient] = useState("");

  const [date,setDate] = useState("");

  const [status,setStatus] = useState(
    "Pendiente"
  );

  const [note,setNote] = useState("");






  function handleSubmit(e){


    e.preventDefault();



    const selectedClient = clients.find(

      item => String(item.id) === client

    );



    if(!selectedClient){

      console.error(
        "Cliente no seleccionado"
      );

      return;

    }





    onSave({


      clientId:String(selectedClient.id),


      client:selectedClient.name,


      date,


      status,


      note


    });



  }







  return (


    <div className="follow-modal-overlay">


      <div className="follow-modal">



        <div className="follow-modal__header">


          <h2>

            Nuevo seguimiento

          </h2>



          <button

            onClick={onClose}

          >

            ×

          </button>


        </div>







        <form

          onSubmit={handleSubmit}

        >




          <label>

            Cliente



            <select


              value={client}


              onChange={(e)=>

                setClient(e.target.value)

              }


              required


            >



              <option value="">

                Seleccionar cliente

              </option>




              {


                clients.map(item=>(



                  <option


                    key={item.id}


                    value={String(item.id)}


                  >


                    {item.name}


                  </option>



                ))


              }



            </select>



          </label>







          <label>

            Fecha próxima gestión



            <input


              type="date"


              value={date}


              onChange={(e)=>

                setDate(e.target.value)

              }


              required


            />


          </label>







          <label>

            Estado



            <select


              value={status}


              onChange={(e)=>

                setStatus(e.target.value)

              }


            >



              <option>

                Pendiente

              </option>


              <option>

                Contactado

              </option>


              <option>

                Promesa de pago

              </option>


              <option>

                Visita programada

              </option>



            </select>



          </label>







          <label>

            Nota



            <textarea


              value={note}


              onChange={(e)=>

                setNote(e.target.value)

              }


            />



          </label>







          <div className="follow-modal__actions">



            <button


              type="button"


              onClick={onClose}


            >

              Cancelar


            </button>





            <button


              type="submit"


            >

              Guardar


            </button>



          </div>





        </form>



      </div>



    </div>


  );


}


export default CreateFollowUpModal;