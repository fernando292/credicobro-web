import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts";


import "./ReportsCharts.css";



function ReportsCharts({

  credits

}) {



  const active = credits.filter(

    credit => credit.status === "Activo"

  ).length;



  const paid = credits.filter(

    credit => credit.status === "Pagado"

  ).length;






  const statusData = [


    {

      name:"Activos",

      value:active

    },


    {

      name:"Pagados",

      value:paid

    }


  ];









  const totalCapital = credits.reduce(

    (total,credit)=>

      total +

      Number(

        credit.amount || 0

      ),

    0

  );







  const pending = credits.reduce(

    (total,credit)=>

      total +

      Number(

        credit.balance || 0

      ),

    0

  );







  const recovered = Math.max(

    totalCapital - pending,

    0

  );









  const moneyData = [


    {

      name:"Capital",

      value:totalCapital

    },


    {

      name:"Pendiente",

      value:pending

    },


    {

      name:"Recuperado",

      value:recovered

    }


  ];









  return (



    <div className="reports-charts">







      <div className="chart-card">



        <h3>

          Estado de cartera

        </h3>







        <ResponsiveContainer

          width="100%"

          height={280}

        >


          <PieChart>



            <Pie

              data={statusData}

              dataKey="value"

              nameKey="name"

              outerRadius={90}

              label

            >



              {

                statusData.map(

                  (item,index)=>(



                    <Cell

                      key={index}

                      fill={

                        [

                          "#2563eb",

                          "#16a34a"

                        ][index]

                      }

                    />



                  )

                )

              }



            </Pie>





            <Tooltip />


            <Legend />



          </PieChart>



        </ResponsiveContainer>





      </div>













      <div className="chart-card">



        <h3>

          Distribución financiera

        </h3>







        <ResponsiveContainer

          width="100%"

          height={280}

        >



          <PieChart>



            <Pie

              data={moneyData}

              dataKey="value"

              nameKey="name"

              outerRadius={90}

              label

            >



              {

                moneyData.map(

                  (item,index)=>(



                    <Cell

                      key={index}

                      fill={

                        [

                          "#2563eb",

                          "#dc2626",

                          "#16a34a"

                        ][index]

                      }

                    />



                  )

                )

              }



            </Pie>





            <Tooltip />


            <Legend />



          </PieChart>



        </ResponsiveContainer>





      </div>








    </div>


  );


}



export default ReportsCharts;