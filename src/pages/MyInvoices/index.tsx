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
  documentTextOutline,
} from "ionicons/icons";

import { InvoiceController, InvoiceWithOrder } from "../../services";
import { useUser } from "../../contexts/useUser";
import "./MyInvoices.css";

export function MyInvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceWithOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    totalInvoices: 0,
    totalAmount: 0,
    averageAmount: 0,
  });

  const { profile } = useUser();
  const invoiceController = useMemo(() => new InvoiceController(), []);
  const [showToast] = useIonToast();
  const router = useIonRouter();

  const loadData = useCallback(async () => {
    if (!profile) return;

    try {
      setIsLoading(true);
      const invoicesData = await invoiceController.getInvoicesByProfileId(
        profile.id
      );
      setInvoices(invoicesData);

      // Calculate statistics
      const stats = {
        totalInvoices: invoicesData.length,
        totalAmount: invoicesData.reduce(
          (sum, invoice) => sum + invoice.total,
          0
        ),
        averageAmount:
          invoicesData.length > 0
            ? invoicesData.reduce((sum, invoice) => sum + invoice.total, 0) /
              invoicesData.length
            : 0,
      };
      setStatistics(stats);
    } catch (error) {
      console.error("Error loading invoices:", error);
      await showToast({
        message: "Error al cargar las facturas",
        duration: 3000,
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  }, [profile, invoiceController, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async (event: CustomEvent) => {
    try {
      await loadData();
      await showToast({
        message: "Facturas actualizadas",
        duration: 1500,
        color: "success",
      });
    } catch (error) {
      console.error("Error refreshing:", error);
      await showToast({
        message: "Error al actualizar las facturas",
        duration: 3000,
        color: "danger",
      });
    } finally {
      event.detail.complete();
    }
  };

  // Filter invoices based on search term
  const filteredInvoices = useMemo(() => {
    if (!searchTerm.trim()) return invoices;

    return invoices.filter((invoice) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        invoice.id.toString().includes(searchLower) ||
        invoice.order_id.toLowerCase().includes(searchLower) ||
        invoice.order.items.some((item) =>
          item.product?.name?.toLowerCase().includes(searchLower)
        )
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
      case "cancelled":
        return alertCircleOutline;
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
      case "cancelled":
        return "danger";
      default:
        return "medium";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "paid":
        return "Pagado";
      case "shipped":
        return "Enviado";
      case "completed":
        return "Completado";
      case "cancelled":
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
        <IonContent fullscreen className="my-invoices-page">
          <div className="access-denied">
            <IonIcon icon={documentTextOutline} />
            <h2>Acceso Denegado</h2>
            <p>Debes iniciar sesión para ver tus facturas.</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent fullscreen className="my-invoices-page">
        {/* Decorative elements */}
        <div className="decoration decoration-1"></div>
        <div className="decoration decoration-2"></div>
        <div className="decoration decoration-3"></div>

        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        <div className="my-invoices-container">
          {/* Header */}
          <div className="my-invoices-header">
            <div className="header-content">
              <IonIcon icon={documentTextOutline} className="header-icon" />
              <h1 className="header-title">Mis Facturas</h1>
              <p className="header-subtitle">Historial de tus facturas</p>

              <IonChip className="invoices-chip">
                <IonIcon icon={documentTextOutline} />
                <IonLabel>Comprador</IonLabel>
              </IonChip>
            </div>
          </div>

          {/* Statistics Cards */}
          <IonGrid className="stats-grid">
            <IonRow>
              <IonCol size="4">
                <IonCard className="stat-card">
                  <IonCardContent>
                    <div className="stat-content">
                      <IonIcon
                        icon={documentTextOutline}
                        className="stat-icon"
                      />
                      <div className="stat-info">
                        <h3>{statistics.totalInvoices}</h3>
                        <p>Total Facturas</p>
                      </div>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="4">
                <IonCard className="stat-card">
                  <IonCardContent>
                    <div className="stat-content">
                      <IonIcon icon={receiptOutline} className="stat-icon" />
                      <div className="stat-info">
                        <h3>${statistics.totalAmount.toFixed(2)}</h3>
                        <p>Total Facturado</p>
                      </div>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="4">
                <IonCard className="stat-card">
                  <IonCardContent>
                    <div className="stat-content">
                      <IonIcon
                        icon={checkmarkCircleOutline}
                        className="stat-icon"
                      />
                      <div className="stat-info">
                        <h3>${statistics.averageAmount.toFixed(2)}</h3>
                        <p>Promedio</p>
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
              onClick={() => navigateTo("/my-orders")}
              className="orders-button"
            >
              <IonIcon icon={receiptOutline} slot="start" />
              <span>Ver Mis Pedidos</span>
            </IonButton>
          </div>

          {/* Search */}
          <div className="search-section">
            <IonSearchbar
              value={searchTerm}
              onIonInput={(e) => setSearchTerm(e.detail.value!)}
              placeholder="Buscar facturas..."
              className="invoices-searchbar"
            />
          </div>

          {/* Invoices List */}
          <div className="invoices-section">
            <h2 className="section-title">Historial de Facturas</h2>
            {isLoading ? (
              <div className="loading-container">
                <IonSpinner name="crescent" />
                <p>Cargando facturas...</p>
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="empty-state">
                <IonIcon icon={documentTextOutline} />
                <h3>No hay facturas</h3>
                <p>
                  {searchTerm
                    ? "No se encontraron facturas que coincidan con la búsqueda"
                    : "Aún no tienes facturas generadas"}
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
              <IonList className="invoices-list">
                {filteredInvoices.map((invoice) => (
                  <IonCard key={invoice.id} className="invoice-card">
                    <IonCardContent>
                      <div className="invoice-header">
                        <div className="invoice-info">
                          <h3 className="invoice-id">Factura #{invoice.id}</h3>
                          <p className="invoice-date">
                            {new Date(invoice.issued_at).toLocaleDateString(
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
                          <p className="invoice-order">
                            Pedido: #{invoice.order_id.slice(-8)}
                          </p>
                        </div>
                        <div className="invoice-status">
                          <IonChip color={getStatusColor(invoice.order.status)}>
                            <IonIcon
                              icon={getStatusIcon(invoice.order.status)}
                            />
                            <IonLabel>
                              {getStatusText(invoice.order.status)}
                            </IonLabel>
                          </IonChip>
                        </div>
                      </div>

                      <div className="invoice-details">
                        <div className="detail-item">
                          <IonNote>Total Facturado</IonNote>
                          <span className="detail-value">
                            ${invoice.total.toFixed(2)}
                          </span>
                        </div>
                        <div className="detail-item">
                          <IonNote>Items</IonNote>
                          <span className="detail-value">
                            {invoice.order.items.length}
                          </span>
                        </div>
                        <div className="detail-item">
                          <IonNote>Estado</IonNote>
                          <span className="detail-value">
                            {getStatusText(invoice.order.status)}
                          </span>
                        </div>
                      </div>

                      <div className="invoice-items">
                        <h4>Productos Facturados:</h4>
                        <div className="items-list">
                          {invoice.order.items.slice(0, 3).map((item) => (
                            <div key={item.id} className="invoice-item">
                              <div className="item-image">
                                {item.product?.image_url ? (
                                  <img
                                    src={item.product.image_url}
                                    alt={item.product.name || "Producto"}
                                  />
                                ) : (
                                  <div className="no-image">
                                    <IonIcon icon={documentTextOutline} />
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
                          {invoice.order.items.length > 3 && (
                            <div className="more-items">
                              <IonNote>
                                +{invoice.order.items.length - 3} productos más
                              </IonNote>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="invoice-actions">
                        {/* PDF download functionality removed */}
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
