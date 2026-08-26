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
  DollarSign,
  X
} from "lucide-react";

import {
  NavLink,
  useNavigate
} from "react-router-dom";

import {
  logoutUser
} from "../../../pages/modules/services/auth/authService";

import "./Sidebar.css";


function Sidebar({
  mobileOpen = false,
  onClose
}) {

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

      if (onClose) {
        onClose();
      }

      navigate("/login");

    } catch (error) {

      console.error(error);

    }

  }


  function handleNavigation() {

    if (onClose) {
      onClose();
    }

  }


  return (

    <>

      <aside
        className={
          mobileOpen
            ? "sidebar sidebar--mobile-open"
            : "sidebar"
        }
      >

        <div className="sidebar__logo">

          <h2>
            Credi<span>Cobro</span>
          </h2>

          <button
            type="button"
            className="sidebar__close"
            onClick={onClose}
            aria-label="Cerrar menú"
          >
            <X size={22} />
          </button>

        </div>


        <nav className="sidebar__menu">

          {
            menu.map((item) => {

              const Icon = item.icon;

              return (

                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={handleNavigation}
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
            type="button"
            onClick={handleLogout}
          >

            <LogOut size={20} />

            <span>
              Cerrar sesión
            </span>

          </button>

        </div>


      </aside>

    </>

  );

}


export default Sidebar;