import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">

      <div className="footer__content">

        <div className="footer__brand">
          <h3>
            CrediCobro<span>.</span>
          </h3>

          <p>
            Plataforma inteligente para gestionar
            préstamos, clientes y cobros de forma profesional.
          </p>
        </div>


        <div className="footer__column">
          <h4>Producto</h4>
          <a href="#">Características</a>
          <a href="#">Beneficios</a>
          <a href="#">Planes</a>
        </div>


        <div className="footer__column">
          <h4>Empresa</h4>
          <a href="#">Nosotros</a>
          <a href="#">Contacto</a>
          <a href="#">Soporte</a>
        </div>


        <div className="footer__column">
          <h4>Contacto</h4>
          <a href="#">Email</a>
          <a href="#">WhatsApp</a>
          <a href="#">Ayuda</a>
        </div>

      </div>


      <div className="footer__bottom">
        © 2026 CrediCobro. Todos los derechos reservados.
      </div>

    </footer>
  );
}

export default Footer;