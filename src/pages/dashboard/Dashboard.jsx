import {
  Users,
  CreditCard,
  Wallet,
  AlertCircle
} from "lucide-react";


import StatCard from "../../components/dashboard/StatCard/StatCard";
import ActivityCard from "../../components/dashboard/ActivityCard/ActivityCard";
import ChartCard from "../../components/dashboard/ChartCard/ChartCard";


import "./Dashboard.css";



function Dashboard() {



  const stats = [

    {
      title: "Clientes activos",
      value: "248",
      icon: Users,
      color: "blue"
    },


    {
      title: "Créditos activos",
      value: "216",
      icon: CreditCard,
      color: "green"
    },


    {
      title: "Cobros del mes",
      value: "$24.8M",
      icon: Wallet,
      color: "purple"
    },


    {
      title: "Cartera pendiente",
      value: "$8.5M",
      icon: AlertCircle,
      color: "orange"
    }

  ];





  const activities = [

    "Nuevo cliente registrado",

    "Pago recibido",

    "Crédito actualizado"

  ];





  return (

    <section className="dashboard">





      <div className="dashboard__header">


        <div>


          <h1>
            Centro de control financiero
          </h1>



          <p>
            Administra clientes, créditos y cobros desde un solo lugar.
          </p>



        </div>


      </div>







      <div className="dashboard__stats">


        {
          stats.map((item)=>(


            <StatCard

              key={item.title}

              title={item.title}

              value={item.value}

              icon={item.icon}

              color={item.color}

            />


          ))
        }



      </div>







      <div className="dashboard__bottom">



        <ChartCard />




        <ActivityCard

          activities={activities}

        />



      </div>





    </section>

  );

}



export default Dashboard;