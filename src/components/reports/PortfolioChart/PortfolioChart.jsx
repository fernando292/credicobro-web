import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";


import "./PortfolioChart.css";



function PortfolioChart({

  credits

}) {



  const totalCapital = credits.reduce(

    (total,credit)=>

      total +

      Number(

        credit.amount || 0

      ),

    0

  );





  const totalPending = credits.reduce(

    (total,credit)=>

      total +

      Number(

        credit.balance || 0

      ),

    0

  );






  const totalPaid = Math.max(

    totalCapital - totalPending,

    0

  );






  const data = [


    {

      name:"Pendiente",

      value:totalPending

    },


    {

      name:"Recuperado",

      value:totalPaid

    }


  ];





  return (


    <div className="portfolio-chart">



      <h3>

        Estado de cartera

      </h3>





      <ResponsiveContainer

        width="100%"

        height={320}

      >



        <PieChart>



          <Pie

            data={data}

            dataKey="value"

            nameKey="name"

            outerRadius={110}

            label

          >



            {

              data.map(

                (item,index)=>(


                  <Cell

                    key={index}

                    fill={

                      [

                        "#dc2626",

                        "#16a34a"

                      ][index]

                    }

                  />


                )

              )

            }



          </Pie>




          <Tooltip

            formatter={

              value =>

              `$${Number(value).toLocaleString()}`

            }

          />



          <Legend />



        </PieChart>



      </ResponsiveContainer>



    </div>


  );


}



export default PortfolioChart;