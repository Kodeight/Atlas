import React, { useState, useEffect, useId } from 'react';
import { X, ShieldCheck, Truck, CheckCircle, AlertCircle, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useShop } from '../context/ShopContext';
import { ALGERIAN_WILAYAS } from '../data/wilayas';
import { calculateDelivery, formatCurrency } from '../services/shippingService';
import { OrderService } from '../services/orderService';
import { Order } from '../types';

export const OrderNowModal: React.FC = () => {
  const { orderNowModal, closeOrderNow, cart, clearCart, navigate, showToast, language, t, codEnabled } = useShop();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPhone, setConfirmPhone] = useState('');
  const [email, setEmail] = useState('');
  const [wilayaCode, setWilayaCode] = useState('16'); // Default Algiers (16)
  const [commune, setCommune] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColorName, setSelectedColorName] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  const fullNameId = useId();
  const phoneId = useId();
  const confirmPhoneId = useId();
  const emailId = useId();
  const wilayaId = useId();
  const communeId = useId();
  const addressId = useId();
  const notesId = useId();

  const isFromCart = orderNowModal.isFromCart;
  const product = orderNowModal.product;

  // Initialize or reset state when modal opens
  useEffect(() => {
    if (orderNowModal.isOpen) {
      setErrorMessage('');
      setConfirmedOrder(null);
      if (product) {
        setQuantity(orderNowModal.quantity || 1);
        setSelectedSize(orderNowModal.size || product.sizes[0] || 'Standard');
        setSelectedColorName(orderNowModal.color?.name || product.colors[0]?.name || 'Standard');
      }
    }
  }, [orderNowModal.isOpen, product, orderNowModal.quantity, orderNowModal.size, orderNowModal.color]);

  if (!orderNowModal.isOpen) return null;

  // Calculate Subtotal
  let subtotal = 0;
  if (isFromCart) {
    subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  } else if (product) {
    const activePrice = product.salePrice ?? product.price;
    subtotal = activePrice * quantity;
  }

  // Calculate Delivery Fee for selected Wilaya
  const deliveryInfo = calculateDelivery(wilayaCode, subtotal);
  const total = subtotal + deliveryInfo.deliveryFee;

  // Algerian phone number validation (05/06/07 or +213 format)
  const validateAlgerianPhone = (number: string): boolean => {
    const cleaned = number.replace(/[\s.-]/g, '');
    const regex = /^(0|\+213|00213)(5|6|7)[0-9]{8}$/;
    return regex.test(cleaned);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!codEnabled) {
      setErrorMessage(
        language === 'fr'
          ? 'Les commandes sont temporairement désactivées.'
          : 'Ordering is temporarily disabled.'
      );
      return;
    }

    // Validation messages localized
    if (!fullName.trim()) {
      setErrorMessage(language === 'fr' ? 'Veuillez saisir votre nom et prénom.' : 'Please enter your full name.');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage(language === 'fr' ? 'Veuillez saisir votre numéro de téléphone mobile algérien.' : 'Please enter your Algerian mobile phone number.');
      return;
    }
    if (!validateAlgerianPhone(phone)) {
      setErrorMessage(
        language === 'fr'
          ? 'Veuillez saisir un numéro mobile algérien valide (ex : 05 XX XX XX XX, 06..., ou 07...).'
          : 'Please enter a valid Algerian mobile number (e.g. 05 XX XX XX XX, 06..., or 07...).'
      );
      return;
    }
    if (phone.replace(/[\s.-]/g, '') !== confirmPhone.replace(/[\s.-]/g, '')) {
      setErrorMessage(
        language === 'fr'
          ? 'Les deux numéros de téléphone ne correspondent pas. Veuillez vérifier votre saisie.'
          : 'The phone numbers do not match. Please verify your phone number.'
      );
      return;
    }
    if (!commune.trim()) {
      setErrorMessage(language === 'fr' ? 'Veuillez saisir votre commune ou ville.' : 'Please enter your City or Commune.');
      return;
    }
    if (!address.trim()) {
      setErrorMessage(language === 'fr' ? 'Veuillez saisir votre adresse de livraison complète.' : 'Please enter your full delivery address.');
      return;
    }

    // Build payload items
    const itemsPayload = isFromCart
      ? cart.map((item) => ({
          productId: item.productId,
          size: item.size,
          colorName: item.color.name,
          quantity: item.quantity,
        }))
      : product
      ? [
          {
            productId: product.id,
            size: selectedSize || product.sizes[0] || 'Standard',
            colorName: selectedColorName || product.colors[0]?.name || 'Standard',
            quantity,
          },
        ]
      : [];

    if (itemsPayload.length === 0) {
      setErrorMessage(language === 'fr' ? 'Aucun article à commander.' : 'There are no items to order.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await OrderService.submitOrder({
        customer: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          confirmPhone: confirmPhone.trim(),
          email: email.trim() || undefined,
          wilayaCode,
          wilayaName: deliveryInfo.wilayaName,
          commune: commune.trim(),
          address: address.trim(),
          notes: notes.trim() || undefined,
        },
        items: itemsPayload,
      });

      if (result.success && result.order) {
        if (isFromCart) {
          clearCart();
        }
        setConfirmedOrder(result.order);
        showToast(
          language === 'fr'
            ? `Commande ${result.order.orderId} validée avec succès !`
            : `Order ${result.order.orderId} placed successfully!`
        );
      } else {
        setErrorMessage(result.error || (language === 'fr' ? 'Échec de validation. Veuillez réessayer.' : 'Failed to submit order. Please try again.'));
      }
    } catch {
      setErrorMessage(language === 'fr' ? 'Une erreur réseau est survenue. Veuillez réessayer.' : 'A network error occurred. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 md:p-6">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={closeOrderNow}
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        className="relative w-full max-w-2xl bg-[#FCFBF7] rounded-sm shadow-2xl border border-[#E7E3DA] overflow-hidden z-10 my-auto max-h-[92vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="bg-[#1F5742] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] font-sans-ui uppercase tracking-[0.2em] text-[#E7E3DA] block">
              {t('orderNowModalTitle')}
            </span>
            <h2 className="text-lg sm:text-xl font-editorial font-normal tracking-wide text-white">
              {confirmedOrder
                ? t('orderConfirmedTitle')
                : t('orderNowModalSubtitle')}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeOrderNow}
            className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto grow space-y-6">
          {confirmedOrder ? (
            /* Order Confirmed View */
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 bg-[#1F5742]/10 text-[#1F5742] rounded-full mx-auto flex items-center justify-center">
                <CheckCircle className="w-9 h-9" />
              </div>

              <div>
                <span className="text-xs uppercase tracking-widest text-[#6D6D6D]">
                  {language === 'fr' ? 'Commande Enregistrée avec Succès' : 'Order Placed Successfully'}
                </span>
                <h3 className="text-2xl font-editorial text-[#1F5742] mt-1">
                  {t('orderConfirmedSub')} {confirmedOrder.customer.fullName}
                </h3>
                <p className="text-sm font-semibold text-[#151515] mt-1">
                  {t('orderReference')} <span className="text-[#1F5742]">{confirmedOrder.orderId}</span>
                </p>
              </div>

              <div className="bg-[#F7F3EA] border border-[#E7E3DA] p-4 rounded text-left space-y-3 max-w-md mx-auto">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#1F5742] uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{language === 'fr' ? 'Paiement à la Livraison' : 'Payment on Delivery'}</span>
                </div>
                <p className="text-xs text-[#151515] leading-relaxed">
                  {t('orderNoticePhone')}{' '}
                  <span className="font-semibold">{confirmedOrder.customer.phone}</span>{' '}
                  {t('orderNoticePhoneEnd')}
                </p>
                <div className="pt-2 border-t border-[#E7E3DA] flex justify-between text-xs font-semibold">
                  <span>{t('totalDue')}:</span>
                  <span className="text-sm text-[#1F5742]">{formatCurrency(confirmedOrder.total)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-[#6D6D6D]">
                  <span>{language === 'fr' ? 'Destination :' : 'Delivery to:'}</span>
                  <span>{confirmedOrder.customer.wilayaName}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    closeOrderNow();
                    navigate(`/order-confirmation/${confirmedOrder.orderId.replace('#', '')}`);
                  }}
                  className="px-6 py-2.5 bg-[#1F5742] hover:bg-[#164030] text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors"
                >
                  {language === 'fr' ? 'Consulter le Reçu' : 'View Full Receipt'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    closeOrderNow();
                    navigate('/shop');
                  }}
                  className="px-6 py-2.5 bg-white border border-[#E7E3DA] hover:bg-[#F7F3EA] text-[#151515] text-xs font-semibold uppercase tracking-wider rounded transition-colors"
                >
                  {t('continueShopping')}
                </button>
              </div>
            </div>
          ) : (
            /* Order Form View */
            <form onSubmit={handleSubmitOrder} className="space-y-6">
              {/* Product Summary Preview */}
              <div className="bg-[#F7F3EA] p-4 rounded border border-[#E7E3DA]">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#1F5742] mb-3 flex items-center justify-between">
                  <span>{language === 'fr' ? 'Articles Sélectionnés' : 'Order Items'}</span>
                  <span className="text-[11px] font-normal text-[#6D6D6D]">
                    {isFromCart
                      ? `${cart.length} ${language === 'fr' ? 'article(s) au panier' : 'item(s) in bag'}`
                      : language === 'fr' ? 'Achat direct' : 'Single Item Order'}
                  </span>
                </div>

                {isFromCart ? (
                  <div className="space-y-3 divide-y divide-[#E7E3DA]">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-3 pt-2 first:pt-0 items-center">
                        <img
                          src={item.product.images[item.color.imageIndex ?? 0] || item.product.images[0]}
                          alt={item.product.name}
                          className="w-12 h-14 object-cover rounded bg-white shrink-0"
                        />
                        <div className="grow text-xs">
                          <p className="font-semibold text-[#151515] line-clamp-1">{item.product.name}</p>
                          <p className="text-[#6D6D6D] text-[11px]">
                            {language === 'fr' ? 'Taille' : 'Size'}: {item.size} • {language === 'fr' ? 'Couleur' : 'Color'}: {item.color.name} • {language === 'fr' ? 'Qté' : 'Qty'}: {item.quantity}
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-[#1F5742]">
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : product ? (
                  <div className="flex gap-3 items-center">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-16 h-20 object-cover rounded bg-white shrink-0"
                    />
                    <div className="grow space-y-1">
                      <h4 className="text-sm font-semibold text-[#151515]">{product.name}</h4>
                      <p className="text-xs text-[#6D6D6D]">
                        {product.categoryLabel} • {formatCurrency(product.salePrice ?? product.price)}
                      </p>

                      {/* Selectable variations if single product flow */}
                      <div className="flex flex-wrap gap-3 pt-1 text-xs">
                        <div>
                          <span className="text-[#6D6D6D] mr-1">{language === 'fr' ? 'Taille:' : 'Size:'}</span>
                          <select
                            value={selectedSize}
                            onChange={(e) => setSelectedSize(e.target.value)}
                            className="bg-white border border-[#E7E3DA] rounded px-2 py-0.5 text-xs focus:outline-none"
                          >
                            {product.sizes.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <span className="text-[#6D6D6D] mr-1">{language === 'fr' ? 'Couleur:' : 'Color:'}</span>
                          <select
                            value={selectedColorName}
                            onChange={(e) => setSelectedColorName(e.target.value)}
                            className="bg-white border border-[#E7E3DA] rounded px-2 py-0.5 text-xs focus:outline-none"
                          >
                            {product.colors.map((c) => (
                              <option key={c.name} value={c.name}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <span className="text-[#6D6D6D] mr-1">{language === 'fr' ? 'Qté:' : 'Qty:'}</span>
                          <select
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            className="bg-white border border-[#E7E3DA] rounded px-2 py-0.5 text-xs focus:outline-none"
                          >
                            {[1, 2, 3, 4, 5].map((q) => (
                              <option key={q} value={q}>
                                {q}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-[#6D6D6D] py-2">{language === 'fr' ? 'Aucun article sélectionné.' : 'No item selected.'}</div>
                )}
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <div className="p-3 bg-[#FDF2F2] border border-[#F8B4B4] rounded text-xs text-[#9B1C1C] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Customer & Delivery Form Fields */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1F5742] border-b border-[#E7E3DA] pb-1.5 flex items-center gap-1.5">
                  <Truck className="w-4 h-4" />
                  <span>{language === 'fr' ? 'Adresse de Livraison en Algérie' : 'Delivery Address in Algeria'}</span>
                </h3>

                {/* Full Name */}
                <div>
                  <label htmlFor={fullNameId} className="block text-xs font-semibold text-[#151515] mb-1">
                    {t('formFullName')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={fullNameId}
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t('formFullNamePlaceholder')}
                    className="w-full bg-white border border-[#E7E3DA] rounded px-3.5 py-2.5 text-xs text-[#151515] focus:outline-none focus:border-[#1F5742] focus:ring-1 focus:ring-[#1F5742]"
                  />
                </div>

                {/* Phone & Confirm Phone Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor={phoneId} className="block text-xs font-semibold text-[#151515] mb-1">
                      {t('formPhone')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={phoneId}
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={t('formPhonePlaceholder')}
                      className="w-full bg-white border border-[#E7E3DA] rounded px-3.5 py-2.5 text-xs text-[#151515] focus:outline-none focus:border-[#1F5742] focus:ring-1 focus:ring-[#1F5742]"
                    />
                    <span className="text-[10px] text-[#6D6D6D] mt-0.5 block">
                      {t('formPhoneHint')}
                    </span>
                  </div>

                  <div>
                    <label htmlFor={confirmPhoneId} className="block text-xs font-semibold text-[#151515] mb-1">
                      {t('formConfirmPhone')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={confirmPhoneId}
                      type="tel"
                      required
                      value={confirmPhone}
                      onChange={(e) => setConfirmPhone(e.target.value)}
                      placeholder={t('formConfirmPhonePlaceholder')}
                      className="w-full bg-white border border-[#E7E3DA] rounded px-3.5 py-2.5 text-xs text-[#151515] focus:outline-none focus:border-[#1F5742] focus:ring-1 focus:ring-[#1F5742]"
                    />
                  </div>
                </div>

                {/* Wilaya & Commune Grid (69 Wilayas) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor={wilayaId} className="block text-xs font-semibold text-[#151515] mb-1">
                      {t('formWilaya')} <span className="text-red-500">*</span>
                    </label>
                    <select
                      id={wilayaId}
                      value={wilayaCode}
                      onChange={(e) => setWilayaCode(e.target.value)}
                      className="w-full bg-white border border-[#E7E3DA] rounded px-3.5 py-2.5 text-xs text-[#151515] focus:outline-none focus:border-[#1F5742] focus:ring-1 focus:ring-[#1F5742]"
                    >
                      {ALGERIAN_WILAYAS.map((w) => (
                        <option key={w.code} value={w.code}>
                          {w.code} - {w.name} ({w.nameAr})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor={communeId} className="block text-xs font-semibold text-[#151515] mb-1">
                      {t('formCommune')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={communeId}
                      type="text"
                      required
                      value={commune}
                      onChange={(e) => setCommune(e.target.value)}
                      placeholder={t('formCommunePlaceholder')}
                      className="w-full bg-white border border-[#E7E3DA] rounded px-3.5 py-2.5 text-xs text-[#151515] focus:outline-none focus:border-[#1F5742] focus:ring-1 focus:ring-[#1F5742]"
                    />
                  </div>
                </div>

                {/* Full Address */}
                <div>
                  <label htmlFor={addressId} className="block text-xs font-semibold text-[#151515] mb-1">
                    {t('formAddress')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={addressId}
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={t('formAddressPlaceholder')}
                    className="w-full bg-white border border-[#E7E3DA] rounded px-3.5 py-2.5 text-xs text-[#151515] focus:outline-none focus:border-[#1F5742] focus:ring-1 focus:ring-[#1F5742]"
                  />
                </div>

                {/* Email (Optional) & Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor={emailId} className="block text-xs font-semibold text-[#151515] mb-1">
                      {t('formEmail')}
                    </label>
                    <input
                      id={emailId}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nom@domaine.dz"
                      className="w-full bg-white border border-[#E7E3DA] rounded px-3.5 py-2.5 text-xs text-[#151515] focus:outline-none focus:border-[#1F5742]"
                    />
                  </div>

                  <div>
                    <label htmlFor={notesId} className="block text-xs font-semibold text-[#151515] mb-1">
                      {t('formNotes')}
                    </label>
                    <input
                      id={notesId}
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={t('formNotesPlaceholder')}
                      className="w-full bg-white border border-[#E7E3DA] rounded px-3.5 py-2.5 text-xs text-[#151515] focus:outline-none focus:border-[#1F5742]"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method & Pricing Breakdown (NO COD MENTION) */}
              <div className="bg-[#1F5742]/5 border border-[#1F5742]/20 p-4 rounded space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#1F5742]" />
                    <div>
                      <h4 className="text-xs font-semibold text-[#1F5742] uppercase tracking-wider">
                        {t('paymentMethodTitle')}
                      </h4>
                      <p className="text-[11px] text-[#6D6D6D]">
                        {t('paymentMethodNotice')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#1F5742]/15 space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#6D6D6D]">
                    <span>{t('itemsSubtotal')}:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[#6D6D6D]">
                    <span>{t('deliveryFee')} ({deliveryInfo.wilayaName}):</span>
                    <span>
                      {deliveryInfo.deliveryFee === 0 ? t('freeDelivery') : formatCurrency(deliveryInfo.deliveryFee)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-[#151515] pt-2 border-t border-[#1F5742]/15">
                    <span>{t('totalDue')}:</span>
                    <span className="text-base text-[#1F5742] font-semibold">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting || !codEnabled}
                  title={
                    !codEnabled
                      ? language === 'fr'
                        ? 'Commandes désactivées'
                        : 'Ordering disabled'
                      : undefined
                  }
                  className="flex-1 py-3.5 px-6 bg-[#1F5742] hover:bg-[#164030] text-white text-xs font-semibold tracking-[0.15em] uppercase rounded shadow-sm transition-transform active:scale-98 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>{t('submittingOrder')}</span>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>{t('orderNowPayOnDelivery')}</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={closeOrderNow}
                  className="py-3 px-5 border border-[#E7E3DA] text-[#6D6D6D] hover:text-[#151515] hover:bg-black/5 text-xs font-medium uppercase tracking-wider rounded transition-colors"
                >
                  {language === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
