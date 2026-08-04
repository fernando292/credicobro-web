import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";


import "./PaymentEvolutionChart.css";





function PaymentEvolutionChart({

  payments

}) {



  const monthlyData = {};





  payments.forEach(payment=>{


    if(!payment.date) return;




    const date = new Date(

      payment.date

    );



    const month = date.toLocaleString(

      "es-CO",

      {

        month:"short"

      }

    );




    if(!monthlyData[month]){


      monthlyData[month] = 0;


    }





    monthlyData[month] += Number(

      payment.value || 0

    );



  });







  const data = Object.keys(

    monthlyData

  ).map(month=>(


    {

      month,

      total:monthlyData[month]

    }


  ));









  return (


    <div className="payment-evolution">



      <h3>

        Evolución de pagos

      </h3>





      <ResponsiveContainer

        width="100%"

        height={320}

      >



        <BarChart

          data={data}

        >



          <CartesianGrid

            strokeDasharray="3 3"

          />




          <XAxis

            dataKey="month"

          />





          <YAxis />





          <Tooltip

            formatter={

              (value)=>

                `$${Number(value).toLocaleString()}`

            }

          />





          <Bar

            dataKey="total"

            fill="#2563eb"

            radius={[8,8,0,0]}

          />





        </BarChart>



      </ResponsiveContainer>




    </div>


  );


}




export default PaymentEvolutionChart;