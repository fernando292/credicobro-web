import {
  useEffect,
  useState
} from "react";

import {
  useAuth
} from "../context/AuthContext";

import {
  getUserProfile
} from "../pages/modules/services/company/companyService";

import {
  getClients
} from "../pages/modules/services/clients/clientService";

import {
  getCredits,
  createCredit,
  updateCredit,
  removeCredit
} from "../pages/modules/services/credit/creditService";


function useCredits() {

  const { user } = useAuth();


  const [companyId, setCompanyId] = useState(null);

  const [clients, setClients] = useState([]);

  const [credits, setCredits] = useState([]);


  /* ======================================================
     CARGAR DATOS
  ====================================================== */

  useEffect(() => {

    async function loadData() {

      if (!user) {
        return;
      }


      try {

        const profile = await getUserProfile(
          user.uid
        );


        if (!profile?.companyId) {
          return;
        }


        const currentCompanyId =
          profile.companyId;


        setCompanyId(
          currentCompanyId
        );


        const clientsData =
          await getClients(
            currentCompanyId
          );


        setClients(
          clientsData
        );


        const creditsData =
          await getCredits(
            currentCompanyId
          );


        setCredits(
          creditsData
        );


      } catch (error) {

        console.error(
          "Error cargando créditos:",
          error
        );

      }

    }


    loadData();

  }, [user]);


  /* ======================================================
     GUARDAR CRÉDITO
  ====================================================== */

  async function saveCredit(
    credit,
    editingCredit
  ) {

    if (!companyId) {

      throw new Error(
        "No se encontró la empresa del usuario."
      );

    }


    try {

      /* ==================================================
         EDITAR CRÉDITO
      ================================================== */

      if (editingCredit) {

        await updateCredit(
          companyId,
          credit.id,
          credit
        );


        setCredits(previous =>
          previous.map(item =>
            String(item.id) ===
            String(credit.id)

              ? {
                  ...item,
                  ...credit
                }

              : item
          )
        );


        return {
          ...editingCredit,
          ...credit
        };

      }


      /* ==================================================
         CREAR CRÉDITO
      ================================================== */

      const selectedClient =
        clients.find(client =>
          String(client.id) ===
          String(credit.clientId)
        );


      const creditData = {

        ...credit,

        client:
          credit.client ||
          selectedClient?.name ||
          "Cliente"

      };


      const newCredit =
        await createCredit(
          companyId,
          creditData
        );


      setCredits(previous => [

        ...previous,

        newCredit

      ]);


      return newCredit;


    } catch (error) {

      console.error(
        "Error guardando crédito:",
        error
      );


      throw error;

    }

  }


  /* ======================================================
     ELIMINAR CRÉDITO
  ====================================================== */

  async function deleteCredit(id) {

    if (!companyId) {

      throw new Error(
        "No se encontró la empresa del usuario."
      );

    }


    try {

      await removeCredit(
        companyId,
        id
      );


      setCredits(previous =>
        previous.filter(item =>
          String(item.id) !==
          String(id)
        )
      );


    } catch (error) {

      console.error(
        "Error eliminando crédito:",
        error
      );


      throw error;

    }

  }


  /* ======================================================
     ACTUALIZAR CRÉDITO EN ESTADO LOCAL
  ====================================================== */

  function updateCreditState(
    updatedCredit
  ) {

    setCredits(previous =>
      previous.map(item => {

        if (
          String(item.id) ===
          String(updatedCredit.id)
        ) {

          return {

            ...item,

            ...updatedCredit

          };

        }


        return item;

      })
    );

  }


  /* ======================================================
     RETORNO
  ====================================================== */

  return {

    companyId,

    clients,

    credits,

    saveCredit,

    deleteCredit,

    updateCreditState

  };

}


export default useCredits;