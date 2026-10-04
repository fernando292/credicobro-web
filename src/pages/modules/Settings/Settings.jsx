
import {
  useEffect,
  useState
} from "react";

import {
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";

import {
  useAuth
} from "../../../context/AuthContext";

import {
  getUserProfile
} from "../services/company/companyService";

import {
  db
} from "../../../config/firebase";

import "./Settings.css";


const DEFAULT_SETTINGS = {
  creditCreated: {
    enabled: true,
    delayMinutes: 30
  },
  paymentRegistered: {
    enabled: true,
    delayMinutes: 30
  },
  paymentDue: {
    enabled: true,
    sendTime: "08:00"
  },
  paymentOverdue: {
    enabled: true,
    sendTime: "08:00"
  }
};


function Settings() {

  const {
    user
  } = useAuth();


  const [
    companyId,
    setCompanyId
  ] = useState(null);


  const [
    settings,
    setSettings
  ] = useState(DEFAULT_SETTINGS);


  const [
    loading,
    setLoading
  ] = useState(true);


  const [
    saving,
    setSaving
  ] = useState(false);


  useEffect(() => {

    async function loadSettings() {

      if (!user) {
        return;
      }


      try {

        const profile =
          await getUserProfile(
            user.uid
          );


        if (!profile?.companyId) {
          setLoading(false);
          return;
        }


        const id =
          profile.companyId;


        setCompanyId(id);


        const settingsRef =
          doc(
            db,
            "companies",
            id,
            "settings",
            "communications"
          );


        const snapshot =
          await getDoc(
            settingsRef
          );


        if (snapshot.exists()) {

          const savedSettings =
            snapshot.data();


          setSettings({
            ...DEFAULT_SETTINGS,
            ...savedSettings,
            creditCreated: {
              ...DEFAULT_SETTINGS.creditCreated,
              ...savedSettings.creditCreated
            },
            paymentRegistered: {
              ...DEFAULT_SETTINGS.paymentRegistered,
              ...savedSettings.paymentRegistered
            },
            paymentDue: {
              ...DEFAULT_SETTINGS.paymentDue,
              ...savedSettings.paymentDue
            },
            paymentOverdue: {
              ...DEFAULT_SETTINGS.paymentOverdue,
              ...savedSettings.paymentOverdue
            }
          });

        }

      } catch (error) {

        console.error(
          "Error cargando configuración:",
          error
        );

      } finally {

        setLoading(false);

      }

    }


    loadSettings();

  }, [user]);


  function updateSetting(
    section,
    field,
    value
  ) {

    setSettings(
      current => ({
        ...current,
        [section]: {
          ...current[section],
          [field]: value
        }
      })
    );

  }


  async function handleSave() {

    if (!companyId) {
      return;
    }


    try {

      setSaving(true);


      const settingsRef =
        doc(
          db,
          "companies",
          companyId,
          "settings",
          "communications"
        );


      await setDoc(
        settingsRef,
        settings
      );


      console.log(
        "Configuración de automatización guardada."
      );

    } catch (error) {

      console.error(
        "Error guardando configuración:",
        error
      );

    } finally {

      setSaving(false);

    }

  }


  if (loading) {

    return (
      <section className="module-page">
        <h1>Configuración</h1>
        <p>Cargando configuración...</p>
      </section>
    );

  }


  return (

    <section className="module-page">

      <h1>
        Configuración
      </h1>


      <p>
        Configura las opciones generales del sistema.
      </p>


      <div className="settings-section">

        <div className="settings-section-header">

          <div>

            <h2>
              Automatización de mensajes
            </h2>

            <p>
              Configura cuándo CrediCobro debe programar automáticamente los
              mensajes SMS.
            </p>

          </div>

        </div>


        <div className="settings-options">


          <div className="settings-card">

            <div className="settings-card-content">

              <div>

                <h3>
                  Crédito creado
                </h3>

                <p>
                  Envía un SMS después de crear un crédito.
                </p>

              </div>


              <label className="settings-switch">

                <input
                  type="checkbox"
                  checked={
                    settings.creditCreated.enabled
                  }
                  onChange={event =>
                    updateSetting(
                      "creditCreated",
                      "enabled",
                      event.target.checked
                    )
                  }
                />

                <span className="settings-switch-slider"></span>

              </label>

            </div>


            <div className="settings-field">

              <label htmlFor="creditCreatedDelay">
                Enviar después de
              </label>


              <div className="settings-input-group">

                <input
                  id="creditCreatedDelay"
                  type="number"
                  min="1"
                  value={
                    settings.creditCreated.delayMinutes
                  }
                  onChange={event =>
                    updateSetting(
                      "creditCreated",
                      "delayMinutes",
                      Number(event.target.value)
                    )
                  }
                />

                <span>
                  minutos
                </span>

              </div>

            </div>

          </div>


          <div className="settings-card">

            <div className="settings-card-content">

              <div>

                <h3>
                  Pago registrado
                </h3>

                <p>
                  Envía un SMS después de registrar un pago.
                </p>

              </div>


              <label className="settings-switch">

                <input
                  type="checkbox"
                  checked={
                    settings.paymentRegistered.enabled
                  }
                  onChange={event =>
                    updateSetting(
                      "paymentRegistered",
                      "enabled",
                      event.target.checked
                    )
                  }
                />

                <span className="settings-switch-slider"></span>

              </label>

            </div>


            <div className="settings-field">

              <label htmlFor="paymentRegisteredDelay">
                Enviar después de
              </label>


              <div className="settings-input-group">

                <input
                  id="paymentRegisteredDelay"
                  type="number"
                  min="1"
                  value={
                    settings.paymentRegistered.delayMinutes
                  }
                  onChange={event =>
                    updateSetting(
                      "paymentRegistered",
                      "delayMinutes",
                      Number(event.target.value)
                    )
                  }
                />

                <span>
                  minutos
                </span>

              </div>

            </div>

          </div>


          <div className="settings-card">

            <div className="settings-card-content">

              <div>

                <h3>
                  Cobro de hoy
                </h3>

                <p>
                  Envía un SMS cuando el cliente tenga un pago programado
                  para hoy.
                </p>

              </div>


              <label className="settings-switch">

                <input
                  type="checkbox"
                  checked={
                    settings.paymentDue.enabled
                  }
                  onChange={event =>
                    updateSetting(
                      "paymentDue",
                      "enabled",
                      event.target.checked
                    )
                  }
                />

                <span className="settings-switch-slider"></span>

              </label>

            </div>


            <div className="settings-field">

              <label htmlFor="paymentDueTime">
                Enviar a las
              </label>


              <input
                id="paymentDueTime"
                type="time"
                value={
                  settings.paymentDue.sendTime
                }
                onChange={event =>
                  updateSetting(
                    "paymentDue",
                    "sendTime",
                    event.target.value
                  )
                }
              />

            </div>

          </div>


          <div className="settings-card">

            <div className="settings-card-content">

              <div>

                <h3>
                  Crédito vencido
                </h3>

                <p>
                  Envía un SMS cuando un pago se encuentre vencido.
                </p>

              </div>


              <label className="settings-switch">

                <input
                  type="checkbox"
                  checked={
                    settings.paymentOverdue.enabled
                  }
                  onChange={event =>
                    updateSetting(
                      "paymentOverdue",
                      "enabled",
                      event.target.checked
                    )
                  }
                />

                <span className="settings-switch-slider"></span>

              </label>

            </div>


            <div className="settings-field">

              <label htmlFor="paymentOverdueTime">
                Enviar a las
              </label>


              <input
                id="paymentOverdueTime"
                type="time"
                value={
                  settings.paymentOverdue.sendTime
                }
                onChange={event =>
                  updateSetting(
                    "paymentOverdue",
                    "sendTime",
                    event.target.value
                  )
                }
              />

            </div>

          </div>


        </div>


        <div className="settings-actions">

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !companyId}
          >
            {saving
              ? "Guardando..."
              : "Guardar configuración"}
          </button>

        </div>

      </div>

    </section>

  );

}


export default Settings;
