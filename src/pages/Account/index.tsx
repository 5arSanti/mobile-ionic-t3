import { useState, useEffect } from "react";
import {
  IonButton,
  IonContent,
  IonIcon,
  IonPage,
  useIonToast,
  useIonLoading,
} from "@ionic/react";
import {
  personOutline,
  mailOutline,
  checkmarkCircleOutline,
} from "ionicons/icons";

import { ProfileController, AuthController, UserRole } from "../../services";
import { AuthSession } from "../../services/auth/types";
import { CustomInput } from "../../components/CustomInput";
import "./Account.css";

function getErrorMessage(error: unknown): string {
  if (typeof error === "string") {
    return error;
  }
  if (error && typeof error === "object") {
    const asObj = error as Record<string, unknown>;
    const desc = asObj["error_description"];
    const msg = asObj["message"];
    if (typeof desc === "string") return desc;
    if (typeof msg === "string") return msg;
  }
  return "Ocurrió un error inesperado";
}

export function AccountPage() {
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [userRole, setUserRole] = useState<string | undefined>(undefined);

  const profileController = new ProfileController();
  const authController = new AuthController();

  const [showLoading, hideLoading] = useIonLoading();
  const [showToast] = useIonToast();

  useEffect(() => {
    const getSession = async () => {
      const session = await authController.getCurrentSession();
      setSession(session);
    };
    getSession();
    authController.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (session && !isLoadingProfile && (!username || !fullName)) {
      getProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const getProfile = async () => {
    if (isLoadingProfile) return; // Prevent multiple calls

    setIsLoadingProfile(true);
    try {
      await showLoading({
        message: "Cargando perfil...",
        spinner: "crescent",
      });
    } catch (error) {
      console.error("Error showing loading:", error);
    }

    try {
      const user = await authController.getCurrentUser();
      if (!user) throw new Error("No hay usuario autenticado");

      const profileData = await profileController.getProfileByUserId(user.id);

      if (profileData) {
        setUsername(profileData.username);
        setFullName(profileData.full_name || "");
        // Extract role name from the joined data
        if (
          profileData.role &&
          typeof profileData.role === "object" &&
          "name" in profileData.role
        ) {
          setUserRole(profileData.role.name);
        }
      }
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      await showToast({ message, duration: 5000, color: "danger" });
    } finally {
      try {
        await hideLoading();
      } catch (error) {
        console.error("Error hiding loading:", error);
      }
      setIsLoadingProfile(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) return;
    setIsSubmitting(true);

    // Validación básica
    if (username.length < 3) {
      await showToast({
        message: "El nombre de usuario debe tener al menos 3 caracteres",
        duration: 3000,
        color: "warning",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      await showLoading({
        message: "Actualizando perfil...",
        spinner: "crescent",
      });
    } catch (error) {
      console.error("Error showing loading:", error);
    }

    try {
      const user = await authController.getCurrentUser();
      if (!user) throw new Error("No hay usuario autenticado");

      const updates = {
        username,
        full_name: fullName,
      };

      await profileController.updateProfile(user.id, updates);

      await showToast({
        message: "✨ Perfil actualizado exitosamente",
        duration: 2000,
        color: "success",
      });
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      await showToast({ message, duration: 5000, color: "danger" });
    } finally {
      try {
        await hideLoading();
      } catch (error) {
        console.error("Error hiding loading:", error);
      }
      setIsSubmitting(false);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="account-page">
        {/* Decorative elements */}
        <div className="decoration decoration-1"></div>
        <div className="decoration decoration-2"></div>
        <div className="decoration decoration-3"></div>

        <div className="account-container">
          {/* Left side - Profile Info */}
          <div className="profile-section">
            <div className="profile-content">
              <div className="profile-icon">
                <IonIcon icon={personOutline} />
              </div>
              <h1 className="profile-title">Mi Perfil</h1>
              <p className="profile-subtitle">
                Gestiona tu información personal
              </p>
              <div className="profile-divider"></div>

              {/* Email display */}
              <div className="email-display">
                <IonIcon icon={mailOutline} className="email-icon" />
                <div className="email-info">
                  <p className="email-label">Correo electrónico</p>
                  <p className="email-value">{session?.user?.email}</p>
                </div>
              </div>

              {/* Role display */}
              {userRole && (
                <div className="role-display">
                  <IonIcon icon={personOutline} className="role-icon" />
                  <div className="role-info">
                    <p className="role-label">Tipo de cuenta</p>
                    <p className="role-value">
                      {userRole === UserRole.ADMIN && "Administrador"}
                      {userRole === UserRole.CUSTOMER && "Comprador"}
                      {userRole === UserRole.SELLER && "Vendedor"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Edit Form */}
          <div className="form-section">
            <div className="form-content">
              <div className="form-header">
                <h2 className="form-title">Editar Perfil</h2>
                <p className="form-subtitle">
                  Actualiza tu información personal
                </p>
              </div>

              <form onSubmit={handleUpdateProfile} className="profile-form">
                <div className="">
                  <label className="input-label">
                    Nombre completo <span className="required">*</span>
                  </label>
                  <CustomInput
                    value={fullName}
                    onChange={setFullName}
                    type="text"
                    placeholder="Ej: María García"
                    icon={personOutline}
                    required
                    name="fullName"
                    enterkeyhint="next"
                  />
                </div>

                <div className="">
                  <label className="input-label">
                    Nombre de usuario <span className="required">*</span>
                  </label>
                  <CustomInput
                    value={username}
                    onChange={setUsername}
                    type="text"
                    placeholder="Ej: mariagarcia"
                    icon={personOutline}
                    required
                    minlength={3}
                    name="username"
                    enterkeyhint="send"
                  />
                  <p className="input-hint">Mínimo 3 caracteres, único</p>
                </div>

                <IonButton
                  type="submit"
                  expand="block"
                  className="update-button"
                  disabled={isSubmitting}
                >
                  <span>
                    {isSubmitting ? "Actualizando..." : "Actualizar perfil"}
                  </span>
                  <IonIcon icon={checkmarkCircleOutline} slot="end" />
                </IonButton>
              </form>

              {/* Sign Out Button moved to Settings page */}

              <div className="form-footer">
                <p className="footer-text">
                  Los cambios se guardarán automáticamente en tu perfil
                </p>
              </div>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}
