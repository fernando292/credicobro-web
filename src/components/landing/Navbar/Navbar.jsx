import {
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";

import "./Navbar.css";


function Navbar() {

  const navigate = useNavigate();

  const [
    menuOpen,
    setMenuOpen
  ] = useState(false);


  const closeMenu = () => {

    setMenuOpen(false);

  };


  return (

    <header className="navbar">

      <div className="navbar__container">


        <div className="navbar__logo">

          CrediCobro

        </div>


        <nav
          className={
            `navbar__links ${
              menuOpen
                ? "navbar__links--open"
                : ""
            }`
          }
        >

          <a
            href="/#soluciones"
            onClick={closeMenu}
          >
            Soluciones
          </a>

          <a
            href="/#caracteristicas"
            onClick={closeMenu}
          >
            Características
          </a>

          <a
            href="/#beneficios"
            onClick={closeMenu}
          >
            Beneficios
          </a>

          <a
            href="/#precios"
            onClick={closeMenu}
          >
            Precios
          </a>

          <a
            href="/#contacto"
            onClick={closeMenu}
          >
            Contacto
          </a>

        </nav>


        <div className="navbar__actions">

          <button
            className="navbar__login"
            onClick={() => {
              closeMenu();
              navigate("/login");
            }}
          >
            Iniciar sesión
          </button>


          <button
            className="navbar__register"
            onClick={() => {
              closeMenu();
              navigate("/register");
            }}
          >
            Crear cuenta
          </button>

        </div>


        <button
          className="navbar__menu"
          type="button"
          aria-label="Abrir menú"
          aria-expanded={menuOpen}
          onClick={() =>
            setMenuOpen(
              previous => !previous
            )
          }
        >

          <span></span>
          <span></span>
          <span></span>

        </button>


      </div>

    </header>

  );

}


export default Navbar;