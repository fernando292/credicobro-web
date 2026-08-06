import "./RecentCredits.css";

function RecentCredits({

  credits

}){

  const recent = [...credits]

    .slice(-5)

    .reverse();



  return(

    <div className="recent-card">

      <h3>

        Últimos créditos

      </h3>



      {

        recent.length===0 ? (

          <p className="recent-empty">

            No existen créditos registrados.

          </p>

        ):(

          recent.map(credit=>(

            <div

              className="recent-item"

              key={credit.id}

            >

              <div>

                <strong>

                  {

                    credit.client ||

                    "Sin cliente"

                  }

                </strong>

                <span>

                  {

                    credit.frequency

                  }

                </span>

              </div>



              <h4>

                $

                {

                  Number(

                    credit.amount||0

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

export default RecentCredits;