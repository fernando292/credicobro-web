import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Search,
  CalendarDays,
  RefreshCw,
  TrendingUp
} from "lucide-react";

import {
  useAuth
} from "../../../context/AuthContext";

import {
  getUserProfile
} from "../services/company/companyService";

import {
  getCredits
} from "../services/credit/creditService";

import {
  getAllCompanyPayments
} from "../services/payment/paymentGlobalService";

import ReportFilters from "../../../components/reports/ReportFilters/ReportFilters";
import ReportCards from "../../../components/reports/ReportCards/ReportCards";
import CreditPortfolioTable from "../../../components/reports/CreditPortfolioTable/CreditPortfolioTable";
import ReportsCharts from "../../../components/reports/ReportsCharts/ReportsCharts";
import PaymentEvolutionChart from "../../../components/reports/PaymentEvolutionChart/PaymentEvolutionChart";
import PortfolioChart from "../../../components/reports/PortfolioChart/PortfolioChart";

import "./Reports.css";


function Reports() {

  const { user } = useAuth();


  const [credits, setCredits] = useState([]);

  const [payments, setPayments] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("Todos");


  async function loadReports(showRefresh = false) {

    try {

      if (!user) {
        return;
      }


      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }


      const profile = await getUserProfile(
        user.uid
      );


      if (!profile?.companyId) {
        return;
      }


      const companyId = String(
        profile.companyId
      );


      const [
        creditsData,
        paymentsData
      ] = await Promise.all([

        getCredits(companyId),

        getAllCompanyPayments(companyId)

      ]);


      setCredits(
        Array.isArray(creditsData)
          ? creditsData
          : []
      );


      setPayments(
        Array.isArray(paymentsData)
          ? paymentsData
          : []
      );


    } catch (error) {

      console.error(
        "Error cargando reportes",
        error
      );


    } finally {

      setLoading(false);

      setRefreshing(false);

    }

  }


  useEffect(() => {

    loadReports();

  }, [user]);


  const filteredCredits = useMemo(() => {

    const normalizedSearch =
      search
        .trim()
        .toLowerCase();


    return credits.filter((credit) => {

      const client =
        String(
          credit.client || ""
        ).toLowerCase();


      const matchesSearch =
        !normalizedSearch ||
        client.includes(
          normalizedSearch
        );


      const matchesStatus =
        status === "Todos" ||
        credit.status === status;


      return (
        matchesSearch &&
        matchesStatus
      );

    });

  }, [
    credits,
    search,
    status
  ]);


  const reportSummary = useMemo(() => {

    const capital = filteredCredits.reduce(
      (total, credit) =>
        total +
        Number(
          credit.amount || 0
        ),
      0
    );


    const pending = filteredCredits.reduce(
      (total, credit) =>
        total +
        Number(
          credit.balance || 0
        ),
      0
    );


    const recovered =
      Math.max(
        capital - pending,
        0
      );


    const recoveryRate =
      capital > 0
        ? (recovered / capital) * 100
        : 0;


    const activeCredits =
      filteredCredits.filter(
        credit =>
          credit.status === "Activo"
      ).length;


    const paidCredits =
      filteredCredits.filter(
        credit =>
          credit.status === "Pagado"
      ).length;


    return {

      capital,

      pending,

      recovered,

      recoveryRate,

      activeCredits,

      paidCredits,

      totalCredits:
        filteredCredits.length

    };

  }, [filteredCredits]);


  return (

    <section className="reports-page">


      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="reports-header">

        <div className="reports-header__content">

          <div className="reports-header__title">

            <span className="reports-header__eyebrow">
              CENTRO DE INTELIGENCIA
            </span>

            <h1>
              Reportes
            </h1>

            <p>
              Analiza el comportamiento de tu cartera,
              recaudo y nivel de recuperación.
            </p>

          </div>


          <div className="reports-header__actions">

            <button
              type="button"
              className="reports-refresh"
              onClick={() => loadReports(true)}
              disabled={refreshing}
            >

              <RefreshCw
                size={17}
                className={
                  refreshing
                    ? "reports-refresh__icon spinning"
                    : "reports-refresh__icon"
                }
              />

              {refreshing
                ? "Actualizando"
                : "Actualizar"
              }

            </button>

          </div>

        </div>


        {/* =====================================================
            RESUMEN SUPERIOR
        ===================================================== */}

        <div className="reports-overview">

          <div className="reports-overview__item">

            <div className="reports-overview__icon">
              <TrendingUp size={19} />
            </div>

            <div>

              <span>
                Recuperación
              </span>

              <strong>
                {reportSummary.recoveryRate.toFixed(1)}%
              </strong>

            </div>

          </div>


          <div className="reports-overview__item">

            <div className="reports-overview__icon">
              <CalendarDays size={19} />
            </div>

            <div>

              <span>
                Créditos analizados
              </span>

              <strong>
                {reportSummary.totalCredits}
              </strong>

            </div>

          </div>


          <div className="reports-overview__item">

            <div className="reports-overview__icon">
              <span className="reports-overview__dot" />
            </div>

            <div>

              <span>
                Cartera activa
              </span>

              <strong>
                {reportSummary.activeCredits}
              </strong>

            </div>

          </div>

        </div>

      </header>


      {/* =====================================================
          FILTROS
      ===================================================== */}

      <div className="reports-toolbar">

        <div className="reports-toolbar__title">

          <div className="reports-toolbar__icon">
            <Search size={18} />
          </div>

          <div>

            <strong>
              Analizar cartera
            </strong>

            <span>
              Filtra los datos para profundizar en el análisis.
            </span>

          </div>

        </div>


        <ReportFilters
          search={search}
          setSearch={setSearch}
          status={status}
          setStatus={setStatus}
        />

      </div>


      {
        loading ? (

          <div className="reports-loading">

            <div className="reports-loading__spinner" />

            <strong>
              Preparando análisis
            </strong>

            <span>
              Estamos recopilando la información de tu cartera.
            </span>

          </div>

        ) : (

          <>

            {/* =================================================
                KPIs
            ================================================= */}

            <section className="reports-section">

              <div className="reports-section__header">

                <div>

                  <span>
                    RESUMEN FINANCIERO
                  </span>

                  <h2>
                    Estado general
                  </h2>

                </div>

                <small>
                  Datos actuales
                </small>

              </div>


              <ReportCards
                credits={filteredCredits}
              />

            </section>


            {/* =================================================
                EVOLUCIÓN DE PAGOS
            ================================================= */}

            <section className="reports-section">

              <div className="reports-section__header">

                <div>

                  <span>
                    RECAUDO
                  </span>

                  <h2>
                    Evolución de pagos
                  </h2>

                </div>

                <small>
                  Comportamiento del recaudo
                </small>

              </div>


              <div className="reports-feature-card">

                <PaymentEvolutionChart
                  payments={payments}
                />

              </div>

            </section>


            {/* =================================================
                ANÁLISIS DE CARTERA
            ================================================= */}

            <section className="reports-section">

              <div className="reports-section__header">

                <div>

                  <span>
                    CARTERA
                  </span>

                  <h2>
                    Distribución y comportamiento
                  </h2>

                </div>

                <small>
                  Lectura financiera
                </small>

              </div>


              <ReportsCharts
                credits={filteredCredits}
              />

            </section>


            {/* =================================================
                ESTADO FINANCIERO
            ================================================= */}

            <section className="reports-section">

              <div className="reports-section__header">

                <div>

                  <span>
                    EXPOSICIÓN
                  </span>

                  <h2>
                    Estado de recuperación
                  </h2>

                </div>

                <small>
                  Pendiente vs recuperado
                </small>

              </div>


              <PortfolioChart
                credits={filteredCredits}
              />

            </section>


            {/* =================================================
                DETALLE DE CARTERA
            ================================================= */}

            <section className="reports-section">

              <div className="reports-section__header">

                <div>

                  <span>
                    DETALLE
                  </span>

                  <h2>
                    Cartera analizada
                  </h2>

                </div>

                <small>
                  {filteredCredits.length} créditos
                </small>

              </div>


              <CreditPortfolioTable
                credits={filteredCredits}
              />

            </section>

          </>

        )
      }


    </section>

  );

}


export default Reports;