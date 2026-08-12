import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from "recharts";

import {
  Activity,
  WalletCards,
  TrendingUp
} from "lucide-react";

import "./ReportsCharts.css";


const COLORS = {
  active: "#2563eb",
  paid: "#16a34a",
  pending: "#ef4444",
  recovered: "#16a34a"
};


function formatMoney(value) {

  return `$${Number(value || 0).toLocaleString(
    "es-CO"
  )}`;

}


function CustomTooltip({ active, payload }) {

  if (
    !active ||
    !payload ||
    !payload.length
  ) {
    return null;
  }


  const item = payload[0];


  return (

    <div className="reports-chart-tooltip">

      <span>
        {item.name}
      </span>

      <strong>
        {typeof item.value === "number"
          ? formatMoney(item.value)
          : item.value}
      </strong>

    </div>

  );

}


function CenterLabel({
  value,
  label,
  money = false
}) {

  return (

    <div className="reports-chart-center">

      <strong>
        {money
          ? formatMoney(value)
          : value}
      </strong>

      <span>
        {label}
      </span>

    </div>

  );

}


function ReportsCharts({
  credits = []
}) {


  /* ======================================================
     ESTADO DE LOS CRÉDITOS
  ====================================================== */

  const activeCredits =
    credits.filter(
      credit =>
        credit.status === "Activo"
    ).length;


  const paidCredits =
    credits.filter(
      credit =>
        credit.status === "Pagado"
    ).length;


  const totalCredits =
    activeCredits +
    paidCredits;


  const statusData = [

    {
      name: "Activos",
      value: activeCredits
    },

    {
      name: "Pagados",
      value: paidCredits
    }

  ];


  const activePercentage =
    totalCredits > 0
      ? Math.round(
          (activeCredits / totalCredits) * 100
        )
      : 0;


  /* ======================================================
     COMPOSICIÓN FINANCIERA
  ====================================================== */

  const totalCapital =
    credits.reduce(
      (total, credit) =>
        total +
        Number(
          credit.amount || 0
        ),
      0
    );


  const pending =
    credits.reduce(
      (total, credit) =>
        total +
        Number(
          credit.balance || 0
        ),
      0
    );


  const recovered =
    Math.max(
      totalCapital - pending,
      0
    );


  const recoveryPercentage =
    totalCapital > 0
      ? Math.round(
          (recovered / totalCapital) * 100
        )
      : 0;


  const moneyData = [

    {
      name: "Pendiente",
      value: pending
    },

    {
      name: "Recuperado",
      value: recovered
    }

  ];


  /* ======================================================
     ESTADO VACÍO
  ====================================================== */

  if (!credits.length) {

    return (

      <section className="reports-charts">

        <div className="reports-chart-empty">

          <Activity size={30} />

          <strong>
            Sin información suficiente
          </strong>

          <span>
            Los gráficos aparecerán cuando
            existan créditos registrados.
          </span>

        </div>

      </section>

    );

  }


  return (

    <section className="reports-charts">


      {/* ==================================================
          ESTADO DE CARTERA
      ================================================== */}

      <article className="reports-chart-card">


        <div className="reports-chart-card__header">

          <div className="reports-chart-card__title">

            <div className="reports-chart-icon reports-chart-icon--blue">

              <Activity size={18} />

            </div>

            <div>

              <h3>
                Estado de cartera
              </h3>

              <span>
                Distribución de créditos
              </span>

            </div>

          </div>


          <div className="reports-chart-badge">

            {activePercentage}% activos

          </div>

        </div>


        <div className="reports-chart-card__body">


          <div className="reports-chart-visual">

            <ResponsiveContainer
              width="100%"
              height={260}
            >

              <PieChart>

                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={72}
                  outerRadius={100}
                  paddingAngle={4}
                  stroke="none"
                >

                  <Cell
                    fill={COLORS.active}
                  />

                  <Cell
                    fill={COLORS.paid}
                  />

                </Pie>


                <Tooltip
                  content={
                    <CustomTooltip />
                  }
                />

              </PieChart>

            </ResponsiveContainer>


            <CenterLabel
              value={totalCredits}
              label="créditos"
            />

          </div>


          <div className="reports-chart-legend">


            <div className="reports-chart-legend__item">

              <div>

                <span
                  className="reports-chart-dot reports-chart-dot--blue"
                />

                <span>
                  Activos
                </span>

              </div>

              <strong>
                {activeCredits}
              </strong>

            </div>


            <div className="reports-chart-legend__item">

              <div>

                <span
                  className="reports-chart-dot reports-chart-dot--green"
                />

                <span>
                  Pagados
                </span>

              </div>

              <strong>
                {paidCredits}
              </strong>

            </div>


            <div className="reports-chart-summary">

              <span>
                Total de créditos
              </span>

              <strong>
                {totalCredits}
              </strong>

            </div>


          </div>


        </div>


      </article>



      {/* ==================================================
          COMPOSICIÓN FINANCIERA
      ================================================== */}

      <article className="reports-chart-card">


        <div className="reports-chart-card__header">

          <div className="reports-chart-card__title">

            <div className="reports-chart-icon reports-chart-icon--green">

              <WalletCards size={18} />

            </div>

            <div>

              <h3>
                Composición financiera
              </h3>

              <span>
                Capital por recuperar
              </span>

            </div>

          </div>


          <div className="reports-chart-badge reports-chart-badge--green">

            {recoveryPercentage}% recuperado

          </div>

        </div>


        <div className="reports-chart-card__body">


          <div className="reports-chart-visual">

            <ResponsiveContainer
              width="100%"
              height={260}
            >

              <PieChart>

                <Pie
                  data={moneyData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={72}
                  outerRadius={100}
                  paddingAngle={4}
                  stroke="none"
                >

                  <Cell
                    fill={COLORS.pending}
                  />

                  <Cell
                    fill={COLORS.recovered}
                  />

                </Pie>


                <Tooltip
                  content={
                    <CustomTooltip />
                  }
                />

              </PieChart>

            </ResponsiveContainer>


            <CenterLabel
              value={totalCapital}
              label="capital"
              money
            />

          </div>


          <div className="reports-chart-legend">


            <div className="reports-chart-legend__item">

              <div>

                <span
                  className="reports-chart-dot reports-chart-dot--red"
                />

                <span>
                  Pendiente
                </span>

              </div>

              <strong>
                {formatMoney(pending)}
              </strong>

            </div>


            <div className="reports-chart-legend__item">

              <div>

                <span
                  className="reports-chart-dot reports-chart-dot--green"
                />

                <span>
                  Recuperado
                </span>

              </div>

              <strong>
                {formatMoney(recovered)}
              </strong>

            </div>


            <div className="reports-chart-summary reports-chart-summary--financial">

              <div>

                <span>
                  Recuperación
                </span>

                <strong>
                  {recoveryPercentage}%
                </strong>

              </div>


              <TrendingUp size={18} />

            </div>


          </div>


        </div>


      </article>


    </section>

  );

}


export default ReportsCharts;