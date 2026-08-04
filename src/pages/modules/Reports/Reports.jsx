import {
  useEffect,
  useState,
  useMemo
} from "react";


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





function Reports(){


  const { user } = useAuth();



  const [credits,setCredits] = useState([]);


  const [payments,setPayments] = useState([]);


  const [loading,setLoading] = useState(true);



  const [search,setSearch] = useState("");



  const [status,setStatus] = useState("Todos");









  useEffect(()=>{


    async function loadReports(){


      try{


        if(!user) return;





        const profile = await getUserProfile(

          user.uid

        );





        if(!profile?.companyId) return;






        const companyId = String(

          profile.companyId

        );






        const creditsData = await getCredits(

          companyId

        );




        setCredits(

          creditsData

        );









        const paymentsData = await getAllCompanyPayments(

          companyId

        );





        setPayments(

          paymentsData

        );






      }catch(error){


        console.error(

          "Error cargando reportes",

          error

        );



      }finally{


        setLoading(false);


      }



    }





    loadReports();



  },[user]);













  const filteredCredits = useMemo(()=>{


    return credits.filter(credit=>{



      const client = String(

        credit.client || ""

      )

      .toLowerCase();





      const matchesSearch =

        client.includes(

          search.toLowerCase()

        );







      const matchesStatus =

        status==="Todos"

        ||

        credit.status===status;







      return (

        matchesSearch

        &&

        matchesStatus

      );



    });



  },[credits,search,status]);













  return (



    <section className="reports-page">





      <header className="reports-header">


        <div>


          <h1>

            Reportes

          </h1>



          <p>

            Análisis de cartera y comportamiento financiero.

          </p>


        </div>


      </header>









      {

        loading ? (


          <div className="reports-loading">

            Cargando reportes...

          </div>



        ) : (


          <>


            <ReportFilters


              search={search}


              setSearch={setSearch}


              status={status}


              setStatus={setStatus}


            />








            <ReportCards


              credits={filteredCredits}


            />









            <CreditPortfolioTable


              credits={filteredCredits}


            />









            <ReportsCharts


              credits={filteredCredits}


            />

            <PaymentEvolutionChart
              payments={payments}
            />

            <PortfolioChart
              credits={filteredCredits}
            />


          </>


        )

      }







    </section>


  );

}




export default Reports;