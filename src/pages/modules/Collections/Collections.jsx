import {
  useEffect,
  useState
} from "react";


import {
  Wallet,
  Users,
  AlertTriangle,
  Clock,
  Plus
} from "lucide-react";


import {
  useAuth
} from "../../../context/AuthContext";


import {
  getUserProfile
} from "../services/company/companyService";


import {
  getTodayCollections,
  getPendingCollections,
  getOverdueCollections
} from "../services/collection/collectionService";


import {
  getFollowUps,
  createFollowUp
} from "../services/collection/collectionFollowUpService";


import {
  getClients
} from "../services/clients/clientService";


import CollectionTable from "../../../components/dashboard/CollectionTable/CollectionTable";

import CollectionSummary from "../../../components/dashboard/CollectionSummary/CollectionSummary";

import CollectionFollowUp from "../../../components/dashboard/CollectionFollowUp/CollectionFollowUp";

import CreateFollowUpModal from "../../../components/dashboard/CreateFollowUpModal/CreateFollowUpModal";


import "./Collections.css";




function Collections() {


  const { user } = useAuth();



  const [collections,setCollections] = useState([]);

  const [today,setToday] = useState([]);

  const [overdue,setOverdue] = useState([]);

  const [followUps,setFollowUps] = useState([]);

  const [clients,setClients] = useState([]);

  const [companyId,setCompanyId] = useState(null);


  const [loading,setLoading] = useState(true);

  const [showModal,setShowModal] = useState(false);


  const [search,setSearch] = useState("");

  const [filter,setFilter] = useState("Todos");








  async function loadCollections(id){


    try{


      const [

        pendingData,

        todayData,

        overdueData,

        followUpData,

        clientsData


      ] = await Promise.all([



        getPendingCollections(id),



        getTodayCollections(id),



        getOverdueCollections(id),



        getFollowUps(id),



        getClients(id)



      ]);




      console.log(

        "CLIENTES PARA MODAL:",

        clientsData

      );





      setCollections(pendingData);

      setToday(todayData);

      setOverdue(overdueData);

      setFollowUps(followUpData);

      setClients(clientsData);



    }catch(error){


      console.error(

        "Error cargando datos cobranza",

        error

      );


    }


  }









  useEffect(()=>{


    async function init(){


      try{


        if(!user) return;



        const profile = await getUserProfile(

          user.uid

        );



        if(!profile?.companyId) return;



        setCompanyId(

          profile.companyId

        );



        await loadCollections(

          profile.companyId

        );



      }catch(error){


        console.error(

          error

        );


      }finally{


        setLoading(false);


      }


    }



    init();



  },[user]);











  async function handleCreateFollowUp(data){


    try{


      if(!companyId) return;



      await createFollowUp({


        ...data,


        companyId



      });



      await loadCollections(

        companyId

      );



      setShowModal(false);



    }catch(error){


      console.error(

        "Error creando seguimiento",

        error

      );


    }


  }









  if(loading){


    return (

      <section className="collections">

        <h2>

          Cargando cobranza...

        </h2>

      </section>

    );


  }











  const filteredCollections = collections.filter((item)=>{


    const clientName =

      item.client

      ?.toLowerCase()

      || "";



    const matchesSearch =

      clientName.includes(

        search.toLowerCase()

      );



    const matchesFilter =

      filter === "Todos"

      ||

      item.status === filter;



    return (

      matchesSearch &&

      matchesFilter

    );


  });











  const totalToday = today.reduce(

    (total,item)=>

      total + Number(item.amount || 0),

    0

  );












  const stats = [


    {

      title:"Cobros de hoy",

      value:`$${totalToday.toLocaleString()}`,

      icon:Wallet,

      color:"green"

    },


    {

      title:"Clientes pendientes",

      value:collections.length,

      icon:Users,

      color:"blue"

    },


    {

      title:"En mora",

      value:overdue.length,

      icon:AlertTriangle,

      color:"orange"

    },


    {

      title:"Promesas de pago",

      value:collections.filter(

        item =>

        item.status === "Promesa de pago"

      ).length,

      icon:Clock,

      color:"purple"

    }


  ];








  const filters = [

    "Todos",

    "Pendiente",

    "Contactado",

    "Promesa de pago",

    "Pagado",

    "No localizado"

  ];









  return (


    <section className="collections">





      <div className="collections__header">


        <div>


          <h1>

            Cobranza

          </h1>


          <p>

            Gestiona los cobros pendientes y seguimiento de clientes.

          </p>


        </div>





        <button

          className="collections__add"

          onClick={()=>setShowModal(true)}

        >

          <Plus size={20}/>

          Nuevo seguimiento


        </button>



      </div>









      <CollectionSummary

        collections={collections}

      />









      <div className="collections__stats">


        {

          stats.map((item)=>{


            const Icon = item.icon;



            return (


              <div

                className="collection-stat"

                key={item.title}

              >


                <div

                  className={`collection-stat__icon ${item.color}`}

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









      <div className="collections__filters">


        <input

          type="text"

          placeholder="Buscar cliente..."

          value={search}

          onChange={(e)=>

            setSearch(e.target.value)

          }

        />



        <select

          value={filter}

          onChange={(e)=>

            setFilter(e.target.value)

          }

        >


          {

            filters.map(item=>(

              <option

                key={item}

                value={item}

              >

                {item}

              </option>

            ))

          }


        </select>


      </div>








      <CollectionFollowUp

        followUps={followUps}

      />








      <CollectionTable

        collections={filteredCollections}

      />








      {

        showModal && (


          <CreateFollowUpModal

            clients={clients}

            onClose={()=>setShowModal(false)}

            onSave={handleCreateFollowUp}

          />


        )


      }






    </section>


  );

}



export default Collections;