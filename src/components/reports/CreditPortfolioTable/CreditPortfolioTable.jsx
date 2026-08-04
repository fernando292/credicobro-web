import "./CreditPortfolioTable.css";


function CreditPortfolioTable({

  credits

}) {


  return (


    <div className="credit-portfolio">



      <div className="credit-portfolio__header">


        <h3>

          Cartera de créditos

        </h3>


        <span>

          {credits.length} créditos

        </span>


      </div>






      {
        credits.length === 0 ? (


          <div className="credit-portfolio__empty">

            No hay créditos registrados.

          </div>



        ) : (


          <div className="credit-portfolio__table">


            <table>


              <thead>


                <tr>


                  <th>

                    Cliente

                  </th>



                  <th>

                    Capital

                  </th>



                  <th>

                    Total crédito

                  </th>



                  <th>

                    Pagado

                  </th>



                  <th>

                    Pendiente

                  </th>



                  <th>

                    Estado

                  </th>


                </tr>


              </thead>





              <tbody>


                {

                  credits.map((credit)=>(


                    <tr key={credit.id}>


                      <td>

                        {credit.client || "Sin cliente"}

                      </td>




                      <td>

                        $

                        {Number(

                          credit.amount || 0

                        ).toLocaleString()}


                      </td>





                      <td>

                        $

                        {Number(

                          credit.total || 0

                        ).toLocaleString()}


                      </td>





                      <td>


                        $

                        {

                          (

                            Number(credit.total || 0)

                            -

                            Number(credit.balance || 0)

                          )

                          .toLocaleString()

                        }


                      </td>






                      <td>


                        $

                        {Number(

                          credit.balance || 0

                        ).toLocaleString()}


                      </td>






                      <td>


                        <span

                          className={

                            credit.status === "Pagado"

                            ?

                            "status paid"

                            :

                            "status active"

                          }

                        >


                          {credit.status}



                        </span>



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


  );


}


export default CreditPortfolioTable;