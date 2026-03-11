import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonBadge,
} from "@ionic/react";
import {
  homeOutline,
  settingsOutline,
  receiptOutline,
  cartOutline,
} from "ionicons/icons";
import { Route, Redirect } from "react-router-dom";
import { HomePage } from "../../pages/Home";
import { AccountPage } from "../../pages/Account";
import { SettingsPage } from "../../pages/Settings";
import { AdminPage } from "../../pages/Admin";
import { CreateProductPage } from "../../pages/CreateProduct";
import { CartPage } from "../../pages/Cart";
import { PayPalDemoPage } from "../../pages/PayPalDemo";
import { ProductManagementPage } from "../../pages/ProductManagement";
import { MyOrdersPage } from "../../pages/MyOrders";
import { MyInvoicesPage } from "../../pages/MyInvoices";
import { useUserPermissions } from "../../contexts/useUser";
import { useCart } from "../../contexts/CartContext";
import "./Navigation.css";

export function GlobalNavigation() {
  const permissions = useUserPermissions();
  const { cartItemCount } = useCart();

  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route exact path="/home">
          <HomePage />
        </Route>
        <Route exact path="/account">
          <AccountPage />
        </Route>
        <Route exact path="/settings">
          <SettingsPage />
        </Route>
        <Route exact path="/admin">
          <AdminPage />
        </Route>
        <Route exact path="/create-product">
          <CreateProductPage />
        </Route>
        <Route exact path="/cart">
          <CartPage />
        </Route>
        <Route exact path="/paypal-demo">
          <PayPalDemoPage />
        </Route>
        <Route exact path="/product-management">
          <ProductManagementPage />
        </Route>
        <Route exact path="/my-orders">
          <MyOrdersPage />
        </Route>
        <Route exact path="/my-invoices">
          <MyInvoicesPage />
        </Route>
        <Route exact path="/edit-product/:id">
          <CreateProductPage />
        </Route>
        <Route exact path="/">
          <Redirect to="/home" />
        </Route>
      </IonRouterOutlet>

      <IonTabBar slot="bottom" className="custom-tab-bar">
        <IonTabButton tab="home" href="/home">
          <IonIcon icon={homeOutline} />
          <IonLabel>Inicio</IonLabel>
        </IonTabButton>

        <IonTabButton tab="cart" href="/cart">
          <IonIcon icon={cartOutline} />
          <IonLabel>Carrito</IonLabel>
          {cartItemCount > 0 && (
            <IonBadge color="danger" className="cart-badge">
              {cartItemCount}
            </IonBadge>
          )}
        </IonTabButton>

        {permissions.isAdmin && (
          <IonTabButton tab="admin" href="/admin">
            <IonIcon icon={receiptOutline} />
            <IonLabel>Admin</IonLabel>
          </IonTabButton>
        )}

        <IonTabButton tab="settings" href="/settings">
          <IonIcon icon={settingsOutline} />
          <IonLabel>Configuración</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
}
