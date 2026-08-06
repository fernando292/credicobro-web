import {
  Wallet,
  AlertTriangle,
  Clock,
  Users
} from "lucide-react";


import "./CollectionSummary.css";



function CollectionSummary({

  collections = []

}) {



  const pendingAmount = collections.reduce(

    (total,item)=>

      total + Number(item.balance || 0),

    0

  );





  const promises = collections.filter(

    item =>

      item.status === "Promesa de pago"

  ).length;





  const overdue = collections.filter(

    item =>

      item.status === "Mora" ||

      item.pendingInstallments > 0

  ).length;







  const cards = [


    {

      title:"Cobros pendientes",

      value:collections.length,

      icon:Users,

      color:"blue"

    },


    {

      title:"Saldo pendiente",

      value:`$${pendingAmount.toLocaleString()}`,

      icon:Wallet,

      color:"green"

    },


    {

      title:"Promesas de pago",

      value:promises,

      icon:Clock,

      color:"purple"

    },


    {

      title:"Clientes en mora",

      value:overdue,

      icon:AlertTriangle,

      color:"orange"

    }


  ];






  return (


    <div className="collection-summary">


      {

        cards.map((item)=>{


          const Icon = item.icon;



          return (


            <div

              className="collection-summary__card"

              key={item.title}

            >


              <div

                className={`collection-summary__icon ${item.color}`}

              >

                <Icon size={24}/>


              </div>




              <div>


                <span>

                  {item.title}

                </span>


                <h2>

                  {item.value}

                </h2>


              </div>



            </div>


          );


        })


      }



    </div>


  );

}


export default CollectionSummary;