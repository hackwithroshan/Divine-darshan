import React, { useState, useEffect, useContext, useRef } from 'react';
import { Puja, PaymentPayload } from '../types';
import { X, Calendar, Clock, Users, User, Phone, CheckCircle, CreditCard, Smartphone } from 'lucide-react';
import { LanguageContext } from '../contexts/LanguageContext';
import AccessibleDatePicker from './AccessibleDatePicker';
import { ToastContext } from '../contexts/ToastContext';
import { createBooking, getApiErrorMessage, createRazorpayOrder, verifyRazorpayPayment, createPhonepeOrder } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import InputError from './InputError';

interface BookingModalProps {
    puja: Puja;
    templeNameKey: string;
    onClose: () => void;
    onNavigateToDashboard: () => void;
}

// Remove 'success' state, as we now redirect immediately
type BookingStatus = 'form' | 'submitting';

const BookingModal: React.FC<BookingModalProps> = ({ puja, templeNameKey, onClose, onNavigateToDashboard }) => {
    const { user } = useContext(AuthContext);
    const [numDevotees, setNumDevotees] = useState(1);
    const [date, setDate] = useState('');
    const [timeSlot, setTimeSlot] = useState('morning');
    const [fullName, setFullName] = useState(user?.name || '');
    const [phoneNumber, setPhoneNumber] = useState(user?.mobile || '');
    const [bookingStatus, setBookingStatus] = useState<BookingStatus>('form');
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const { t, language } = useContext(LanguageContext);
    const toastContext = useContext(ToastContext);
    const datePickerRef = useRef<HTMLDivElement>(null);

    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
                setIsDatePickerOpen(false);
            }
        };
        if (isDatePickerOpen) { document.addEventListener('mousedown', handleClickOutside); }
        return () => { document.removeEventListener('mousedown', handleClickOutside); };
    }, [isDatePickerOpen]);
    
    const totalCost = puja.price * numDevotees;

    const validateForm = () => {
        const errors: Record<string, string> = {};
        if (!date) errors.date = 'Please select a date.';
        if (!fullName.trim() || fullName.trim().length < 3) errors.fullName = 'Please enter a name (min. 3 characters).';
        if (!/^[6-9]\d{9}$/.test(phoneNumber)) errors.phoneNumber = 'Please enter a valid 10-digit mobile number.';
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleDateChange = (newDate: string) => {
        setDate(newDate);
        setValidationErrors(prev => ({ ...prev, date: '' })); // Clear date error on selection
        setIsDatePickerOpen(false);
    };

    const prePaymentCheck = () => {
        if (!user) {
            toastContext?.addToast('Please log in to make a booking.', 'info');
            onClose();
            onNavigateToDashboard();
            return false;
        }

        if (!validateForm()) return false;
        return true;
    }

    const handleRazorpayPayment = async () => {
        if (!prePaymentCheck()) return;
        setBookingStatus('submitting');
        
        try {
            const orderResponse = await createRazorpayOrder(totalCost * 100);
            const { order_id, key_id } = orderResponse.data;

            const options: RazorpayOptions = {
                key: key_id,
                amount: totalCost * 100,
                currency: 'INR',
                name: 'astrologica',
                description: `Booking for ${t(puja.nameKey)}`,
                image: 'https://th.bing.com/th/id/R.7a597d5c26d6c80c9a1770de2935dde6?rik=elpdFrOmUN3pRw&riu=http%3a%2f%2fwww.thehistoryhub.com%2fwp-content%2fuploads%2f2017%2f03%2fKashi-Vishwanath-Temple.jpg&ehk=uLF1dzVIUhTZ7QxBw5uhz06SVzeEBNCdQf1puUHIe3E%3d&risl=&pid=ImgRaw&r=0',
                order_id: order_id,
                handler: async (response) => {
                    try {
                        await verifyRazorpayPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });

                        await createBooking({
                            id: response.razorpay_payment_id,
                            userEmail: user!.email,
                            pujaNameKey: puja.nameKey,
                            templeNameKey: templeNameKey,
                            date,
                            price: totalCost,
                            isEPuja: puja.isEPuja,
                            numDevotees,
                            fullName,
                            phoneNumber,
                        });
                        // Add toast and redirect on success
                        toastContext?.addToast(t('bookingModal.success.title'), 'success');
                        onNavigateToDashboard();
                        onClose();
                    } catch (error) {
                         toastContext?.addToast(getApiErrorMessage(error), 'error');
                         setBookingStatus('form');
                    }
                },
                prefill: {
                    name: fullName,
                    email: user!.email,
                    contact: phoneNumber,
                },
                notes: {
                    puja_id: puja.id.toString(),
                    booking_date: date,
                },
                theme: { color: '#800000' },
                modal: {
                    ondismiss: () => {
                        toastContext?.addToast('Payment was cancelled.', 'info');
                        setBookingStatus('form');
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error) {
            toastContext?.addToast(getApiErrorMessage(error), 'error');
            setBookingStatus('form');
        }
    };

    const handlePhonePePayment = async () => {
        if (!prePaymentCheck()) return;
        setBookingStatus('submitting');

        const paymentPayload: PaymentPayload = {
            amount: totalCost,
            type: 'booking',
            details: {
                pujaNameKey: puja.nameKey,
                templeNameKey: templeNameKey,
                date,
                price: totalCost,
                isEPuja: puja.isEPuja,
                numDevotees,
                fullName,
                phoneNumber,
            }
        };

        try {
            const response = await createPhonepeOrder(paymentPayload);
            const redirectUrl = response.data.redirectUrl;
            if (redirectUrl) {
                window.location.href = redirectUrl;
            } else {
                toastContext?.addToast('Could not initiate PhonePe payment.', 'error');
                setBookingStatus('form');
            }
        } catch (error) {
            toastContext?.addToast(getApiErrorMessage(error), 'error');
            setBookingStatus('form');
        }
    };
    
    const renderForm = () => (
        <>
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-maroon transition-colors" aria-label={t('bookingModal.aria.closeForm')}><X size={24} /></button>
            <h2 id="booking-modal-title" className="text-2xl font-bold text-maroon mb-1">{t('bookingModal.title')}: {t(puja.nameKey)}</h2>
            <p className="text-gray-600 mb-6">{t('bookingModal.subtitle')}</p>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative" ref={datePickerRef}>
                        <label htmlFor="booking-date-button" className="block text-sm font-medium text-gray-700 mb-1">{t('bookingModal.labels.date')}</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                             <button type="button" id="booking-date-button" onClick={() => setIsDatePickerOpen(!isDatePickerOpen)} className="w-full text-left pl-10 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-saffron focus:border-saffron bg-white" aria-haspopup="true" aria-expanded={isDatePickerOpen}>
                                {date ? new Date(date + 'T00:00:00').toLocaleDateString(language, { day: 'numeric', month: 'long', year: 'numeric' }) : <span className="text-gray-500">Select a date</span>}
                            </button>
                        </div>
                         {isDatePickerOpen && <div className="absolute top-full mt-2 z-10 w-full animate-fade-in-up" style={{ animationDuration: '0.2s' }}><AccessibleDatePicker selectedDate={date} onDateChange={handleDateChange} minDate={today}/></div>}
                         <InputError message={validationErrors.date} />
                    </div>
                    <div>
                        <label htmlFor="time-slot" className="block text-sm font-medium text-gray-700 mb-1">{t('bookingModal.labels.timeSlot')}</label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><select id="time-slot" value={timeSlot} onChange={e => setTimeSlot(e.target.value)} required className="w-full pl-10 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-saffron focus:border-saffron appearance-none"><option value="morning">{t('bookingModal.timeSlots.morning')}</option><option value="afternoon">{t('bookingModal.timeSlots.afternoon')}</option><option value="evening">{t('bookingModal.timeSlots.evening')}</option></select>
                        </div>
                    </div>
                </div>
                <div>
                    <label htmlFor="num-devotees" className="block text-sm font-medium text-gray-700 mb-1">{t('bookingModal.labels.devotees')}</label>
                    <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="number" id="num-devotees" value={numDevotees} onChange={e => setNumDevotees(Math.max(1, parseInt(e.target.value) || 1))} min="1" required className="w-full pl-10 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-saffron focus:border-saffron" />
                    </div>
                </div>
                <div>
                    <label htmlFor="full-name" className="block text-sm font-medium text-gray-700 mb-1">{t('bookingModal.labels.fullName')}</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="text" id="full-name" placeholder={t('bookingModal.placeholders.fullName')} value={fullName} onChange={e => setFullName(e.target.value)} required className="w-full pl-10 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-saffron focus:border-saffron" />
                    </div>
                    <InputError message={validationErrors.fullName} />
                </div>
                <div>
                    <label htmlFor="phone-number" className="block text-sm font-medium text-gray-700 mb-1">{t('bookingModal.labels.phone')}</label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="tel" id="phone-number" placeholder={t('bookingModal.placeholders.phone')} value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required pattern="[0-9]{10}" className="w-full pl-10 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-saffron focus:border-saffron" />
                    </div>
                     <InputError message={validationErrors.phoneNumber} />
                </div>
                <div className="pt-4 border-t border-orange-200">
                    <div className="flex justify-between items-center mb-4"><span className="text-lg font-medium text-gray-700">{t('bookingModal.total')}:</span><span className="text-2xl font-bold text-maroon">₹{totalCost.toLocaleString('en-IN')}</span></div>
                    <div className="space-y-3">
                         <button type="button" onClick={handleRazorpayPayment} disabled={bookingStatus === 'submitting'} className="w-full bg-saffron text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-500 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-saffron/50 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                            {bookingStatus === 'submitting' ? t('bookingModal.buttons.processing') : (
                                <>
                                    <CreditCard size={20} />
                                    <span>{t('bookingModal.buttons.confirmRazorpay')}</span>
                                </>
                            )}
                        </button>
                        <button type="button" onClick={handlePhonePePayment} disabled={bookingStatus === 'submitting'} className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-400/50 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                            {bookingStatus === 'submitting' ? t('bookingModal.buttons.processing') : (
                                <>
                                    <Smartphone size={20} />
                                    <span>{t('bookingModal.buttons.confirmPhonePe')}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="booking-modal-title">
            <div className="bg-orange-50 rounded-xl shadow-2xl w-full max-w-lg m-4 p-6 relative transform transition-all animate-fade-in-up" onClick={e => e.stopPropagation()}>
                {renderForm()}
            </div>
        </div>
    );
};

export default BookingModal;