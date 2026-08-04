import { Outlet } from "react-router-dom";

import Sidebar from "../components/dashboard/Sidebar/Sidebar";
import Topbar from "../components/dashboard/Topbar/Topbar";

import "./DashboardLayout.css";


function DashboardLayout() {

  return (

    <div className="dashboard-layout">

      <Sidebar />


      <div className="dashboard-layout__main">

        <Topbar />


        <main className="dashboard-layout__content">

          <Outlet />

        </main>

      </div>

    </div>

  );

}


export default DashboardLayout;