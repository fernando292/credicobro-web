import {
  useEffect,
  useState
} from "react";

import {
  useLocation,
  useNavigate
} from "react-router-dom";

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

import {
  geocodeClientAddress
} from "../services/maps/geocodingService";

import ClientTable from "../../../components/clients/ClientTable/ClientTable";
import ClientForm from "../../../components/clients/ClientForm/ClientForm";
import ClientDetails from "../../../components/clients/ClientDetails/ClientDetails";

import "./Clients.css";


function Clients() {

  const {
    user
  } = useAuth();


  const location =
    useLocation();


  const navigate =
    useNavigate();


  const [
    companyId,
    setCompanyId
  ] = useState(null);


  const [
    clients,
    setClients
  ] = useState([]);


  const [
    selectedClient,
    setSelectedClient
  ] = useState(null);


  const [
    editingClient,
    setEditingClient
  ] = useState(null);


  const [
    showForm,
    setShowForm
  ] = useState(false);


  const [
    search,
    setSearch
  ] = useState("");


  useEffect(() => {

    async function loadData() {

      if (!user) {
        return;
      }


      try {

        const profile =
          await getUserProfile(
            user.uid
          );


        if (!profile?.companyId) {
          return;
        }


        const id =
          profile.companyId;


        setCompanyId(id);


        const data =
          await getClients(id);


        setClients(data);


      } catch (error) {

        console.error(
          "Error cargando clientes:",
          error
        );

      }

    }


    loadData();

  }, [user]);


  useEffect(() => {

    const clientId =
      location.state?.clientId;


    if (
      !clientId ||
      clients.length === 0
    ) {
      return;
    }


    const client =
      clients.find(
        item =>
          String(item.id) ===
          String(clientId)
      );


    if (!client) {
      return;
    }


    setSelectedClient(client);


    navigate(
      location.pathname,
      {
        replace: true,
        state: {}
      }
    );

  }, [
    clients,
    location.pathname,
    location.state,
    navigate
  ]);


  async function handleSave(
    client
  ) {

    console.log(
      "🔥 HANDLE SAVE CLIENTS EJECUTADO",
      client
    );


    if (!companyId) {

      alert(
        "No se encontró la empresa del usuario."
      );

      return;
    }


    let clientWithLocation = {
      ...client
    };


    try {

      const location =
        await geocodeClientAddress(
          client
        );


      if (location) {

        clientWithLocation = {

          ...clientWithLocation,

          latitude:
            location.latitude,

          longitude:
            location.longitude

        };

      }


      if (editingClient) {

        await updateClient(

          companyId,

          editingClient.id,

          clientWithLocation

        );


        setClients(
          previous =>
            previous.map(
              item =>

                item.id ===
                editingClient.id

                  ? {
                      ...item,
                      ...clientWithLocation
                    }

                  : item
            )
        );


        setEditingClient(null);


      } else {

        const newClient =
          await createClient(

            companyId,

            clientWithLocation

          );


        setClients(
          previous => [
            ...previous,
            newClient
          ]
        );

      }


      setShowForm(false);


    } catch (error) {

      console.error(
        "Error guardando cliente:",
        error
      );


      alert(
        error.message ||
        "No fue posible guardar el cliente."
      );

    }

  }


  function handleView(
    client
  ) {

    setSelectedClient(
      client
    );

  }


  function handleEdit(
    client
  ) {

    setEditingClient(
      client
    );

    setShowForm(
      true
    );

  }


  async function handleDelete(
    id
  ) {

    const confirmDelete =
      window.confirm(
        "¿Deseas eliminar este cliente?"
      );


    if (!confirmDelete) {
      return;
    }


    try {

      await removeClient(
        companyId,
        id
      );


      setClients(
        previous =>
          previous.filter(
            item =>
              item.id !== id
          )
      );


      setSelectedClient(
        null
      );


    } catch (error) {

      console.error(
        "Error eliminando cliente:",
        error
      );


      alert(
        error.message ||
        "No fue posible eliminar el cliente."
      );

    }

  }


  const filteredClients =
    clients.filter(
      client => {

        const value =
          search
            .toLowerCase()
            .trim();


        return (

          client.name
            ?.toLowerCase()
            .includes(value)

          ||

          client.document
            ?.toLowerCase()
            .includes(value)

          ||

          client.phone
            ?.toLowerCase()
            .includes(value)

        );

      }
    );


  return (

    <section className="clients-page">


      <div className="clients-header">


        <div>

          <h1>
            Clientes
          </h1>


          <p>

            Gestiona tus clientes y su
            información financiera.

          </p>

        </div>


        <button

          type="button"

          onClick={() => {

            setEditingClient(
              null
            );

            setShowForm(
              previous =>
                !previous
            );

          }}

        >

          {
            showForm
              ? "Cerrar"
              : "Nuevo cliente"
          }

        </button>

      </div>


      <div className="clients-search">

        <input

          value={search}

          onChange={event =>
            setSearch(
              event.target.value
            )
          }

          placeholder="Buscar cliente..."

        />

      </div>


      {
        showForm && (

          <ClientForm

            onSave={
              handleSave
            }

            client={
              editingClient
            }

          />

        )
      }


      <ClientTable

        clients={
          filteredClients
        }

        onView={
          handleView
        }

        onEdit={
          handleEdit
        }

        onDelete={
          handleDelete
        }

      />


      {
        selectedClient && (

          <ClientDetails

            client={
              selectedClient
            }

            onClose={() =>
              setSelectedClient(
                null
              )
            }

          />

        )
      }


    </section>

  );

}


export default Clients;