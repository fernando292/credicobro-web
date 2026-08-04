import "./PaymentTable.css";


function PaymentTable({

  payments

}) {



  return (


    <div className="payment-table">


      <div className="payment-table__header">


        <h3>
          Historial de pagos
        </h3>


      </div>





      {

        payments.length === 0 ? (


          <div className="payment-empty">

            No hay pagos registrados.

          </div>


        ) : (


          <div className="payment-table__container">



            <table>



              <thead>

                <tr>

                  <th>
                    Fecha
                  </th>


                  <th>
                    Cliente
                  </th>


                  <th>
                    Crédito
                  </th>


                  <th>
                    Cuota
                  </th>


                  <th>
                    Método
                  </th>


                  <th>
                    Valor
                  </th>


                </tr>


              </thead>





              <tbody>


                {

                  payments.map(payment=>(



                    <tr

                      key={payment.id}

                    >



                      <td>

                        {payment.date || "-"}

                      </td>





                      <td>

                        {payment.client || "Sin cliente"}

                      </td>





                      <td>

                        $

                        {Number(

                          payment.creditAmount || 0

                        ).toLocaleString()}


                      </td>





                      <td>


                        {

                          payment.installmentNumber

                            ? `Cuota ${payment.installmentNumber}`

                            : "-"

                        }


                      </td>





                      <td>


                        <span className="payment-method">


                          {payment.method}


                        </span>


                      </td>





                      <td className="payment-value">


                        $

                        {Number(

                          payment.value || 0

                        ).toLocaleString()}


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



export default PaymentTable;