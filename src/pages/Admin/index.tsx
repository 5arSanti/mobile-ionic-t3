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
  IonSegment,
  IonSegmentButton,
  IonSearchbar,
  IonRefresher,
  IonRefresherContent,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonSpinner,
  useIonToast,
  useIonLoading,
} from "@ionic/react";
import {
  receiptOutline,
  analyticsOutline,
  checkmarkCircleOutline,
  timeOutline,
  alertCircleOutline,
} from "ionicons/icons";

import { useUserPermissions } from "../../contexts/useUser";
import {
  OrderController,
  InvoiceController,
  OrderWithItems,
  InvoiceWithOrder,
  OrderStatus,
} from "../../services";
import { UserRole } from "../../services/enums";
import "./Admin.css";

export function AdminPage() {
  const [selectedSegment, setSelectedSegment] = useState("orders");
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [invoices, setInvoices] = useState<InvoiceWithOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalInvoices: 0,
    invoiceRevenue: 0,
  });

  const permissions = useUserPermissions();
  const orderController = useMemo(() => new OrderController(), []);
  const invoiceController = useMemo(() => new InvoiceController(), []);
  const [showToast] = useIonToast();
  const [showLoading, hideLoading] = useIonLoading();

  // Check if user has permission to view orders and invoices
  const canViewOrdersAndInvoices =
    permissions.userRole === UserRole.ADMIN ||
    permissions.userRole === UserRole.SELLER;

  const loadData = useCallback(async () => {
    if (!canViewOrdersAndInvoices) return;

    try {
      setIsLoading(true);
      const [ordersData, invoicesData, orderStats, invoiceStats] =
        await Promise.all([
          orderController.getAllOrders(),
          invoiceController.getAllInvoices(),
          orderController.getOrderStatistics(),
          invoiceController.getInvoiceStatistics(),
        ]);

      setOrders(ordersData);
      setInvoices(invoicesData);
      setStatistics({
        totalOrders: orderStats.totalOrders,
        completedOrders: orderStats.completedOrders,
        pendingOrders: orderStats.pendingOrders,
        totalRevenue: orderStats.totalRevenue,
        totalInvoices: invoiceStats.totalInvoices,
        invoiceRevenue: invoiceStats.totalRevenue,
      });
    } catch (error) {
      console.error("Error loading admin data:", error);
      await showToast({
        message: "Error al cargar los datos",
        duration: 3000,
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  }, [canViewOrdersAndInvoices, orderController, invoiceController, showToast]);

  useEffect(() => {
    loadData();
  }, [canViewOrdersAndInvoices, loadData]);

  const handleRefresh = async (event: CustomEvent) => {
    try {
      await loadData();
      await showToast({
        message: "Datos actualizados",
        duration: 1500,
        color: "success",
      });
    } catch (error) {
      console.error("Error refreshing:", error);
      await showToast({
        message: "Error al actualizar los datos",
        duration: 3000,
        color: "danger",
      });
    } finally {
      event.detail.complete();
    }
  };

  // Filter orders and invoices based on search term
  const filteredOrders = useMemo(() => {
    if (!searchTerm.trim()) return orders;

    return orders.filter((order) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        order.id.toLowerCase().includes(searchLower) ||
        order.profile?.username.toLowerCase().includes(searchLower) ||
        order.profile?.full_name?.toLowerCase().includes(searchLower) ||
        order.status.toLowerCase().includes(searchLower)
      );
    });
  }, [orders, searchTerm]);

  const filteredInvoices = useMemo(() => {
    if (!searchTerm.trim()) return invoices;

    return invoices.filter((invoice) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        invoice.id.toString().includes(searchLower) ||
        invoice.order_id.toLowerCase().includes(searchLower) ||
        invoice.order.profile?.username.toLowerCase().includes(searchLower) ||
        invoice.order.profile?.full_name?.toLowerCase().includes(searchLower)
      );
    });
  }, [invoices, searchTerm]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return timeOutline;
      case "paid":
        return checkmarkCircleOutline;
      case "shipped":
        return checkmarkCircleOutline;
      case "completed":
        return checkmarkCircleOutline;
      default:
        return alertCircleOutline;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "warning";
      case "paid":
        return "success";
      case "shipped":
        return "primary";
      case "completed":
        return "success";
      default:
        return "danger";
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

  const handleProcessOrder = async (orderId: string) => {
    try {
      await showLoading({ message: "Procesando pedido..." });
      await orderController.processOrder(orderId);
      await loadData();
      await showToast({
        message: "Pedido procesado exitosamente",
        duration: 2000,
        color: "success",
      });
    } catch (error) {
      console.error("Error processing order:", error);
      await showToast({
        message: "Error al procesar el pedido",
        duration: 3000,
        color: "danger",
      });
    } finally {
      await hideLoading();
    }
  };

  const handleShipOrder = async (orderId: string) => {
    try {
      await showLoading({ message: "Marcando como enviado..." });
      await orderController.shipOrder(orderId);
      await loadData();
      await showToast({
        message: "Pedido marcado como enviado",
        duration: 2000,
        color: "success",
      });
    } catch (error) {
      console.error("Error shipping order:", error);
      await showToast({
        message: "Error al marcar como enviado",
        duration: 3000,
        color: "danger",
      });
    } finally {
      await hideLoading();
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
    try {
      await showLoading({ message: "Completando pedido..." });
      await orderController.completeOrder(orderId);
      await loadData();
      await showToast({
        message: "Pedido completado exitosamente",
        duration: 2000,
        color: "success",
      });
    } catch (error) {
      console.error("Error completing order:", error);
      await showToast({
        message: "Error al completar el pedido",
        duration: 3000,
        color: "danger",
      });
    } finally {
      await hideLoading();
    }
  };

  const handleGenerateInvoice = async (orderId: string) => {
    try {
      await showLoading({ message: "Generando factura..." });
      await invoiceController.generateInvoiceForOrder(orderId);
      await loadData();
      await showToast({
        message: "Factura generada exitosamente",
        duration: 2000,
        color: "success",
      });
    } catch (error) {
      console.error("Error generating invoice:", error);
      await showToast({
        message: "Error al generar la factura",
        duration: 3000,
        color: "danger",
      });
    } finally {
      await hideLoading();
    }
  };

  // Check if user has permission to view orders and invoices
  if (!canViewOrdersAndInvoices) {
    return (
      <IonPage>
        <IonContent fullscreen className="admin-page">
          <div className="access-denied">
            <IonIcon icon={alertCircleOutline} />
            <h2>Acceso Denegado</h2>
            <p>No tienes permisos para acceder a esta sección.</p>
            <p>
              Solo administradores y vendedores pueden ver pedidos y facturas.
            </p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent fullscreen className="admin-page">
        {/* Decorative elements */}
        <div className="decoration decoration-1"></div>
        <div className="decoration decoration-2"></div>
        <div className="decoration decoration-3"></div>

        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        <div className="admin-container">
          {/* Header */}
          <div className="admin-header">
            <div className="header-content">
              <IonIcon icon={receiptOutline} className="header-icon" />
              <h1 className="header-title">Panel de Administración</h1>
              <p className="header-subtitle">
                Gestiona pedidos, facturas y analíticas
              </p>

              <IonChip className="admin-chip">
                <IonIcon icon={analyticsOutline} />
                <IonLabel>
                  {permissions.userRole === UserRole.ADMIN &&
                    "Administrador"}
                  {permissions.userRole === UserRole.SELLER && "Vendedor"}
                </IonLabel>
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
                        <p>Pedidos Totales</p>
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
                      <IonIcon icon={analyticsOutline} className="stat-icon" />
                      <div className="stat-info">
                        <h3>${statistics.totalRevenue.toFixed(2)}</h3>
                        <p>Ingresos</p>
                      </div>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>

          {/* Search and Filter */}
          <div className="search-section">
            <IonSearchbar
              value={searchTerm}
              onIonInput={(e) => setSearchTerm(e.detail.value!)}
              placeholder="Buscar pedidos o facturas..."
              className="admin-searchbar"
            />
          </div>

          {/* Segment Control */}
          <div className="segment-section">
            <IonSegment
              value={selectedSegment}
              onIonChange={(e) => setSelectedSegment(e.detail.value as string)}
              className="admin-segment"
            >
              <IonSegmentButton value="orders">
                <IonLabel>Pedidos</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="invoices">
                <IonLabel>Facturas</IonLabel>
              </IonSegmentButton>
            </IonSegment>
          </div>

          {/* Content based on selected segment */}
          {selectedSegment === "orders" && (
            <div className="content-section">
              <h2 className="section-title">Gestión de Pedidos</h2>
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
                    No se encontraron pedidos que coincidan con los criterios de
                    búsqueda
                  </p>
                </div>
              ) : (
                <IonList className="admin-list">
                  {filteredOrders.map((order) => (
                    <IonCard key={order.id} className="admin-item-card">
                      <IonCardContent>
                        <div className="item-header">
                          <div className="item-info">
                            <h3 className="item-title">{order.id}</h3>
                            <p className="item-subtitle">
                              {order.profile?.full_name ||
                                order.profile?.username ||
                                "Usuario"}
                            </p>
                            <p className="item-email">
                              {order.profile?.username &&
                                `@${order.profile.username}`}
                            </p>
                          </div>
                          <div className="item-status">
                            <IonChip color={getStatusColor(order.status)}>
                              <IonIcon icon={getStatusIcon(order.status)} />
                              <IonLabel>{getStatusText(order.status)}</IonLabel>
                            </IonChip>
                          </div>
                        </div>

                        <div className="item-details">
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
                            <IonNote>Fecha</IonNote>
                            <span className="detail-value">
                              {new Date(order.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="item-actions">
                          {order.status === OrderStatus.PENDING && (
                            <IonButton
                              size="small"
                              color="primary"
                              onClick={() => handleProcessOrder(order.id)}
                            >
                              Procesar
                            </IonButton>
                          )}
                          {order.status === OrderStatus.PAID && (
                            <IonButton
                              size="small"
                              color="secondary"
                              onClick={() => handleShipOrder(order.id)}
                            >
                              Enviar
                            </IonButton>
                          )}
                          {order.status === OrderStatus.SHIPPED && (
                            <IonButton
                              size="small"
                              color="success"
                              onClick={() => handleCompleteOrder(order.id)}
                            >
                              Completar
                            </IonButton>
                          )}
                          {order.status === OrderStatus.COMPLETED && (
                            <IonButton
                              size="small"
                              color="tertiary"
                              onClick={() => handleGenerateInvoice(order.id)}
                            >
                              Generar Factura
                            </IonButton>
                          )}
                        </div>
                      </IonCardContent>
                    </IonCard>
                  ))}
                </IonList>
              )}
            </div>
          )}

          {selectedSegment === "invoices" && (
            <div className="content-section">
              <h2 className="section-title">Gestión de Facturas</h2>
              {isLoading ? (
                <div className="loading-container">
                  <IonSpinner name="crescent" />
                  <p>Cargando facturas...</p>
                </div>
              ) : filteredInvoices.length === 0 ? (
                <div className="empty-state">
                  <IonIcon icon={receiptOutline} />
                  <h3>No hay facturas</h3>
                  <p>
                    No se encontraron facturas que coincidan con los criterios
                    de búsqueda
                  </p>
                </div>
              ) : (
                <IonList className="admin-list">
                  {filteredInvoices.map((invoice) => (
                    <IonCard key={invoice.id} className="admin-item-card">
                      <IonCardContent>
                        <div className="item-header">
                          <div className="item-info">
                            <h3 className="item-title">#{invoice.id}</h3>
                            <p className="item-subtitle">
                              {invoice.order.profile?.full_name ||
                                invoice.order.profile?.username ||
                                "Usuario"}
                            </p>
                            <p className="item-email">
                              Pedido: {invoice.order_id}
                            </p>
                          </div>
                          <div className="item-status">
                            <IonChip
                              color={getStatusColor(invoice.order.status)}
                            >
                              <IonIcon
                                icon={getStatusIcon(invoice.order.status)}
                              />
                              <IonLabel>
                                {getStatusText(invoice.order.status)}
                              </IonLabel>
                            </IonChip>
                          </div>
                        </div>

                        <div className="item-details">
                          <div className="detail-item">
                            <IonNote>Total</IonNote>
                            <span className="detail-value">
                              ${invoice.total.toFixed(2)}
                            </span>
                          </div>
                          <div className="detail-item">
                            <IonNote>Emitida</IonNote>
                            <span className="detail-value">
                              {new Date(invoice.issued_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="detail-item">
                            <IonNote>Items</IonNote>
                            <span className="detail-value">
                              {invoice.order.items.length}
                            </span>
                          </div>
                        </div>

                        <div className="item-actions">
                          <IonButton size="small" color="primary">
                            Reenviar
                          </IonButton>
                        </div>
                      </IonCardContent>
                    </IonCard>
                  ))}
                </IonList>
              )}
            </div>
          )}

          <IonInfiniteScroll>
            <IonInfiniteScrollContent></IonInfiniteScrollContent>
          </IonInfiniteScroll>
        </div>
      </IonContent>
    </IonPage>
  );
}
