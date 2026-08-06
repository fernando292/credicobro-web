import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";


function PaymentEvolutionChart({

  payments = []

}) {


  const monthlyData = {};



  payments.forEach((payment) => {



    const paymentDate =

      payment.date ||

      payment.createdAt ||

      payment.paymentDate;



    if (!paymentDate) return;



    const date =

      paymentDate?.toDate

        ? paymentDate.toDate()

        : new Date(paymentDate);



    if (isNaN(date)) return;



    const month = date.toLocaleDateString(

      "es-CO",

      {

        month:"short"

      }

    );



    const amount =

      Number(

        payment.value ||

        payment.amount ||

        payment.paymentAmount ||

        0

      );



    monthlyData[month] =

      (monthlyData[month] || 0) +

      amount;



  });




  const data = Object.keys(monthlyData).map(

    (month)=>(

      {

        month,

        total: monthlyData[month]

      }

    )

  );





  return (


    <ResponsiveContainer

      width="100%"

      height={260}

    >


      <AreaChart data={data}>


        <CartesianGrid

          strokeDasharray="3 3"

        />


        <XAxis

          dataKey="month"

        />


        <YAxis />


        <Tooltip

          formatter={(value)=>

            `$${Number(value).toLocaleString()}`

          }

        />



        <Area

          type="monotone"

          dataKey="total"

          stroke="#2563eb"

          fill="#60a5fa"

          fillOpacity={0.35}

        />


      </AreaChart>


    </ResponsiveContainer>


  );

}


export default PaymentEvolutionChart;