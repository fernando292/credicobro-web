import {
  CreditCard,
  Wallet,
  CircleDollarSign,
  AlertTriangle
} from "lucide-react";

import "./CreditStats.css";

function CreditStats() {

  const stats = [

    {
      title:"Créditos activos",
      value:"128",
      icon:CreditCard,
      color:"blue"
    },

    {
      title:"Capital prestado",
      value:"$85.000.000",
      icon:Wallet,
      color:"green"
    },

    {
      title:"Saldo pendiente",
      value:"$21.500.000",
      icon:CircleDollarSign,
      color:"purple"
    },

    {
      title:"En mora",
      value:"12",
      icon:AlertTriangle,
      color:"orange"
    }

  ];


  return (

    <div className="credit-stats">

      {

        stats.map((item)=>{

          const Icon = item.icon;

          return(

            <div
              className="credit-stat-card"
              key={item.title}
            >

              <div className={`credit-stat-card__icon ${item.color}`}>

                <Icon size={24}/>

              </div>

              <div>

                <span>

                  {item.title}

                </span>

                <h3>

                  {item.value}

                </h3>

              </div>

            </div>

          );

        })

      }

    </div>

  );

}

export default CreditStats;