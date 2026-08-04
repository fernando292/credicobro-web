import {
  Users,
  CreditCard,
  Wallet,
  TrendingUp
} from "lucide-react";

import "./Dashboard.css";


function Dashboard() {


  const stats = [
    {
      title: "Clientes activos",
      value: "248",
      icon: Users,
      growth: "+12%"
    },
    {
      title: "Créditos activos",
      value: "$18.5M",
      icon: CreditCard,
      growth: "+8%"
    },
    {
      title: "Cobros del mes",
      value: "$24.8M",
      icon: Wallet,
      growth: "+15%"
    },
    {
      title: "Ingresos",
      value: "$32M",
      icon: TrendingUp,
      growth: "+20%"
    }
  ];


  return (
    <section className="dashboard">


      <div className="dashboard__header">

        <div>

          <h2>
            Panel general
          </h2>

          <p>
            Aquí tienes el resumen financiero de tu negocio.
          </p>

        </div>


      </div>



      <div className="dashboard__stats">


        {stats.map((item) => {

          const Icon = item.icon;


          return (

            <div
              className="stat-card"
              key={item.title}
            >

              <div className="stat-card__icon">

                <Icon size={24}/>

              </div>


              <div>

                <span>
                  {item.title}
                </span>

                <h3>
                  {item.value}
                </h3>

                <small>
                  {item.growth} este mes
                </small>

              </div>


            </div>

          );

        })}


      </div>




      <div className="dashboard__grid">


        <div className="panel-card">

          <h3>
            Resumen de cobros
          </h3>


          <div className="chart-placeholder">

            Próximamente gráfica financiera

          </div>

        </div>



        <div className="panel-card">


          <h3>
            Actividad reciente
          </h3>


          <ul className="activity">

            <li>
              Nuevo cliente registrado
            </li>

            <li>
              Pago recibido
            </li>

            <li>
              Crédito actualizado
            </li>

          </ul>


        </div>


      </div>


    </section>
  );
}


export default Dashboard;