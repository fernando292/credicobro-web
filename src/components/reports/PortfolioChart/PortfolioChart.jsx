import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from "recharts";

import "./PortfolioChart.css";


function PortfolioChart({ credits = [] }) {

  const totalCapital = credits.reduce(
    (total, credit) =>
      total +
      Number(credit.amount || 0),
    0
  );


  const totalPending = credits.reduce(
    (total, credit) =>
      total +
      Number(credit.balance || 0),
    0
  );


  const totalRecovered = Math.max(
    totalCapital - totalPending,
    0
  );


  const recoveryPercentage =
    totalCapital > 0
      ? Math.min(
          (totalRecovered / totalCapital) * 100,
          100
        )
      : 0;


  const pendingPercentage =
    totalCapital > 0
      ? Math.max(
          (totalPending / totalCapital) * 100,
          0
        )
      : 0;


  const data = [
    {
      name: "Recuperado",
      value: totalRecovered
    },
    {
      name: "Pendiente",
      value: totalPending
    }
  ];


  const formatMoney = (value) =>
    `$${Number(value).toLocaleString("es-CO")}`;


  return (

    <div className="portfolio-chart">

      <div className="portfolio-chart__header">

        <div>

          <span className="portfolio-chart__eyebrow">
            CARTERA
          </span>

          <h3>
            Estado de recuperación
          </h3>

          <p>
            Capital recuperado frente al saldo pendiente.
          </p>

        </div>

      </div>


      <div className="portfolio-chart__body">


        <div className="portfolio-chart__visual">

          <ResponsiveContainer
            width="100%"
            height={270}
          >

            <PieChart>

              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={78}
                outerRadius={108}
                paddingAngle={3}
                startAngle={90}
                endAngle={-270}
                stroke="none"
              >

                <Cell
                  fill="#2563eb"
                />

                <Cell
                  fill="#e2e8f0"
                />

              </Pie>


              <Tooltip
                formatter={(value) =>
                  formatMoney(value)
                }
              />

            </PieChart>

          </ResponsiveContainer>


          <div className="portfolio-chart__center">

            <strong>
              {recoveryPercentage.toFixed(1)}%
            </strong>

            <span>
              recuperado
            </span>

          </div>

        </div>


        <div className="portfolio-chart__summary">


          <div className="portfolio-chart__summary-item">

            <div className="portfolio-chart__summary-label">

              <span className="portfolio-chart__dot portfolio-chart__dot--recovered" />

              <span>
                Recuperado
              </span>

            </div>

            <strong>
              {formatMoney(totalRecovered)}
            </strong>

            <small>
              {recoveryPercentage.toFixed(1)}% del capital
            </small>

          </div>


          <div className="portfolio-chart__summary-item">

            <div className="portfolio-chart__summary-label">

              <span className="portfolio-chart__dot portfolio-chart__dot--pending" />

              <span>
                Pendiente
              </span>

            </div>

            <strong>
              {formatMoney(totalPending)}
            </strong>

            <small>
              {pendingPercentage.toFixed(1)}% del capital
            </small>

          </div>


          <div className="portfolio-chart__progress">

            <div className="portfolio-chart__progress-header">

              <span>
                Recuperación de cartera
              </span>

              <strong>
                {recoveryPercentage.toFixed(1)}%
              </strong>

            </div>


            <div className="portfolio-chart__progress-track">

              <div
                className="portfolio-chart__progress-fill"
                style={{
                  width: `${recoveryPercentage}%`
                }}
              />

            </div>

          </div>


        </div>


      </div>


    </div>

  );

}


export default PortfolioChart;