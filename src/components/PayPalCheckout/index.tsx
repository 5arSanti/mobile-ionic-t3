import { useState, useEffect } from "react";
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonSpinner,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle, useIonToast,
  useIonLoading
} from "@ionic/react";
import {
  closeOutline, cardOutline,
  logoPaypal
} from "ionicons/icons";

import { CartWithItems } from "../../services";
import { PayPalService } from "../../services/paypal/PayPalService";
import { readCachedTRM, usdToCop, formatCOP } from "../../utils/trm";
import "./PayPalCheckout.css";

interface PayPalCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartWithItems | null;
}

export function PayPalCheckout({ isOpen, onClose, cart }: PayPalCheckoutProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [trmValue, setTrmValue] = useState<number | null>(null);
  const [showToast] = useIonToast();
  const [showLoading, hideLoading] = useIonLoading();
  const paypalService = new PayPalService();

  useEffect(() => {
    if (isOpen) {
      const cached = readCachedTRM();
      setTrmValue(cached?.valor ?? null);
    }
  }, [isOpen]);

  const calculateTotals = () => {
    if (!cart || !cart.items) return { totalPrice: 0, totalPriceCOP: 0 };

    const totalPrice = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );
    const totalPriceCOP = usdToCop(
      totalPrice,
      trmValue
        ? {
            unidad: "COP",
            valor: trmValue,
            vigenciadesde: "",
            vigenciahasta: "",
          }
        : null,
    );

    return { totalPrice, totalPriceCOP };
  };

  const totals = calculateTotals();

  const handlePayPalPayment = async () => {
    if (!cart || !cart.items.length) {
      await showToast({
        message: "No hay productos en el carrito",
        duration: 3000,
        color: "danger",
      });
      return;
    }

    setIsProcessing(true);
    await showLoading({ message: "Redirigiendo a PayPal..." });

    try {
      // Create PayPal payment link with simulated PayPal interface
      const paymentDetails = paypalService.createSimulatedPayPalLink(
        cart,
        totals.totalPrice,
        "USD",
      );

      // Show success message before redirect
      await showToast({
        message: "Redirigiendo a PayPal...",
        duration: 1500,
        color: "success",
      });

      // Redirect to simulated PayPal interface
      window.location.href = paymentDetails.paymentUrl;
    } catch (error) {
      console.error("Error creating PayPal payment:", error);
      await showToast({
        message: "Error al crear el pago con PayPal",
        duration: 3000,
        color: "danger",
      });
      setIsProcessing(false);
      await hideLoading();
    }
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} className="paypal-modal">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Pago con PayPal</IonTitle>
          <IonButton
            fill="clear"
            slot="end"
            onClick={onClose}
            disabled={isProcessing}
          >
            <IonIcon icon={closeOutline} />
          </IonButton>
        </IonToolbar>
      </IonHeader>

      <IonContent className="paypal-content">
        <div className="paypal-container">
          {/* PayPal Header */}
          <div className="paypal-header">
            <IonIcon icon={logoPaypal} className="paypal-logo" />
            <h2>Pago Seguro con PayPal</h2>
            <p>Tu información está protegida</p>
          </div>

          {/* Order Summary */}
          <IonCard className="order-summary-card">
            <IonCardHeader>
              <IonCardTitle>Resumen del Pedido</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              {cart?.items.map((item) => (
                <div key={item.id} className="order-item">
                  <div className="item-info">
                    <span className="item-name">{item.product.name}</span>
                    <span className="item-quantity">x{item.quantity}</span>
                  </div>
                  <div className="item-price">
                    ${(item.product.price * item.quantity).toFixed(2)} USD
                  </div>
                </div>
              ))}

              <div className="order-totals">
                <div className="total-row">
                  <span>Subtotal:</span>
                  <span>${totals.totalPrice.toFixed(2)} USD</span>
                </div>
                <div className="total-row">
                  <span>Total en COP:</span>
                  <span className="cop-total">
                    {formatCOP(totals.totalPriceCOP)}
                  </span>
                </div>
                <div className="total-divider"></div>
                <div className="total-row final-total">
                  <span>Total a Pagar:</span>
                  <span className="final-amount">
                    {formatCOP(totals.totalPriceCOP)}
                  </span>
                </div>
              </div>
            </IonCardContent>
          </IonCard>

          {/* Payment Information */}
          <IonCard className="payment-info-card">
            <IonCardContent>
              <div className="payment-info">
                <IonIcon icon={cardOutline} className="payment-icon" />
                <div className="payment-details">
                  <h3>Información de Pago</h3>
                  <p>
                    Serás redirigido a una interfaz simulada de PayPal donde
                    podrás ver el monto real. No se procesará ningún pago real.
                  </p>
                </div>
              </div>
            </IonCardContent>
          </IonCard>

          {/* Payment Button */}
          <div className="payment-actions">
            <IonButton
              expand="block"
              fill="solid"
              className="paypal-button"
              onClick={handlePayPalPayment}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <IonSpinner name="crescent" />
                  <span>Redirigiendo...</span>
                </>
              ) : (
                <>
                  <IonIcon icon={logoPaypal} slot="start" />
                  <span>Ir a PayPal</span>
                </>
              )}
            </IonButton>

            <IonButton
              expand="block"
              fill="outline"
              onClick={onClose}
              disabled={isProcessing}
              className="cancel-button"
            >
              Cancelar
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonModal>
  );
}
