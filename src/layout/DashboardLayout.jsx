import {
  useEffect,
  useState
} from "react";

import {
  Outlet
} from "react-router-dom";

import Sidebar from "../components/dashboard/Sidebar/Sidebar";
import Topbar from "../components/dashboard/Topbar/Topbar";

import "./DashboardLayout.css";


function DashboardLayout() {

  const [
    mobileMenuOpen,
    setMobileMenuOpen
  ] = useState(false);


  function closeMobileMenu() {

    setMobileMenuOpen(false);

  }


  function toggleMobileMenu() {

    setMobileMenuOpen(
      current => !current
    );

  }


  useEffect(() => {

    if (!mobileMenuOpen) {

      document.body.style.overflow = "";

      return;

    }


    document.body.style.overflow = "hidden";


    return () => {

      document.body.style.overflow = "";

    };

  }, [
    mobileMenuOpen
  ]);


  return (

    <div className="dashboard-layout">


      <Sidebar
        mobileOpen={mobileMenuOpen}
        onClose={closeMobileMenu}
      />


      {
        mobileMenuOpen && (

          <button
            type="button"
            className="dashboard-layout__overlay"
            onClick={closeMobileMenu}
            aria-label="Cerrar menú"
          />

        )
      }


      <div className="dashboard-layout__main">


        <Topbar
          onMenuClick={toggleMobileMenu}
        />


        <main className="dashboard-layout__content">

          <Outlet />

        </main>


      </div>


    </div>

  );

}


export default DashboardLayout;