import "./CollectionFollowUp.css";


function CollectionFollowUp({

  followUps = []

}) {


  return (


    <div className="follow-up-card">


      <div className="follow-up-card__header">


        <h2>

          Próximos seguimientos

        </h2>


        <p>

          Clientes que requieren gestión

        </p>


      </div>





      {

        followUps.length === 0 ? (


          <div className="follow-up-empty">


            No hay seguimientos pendientes.


          </div>


        ) : (



          <div className="follow-up-list">


            {

              followUps.map((item)=>(


                <div

                  className="follow-up-item"

                  key={item.id}

                >



                  <div>


                    <strong>

                      {item.client}

                    </strong>


                    <span>

                      {item.status}

                    </span>


                  </div>




                  <div className="follow-up-date">


                    {item.date}


                  </div>



                </div>


              ))


            }


          </div>


        )


      }



    </div>


  );


}


export default CollectionFollowUp;