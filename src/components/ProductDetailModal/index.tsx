import { useState, useEffect } from "react";
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonChip,
  IonSpinner,
  useIonToast,
  useIonLoading,
} from "@ionic/react";
import {
  closeOutline,
  cartOutline,
  heartOutline,
  heart,
  starOutline,
  addOutline,
  removeOutline,
} from "ionicons/icons";

import { Product } from "../../services/products/types";
import { useUser } from "../../contexts/useUser";
import { useCart } from "../../contexts/CartContext";
import { readCachedTRM, usdToCop, formatCOP } from "../../utils/trm";
import { CustomInput } from "../CustomInput";
import "./ProductDetailModal.css";

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onAddToCart?: () => void;
}

export function ProductDetailModal({
  isOpen,
  onClose,
  product,
  onAddToCart,
}: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [trmValue, setTrmValue] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  const { user, profile } = useUser();
  const { addToCart } = useCart();
  const [showLoading, hideLoading] = useIonLoading();
  const [showToast] = useIonToast();

  useEffect(() => {
    if (isOpen && product) {
      setQuantity(1);
      const cached = readCachedTRM();
      setTrmValue(cached?.valor ?? null);
    }
  }, [isOpen, product]);

  const toggleFavorite = (productId: number) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

  const handleAddToCart = async () => {
    if (!product || !user || !profile) {
      await showToast({
        message: "Debes estar autenticado para agregar productos al carrito",
        duration: 3000,
        color: "warning",
      });
      return;
    }

    setIsAddingToCart(true);

    try {
      await showLoading({ message: "Agregando al carrito..." });

      // Add product to cart using context
      await addToCart(product.id!, quantity);

      await showToast({
        message: `${product.name} agregado al carrito`,
        duration: 2000,
        color: "success",
      });

      onAddToCart?.();
      onClose();
    } catch (error) {
      console.error("Error adding to cart:", error);
      await showToast({
        message: "Error al agregar al carrito",
        duration: 3000,
        color: "danger",
      });
    } finally {
      await hideLoading();
      setIsAddingToCart(false);
    }
  };

  const adjustQuantity = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantity(newQuantity);
    }
  };

  if (!product) return null;

  const isFavorite = favorites.has(product.id!);
  const copPrice = usdToCop(
    product.price,
    trmValue
      ? {
          unidad: "COP",
          valor: trmValue,
          vigenciadesde: "",
          vigenciahasta: "",
        }
      : null,
  );

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{product.name}</IonTitle>
          <IonButton
            fill="clear"
            slot="end"
            onClick={onClose}
            className="close-button"
          >
            <IonIcon icon={closeOutline} />
          </IonButton>
        </IonToolbar>
      </IonHeader>

      <IonContent className="product-detail-content">
        <div className="product-detail-container">
          {/* Product Image */}
          <div className="product-image-section">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="product-detail-image"
              />
            ) : (
              <div className="product-image-placeholder">
                <IonIcon icon={starOutline} />
              </div>
            )}

            <div className="product-overlay">
              <IonButton
                fill="clear"
                className="favorite-button"
                onClick={() => toggleFavorite(product.id!)}
              >
                <IonIcon
                  icon={isFavorite ? heart : heartOutline}
                  color={isFavorite ? "danger" : "light"}
                />
              </IonButton>

              {!product.available && (
                <IonChip color="danger" className="unavailable-chip">
                  Agotado
                </IonChip>
              )}
            </div>
          </div>

          {/* Product Info */}
          <IonCard className="product-info-card">
            <IonCardHeader>
              <IonCardTitle className="product-title">
                {product.name}
              </IonCardTitle>
              <IonCardSubtitle className="product-category">
                Categoría:{" "}
                {product.category_id
                  ? `Categoría ${product.category_id}`
                  : "Sin categoría"}
              </IonCardSubtitle>
            </IonCardHeader>

            <IonCardContent>
              {product.description && (
                <div className="product-description">
                  <h4>Descripción</h4>
                  <p>{product.description}</p>
                </div>
              )}

              {/* Price Section */}
              <div className="price-section">
                <h4>Precio</h4>
                <div className="price-display">
                  <div className="price-item">
                    <span className="price-currency"> Precio en USD: $</span>
                    <span className="price-amount">
                      {product.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="price-item">
                    <span className="price-currency"> Precio en COP: </span>
                    <span className="price-amount">{formatCOP(copPrice)}</span>
                  </div>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="quantity-section">
                <h4>Cantidad</h4>
                <div className="quantity-selector">
                  <IonButton
                    fill="outline"
                    size="small"
                    onClick={() => adjustQuantity(-1)}
                    disabled={quantity <= 1}
                  >
                    <IonIcon icon={removeOutline} />
                  </IonButton>

                  <div className="quantity-input-container">
                    <CustomInput
                      value={quantity.toString()}
                      onChange={(value) => {
                        const numValue = parseInt(value) || 1;
                        if (numValue >= 1 && numValue <= 99) {
                          setQuantity(numValue);
                        }
                      }}
                      type="number"
                      className="quantity-input"
                      minlength={1}
                      maxlength={2}
                    />
                  </div>

                  <IonButton
                    fill="outline"
                    size="small"
                    onClick={() => adjustQuantity(1)}
                    disabled={quantity >= 99}
                  >
                    <IonIcon icon={addOutline} />
                  </IonButton>
                </div>
              </div>

              {/* Add to Cart Button */}
              <div className="add-to-cart-section">
                <IonButton
                  expand="block"
                  fill="solid"
                  onClick={handleAddToCart}
                  disabled={!product.available || isAddingToCart}
                  className="add-to-cart-button"
                >
                  {isAddingToCart ? (
                    <IonSpinner name="crescent" />
                  ) : (
                    <>
                      <IonIcon icon={cartOutline} slot="start" />
                      {product.available
                        ? "Agregar al Carrito"
                        : "Producto Agotado"}
                    </>
                  )}
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonModal>
  );
}
