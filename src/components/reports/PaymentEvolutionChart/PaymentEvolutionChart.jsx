import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

import "./PaymentEvolutionChart.css";


function PaymentEvolutionChart({
  payments = []
}) {


  const monthlyData = {};


  payments.forEach((payment) => {


    const rawDate =
      payment?.date ||
      payment?.createdAt ||
      payment?.paymentDate;


    if (!rawDate) return;


    let date;


    if (rawDate?.toDate) {

      date = rawDate.toDate();

    } else {

      date = new Date(rawDate);

    }


    if (
      !date ||
      Number.isNaN(date.getTime())
    ) {
      return;
    }


    const year = date.getFullYear();

    const month = date.getMonth();


    const key =
      `${year}-${String(month + 1).padStart(2, "0")}`;


    if (!monthlyData[key]) {

      monthlyData[key] = {
        year,
        month,
        total: 0
      };

    }


    monthlyData[key].total += Number(
      payment?.value ??
      payment?.amount ??
      payment?.paymentAmount ??
      0
    );

  });


  const data = Object
    .values(monthlyData)
    .sort((a, b) => {

      if (a.year !== b.year) {
        return a.year - b.year;
      }

      return a.month - b.month;

    })
    .map((item) => {


      const date = new Date(
        item.year,
        item.month,
        1
      );


      return {

        month: date.toLocaleDateString(
          "es-CO",
          {
            month: "short"
          }
        ).replace(".", ""),

        total: item.total

      };

    });


  const formatCurrency = (value) => {

    return `$${Number(
      value || 0
    ).toLocaleString(
      "es-CO"
    )}`;

  };


  const CustomTooltip = ({
    active,
    payload,
    label
  }) => {


    if (
      !active ||
      !payload ||
      !payload.length
    ) {
      return null;
    }


    return (

      <div className="payment-tooltip">

        <span className="payment-tooltip__month">
          {label}
        </span>

        <strong className="payment-tooltip__value">
          {formatCurrency(
            payload[0].value
          )}
        </strong>

        <span className="payment-tooltip__label">
          Pagos recibidos
        </span>

      </div>

    );

  };


  const totalPayments = data.reduce(
    (total, item) =>
      total + Number(item.total || 0),
    0
  );


  const averagePayments =
    data.length > 0
      ? totalPayments / data.length
      : 0;


  return (

    <div className="payment-evolution">


      <div className="payment-evolution__header">

        <div>

          <span className="payment-evolution__eyebrow">
            FLUJO DE RECUPERACIÓN
          </span>

          <h3>
            Evolución de pagos
          </h3>

          <p>
            Comportamiento mensual de los pagos recibidos.
          </p>

        </div>


        <div className="payment-evolution__summary">

          <span>
            Promedio mensual
          </span>

          <strong>
            {formatCurrency(
              averagePayments
            )}
          </strong>

        </div>

      </div>


      {
        data.length === 0 ? (

          <div className="payment-evolution__empty">

            <div className="payment-evolution__empty-icon">
              $
            </div>

            <strong>
              Sin información de pagos
            </strong>

            <span>
              Cuando se registren pagos aparecerá aquí su evolución.
            </span>

          </div>

        ) : (

          <div className="payment-evolution__chart">

            <ResponsiveContainer
              width="100%"
              height={320}
            >

              <AreaChart
                data={data}
                margin={{
                  top: 10,
                  right: 10,
                  left: 5,
                  bottom: 5
                }}
              >

                <defs>

                  <linearGradient
                    id="paymentGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >

                    <stop
                      offset="0%"
                      stopColor="#2563eb"
                      stopOpacity={0.28}
                    />

                    <stop
                      offset="100%"
                      stopColor="#2563eb"
                      stopOpacity={0.02}
                    />

                  </linearGradient>

                </defs>


                <CartesianGrid
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                  vertical={false}
                />


                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#64748b",
                    fontSize: 12
                  }}
                  dy={8}
                />


                <YAxis
                  axisLine={false}
                  tickLine={false}
                  width={75}
                  tick={{
                    fill: "#64748b",
                    fontSize: 11
                  }}
                  tickFormatter={(value) =>
                    value >= 1000000
                      ? `$${(
                          value / 1000000
                        ).toFixed(1)}M`
                      : value >= 1000
                        ? `$${(
                            value / 1000
                          ).toFixed(0)}K`
                        : `$${value}`
                  }
                />


                <Tooltip
                  content={
                    <CustomTooltip />
                  }
                  cursor={{
                    stroke: "#94a3b8",
                    strokeDasharray: "4 4"
                  }}
                />


                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#2563eb"
                  strokeWidth={3}
                  fill="url(#paymentGradient)"
                  dot={{
                    r: 4,
                    strokeWidth: 2,
                    fill: "#ffffff",
                    stroke: "#2563eb"
                  }}
                  activeDot={{
                    r: 6,
                    strokeWidth: 3,
                    fill: "#ffffff",
                    stroke: "#2563eb"
                  }}
                />

              </AreaChart>

            </ResponsiveContainer>

          </div>

        )
      }


    </div>

  );

}


export default PaymentEvolutionChart;