import { useState, useEffect, useMemo, useCallback } from "react";
import {
  IonButton,
  IonContent,
  IonIcon,
  IonLabel,
  IonList,
  IonPage,
  IonCard,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonChip,
  IonNote,
  IonSearchbar,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  useIonToast,
  useIonRouter,
} from "@ionic/react";
import {
  receiptOutline,
  checkmarkCircleOutline,
  timeOutline,
  alertCircleOutline,
} from "ionicons/icons";

import { OrderController, OrderWithItems, OrderStatus } from "../../services";
import { useUser } from "../../contexts/useUser";
import "./MyOrders.css";

export function MyOrdersPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    totalSpent: 0,
  });

  const { profile } = useUser();
  const orderController = useMemo(() => new OrderController(), []);
  const [showToast] = useIonToast();
  const router = useIonRouter();

  const loadData = useCallback(async () => {
    if (!profile) return;

    try {
      setIsLoading(true);
      const ordersData = await orderController.getOrdersByProfileId(profile.id);
      setOrders(ordersData);

      // Calculate statistics
      const stats = {
        totalOrders: ordersData.length,
        completedOrders: ordersData.filter(
          (o) => o.status === OrderStatus.COMPLETED
        ).length,
        pendingOrders: ordersData.filter(
          (o) => o.status === OrderStatus.PENDING
        ).length,
        totalSpent: ordersData.reduce((sum, order) => sum + order.total, 0),
      };
      setStatistics(stats);
    } catch (error) {
      console.error("Error loading orders:", error);
      await showToast({
        message: "Error al cargar los pedidos",
        duration: 3000,
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  }, [profile, orderController, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async (event: CustomEvent) => {
    try {
      await loadData();
      await showToast({
        message: "Pedidos actualizados",
        duration: 1500,
        color: "success",
      });
    } catch (error) {
      console.error("Error refreshing:", error);
      await showToast({
        message: "Error al actualizar los pedidos",
        duration: 3000,
        color: "danger",
      });
    } finally {
      event.detail.complete();
    }
  };

  // Filter orders based on search term
  const filteredOrders = useMemo(() => {
    if (!searchTerm.trim()) return orders;

    return orders.filter((order) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        order.id.toLowerCase().includes(searchLower) ||
        order.status.toLowerCase().includes(searchLower) ||
        order.items.some((item) =>
          item.product?.name?.toLowerCase().includes(searchLower)
        )
      );
    });
  }, [orders, searchTerm]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case OrderStatus.PENDING:
        return timeOutline;
      case OrderStatus.PAID:
        return checkmarkCircleOutline;
      case OrderStatus.SHIPPED:
        return checkmarkCircleOutline;
      case OrderStatus.COMPLETED:
        return checkmarkCircleOutline;
      case OrderStatus.CANCELLED:
        return alertCircleOutline;
      default:
        return alertCircleOutline;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case OrderStatus.PENDING:
        return "warning";
      case OrderStatus.PAID:
        return "success";
      case OrderStatus.SHIPPED:
        return "primary";
      case OrderStatus.COMPLETED:
        return "success";
      case OrderStatus.CANCELLED:
        return "danger";
      default:
        return "medium";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case OrderStatus.PENDING:
        return "Pendiente";
      case OrderStatus.PAID:
        return "Pagado";
      case OrderStatus.SHIPPED:
        return "Enviado";
      case OrderStatus.COMPLETED:
        return "Completado";
      case OrderStatus.CANCELLED:
        return "Cancelado";
      default:
        return "Desconocido";
    }
  };

  const navigateTo = (path: string) => {
    router.push(path, "forward");
  };

  if (!profile) {
    return (
      <IonPage>
        <IonContent fullscreen className="my-orders-page">
          <div className="access-denied">
            <IonIcon icon={receiptOutline} />
            <h2>Acceso Denegado</h2>
            <p>Debes iniciar sesión para ver tus pedidos.</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent fullscreen className="my-orders-page">
        {/* Decorative elements */}
        <div className="decoration decoration-1"></div>
        <div className="decoration decoration-2"></div>
        <div className="decoration decoration-3"></div>

        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        <div className="my-orders-container">
          {/* Header */}
          <div className="my-orders-header">
            <div className="header-content">
              <IonIcon icon={receiptOutline} className="header-icon" />
              <h1 className="header-title">Mis Pedidos</h1>
              <p className="header-subtitle">Historial de tus compras</p>

              <IonChip className="orders-chip">
                <IonIcon icon={receiptOutline} />
                <IonLabel>Comprador</IonLabel>
              </IonChip>
            </div>
          </div>

          {/* Statistics Cards */}
          <IonGrid className="stats-grid">
            <IonRow>
              <IonCol size="6" sizeMd="3">
                <IonCard className="stat-card">
                  <IonCardContent>
                    <div className="stat-content">
                      <IonIcon icon={receiptOutline} className="stat-icon" />
                      <div className="stat-info">
                        <h3>{statistics.totalOrders}</h3>
                        <p>Total Pedidos</p>
                      </div>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="6" sizeMd="3">
                <IonCard className="stat-card">
                  <IonCardContent>
                    <div className="stat-content">
                      <IonIcon
                        icon={checkmarkCircleOutline}
                        className="stat-icon"
                      />
                      <div className="stat-info">
                        <h3>{statistics.completedOrders}</h3>
                        <p>Completados</p>
                      </div>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="6" sizeMd="3">
                <IonCard className="stat-card">
                  <IonCardContent>
                    <div className="stat-content">
                      <IonIcon icon={timeOutline} className="stat-icon" />
                      <div className="stat-info">
                        <h3>{statistics.pendingOrders}</h3>
                        <p>Pendientes</p>
                      </div>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="6" sizeMd="3">
                <IonCard className="stat-card">
                  <IonCardContent>
                    <div className="stat-content">
                      <IonIcon icon={receiptOutline} className="stat-icon" />
                      <div className="stat-info">
                        <h3>${statistics.totalSpent.toFixed(2)}</h3>
                        <p>Total Gastado</p>
                      </div>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>

          {/* Actions */}
          <div className="actions-section">
            <IonButton
              expand="block"
              color="primary"
              onClick={() => navigateTo("/cart")}
              className="shop-button"
            >
              <IonIcon icon={receiptOutline} slot="start" />
              <span>Continuar Comprando</span>
            </IonButton>
          </div>

          {/* Search */}
          <div className="search-section">
            <IonSearchbar
              value={searchTerm}
              onIonInput={(e) => setSearchTerm(e.detail.value!)}
              placeholder="Buscar pedidos..."
              className="orders-searchbar"
            />
          </div>

          {/* Orders List */}
          <div className="orders-section">
            <h2 className="section-title">Historial de Pedidos</h2>
            {isLoading ? (
              <div className="loading-container">
                <IonSpinner name="crescent" />
                <p>Cargando pedidos...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="empty-state">
                <IonIcon icon={receiptOutline} />
                <h3>No hay pedidos</h3>
                <p>
                  {searchTerm
                    ? "No se encontraron pedidos que coincidan con la búsqueda"
                    : "Aún no has realizado ningún pedido"}
                </p>
                {!searchTerm && (
                  <IonButton
                    color="primary"
                    onClick={() => navigateTo("/home")}
                  >
                    <IonIcon icon={receiptOutline} slot="start" />
                    Comenzar a Comprar
                  </IonButton>
                )}
              </div>
            ) : (
              <IonList className="orders-list">
                {filteredOrders.map((order) => (
                  <IonCard key={order.id} className="order-card">
                    <IonCardContent>
                      <div className="order-header">
                        <div className="order-info">
                          <h3 className="order-id">
                            Pedido #{order.id.slice(-8)}
                          </h3>
                          <p className="order-date">
                            {new Date(order.created_at).toLocaleDateString(
                              "es-ES",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                        <div className="order-status">
                          <IonChip color={getStatusColor(order.status)}>
                            <IonIcon icon={getStatusIcon(order.status)} />
                            <IonLabel>{getStatusText(order.status)}</IonLabel>
                          </IonChip>
                        </div>
                      </div>

                      <div className="order-details">
                        <div className="detail-item">
                          <IonNote>Total</IonNote>
                          <span className="detail-value">
                            ${order.total.toFixed(2)}
                          </span>
                        </div>
                        <div className="detail-item">
                          <IonNote>Items</IonNote>
                          <span className="detail-value">
                            {order.items.length}
                          </span>
                        </div>
                        <div className="detail-item">
                          <IonNote>Estado</IonNote>
                          <span className="detail-value">
                            {getStatusText(order.status)}
                          </span>
                        </div>
                      </div>

                      <div className="order-items">
                        <h4>Productos:</h4>
                        <div className="items-list">
                          {order.items.slice(0, 3).map((item) => (
                            <div key={item.id} className="order-item">
                              <div className="item-image">
                                {item.product?.image_url ? (
                                  <img
                                    src={item.product.image_url}
                                    alt={item.product.name || "Producto"}
                                  />
                                ) : (
                                  <div className="no-image">
                                    <IonIcon icon={receiptOutline} />
                                  </div>
                                )}
                              </div>
                              <div className="item-info">
                                <p className="item-name">
                                  {item.product?.name || "Producto eliminado"}
                                </p>
                                <p className="item-quantity">
                                  Cantidad: {item.quantity}
                                </p>
                                <p className="item-price">
                                  ${item.price_at_purchase.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <div className="more-items">
                              <IonNote>
                                +{order.items.length - 3} productos más
                              </IonNote>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="order-actions">
                        {/* PDF invoice functionality removed */}
                      </div>
                    </IonCardContent>
                  </IonCard>
                ))}
              </IonList>
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}
