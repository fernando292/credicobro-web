import ReportsCharts from "../../reports/ReportsCharts/ReportsCharts";
import PaymentEvolutionChart from "../../reports/PaymentEvolutionChart/PaymentEvolutionChart";
import PortfolioChart from "../../reports/PortfolioChart/PortfolioChart";

import "./DashboardCharts.css";

function DashboardCharts({

  credits,

  payments

}){

  return(

    <section className="dashboard-charts">

      <div className="dashboard-chart">

        <ReportsCharts

          credits={credits}

        />

      </div>



      <div className="dashboard-chart">

        <PortfolioChart

          credits={credits}

        />

      </div>



      <div className="dashboard-chart dashboard-chart--full">

        <PaymentEvolutionChart

          payments={payments}

        />

      </div>

    </section>

  );

}

export default DashboardCharts;