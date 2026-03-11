import { useState, useEffect } from "react";
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonSpinner,
} from "@ionic/react";
import {
  logoPaypal, arrowBackOutline,
  cardOutline
} from "ionicons/icons";
import { useIonRouter } from "@ionic/react";
import "./PayPalDemo.css";

export function PayPalDemoPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [amount, setAmount] = useState<number>(0);
  const [currency, setCurrency] = useState<string>("USD");
  const [orderId, setOrderId] = useState<string>("");
  const router = useIonRouter();

  useEffect(() => {
    // Get parameters from URL
    const urlParams = new URLSearchParams(window.location.search);
    const amountParam = urlParams.get("amount");
    const currencyParam = urlParams.get("currency");
    const orderParam = urlParams.get("order");

    if (amountParam) setAmount(parseFloat(amountParam));
    if (currencyParam) setCurrency(currencyParam);
    if (orderParam) setOrderId(orderParam);
  }, []);

  const handlePayPalPayment = async () => {
    setIsProcessing(true);

    // Simulate PayPal payment processing
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Redirect back to cart with success
    router.push(`/cart?payment=success&order=${orderId}`);
  };

  const handleCancel = () => {
    // Redirect back to cart with cancel
    router.push(`/cart?payment=cancelled&order=${orderId}`);
  };

  return (
    <IonPage className="paypal-demo-page">
      <IonHeader>
        <IonToolbar>
          <IonTitle>PayPal Demo</IonTitle>
          <IonButton fill="clear" slot="start" onClick={handleCancel}>
            <IonIcon icon={arrowBackOutline} />
          </IonButton>
        </IonToolbar>
      </IonHeader>

      <IonContent className="paypal-demo-content">
        <div className="paypal-demo-container">
          {/* PayPal Header */}
          <div className="paypal-demo-header">
            <IonIcon icon={logoPaypal} className="paypal-demo-logo" />
            <h1>PayPal</h1>
            <p>Pago seguro y rápido</p>
          </div>

          {/* Payment Summary */}
          <IonCard className="payment-summary-card">
            <IonCardHeader>
              <IonCardTitle>Resumen del Pago</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <div className="payment-summary">
                <div className="summary-row">
                  <span>Monto a pagar:</span>
                  <span className="amount">
                    ${amount.toFixed(2)} {currency}
                  </span>
                </div>
                <div className="summary-row">
                  <span>Orden:</span>
                  <span>{orderId}</span>
                </div>
                <div className="summary-row">
                  <span>Método de pago:</span>
                  <span>PayPal</span>
                </div>
              </div>
            </IonCardContent>
          </IonCard>

          {/* Payment Options */}
          <IonCard className="payment-options-card">
            <IonCardHeader>
              <IonCardTitle>Opciones de Pago</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <div className="payment-options">
                <div className="payment-option">
                  <IonIcon icon={cardOutline} className="payment-icon" />
                  <div className="payment-details">
                    <h3>Tarjeta de Crédito/Débito</h3>
                    <p>
                      Paga con tu tarjeta Visa, Mastercard o American Express
                    </p>
                  </div>
                </div>
                <div className="payment-option">
                  <IonIcon icon={logoPaypal} className="payment-icon" />
                  <div className="payment-details">
                    <h3>Cuenta PayPal</h3>
                    <p>Paga con tu cuenta PayPal existente</p>
                  </div>
                </div>
              </div>
            </IonCardContent>
          </IonCard>
          
          {/* Action Buttons */}
          <div className="action-buttons">
            <IonButton
              expand="block"
              fill="solid"
              className="paypal-demo-button"
              onClick={handlePayPalPayment}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <IonSpinner name="crescent" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <IonIcon icon={logoPaypal} slot="start" />
                  <span>Pagar con PayPal</span>
                </>
              )}
            </IonButton>

            <IonButton
              expand="block"
              fill="outline"
              onClick={handleCancel}
              disabled={isProcessing}
              className="cancel-button"
            >
              Cancelar
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}
