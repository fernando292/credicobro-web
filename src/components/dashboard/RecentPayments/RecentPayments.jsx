import "./RecentPayments.css";

function RecentPayments({

  payments

}){

  const recent = [...payments]

    .sort(

      (a,b)=>

        new Date(b.date)-

        new Date(a.date)

    )

    .slice(0,5);



  return(

    <div className="recent-card">

      <h3>

        Últimos pagos

      </h3>



      {

        recent.length===0 ? (

          <p className="recent-empty">

            No existen pagos registrados.

          </p>

        ):(

          recent.map(payment=>(

            <div

              className="recent-item"

              key={payment.id}

            >

              <div>

                <strong>

                  {payment.client}

                </strong>

                <span>

                  {payment.date}

                </span>

              </div>



              <h4>

                $

                {

                  Number(

                    payment.value||0

                  ).toLocaleString()

                }

              </h4>

            </div>

          ))

        )

      }

    </div>

  );

}

export default RecentPayments;