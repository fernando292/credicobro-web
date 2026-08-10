import { useEffect, useState } from "react";

import {
  Users,
  CreditCard,
  Wallet,
  AlertCircle
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import { getUserProfile } from "../modules/services/company/companyService";
import { getDashboardSummary } from "../modules/services/dashboard/dashboardService";

import StatCard from "../../components/dashboard/StatCard/StatCard";
import ActivityCard from "../../components/dashboard/ActivityCard/ActivityCard";
import ChartCard from "../../components/dashboard/ChartCard/ChartCard";
import DailySummary from "../../components/dashboard/DailySummary/DailySummary";
import NotificationCenter from "../../components/dashboard/NotificationCenter/NotificationCenter";

import "./Dashboard.css";


function Dashboard() {

  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [companyId, setCompanyId] = useState(null);


  useEffect(() => {

    async function loadDashboard() {

      if (!user) {
        return;
      }

      try {

        setLoading(true);

        const profile =
          await getUserProfile(
            user.uid
          );

        if (!profile?.companyId) {
          return;
        }

        setCompanyId(
          profile.companyId
        );

        const data =
          await getDashboardSummary(
            profile.companyId
          );

        setSummary(data);

      } catch (error) {

        console.error(
          "Error cargando Dashboard:",
          error
        );

      } finally {

        setLoading(false);

      }

    }


    loadDashboard();

  }, [user]);


  if (loading) {

    return (
      <section className="dashboard">

        <h2>
          Cargando Dashboard...
        </h2>

      </section>
    );

  }


  const stats = [

    {
      title: "Clientes activos",
      value:
        summary?.activeClients ?? 0,
      icon: Users,
      color: "blue"
    },

    {
      title: "Créditos activos",
      value:
        summary?.activeCredits ?? 0,
      icon: CreditCard,
      color: "green"
    },

    {
      title: "Capital recuperado",
      value:
        `$${Number(
          summary?.recovered || 0
        ).toLocaleString()}`,
      icon: Wallet,
      color: "purple"
    },

    {
      title: "Saldo pendiente",
      value:
        `$${Number(
          summary?.pending || 0
        ).toLocaleString()}`,
      icon: AlertCircle,
      color: "orange"
    }

  ];


  const activities =
    summary?.recentActivities || [

      `Clientes registrados: ${
        summary?.totalClients ?? 0
      }`,

      `Capital prestado: $${Number(
        summary?.capital || 0
      ).toLocaleString()}`,

      `Recuperación: ${
        summary?.recoveryRate ?? 0
      }%`

    ];


  return (

    <section className="dashboard">

      <div className="dashboard__header">

        <div>

          <h1>
            Centro de control financiero
          </h1>

          <p>
            Administra clientes, créditos y cobros
            desde un solo lugar.
          </p>

        </div>

      </div>


      <NotificationCenter
        companyId={companyId}
      />


      <DailySummary
        summary={summary}
      />


      <div className="dashboard__stats">

        {stats.map((item) => (

          <StatCard
            key={item.title}
            title={item.title}
            value={item.value}
            icon={item.icon}
            color={item.color}
          />

        ))}

      </div>


      <div className="dashboard__bottom">

        <ChartCard
          payments={
            summary?.payments || []
          }
        />

        <ActivityCard
          activities={activities}
        />

      </div>

    </section>

  );

}


export default Dashboard;