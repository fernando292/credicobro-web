import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  useAuth
} from "../../../context/AuthContext";

import {
  getUserProfile
} from "../../../pages/modules/services/company/companyService";

import {
  getClients
} from "../../../pages/modules/services/clients/clientService";

import {
  getCredits
} from "../../../pages/modules/services/credit/creditService";

import {
  getAllCompanyPayments
} from "../../../pages/modules/services/payment/paymentGlobalService";

import DashboardStats from "../DashboardStats/DashboardStats";
import DashboardCharts from "../DashboardCharts/DashboardCharts";
import RecentPayments from "../RecentPayments/RecentPayments";
import RecentCredits from "../RecentCredits/RecentCredits";

import "./Dashboard.css";

function Dashboard() {

  const { user } = useAuth();

  const [loading,setLoading] = useState(true);

  const [clients,setClients] = useState([]);

  const [credits,setCredits] = useState([]);

  const [payments,setPayments] = useState([]);

  useEffect(()=>{

    async function loadDashboard(){

      try{

        if(!user){

          return;

        }

        const profile = await getUserProfile(

          user.uid

        );

        if(!profile?.companyId){

          return;

        }

        const companyId = String(

          profile.companyId

        );

        const [

          clientsData,

          creditsData,

          paymentsData

        ] = await Promise.all([

          getClients(companyId),

          getCredits(companyId),

          getAllCompanyPayments(companyId)

        ]);

        setClients(

          clientsData

        );

        setCredits(

          creditsData

        );

        setPayments(

          paymentsData

        );

      }catch(error){

        console.error(

          "Error cargando dashboard",

          error

        );

      }finally{

        setLoading(false);

      }

    }

    loadDashboard();

  },[user]);



  const dashboardData = useMemo(()=>{

    const capitalPrestado = credits.reduce(

      (total,credit)=>

        total +

        Number(

          credit.amount || 0

        ),

      0

    );



    const saldoPendiente = credits.reduce(

      (total,credit)=>

        total +

        Number(

          credit.balance || 0

        ),

      0

    );



    const totalPagado = payments.reduce(

      (total,payment)=>

        total +

        Number(

          payment.value || 0

        ),

      0

    );



    const creditosActivos = credits.filter(

      credit=>

        credit.status==="Activo"

    ).length;



    return{

      capitalPrestado,

      saldoPendiente,

      totalPagado,

      creditosActivos,

      totalClientes:clients.length

    };

  },[clients,credits,payments]);



  if(loading){

    return(

      <section className="dashboard">

        Cargando Dashboard...

      </section>

    );

  }



  return(

    <section className="dashboard">

      <div className="dashboard__header">

        <div>

          <h2>

            Panel general

          </h2>

          <p>

            Resumen general del negocio.

          </p>

        </div>

      </div>



      <DashboardStats

        data={dashboardData}

      />



      <DashboardCharts

        credits={credits}

        payments={payments}

      />



      <div className="dashboard__bottom">

        <RecentPayments

          payments={payments}

        />



        <RecentCredits

          credits={credits}

        />

      </div>

    </section>

  );

}

export default Dashboard;