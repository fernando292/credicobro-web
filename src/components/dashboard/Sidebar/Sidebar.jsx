import {
  LayoutDashboard,
  Users,
  CreditCard,
  Wallet,
  BarChart3,
  Settings,
  LogOut,
  HandCoins,
  Map,
  DollarSign
} from "lucide-react";

import {
  NavLink,
  useNavigate
} from "react-router-dom";

import {
  logoutUser
} from "../../../pages/modules/services/auth/authService";

import "./Sidebar.css";


function Sidebar() {

  const navigate = useNavigate();


  const menu = [

    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard"
    },

    {
      name: "Clientes",
      icon: Users,
      path: "/clientes"
    },

    {
      name: "Créditos",
      icon: CreditCard,
      path: "/creditos"
    },

    {
      name: "Cobranza",
      icon: HandCoins,
      path: "/cobranza"
    },

    {
      name: "Rutas",
      icon: Map,
      path: "/rutas"
    },

    {
      name: "Pagos",
      icon: Wallet,
      path: "/pagos"
    },

    {
      name: "Finanzas",
      icon: DollarSign,
      path: "/finanzas"
    },

    {
      name: "Reportes",
      icon: BarChart3,
      path: "/reportes"
    },

    {
      name: "Configuración",
      icon: Settings,
      path: "/configuracion"
    }

  ];


  async function handleLogout() {

    try {

      await logoutUser();

      navigate("/login");

    } catch (error) {

      console.error(error);

    }

  }


  return (

    <aside className="sidebar">


      <div className="sidebar__logo">

        <h2>
          Credi<span>Cobro</span>
        </h2>

      </div>


      <nav className="sidebar__menu">

        {

          menu.map((item) => {

            const Icon = item.icon;

            return (

              <NavLink

                key={item.name}

                to={item.path}

                className={({ isActive }) =>
                  isActive
                    ? "sidebar__item active"
                    : "sidebar__item"
                }

              >

                <Icon size={20} />

                <span>
                  {item.name}
                </span>

              </NavLink>

            );

          })

        }

      </nav>


      <div className="sidebar__footer">

        <button
          onClick={handleLogout}
        >

          <LogOut size={20} />

          <span>
            Cerrar sesión
          </span>

        </button>

      </div>


    </aside>

  );

}


export default Sidebar;