import {
  Users,
  CreditCard,
  Wallet,
  CircleDollarSign,
  TrendingDown
} from "lucide-react";

import "./DashboardStats.css";

function DashboardStats({ data }) {

  const cards = [

    {
      title: "Clientes",
      value: data.totalClientes,
      icon: Users
    },

    {
      title: "Créditos activos",
      value: data.creditosActivos,
      icon: CreditCard
    },

    {
      title: "Capital prestado",
      value:
        "$" +
        Number(
          data.capitalPrestado
        ).toLocaleString(),

      icon: Wallet
    },

    {
      title: "Total recuperado",
      value:
        "$" +
        Number(
          data.totalPagado
        ).toLocaleString(),

      icon: CircleDollarSign
    },

    {
      title: "Saldo pendiente",
      value:
        "$" +
        Number(
          data.saldoPendiente
        ).toLocaleString(),

      icon: TrendingDown
    }

  ];



  return (

    <section className="dashboard-stats">

      {

        cards.map(card=>{

          const Icon = card.icon;

          return(

            <div

              className="dashboard-stat-card"

              key={card.title}

            >

              <div className="dashboard-stat-card__icon">

                <Icon size={22}/>

              </div>

              <span>

                {card.title}

              </span>

              <h2>

                {card.value}

              </h2>

            </div>

          );

        })

      }

    </section>

  );

}

export default DashboardStats;