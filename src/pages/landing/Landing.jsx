import Navbar from "../../components/landing/Navbar/Navbar";
import Hero from "../../components/landing/Hero/Hero";
import Features from "../../components/landing/Features/Features";
import HowItWorks from "../../components/landing/HowItWorks/HowItWorks";
import Benefits from "../../components/landing/Benefits/Benefits";
import Pricing from "../../components/landing/Pricing/Pricing";
import CTA from "../../components/landing/CTA/CTA";
import Footer from "../../components/landing/Footer/Footer";

import Container from "../../components/ui/Container/Container";

import "./Landing.css";


function Landing() {


  return (

    <>


      <Navbar />



      <main className="landing">



        <section className="landing__hero">

          <Container>

            <Hero />

          </Container>

        </section>





        <section

          id="soluciones"

          className="landing__features"

        >

          <Container>

            <Features />

          </Container>

        </section>







        <section

          id="caracteristicas"

          className="landing__how"

        >

          <Container>

            <HowItWorks />

          </Container>

        </section>







        <section

          id="beneficios"

          className="landing__benefits"

        >

          <Container>

            <Benefits />

          </Container>

        </section>







        <section

          id="precios"

          className="landing__pricing"

        >

          <Container>

            <Pricing />

          </Container>

        </section>







        <section

          id="contacto"

          className="landing__cta"

        >

          <Container>

            <CTA />

          </Container>

        </section>





      </main>





      <Footer />



    </>

  );

}


export default Landing;