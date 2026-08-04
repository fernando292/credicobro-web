import "./PaymentSchedule.css";


function PaymentSchedule({ credit }) {


  const totalInstallments = Number(
    credit.installments || 0
  );


  const paidInstallments = Number(
    credit.paidInstallments || 0
  );


  const installmentValue = Number(
    credit.installmentValue || 0
  );



  function parseDate(){


    if(!credit.firstPayment){

      return new Date();

    }


    const [
      year,
      month,
      day
    ] = credit.firstPayment.split("-");



    return new Date(

      Number(year),

      Number(month)-1,

      Number(day)

    );


  }






  function generateSchedule(){


    const result=[];


    let date=parseDate();




    for(
      let i=0;
      i<totalInstallments;
      i++
    ){


      result.push({

        number:i+1,

        date:new Date(date),

        value:installmentValue,

        paid:i < paidInstallments

      });




      const nextDate=new Date(date);



      if(credit.frequency==="Semanal"){

        nextDate.setDate(
          nextDate.getDate()+7
        );

      }



      if(credit.frequency==="Quincenal"){

        nextDate.setDate(
          nextDate.getDate()+15
        );

      }



      if(credit.frequency==="Mensual"){

        nextDate.setMonth(
          nextDate.getMonth()+1
        );

      }



      date=nextDate;


    }


    return result;


  }






  function formatDate(date){


    return date.toLocaleDateString(

      "es-CO",

      {

        day:"2-digit",

        month:"short",

        year:"numeric"

      }

    );


  }





  const schedule=generateSchedule();



  const progress = totalInstallments > 0

    ? Math.round(

        (paidInstallments / totalInstallments) * 100

      )

    : 0;






  return (


    <div className="payment-schedule">



      <div className="schedule-header">


        <div>

          <h3>
            Calendario de cuotas
          </h3>


          <p>

            Seguimiento de pagos del crédito

          </p>


        </div>



        <div className="schedule-progress">


          <strong>

            {paidInstallments}

            /

            {totalInstallments}

          </strong>


          <span>

            cuotas pagadas

          </span>


        </div>


      </div>







      <div className="schedule-bar">


        <div

          style={{

            width:`${progress}%`

          }}

        />

      </div>









      <div className="schedule-list">



        {
          schedule.map(item=>(



            <div

              key={item.number}

              className="schedule-card"

            >



              <div className="schedule-number">


                <strong>

                  {item.number}

                </strong>


                <span>

                  Cuota

                </span>


              </div>






              <div className="schedule-info">


                <strong>

                  {formatDate(item.date)}

                </strong>


                <span>

                  Fecha de pago

                </span>


              </div>







              <div className="schedule-value">


                <strong>

                  $

                  {item.value.toLocaleString()}

                </strong>


                <span>

                  Valor cuota

                </span>


              </div>








              <div

                className={

                  item.paid

                    ? "schedule-status paid"

                    : "schedule-status pending"

                }

              >


                {

                  item.paid

                    ? "Pagada"

                    : "Pendiente"

                }


              </div>






            </div>


          ))
        }



      </div>




    </div>


  );


}


export default PaymentSchedule;