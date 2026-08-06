import {
  useState
} from "react";


import CollectionModal from "../CollectionModal/CollectionModal";


import "./CollectionTable.css";



function CollectionTable({

  collections = []

}) {


  const [selectedCollection,setSelectedCollection] = useState(null);





  return (


    <>


      <div className="collection-table">





        <div className="collection-table__header">


          <h3>

            Seguimiento de cobranza

          </h3>



          <span>

            {collections.length} pendientes

          </span>



        </div>








        {

          collections.length === 0 ? (


            <div className="collection-table__empty">

              No hay cobros pendientes.

            </div>


          ) : (



            <div className="table-container">



              <table>


                <thead>


                  <tr>


                    <th>
                      Cliente
                    </th>


                    <th>
                      Cuota
                    </th>


                    <th>
                      Pendientes
                    </th>


                    <th>
                      Saldo
                    </th>


                    <th>
                      Próximo pago
                    </th>


                    <th>
                      Estado
                    </th>


                    <th>
                      Acción
                    </th>


                  </tr>


                </thead>






                <tbody>



                  {

                    collections.map((item)=>(


                      <tr key={item.id}>


                        <td>

                          {item.client}

                        </td>





                        <td>

                          $

                          {Number(

                            item.amount || 0

                          ).toLocaleString()}


                        </td>





                        <td>

                          {item.pendingInstallments}

                        </td>






                        <td>

                          $

                          {Number(

                            item.balance || 0

                          ).toLocaleString()}


                        </td>






                        <td>

                          {item.nextPaymentDate || "-"}


                        </td>







                        <td>


                          <span className="status active">


                            {item.status}


                          </span>


                        </td>







                        <td>


                          <button

                            onClick={()=>


                              setSelectedCollection(item)


                            }


                          >

                            Gestionar

                          </button>



                        </td>






                      </tr>


                    ))


                  }



                </tbody>





              </table>


            </div>


          )


        }




      </div>






      <CollectionModal


        collection={selectedCollection}


        onClose={()=>


          setSelectedCollection(null)


        }


      />





    </>


  );

}


export default CollectionTable;