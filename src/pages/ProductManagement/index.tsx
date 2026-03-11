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
  useIonLoading,
  useIonRouter,
} from "@ionic/react";
import {
  listOutline,
  addOutline,
  createOutline,
  trashOutline,
  eyeOutline,
  storefrontOutline,
  analyticsOutline,
} from "ionicons/icons";

import { ProductController, Product, UserRole } from "../../services";
import { useUserPermissions } from "../../contexts/useUser";
import "./ProductManagement.css";

export function ProductManagementPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    totalProducts: 0,
    availableProducts: 0,
    unavailableProducts: 0,
  });

  const permissions = useUserPermissions();
  const productController = useMemo(() => new ProductController(), []);
  const [showToast] = useIonToast();
  const [showLoading, hideLoading] = useIonLoading();
  const router = useIonRouter();

  // Check if user has permission to manage products
  const canManageProducts =
    permissions.userRole === "admin" || permissions.userRole === "seller";

  const loadData = useCallback(async () => {
    if (!canManageProducts) return;

    try {
      setIsLoading(true);
      const productsData = await productController.getAllProducts();
      setProducts(productsData);

      // Calculate statistics
      const stats = {
        totalProducts: productsData.length,
        availableProducts: productsData.filter((p) => p.available).length,
        unavailableProducts: productsData.filter((p) => !p.available).length,
      };
      setStatistics(stats);
    } catch (error) {
      console.error("Error loading products:", error);
      await showToast({
        message: "Error al cargar los productos",
        duration: 3000,
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  }, [canManageProducts, productController, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async (event: CustomEvent) => {
    try {
      await loadData();
      await showToast({
        message: "Productos actualizados",
        duration: 1500,
        color: "success",
      });
    } catch (error) {
      console.error("Error refreshing:", error);
      await showToast({
        message: "Error al actualizar los productos",
        duration: 3000,
        color: "danger",
      });
    } finally {
      event.detail.complete();
    }
  };

  // Filter products based on search term
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;

    return products.filter((product) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        product.name.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower)
      );
    });
  }, [products, searchTerm]);

  const handleDeleteProduct = async (productId: number) => {
    try {
      await showLoading({ message: "Eliminando producto..." });
      await productController.deleteProduct(productId);
      await loadData();
      await showToast({
        message: "Producto eliminado exitosamente",
        duration: 2000,
        color: "success",
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      await showToast({
        message: "Error al eliminar el producto",
        duration: 3000,
        color: "danger",
      });
    } finally {
      await hideLoading();
    }
  };

  const handleToggleAvailability = async (
    productId: number,
    currentStatus: boolean
  ) => {
    try {
      await showLoading({ message: "Actualizando estado..." });
      await productController.update(productId, {
        available: !currentStatus,
      });
      await loadData();
      await showToast({
        message: `Producto ${!currentStatus ? "activado" : "desactivado"}`,
        duration: 2000,
        color: "success",
      });
    } catch (error) {
      console.error("Error updating product:", error);
      await showToast({
        message: "Error al actualizar el producto",
        duration: 3000,
        color: "danger",
      });
    } finally {
      await hideLoading();
    }
  };

  const navigateTo = (path: string) => {
    router.push(path, "forward");
  };

  // Check if user has permission to manage products
  if (!canManageProducts) {
    return (
      <IonPage>
        <IonContent fullscreen className="product-management-page">
          <div className="access-denied">
            <IonIcon icon={listOutline} />
            <h2>Acceso Denegado</h2>
            <p>No tienes permisos para gestionar productos.</p>
            <p>
              Solo administradores y vendedores pueden acceder a esta sección.
            </p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent fullscreen className="product-management-page">
        {/* Decorative elements */}
        <div className="decoration decoration-1"></div>
        <div className="decoration decoration-2"></div>
        <div className="decoration decoration-3"></div>

        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        <div className="product-management-container">
          {/* Header */}
          <div className="product-management-header">
            <div className="header-content">
              <IonIcon icon={listOutline} className="header-icon" />
              <h1 className="header-title">Gestión de Productos</h1>
              <p className="header-subtitle">
                Administra tu catálogo de productos
              </p>

              <IonChip className="management-chip">
                <IonIcon icon={storefrontOutline} />
                <IonLabel>
                  {permissions.userRole === UserRole.ADMIN && "Administrador"}
                  {permissions.userRole === UserRole.SELLER && "Vendedor"}
                </IonLabel>
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
                      <IonIcon icon={listOutline} className="stat-icon" />
                      <div className="stat-info">
                        <h3>{statistics.totalProducts}</h3>
                        <p>Total</p>
                      </div>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="4">
                <IonCard className="stat-card">
                  <IonCardContent>
                    <div className="stat-content">
                      <IonIcon icon={eyeOutline} className="stat-icon" />
                      <div className="stat-info">
                        <h3>{statistics.availableProducts}</h3>
                        <p>Disponibles</p>
                      </div>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="4">
                <IonCard className="stat-card">
                  <IonCardContent>
                    <div className="stat-content">
                      <IonIcon icon={analyticsOutline} className="stat-icon" />
                      <div className="stat-info">
                        <h3>{statistics.unavailableProducts}</h3>
                        <p>No Disponibles</p>
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
              onClick={() => navigateTo("/create-product")}
              className="add-product-button"
            >
              <IonIcon icon={addOutline} slot="start" />
              <span>Agregar Producto</span>
            </IonButton>
          </div>

          {/* Search */}
          <div className="search-section">
            <IonSearchbar
              value={searchTerm}
              onIonInput={(e) => setSearchTerm(e.detail.value!)}
              placeholder="Buscar productos..."
              className="product-searchbar"
            />
          </div>

          {/* Products List */}
          <div className="products-section">
            <h2 className="section-title">Mis Productos</h2>
            {isLoading ? (
              <div className="loading-container">
                <IonSpinner name="crescent" />
                <p>Cargando productos...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="empty-state">
                <IonIcon icon={listOutline} />
                <h3>No hay productos</h3>
                <p>
                  {searchTerm
                    ? "No se encontraron productos que coincidan con la búsqueda"
                    : "Aún no has creado ningún producto"}
                </p>
                {!searchTerm && (
                  <IonButton
                    color="primary"
                    onClick={() => navigateTo("/create-product")}
                  >
                    <IonIcon icon={addOutline} slot="start" />
                    Crear Primer Producto
                  </IonButton>
                )}
              </div>
            ) : (
              <IonList className="products-list">
                {filteredProducts.map((product) => (
                  <IonCard key={product.id} className="product-card">
                    <IonCardContent>
                      <div className="product-header">
                        <div className="product-image">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} />
                          ) : (
                            <div className="no-image">
                              <IonIcon icon={storefrontOutline} />
                            </div>
                          )}
                        </div>
                        <div className="product-info">
                          <h3 className="product-name">{product.name}</h3>
                          <p className="product-description">
                            {product.description || "Sin descripción"}
                          </p>
                          <div className="product-details">
                            <IonChip
                              color={product.available ? "success" : "warning"}
                            >
                              <IonLabel>
                                {product.available
                                  ? "Disponible"
                                  : "No Disponible"}
                              </IonLabel>
                            </IonChip>
                            <IonNote className="product-price">
                              ${product.price.toFixed(2)}
                            </IonNote>
                          </div>
                        </div>
                      </div>

                      <div className="product-actions">
                        <IonButton
                          size="small"
                          fill="outline"
                          onClick={() =>
                            handleToggleAvailability(
                              product.id!,
                              product.available
                            )
                          }
                        >
                          <IonIcon icon={eyeOutline} slot="start" />
                          {product.available ? "Desactivar" : "Activar"}
                        </IonButton>
                        <IonButton
                          size="small"
                          fill="outline"
                          onClick={() =>
                            navigateTo(`/edit-product/${product.id}`)
                          }
                        >
                          <IonIcon icon={createOutline} slot="start" />
                          Editar
                        </IonButton>
                        <IonButton
                          size="small"
                          color="danger"
                          fill="outline"
                          onClick={() => handleDeleteProduct(product.id!)}
                        >
                          <IonIcon icon={trashOutline} slot="start" />
                          Eliminar
                        </IonButton>
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
