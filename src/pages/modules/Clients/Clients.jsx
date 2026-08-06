import {
  useEffect,
  useState
} from "react";


import {
  useAuth
} from "../../../context/AuthContext";


import {
  getUserProfile
} from "../services/company/companyService";


import {
  getClients,
  createClient,
  updateClient,
  removeClient
} from "../services/clients/clientService";


import ClientTable from "../../../components/clients/ClientTable/ClientTable";
import ClientForm from "../../../components/clients/ClientForm/ClientForm";
import ClientDetails from "../../../components/clients/ClientDetails/ClientDetails";


import "./Clients.css";



function Clients(){


  const { user } = useAuth();



  const [companyId,setCompanyId] = useState(null);


  const [clients,setClients] = useState([]);


  const [selectedClient,setSelectedClient] = useState(null);


  const [editingClient,setEditingClient] = useState(null);


  const [showForm,setShowForm] = useState(false);


  const [search,setSearch] = useState("");



  useEffect(()=>{


    async function loadData(){


      if(!user) return;



      const profile = await getUserProfile(

        user.uid

      );



      if(profile?.companyId){


        setCompanyId(profile.companyId);



        const data = await getClients(

          profile.companyId

        );


        setClients(data);


      }


    }



    loadData();



  },[user]);







  async function handleSave(client){



    if(editingClient){



      await updateClient(

        companyId,

        editingClient.id,

        client

      );



      setClients(prev=>

        prev.map(item=>

          item.id===editingClient.id

          ? {
            ...item,
            ...client
          } 
          
          :item

        )

      );



      setEditingClient(null);



    }else{



      const newClient = await createClient(

        companyId,

        client

      );



      setClients(prev=>[

        ...prev,

        newClient

      ]);



    }



    setShowForm(false);


  }







  function handleView(client){


    setSelectedClient(client);


  }







  function handleEdit(client){


    setEditingClient(client);

    setShowForm(true);


  }







  async function handleDelete(id){



    const confirmDelete = window.confirm(

      "¿Deseas eliminar este cliente?"

    );



    if(!confirmDelete) return;



    await removeClient(

      companyId,

      id

    );



    setClients(prev=>

      prev.filter(

        item=>item.id!==id

      )

    );



    setSelectedClient(null);


  }








  const filteredClients = clients.filter(client=>{


    const value = search.toLowerCase();



    return (

      client.name?.toLowerCase().includes(value)

      ||

      client.document?.includes(value)

      ||

      client.phone?.includes(value)

    );


  });







  return (

    <section className="clients-page">



      <div className="clients-header">


        <div>

          <h1>
            Clientes
          </h1>


          <p>
            Gestiona tus clientes y su información financiera.
          </p>


        </div>




        <button

          onClick={()=>{


            setEditingClient(null);


            setShowForm(!showForm);


          }}

        >

          {
            showForm

            ?

            "Cerrar"

            :

            "Nuevo cliente"

          }

        </button>



      </div>






      <div className="clients-search">


        <input

          value={search}

          onChange={(e)=>setSearch(e.target.value)}

          placeholder="Buscar cliente..."

        />


      </div>






      {
        showForm && (

          <ClientForm

            onSave={handleSave}

            client={editingClient}

          />

        )
      }








      <ClientTable


        clients={filteredClients}


        onView={handleView}


        onEdit={handleEdit}


        onDelete={handleDelete}


      />







      {
        selectedClient && (

          <ClientDetails


            client={selectedClient}


            onClose={()=>setSelectedClient(null)}


          />

        )
      }






    </section>

  );

}



export default Clients;