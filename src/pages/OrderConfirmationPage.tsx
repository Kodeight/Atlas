import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { OrderService } from '../services/orderService';
import { Order } from '../types';
import { formatCurrency } from '../services/shippingService';
import { CheckCircle2, Printer, ArrowRight, ShieldCheck, MapPin, Phone } from 'lucide-react';
import { motion } from 'motion/react';

interface OrderConfirmationPageProps {
  orderIdParam?: string;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({ orderIdParam }) => {
  const { currentPath, navigate, language, t } = useShop();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Extract ID from path if not passed
  const orderId =
    orderIdParam ||
    currentPath.replace('/order-confirmation/', '').replace('#', '') ||
    '';

  useEffect(() => {
    let isMounted = true;
    async function loadOrder() {
      if (!orderId) {
        setLoading(false);
        return;
      }
      const fullId = orderId.startsWith('#') ? orderId : `#${orderId}`;
      const found = await OrderService.getOrderById(fullId);
      if (isMounted) {
        setOrder(found || null);
        setLoading(false);
      }
    }
    loadOrder();
    return () => {
      isMounted = false;
    };
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="bg-[#FCFBF7] min-h-[60vh] flex items-center justify-center">
        <p className="text-xs text-[#6D6D6D] uppercase tracking-widest font-sans-ui animate-pulse">
          {language === 'fr' ? 'Chargement des détails de la commande...' : 'Loading order details...'}
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-[#FCFBF7] min-h-[60vh] flex items-center justify-center p-4">
        <div className="text-center max-w-md space-y-4">
          <h1 className="text-2xl font-editorial text-[#151515]">
            {language === 'fr' ? 'Commande Introuvable' : 'Order Not Found'}
          </h1>
          <p className="text-xs text-[#6D6D6D]">
            {language === 'fr'
              ? `Nous n'avons pas trouvé de référence correspondant à « ${orderId} ».`
              : `We could not find an order reference matching “${orderId}”.`}
          </p>
          <button
            type="button"
            onClick={() => navigate('/shop')}
            className="px-6 py-2.5 bg-[#1F5742] text-white text-xs font-semibold uppercase tracking-wider rounded-xs cursor-pointer"
          >
            {t('continueShopping')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FCFBF7] min-h-screen py-10 sm:py-16 print:py-0 print:bg-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8"
      >
        {/* Confirmed Banner */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-[#1F5742]/10 text-[#1F5742] rounded-full mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <span className="text-xs font-sans-ui uppercase tracking-[0.2em] text-[#6D6D6D] block">
            {language === 'fr' ? 'BORDEREAU OFFICIEL DE COMMANDE' : 'OFFICIAL ORDER RECEIPT'}
          </span>
          <h1 className="text-3xl sm:text-4xl font-editorial font-normal text-[#1F5742]">
            {t('orderConfirmedTitle')}
          </h1>
          <p className="text-sm font-semibold text-[#151515]">
            {language === 'fr' ? 'Référence de suivi :' : 'Reference:'}{' '}
            <span className="text-[#1F5742] font-mono">{order.orderId}</span>
          </p>
        </div>

        {/* Payment on Delivery Information Box (NO COD MENTION) */}
        <div className="bg-[#F7F3EA] border border-[#E7E3DA] p-6 rounded-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1F5742] uppercase tracking-wider">
            <ShieldCheck className="w-5 h-5" />
            <span>
              {language === 'fr'
                ? 'Modalité de Paiement à la Livraison'
                : 'Payment on Delivery Information'}
            </span>
          </div>
          <p className="text-xs text-[#151515] leading-relaxed">
            {t('orderConfirmedDesc')}{' '}
            <strong className="text-[#1F5742]">{order.customer.phone}</strong>{' '}
            {language === 'fr'
              ? 'pour valider votre adresse et planifier le passage du coursier.'
              : 'to confirm your order details and delivery window before dispatch.'}
          </p>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-[#E7E3DA] font-semibold text-[#151515]">
            <span>{t('paymentMethodTitle')}:</span>
            <span className="text-[#1F5742]">{t('paymentMethodDesc')}</span>
          </div>
        </div>

        {/* Items Summary Card */}
        <div className="bg-white border border-[#E7E3DA] rounded-xs p-6 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#1F5742] border-b border-[#E7E3DA] pb-2">
            {language === 'fr' ? 'Articles Commandés' : 'Purchased Items'}
          </h2>

          <div className="divide-y divide-[#E7E3DA]">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center gap-4">
                <img
                  src={item.productImage}
                  alt={item.productName}
                  className="w-14 h-18 object-cover rounded-xs bg-[#F7F3EA] shrink-0"
                />
                <div className="grow text-xs space-y-0.5">
                  <h3 className="font-semibold text-[#151515]">{item.productName}</h3>
                  <p className="text-[#6D6D6D]">
                    {language === 'fr' ? 'Taille :' : 'Size:'}{' '}
                    <span className="text-[#151515] font-medium">{item.size}</span> •{' '}
                    {language === 'fr' ? 'Couleur :' : 'Color:'}{' '}
                    <span className="text-[#151515] font-medium">{item.color}</span>
                  </p>
                  <p className="text-[#6D6D6D]">
                    {t('quantity')}: {item.quantity}
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#1F5742]">
                  {formatCurrency(item.totalPrice)}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="pt-4 border-t border-[#E7E3DA] space-y-2 text-xs">
            <div className="flex justify-between text-[#6D6D6D]">
              <span>{t('subtotal')}:</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-[#6D6D6D]">
              <span>
                {t('shipping')} ({order.customer.wilayaName}):
              </span>
              <span>
                {order.deliveryFee === 0
                  ? language === 'fr'
                    ? 'GRATUITE'
                    : 'FREE'
                  : formatCurrency(order.deliveryFee)}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold text-[#151515] pt-2 border-t border-[#E7E3DA]">
              <span>{t('totalDue')}:</span>
              <span className="text-[#1F5742]">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Customer & Delivery Details */}
        <div className="bg-white border border-[#E7E3DA] rounded-xs p-6 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#1F5742] border-b border-[#E7E3DA] pb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{language === 'fr' ? 'Destination de Livraison' : 'Delivery Destination'}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[#6D6D6D] block">
                {language === 'fr' ? 'Nom du Destinataire :' : 'Customer Name:'}
              </span>
              <strong className="text-[#151515] text-sm">{order.customer.fullName}</strong>
            </div>

            <div>
              <span className="text-[#6D6D6D] block">
                {language === 'fr' ? 'Numéro de Téléphone :' : 'Contact Phone:'}
              </span>
              <span className="text-[#151515] font-semibold flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#1F5742]" />
                {order.customer.phone}
              </span>
            </div>

            <div>
              <span className="text-[#6D6D6D] block">
                {language === 'fr' ? 'Wilaya & Commune :' : 'Wilaya & Commune:'}
              </span>
              <span className="text-[#151515] font-medium">
                {order.customer.commune}, {order.customer.wilayaName}
              </span>
            </div>

            <div>
              <span className="text-[#6D6D6D] block">
                {language === 'fr' ? 'Adresse de Livraison :' : 'Delivery Address:'}
              </span>
              <span className="text-[#151515]">{order.customer.address}</span>
            </div>

            {order.customer.notes && (
              <div className="sm:col-span-2">
                <span className="text-[#6D6D6D] block">
                  {language === 'fr' ? 'Instructions Complémentaires :' : 'Delivery Notes:'}
                </span>
                <span className="text-[#151515] italic">{order.customer.notes}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="px-6 py-3 bg-white border border-[#E7E3DA] hover:bg-[#F7F3EA] text-[#151515] text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{language === 'fr' ? 'Imprimer le Reçu' : 'Print Receipt'}</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/shop')}
            className="px-6 py-3 bg-[#1F5742] hover:bg-[#164030] text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{t('continueShopping')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
