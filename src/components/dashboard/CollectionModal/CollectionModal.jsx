import {
  useEffect,
  useState
} from "react";


import {
  useAuth
} from "../../../context/AuthContext";


import {
  getUserProfile
} from "../../../pages/modules/services/company/companyService";


import {
  createCollectionTracking,
  getCollectionTracking
} from "../../../pages/modules/services/collection/collectionTrackingService";


import "./CollectionModal.css";



function CollectionModal({

  collection,

  onClose

}) {


  const { user } = useAuth();


  const [note,setNote] = useState("");

  const [status,setStatus] = useState("Contactado");

  const [history,setHistory] = useState([]);

  const [saving,setSaving] = useState(false);

  const [companyId,setCompanyId] = useState(null);





  const statuses = [

    "Pendiente",

    "Contactado",

    "Promesa de pago",

    "Pagado",

    "No localizado"

  ];







  useEffect(()=>{


    async function loadHistory(){


      try{


        const profile = await getUserProfile(

          user.uid

        );


        if(!profile?.companyId) return;



        setCompanyId(profile.companyId);



        const data = await getCollectionTracking(

          profile.companyId,

          collection.id

        );


        setHistory(data);



      }catch(error){


        console.error(

          "Error cargando historial",

          error

        );


      }


    }



    if(collection){

      loadHistory();

    }


  },[collection,user]);








  if(!collection) return null;







  async function handleSave(){


    try{


      setSaving(true);



      await createCollectionTracking(


        companyId,


        {


          creditId:collection.id,

          clientId:collection.clientId,

          client:collection.client,

          status,

          note


        }


      );



      setNote("");



      const updated = await getCollectionTracking(

        companyId,

        collection.id

      );


      setHistory(updated);



    }catch(error){


      console.error(

        "Error guardando seguimiento",

        error

      );


    }finally{


      setSaving(false);


    }


  }







  return (


    <div className="collection-modal-overlay">


      <div className="collection-modal">





        <div className="collection-modal__header">


          <h2>

            Gestión de cobranza

          </h2>



          <button

            onClick={onClose}

          >

            ×

          </button>


        </div>







        <div className="collection-modal__body">





          <div className="detail-item">

            <span>
              Cliente
            </span>


            <strong>
              {collection.client}
            </strong>


          </div>





          <div className="detail-item">

            <span>
              Saldo pendiente
            </span>


            <strong>

              $

              {Number(

                collection.balance || 0

              ).toLocaleString()}


            </strong>


          </div>








          <div className="collection-status">


            <label>
              Estado de gestión
            </label>



            <select

              value={status}

              onChange={(e)=>

                setStatus(e.target.value)

              }

            >


              {

                statuses.map(item=>(

                  <option

                    key={item}

                    value={item}

                  >

                    {item}

                  </option>

                ))

              }


            </select>


          </div>








          <div className="collection-note">


            <label>
              Nota de seguimiento
            </label>


            <textarea

              value={note}

              onChange={(e)=>

                setNote(e.target.value)

              }


              placeholder="Escribe la gestión realizada..."

            />


          </div>








          <div className="collection-history">


            <h3>

              Historial

            </h3>



            {

              history.length === 0 ? (


                <p>

                  Sin gestiones registradas.

                </p>


              ) : (


                history.map(item=>(


                  <div

                    className={`history-item ${
                      
                      item.status

                      ?.toLowerCase()

                      .replaceAll(" ","-")

                    }`}


                    key={item.id}

                  >



                    <strong>

                      {item.status}

                    </strong>



                    <p>

                      {item.note}

                    </p>





                    <small>

                      {

                        item.createdAt?.toDate

                        ?

                        item.createdAt.toDate()

                        .toLocaleString(

                          "es-CO",

                          {

                            dateStyle:"short",

                            timeStyle:"short"

                          }

                        )

                        :

                        ""

                      }

                    </small>




                  </div>


                ))


              )

            }



          </div>






        </div>







        <div className="collection-modal__footer">


          <button

            className="secondary"

            onClick={onClose}

          >

            Cerrar

          </button>





          <button

            className="primary"

            onClick={handleSave}

            disabled={saving}

          >

            {

              saving

              ? "Guardando..."

              : "Guardar gestión"

            }


          </button>



        </div>




      </div>


    </div>

  );

}



export default CollectionModal;