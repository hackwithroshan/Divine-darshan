import React, { useState, useEffect, useContext } from 'react';
import { AvailablePrasad, Temple, User, PaymentPayload } from '../types';
import { X, User as UserIcon, Phone, Home, CheckCircle, CreditCard, Smartphone } from 'lucide-react';
import { LanguageContext } from '../contexts/LanguageContext';
import InputError from './InputError';
import { ToastContext } from '../contexts/ToastContext';
import { createSubscription, getApiErrorMessage, createRazorpayOrder, verifyRazorpayPayment, createPhonepeOrder } from '../services/api';

interface SubscriptionModalProps {
    prasad: AvailablePrasad;
    temple: Temple;
    user: User;
    onClose: () => void;
    onNavigateToDashboard: () => void;
}

// Remove 'success' state, as we now redirect immediately
type SubscriptionStatus = 'form' | 'submitting';

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ prasad, temple, user, onClose, onNavigateToDashboard }) => {
    const [frequency, setFrequency] = useState<'monthly' | 'quarterly'>('monthly');
    const [fullName, setFullName] = useState(user.name || '');
    const [phoneNumber, setPhoneNumber] = useState(user.mobile || '');
    const [address, setAddress] = useState('');
    const [status, setStatus] = useState<SubscriptionStatus>('form');
    const { t } = useContext(LanguageContext);
    const toastContext = useContext(ToastContext);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    const totalCost = frequency === 'monthly' ? prasad.priceMonthly : prasad.priceQuarterly;

    const validateForm = () => {
        const errors: Record<string, string> = {};
        if (!fullName.trim() || fullName.trim().length < 3) errors.fullName = 'Please enter a name (min. 3 characters).';
        if (!/^[6-9]\d{9}$/.test(phoneNumber)) errors.phoneNumber = 'Please enter a valid 10-digit mobile number.';
        if (!address.trim() || address.trim().length < 10) errors.address = 'Please enter a full address (min. 10 characters).';
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };
    
    const prePaymentCheck = () => {
        if (!validateForm()) return false;
        return true;
    }

    const handleRazorpayPayment = async () => {
        if (!prePaymentCheck()) return;
        setStatus('submitting');
        
        try {
            const orderResponse = await createRazorpayOrder(totalCost * 100);
            const { order_id, key_id } = orderResponse.data;

            const options: RazorpayOptions = {
                key: key_id,
                amount: totalCost * 100,
                currency: 'INR',
                name: 'astrologica Subscription',
                description: `Subscription for ${t(prasad.nameKey)}`,
                image: prasad.imageUrl,
                order_id: order_id,
                handler: async (response) => {
                    try {
                        await verifyRazorpayPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });

                        await createSubscription({
                            id: response.razorpay_payment_id,
                            templeNameKey: temple.nameKey,
                            prasadNameKey: prasad.nameKey,
                            frequency: frequency === 'monthly' ? 'Monthly' : 'Quarterly',
                            price: totalCost,
                            fullName,
                            phoneNumber,
                            address,
                        });
                        // Add toast and redirect on success
                        toastContext?.addToast(t('subscriptionModal.success.title'), 'success');
                        onNavigateToDashboard();
                        onClose();
                    } catch (error) {
                        toastContext?.addToast(getApiErrorMessage(error), 'error');
                        setStatus('form');
                    }
                },
                prefill: { name: fullName, email: user.email, contact: phoneNumber },
                notes: { prasad_id: prasad.id.toString(), user_id: user.id.toString() },
                theme: { color: '#800000' },
                modal: {
                    ondismiss: () => {
                        toastContext?.addToast('Payment was cancelled.', 'info');
                        setStatus('form');
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error) {
            toastContext?.addToast(getApiErrorMessage(error), 'error');
            setStatus('form');
        }
    };

    const handlePhonePePayment = async () => {
        if (!prePaymentCheck()) return;
        setStatus('submitting');

        const paymentPayload: PaymentPayload = {
            amount: totalCost,
            type: 'subscription',
            details: {
                templeNameKey: temple.nameKey,
                prasadNameKey: prasad.nameKey,
                frequency: frequency === 'monthly' ? 'Monthly' : 'Quarterly',
                price: totalCost,
                fullName,
                phoneNumber,
                address,
            }
        };

        try {
            const response = await createPhonepeOrder(paymentPayload);
            const redirectUrl = response.data.redirectUrl;
            if (redirectUrl) {
                window.location.href = redirectUrl;
            } else {
                toastContext?.addToast('Could not initiate PhonePe payment.', 'error');
                setStatus('form');
            }
        } catch (error) {
            toastContext?.addToast(getApiErrorMessage(error), 'error');
            setStatus('form');
        }
    };
    
    const renderForm = () => (
        <>
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-maroon" aria-label={t('subscriptionModal.aria.close')}><X size={24} /></button>
            <h2 id="subscription-modal-title" className="text-2xl font-bold text-maroon mb-1">{t('subscriptionModal.title')}: {t(prasad.nameKey)}</h2>
            <p className="text-gray-600 mb-6">{t('subscriptionModal.subtitle')}</p>
            <form onSubmit={e => e.preventDefault()} className="space-y-4">
                <div>
                    <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">{t('subscriptionModal.labels.frequency')}</label>
                    <select id="frequency" value={frequency} onChange={e => setFrequency(e.target.value as any)} required className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-saffron focus:border-saffron">
                        <option value="monthly">{t('prasadSubscriptionPage.monthly')} - ₹{prasad.priceMonthly.toLocaleString('en-IN')}/mo</option>
                        <option value="quarterly">{t('prasadSubscriptionPage.quarterly')} - ₹{prasad.priceQuarterly.toLocaleString('en-IN')}/qtr</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="full-name" className="block text-sm font-medium text-gray-700 mb-1">{t('subscriptionModal.labels.fullName')}</label>
                    <div className="relative"><UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="text" id="full-name" placeholder={t('subscriptionModal.placeholders.fullName')} value={fullName} onChange={e => setFullName(e.target.value)} required className="w-full pl-10 p-2 border border-gray-300 rounded-md" /></div>
                    <InputError message={validationErrors.fullName} />
                </div>
                 <div>
                    <label htmlFor="phone-number" className="block text-sm font-medium text-gray-700 mb-1">{t('subscriptionModal.labels.phone')}</label>
                    <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="tel" id="phone-number" placeholder={t('subscriptionModal.placeholders.phone')} value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required pattern="[0-9]{10}" className="w-full pl-10 p-2 border border-gray-300 rounded-md" /></div>
                    <InputError message={validationErrors.phoneNumber} />
                </div>
                 <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">{t('subscriptionModal.labels.address')}</label>
                    <div className="relative"><Home className="absolute left-3 top-3 text-gray-400" size={18} /><textarea id="address" placeholder={t('subscriptionModal.placeholders.address')} value={address} onChange={e => setAddress(e.target.value)} required rows={3} className="w-full pl-10 p-2 border border-gray-300 rounded-md" /></div>
                    <InputError message={validationErrors.address} />
                </div>
                <div className="pt-4 border-t border-orange-200">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-medium text-gray-700">{t('subscriptionModal.total')}:</span>
                        <span className="text-2xl font-bold text-maroon">₹{totalCost.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="space-y-3">
                        <button type="button" onClick={handleRazorpayPayment} disabled={status === 'submitting'} className="w-full bg-saffron text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-500 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-saffron/50 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                           {status === 'submitting' ? t('bookingModal.buttons.processing') : (
                                <>
                                    <CreditCard size={20} />
                                    <span>{t('subscriptionModal.buttons.confirmRazorpay')}</span>
                                </>
                            )}
                        </button>
                        <button type="button" onClick={handlePhonePePayment} disabled={status === 'submitting'} className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-400/50 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                            {status === 'submitting' ? t('bookingModal.buttons.processing') : (
                                <>
                                    <Smartphone size={20} />
                                    <span>{t('subscriptionModal.buttons.confirmPhonePe')}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="subscription-modal-title">
            <div className="bg-orange-50 rounded-xl shadow-2xl w-full max-w-lg m-4 p-6 relative animate-fade-in-up" onClick={e => e.stopPropagation()}>
                {renderForm()}
            </div>
        </div>
    );
};

export default SubscriptionModal;