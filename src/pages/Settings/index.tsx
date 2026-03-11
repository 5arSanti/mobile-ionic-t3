import {
  IonButton,
  IonContent,
  IonIcon,
  IonLabel,
  IonList,
  IonPage,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonGrid,
  IonRow,
  IonCol,
  IonChip,
  useIonToast,
  useIonLoading,
  useIonRouter,
  IonItem,
  IonNote,
} from "@ionic/react";
import {
  settingsOutline,
  addOutline,
  listOutline,
  shieldOutline,
  logOutOutline,
  personOutline,
  cartOutline,
  receiptOutline,
  documentTextOutline,
  helpCircleOutline,
  informationCircleOutline,
} from "ionicons/icons";

import { AuthController, UserRole } from "../../services";
import { useUserPermissions } from "../../contexts/useUser";
import "./Settings.css";

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

export function SettingsPage() {
  const permissions = useUserPermissions();
  const authController = new AuthController();

  const [showLoading, hideLoading] = useIonLoading();
  const [showToast] = useIonToast();
  const router = useIonRouter();

  const handleSignOut = async () => {
    try {
      await showLoading({
        message: "Cerrando sesión...",
        spinner: "crescent",
      });
      await authController.signOut();
      await showToast({
        message: "👋 Sesión cerrada exitosamente",
        duration: 2000,
        color: "success",
      });
      setTimeout(() => {
        router.push("/", "forward", "replace");
      }, 500);
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      await showToast({ message, duration: 5000, color: "danger" });
    } finally {
      await hideLoading();
    }
  };

  const navigateTo = (path: string) => {
    router.push(path, "forward");
  };

  return (
    <IonPage>
      <IonContent fullscreen className="settings-page">
        {/* Decorative elements */}
        <div className="decoration decoration-1"></div>
        <div className="decoration decoration-2"></div>
        <div className="decoration decoration-3"></div>

        <div className="settings-container">
          {/* Header */}
          <div className="settings-header">
            <div className="header-content">
              <IonIcon icon={settingsOutline} className="header-icon" />
              <h1 className="header-title">Configuración</h1>
              <p className="header-subtitle">
                Gestiona tu cuenta y preferencias
              </p>
              <p className="header-subtitle">
                Por: Johel Santiago Arias Becerra
              </p>

              {/* Role Badge */}
              {permissions.userRole && (
                <IonChip className="role-chip">
                  <IonIcon icon={shieldOutline} />
                  <IonLabel>
                    {permissions.userRole === UserRole.ADMIN && "Administrador"}
                    {permissions.userRole === UserRole.CUSTOMER && "Comprador"}
                    {permissions.userRole === UserRole.SELLER && "Vendedor"}
                  </IonLabel>
                </IonChip>
              )}
            </div>
          </div>

          <IonGrid className="settings-grid">
            <IonRow>
              {/* Account Settings */}
              <IonCol size="12" sizeMd="6">
                <IonCard className="settings-card">
                  <IonCardHeader>
                    <IonCardTitle>
                      <IonIcon icon={personOutline} />
                      Cuenta
                    </IonCardTitle>
                    <IonCardSubtitle>
                      Gestiona tu información personal
                    </IonCardSubtitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonList className="settings-list">
                      <IonItem
                        button
                        className="highlight-item"
                        onClick={() => navigateTo("/account")}
                      >
                        <IonIcon icon={personOutline} slot="start" />
                        <IonLabel>Mi Perfil</IonLabel>
                        <IonNote slot="end">Editar información</IonNote>
                      </IonItem>
                    </IonList>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              {/* Shopping Settings (for Customers) */}
              {permissions.canPurchaseProducts && (
                <IonCol size="12" sizeMd="6">
                  <IonCard className="settings-card">
                    <IonCardHeader>
                      <IonCardTitle>
                        <IonIcon icon={cartOutline} />
                        Compras
                      </IonCardTitle>
                      <IonCardSubtitle>Gestiona tus compras</IonCardSubtitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <IonList className="settings-list">
                        <IonItem button onClick={() => navigateTo("/cart")}>
                          <IonIcon icon={cartOutline} slot="start" />
                          <IonLabel>Mi Carrito</IonLabel>
                        </IonItem>

                        <IonItem
                          button
                          onClick={() => navigateTo("/my-orders")}
                        >
                          <IonIcon icon={receiptOutline} slot="start" />
                          <IonLabel>Mis Pedidos</IonLabel>
                        </IonItem>

                        <IonItem
                          button
                          onClick={() => navigateTo("/my-invoices")}
                        >
                          <IonIcon icon={documentTextOutline} slot="start" />
                          <IonLabel>Mis Facturas</IonLabel>
                        </IonItem>
                      </IonList>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              )}

              {/* Admin Settings */}
              {permissions.isAdmin && (
                <IonCol size="12" sizeMd="6">
                  <IonCard className="settings-card admin-card">
                    <IonCardHeader>
                      <IonCardTitle>
                        <IonIcon icon={shieldOutline} />
                        Administración
                      </IonCardTitle>
                      <IonCardSubtitle>Panel de administrador</IonCardSubtitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <IonList className="settings-list">
                        <IonItem
                          button
                          onClick={() => navigateTo("/create-product")}
                        >
                          <IonIcon icon={addOutline} slot="start" />
                          <IonLabel>Crear Producto</IonLabel>
                        </IonItem>

                        <IonItem
                          button
                          onClick={() => navigateTo("/product-management")}
                        >
                          <IonIcon icon={listOutline} slot="start" />
                          <IonLabel>Gestionar Productos</IonLabel>
                        </IonItem>

                        {/* <IonItem button onClick={() => navigateTo("/admin")}>
                          <IonIcon icon={receiptOutline} slot="start" />
                          <IonLabel>Pedidos y Facturas</IonLabel>
                        </IonItem> */}
                      </IonList>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              )}

              {/* Help & Support */}
              <IonCol size="12" sizeMd="6">
                <IonCard className="settings-card">
                  <IonCardHeader>
                    <IonCardTitle>
                      <IonIcon icon={helpCircleOutline} />
                      Ayuda
                    </IonCardTitle>
                    <IonCardSubtitle>Soporte y información</IonCardSubtitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonList className="settings-list">
                      <IonItem
                        button
                        onClick={() =>
                          alert(
                            "Centro de Ayuda: Próximamente.\nSoporte: soporte@tienda.com"
                          )
                        }
                      >
                        <IonIcon icon={helpCircleOutline} slot="start" />
                        <IonLabel>Centro de Ayuda</IonLabel>
                      </IonItem>

                      <IonItem
                        button
                        onClick={() =>
                          alert(
                            "Tienda v1.0.0\nAplicación de ventas."
                          )
                        }
                      >
                        <IonIcon icon={informationCircleOutline} slot="start" />
                        <IonLabel>Acerca de Tienda</IonLabel>
                      </IonItem>
                    </IonList>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              {/* Sign Out */}
              <IonCol size="12">
                <IonCard className="settings-card signout-card">
                  {/* <IonCardContent> */}
                  <IonButton
                    expand="block"
                    className="signout-button"
                    onClick={handleSignOut}
                  >
                    <IonIcon icon={logOutOutline} slot="start" />
                    <span>Cerrar Sesión</span>
                  </IonButton>
                  {/* </IonCardContent> */}
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>
        </div>
      </IonContent>
    </IonPage>
  );
}
