import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";


import PublicLayout from "../layout/PublicLayout";
import DashboardLayout from "../layout/DashboardLayout";


import ProtectedRoute from "./ProtectedRoute";


import Landing from "../pages/Landing/Landing";


import Login from "../pages/auth/Login/Login";
import Register from "../pages/auth/Register/Register";


import Dashboard from "../pages/Dashboard/Dashboard.jsx";


import Clients from "../pages/modules/Clients/Clients";
import Credits from "../pages/modules/Credits/Credits";
import Collections from "../pages/modules/Collections/Collections";
import Payments from "../pages/modules/payments/Payments";
import Reports from "../pages/modules/Reports/Reports";
import Settings from "../pages/modules/Settings/Settings";





function AppRouter() {



  return (


    <BrowserRouter>


      <Routes>





        {/* 
          Zona pública
        */}



        <Route element={<PublicLayout />}>


          <Route

            path="/"

            element={<Landing />}

          />




          <Route

            path="/login"

            element={<Login />}

          />




          <Route

            path="/register"

            element={<Register />}

          />



        </Route>








        {/* 
          Panel administrativo protegido
        */}



        <Route


          element={


            <ProtectedRoute>


              <DashboardLayout />


            </ProtectedRoute>


          }


        >




          <Route

            path="/dashboard"

            element={<Dashboard />}

          />





          <Route

            path="/clientes"

            element={<Clients />}

          />





          <Route

            path="/creditos"

            element={<Credits />}

          />

          <Route
            path="/cobranza"  
          element={<Collections />}
          />





          <Route

            path="/pagos"

            element={<Payments />}

          />





          <Route

            path="/reportes"

            element={<Reports />}

          />





          <Route

            path="/configuracion"

            element={<Settings />}

          />




        </Route>





      </Routes>



    </BrowserRouter>


  );

}



export default AppRouter;