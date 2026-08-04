import "./ChartCard.css";


function ChartCard() {


  return (

    <div className="chart-card">

      <div className="chart-card__header">

        <div>

          <h3>
            Resumen financiero
          </h3>


          <p>
            Comportamiento general de la cartera
          </p>

        </div>


        <span>
          2026
        </span>

      </div>



      <div className="chart-card__body">

        <div className="chart-placeholder">

          <div className="chart-line"></div>


          <p>
            Gráfico financiero
          </p>


        </div>

      </div>


    </div>

  );

}


export default ChartCard;