import {
  useCallback,
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
  getFinancialSummary
} from "../pages/modules/services/finance/financeService";


function useFinances() {

  const { user } = useAuth();


  const [
    companyId,
    setCompanyId
  ] = useState(null);


  const [
    summary,
    setSummary
  ] = useState({

    initialCapital: 0,

    capitalAvailable: 0,

    capitalPlaced: 0,

    totalIncome: 0,

    totalExpenses: 0,

    interestCollected: 0,

    interestPending: 0,

    netFlow: 0,

    movements: []

  });


  const [
    loading,
    setLoading
  ] = useState(true);


  const [
    error,
    setError
  ] = useState(null);


  /* ======================================================
     CARGAR DATOS FINANCIEROS
  ====================================================== */

  const loadFinanceData =
    useCallback(
      async () => {

        if (!user) {

          setLoading(false);

          return;

        }


        try {

          setLoading(true);

          setError(null);


          /* ==============================================
             OBTENER PERFIL
          ============================================== */

          const profile =
            await getUserProfile(
              user.uid
            );


          if (!profile?.companyId) {

            setError(
              "No se encontró la empresa del usuario."
            );

            setLoading(false);

            return;

          }


          const currentCompanyId =
            profile.companyId;


          setCompanyId(
            currentCompanyId
          );


          /* ==============================================
             OBTENER RESUMEN FINANCIERO
          ============================================== */

          const financialSummary =
            await getFinancialSummary(
              currentCompanyId
            );


          setSummary({

            initialCapital:
              Number(
                financialSummary.initialCapital || 0
              ),

            capitalAvailable:
              Number(
                financialSummary.capitalAvailable || 0
              ),

            capitalPlaced:
              Number(
                financialSummary.capitalPlaced || 0
              ),

            totalIncome:
              Number(
                financialSummary.totalIncome || 0
              ),

            totalExpenses:
              Number(
                financialSummary.totalExpenses || 0
              ),

            interestCollected:
              Number(
                financialSummary.interestCollected || 0
              ),

            interestPending:
              Number(
                financialSummary.interestPending || 0
              ),

            netFlow:
              Number(
                financialSummary.netFlow || 0
              ),

            movements:
              financialSummary.movements || []

          });


        } catch (error) {

          console.error(
            "Error cargando finanzas:",
            error
          );


          setError(
            error.message ||
            "No fue posible cargar la información financiera."
          );


        } finally {

          setLoading(false);

        }

      },
      [user]
    );


  /* ======================================================
     EFECTO INICIAL
  ====================================================== */

  useEffect(() => {

    loadFinanceData();

  }, [
    loadFinanceData
  ]);


  /* ======================================================
     RETORNO
  ====================================================== */

  return {

    companyId,

    summary,


    /* ==================================================
       CAPITAL
    ================================================== */

    initialCapital:
      summary.initialCapital,

    capitalAvailable:
      summary.capitalAvailable,

    capitalPlaced:
      summary.capitalPlaced,


    /* ==================================================
       INGRESOS Y EGRESOS
    ================================================== */

    totalIncome:
      summary.totalIncome,

    totalExpenses:
      summary.totalExpenses,


    /* ==================================================
       INTERESES
    ================================================== */

    interestCollected:
      summary.interestCollected,

    interestPending:
      summary.interestPending,


    /* ==================================================
       FLUJO
    ================================================== */

    netFlow:
      summary.netFlow,


    /* ==================================================
       MOVIMIENTOS
    ================================================== */

    movements:
      summary.movements,


    /* ==================================================
       ESTADO
    ================================================== */

    loading,

    error,


    /* ==================================================
       RECARGAR
    ================================================== */

    reload:
      loadFinanceData

  };

}


export default useFinances;