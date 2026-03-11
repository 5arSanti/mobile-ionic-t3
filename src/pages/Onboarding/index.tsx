import { useState, useMemo } from "react";
import {
  IonButton,
  IonContent,
  IonIcon,
  IonPage,
  IonRadio,
  IonRadioGroup,
  IonItem,
  IonLabel,
  useIonToast,
  useIonLoading,
} from "@ionic/react";
import { personOutline, checkmarkCircleOutline } from "ionicons/icons";

import {
  ProfileController,
  AuthController,
  RoleController,
  UserRole,
} from "../../services";
import { CustomInput } from "../../components/CustomInput";
import "./Onboarding.css";

// Cache for role IDs to avoid repeated queries
const roleIdCache = new Map<UserRole, number>();

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

async function getRoleId(roleName: UserRole): Promise<number> {
  // Check cache first
  if (roleIdCache.has(roleName)) {
    return roleIdCache.get(roleName)!;
  }

  const roleController = new RoleController();
  const role = await roleController.getRoleByName(roleName);
  if (!role) {
    throw new Error(`Rol ${roleName} no encontrado`);
  }

  // Cache the result
  roleIdCache.set(roleName, role.id);
  return role.id;
}

export function OnboardingPage() {
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.CUSTOMER);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Memoize controllers to avoid recreating them on every render
  const controllers = useMemo(
    () => ({
      profile: new ProfileController(),
      auth: new AuthController(),
    }),
    []
  );

  const [showLoading, hideLoading] = useIonLoading();
  const [showToast] = useIonToast();

  // Enhanced validation
  const validateForm = (): string | null => {
    const trimmedUsername = username.trim();
    const trimmedFullName = fullName.trim();

    if (trimmedFullName.length < 2) {
      return "El nombre completo debe tener al menos 2 caracteres";
    }
    if (trimmedUsername.length < 3) {
      return "El nombre de usuario debe tener al menos 3 caracteres";
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
      return "El nombre de usuario solo puede contener letras, números y guiones bajos";
    }
    return null;
  };

  const handleCompleteProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) return;
    setIsSubmitting(true);

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      await showToast({
        message: validationError,
        duration: 3000,
        color: "warning",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      await showLoading({
        message: "Completando perfil...",
        spinner: "crescent",
      });

      const user = await controllers.auth.getCurrentUser();
      if (!user) {
        throw new Error("No hay usuario autenticado");
      }

      const updates = {
        username: username.trim(),
        full_name: fullName.trim(),
        role_id: await getRoleId(selectedRole),
      };

      await controllers.profile.updateProfile(user.id, updates);

      await showToast({
        message: "✨ Perfil completado exitosamente",
        duration: 2000,
        color: "success",
      });

      // Force page reload to trigger App.tsx re-evaluation
      // This ensures the routing logic detects the completed profile
      setTimeout(() => {
        window.location.href = "/home";
      }, 1000);
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      await showToast({
        message,
        duration: 5000,
        color: "danger",
      });
    } finally {
      await hideLoading();
      setIsSubmitting(false);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="onboarding-page">
        {/* Decorative elements */}
        <div className="decoration decoration-1"></div>
        <div className="decoration decoration-2"></div>

        <div className="onboarding-container">
          <div className="onboarding-content">
            {/* Header */}
            <div className="onboarding-header">
              <div className="welcome-icon">
                <IonIcon icon={checkmarkCircleOutline} />
              </div>
              <h1 className="onboarding-title">¡Bienvenido a Make‑upp!</h1>
              <p className="onboarding-subtitle">
                Completa tu perfil para comenzar
                luxury
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleCompleteProfile} className="onboarding-form">
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
                  enterkeyhint="next"
                />
                <p className="input-hint">Mínimo 3 caracteres, único</p>
              </div>

              {/* Role selection */}
              <div className="role-selection">
                <label className="input-label">
                  Tipo de cuenta <span className="required">*</span>
                </label>
                <IonRadioGroup
                  value={selectedRole}
                  onIonChange={(e) => setSelectedRole(e.detail.value)}
                >
                  <IonItem className="role-item">
                    <IonRadio slot="start" value={UserRole.CUSTOMER} />
                    <IonLabel>
                      <div className="role-content">
                        <div className="role-header">
                          <span className="role-name">Comprador</span>
                        </div>
                        <p className="role-description">
                          Explorar catálogo de productos
                        </p>
                      </div>
                    </IonLabel>
                  </IonItem>
                  <IonItem className="role-item">
                    <IonRadio slot="start" value={UserRole.SELLER} />
                    <IonLabel>
                      <div className="role-content">
                        <div className="role-header">
                          <span className="role-name">Vendedor</span>
                        </div>
                        <p className="role-description">
                          Vende productos en la plataforma
                        </p>
                      </div>
                    </IonLabel>
                  </IonItem>
                </IonRadioGroup>
              </div>

              <IonButton
                type="submit"
                expand="block"
                className="submit-button"
                disabled={isSubmitting}
              >
                <span>
                  {isSubmitting ? "Completando..." : "Completar perfil"}
                </span>
                <IonIcon icon={checkmarkCircleOutline} slot="end" />
              </IonButton>
            </form>

            {/* Footer note */}
            <p className="onboarding-note">
              Podrás actualizar esta información más tarde desde tu perfil
            </p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}
