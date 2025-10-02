import React, { useState, useEffect, useContext, useRef } from 'react';
import { Temple, PaymentPayload, Booking, QueueAssistancePackage, QueueAssistanceAddOn } from '../types';
import { ArrowLeft, Calendar, Users, User, Phone, CreditCard, Smartphone, Building2, Clock, Sparkles, Car, Languages, Flower2, Wifi, Map } from 'lucide-react';
import { LanguageContext } from '../contexts/LanguageContext';
import AccessibleDatePicker from './AccessibleDatePicker';
import { ToastContext } from '../contexts/ToastContext';
import { createBooking, getApiErrorMessage, createRazorpayOrder, verifyRazorpayPayment, createPhonepeOrder, getTemples, getQueueStatus, getQueuePackages, getQueueAddOns } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import InputError from './InputError';

interface QueueAssistancePageProps {
    onBack: () => void;
    onLoginRequired: () => void;
}

interface QueueStatus {
    waitingTime: number; // in minutes
    devoteesInQueue: number;
    lastUpdated: string;
}

const guideLanguages = [
    { code: 'en', nameKey: 'queueAssistancePage.languages.english' },
    { code: 'hi', nameKey: 'queueAssistancePage.languages.hindi' },
    { code: 'ta', nameKey: 'queueAssistancePage.languages.tamil' },
    { code: 'te', nameKey: 'queueAssistancePage.languages.telugu' },
];

// Reusable Add-on Card Component
interface AddOnCardProps {
    addon: QueueAssistanceAddOn;
    icon: React.ReactNode;
    isSelected: boolean;
    onToggle: (type: string) => void;
    children?: React.ReactNode;
}

const AddOnCard: React.FC<AddOnCardProps> = ({ addon, icon, isSelected, onToggle, children }) => {
    return (
        <div 
            className={`p-4 border-2 rounded-lg transition-all cursor-pointer ${isSelected ? 'border-saffron bg-orange-50/50 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}
            onClick={() => onToggle(addon.type)}
        >
            <div className="flex items-start gap-4">
                <div className="text-saffron bg-orange-100 p-3 rounded-full mt-1">
                    {icon}
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <span className="font-bold text-gray-800">{addon.name}</span>
                        <span className="font-bold text-maroon text-lg whitespace-nowrap ml-2">+ ₹{addon.price}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{addon.description}</p>
                </div>
                <div className="flex items-center mt-1">
                    <button 
                        type="button"
                        role="switch"
                        aria-checked={isSelected}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-saffron focus:ring-offset-2 ${isSelected ? 'bg-saffron' : 'bg-gray-200'}`}
                    >
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isSelected ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                </div>
            </div>
            {isSelected && children && (
                <div className="mt-3 pl-[52px] animate-fade-in-up" style={{animationDuration: '0.3s'}}>
                    {children}
                </div>
            )}
        </div>
    );
};


const LiveQueueStatusCard: React.FC<{ status: QueueStatus | null; isLoading: boolean, selectedTempleName: string }> = ({ status, isLoading, selectedTempleName }) => {
    const { t } = useContext(LanguageContext);

    return (
        <div className="bg-maroon/5 border-2 border-dashed border-maroon/20 p-4 rounded-xl mb-6 text-center">
            <h4 className="font-bold text-maroon mb-2 flex items-center justify-center gap-2"><Wifi size={18} /> {t('queueAssistancePage.liveStatus.title')}</h4>
            {selectedTempleName ? (
                isLoading ? (
                    <p className="text-gray-600 animate-pulse">Loading status for {selectedTempleName}...</p>
                ) : status ? (
                    <div className="animate-fade-in" style={{animationDuration: '0.5s'}}>
                        <p className="text-2xl md:text-3xl font-bold text-gray-800">{t('queueAssistancePage.liveStatus.approxTime', { time: status.waitingTime })}</p>
                        <p className="text-sm text-gray-600 mt-1">{t('queueAssistancePage.liveStatus.devoteesInQueue', { count: status.devoteesInQueue.toLocaleString() })}</p>
                        <p className="text-xs text-gray-400 mt-2">{t('queueAssistancePage.liveStatus.lastUpdated', { time: new Date(status.lastUpdated).toLocaleTimeString() })}</p>
                    </div>
                ) : (
                    <p className="text-gray-500">{t('queueAssistancePage.liveStatus.noData')}</p>
                )
            ) : (
                <p className="text-gray-500">{t('queueAssistancePage.liveStatus.selectTemplePrompt')}</p>
            )}
        </div>
    );
};

const QueueAssistancePage: React.FC<QueueAssistancePageProps> = ({ onBack, onLoginRequired }) => {
    const { user } = useContext(AuthContext);
    const { t, language } = useContext(LanguageContext);
    const toastContext = useContext(ToastContext);

    // Data from API
    const [temples, setTemples] = useState<Temple[]>([]);
    const [packages, setPackages] = useState<QueueAssistancePackage[]>([]);
    const [addOns, setAddOns] = useState<QueueAssistanceAddOn[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Form State
    const [selectedPackageId, setSelectedPackageId] = useState('');
    const [selectedTempleId, setSelectedTempleId] = useState('');
    const [numDevotees, setNumDevotees] = useState(1);
    const [date, setDate] = useState('');
    const [timeSlot, setTimeSlot] = useState('morning');
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [receiveNotifications, setReceiveNotifications] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
    const [isQueueStatusLoading, setIsQueueStatusLoading] = useState(false);

    const [selectedAddOns, setSelectedAddOns] = useState<Record<string, boolean>>({
        guide: false,
        pickup: false,
        poojaItems: false,
    });
    const [guideLanguage, setGuideLanguage] = useState('en');
    
    const datePickerRef = useRef<HTMLDivElement>(null);
    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        if (user) {
            setFullName(user.name || '');
            setPhoneNumber(user.mobile || '');
        }
    }, [user]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [templesRes, packagesRes, addOnsRes] = await Promise.all([
                    getTemples(),
                    getQueuePackages(),
                    getQueueAddOns(),
                ]);
                setTemples(templesRes.data.data);
                const activePackages = packagesRes.data.data.filter(p => p.active).sort((a, b) => a.order - b.order);
                setPackages(activePackages);
                if (activePackages.length > 0) {
                    setSelectedPackageId(activePackages[0]._id);
                }
                setAddOns(addOnsRes.data.data.filter(a => a.active));
            } catch (error) {
                toastContext?.addToast(getApiErrorMessage(error), 'error');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [toastContext]);

    useEffect(() => {
        if (!selectedTempleId) {
            setQueueStatus(null);
            return;
        }
        const fetchStatus = async () => {
            setIsQueueStatusLoading(true);
            try {
                const response = await getQueueStatus(selectedTempleId);
                setQueueStatus(response.data);
            } catch (error) {
                console.error("Could not fetch queue status:", error);
                setQueueStatus(null);
            } finally {
                setIsQueueStatusLoading(false);
            }
        };
        fetchStatus();
        const interval = setInterval(fetchStatus, 30000);
        return () => clearInterval(interval);
    }, [selectedTempleId]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
                setIsDatePickerOpen(false);
            }
        };
        if (isDatePickerOpen) { document.addEventListener('mousedown', handleClickOutside); }
        return () => { document.removeEventListener('mousedown', handleClickOutside); };
    }, [isDatePickerOpen]);

    const handleAddOnToggle = (addOnType: string) => {
        setSelectedAddOns(prev => ({ ...prev, [addOnType]: !prev[addOnType] }));
    };

    const selectedTemple = temples.find(t => t.id.toString() === selectedTempleId);
    const selectedPackage = packages.find(p => p._id === selectedPackageId);
    
    const baseCost = selectedPackage ? selectedPackage.price * numDevotees : 0;
    
    const addOnsCost = addOns.reduce((total, addon) => {
        if (selectedAddOns[addon.type]) {
            return total + addon.price;
        }
        return total;
    }, 0);
    
    const totalCost = baseCost + addOnsCost;

    const validateForm = () => {
        const errors: Record<string, string> = {};
        if (!selectedTempleId) errors.selectedTempleId = 'Please select a temple.';
        if (!selectedPackageId) errors.selectedPackageId = 'Please select a package.';
        if (!date) errors.date = 'Please select a date.';
        if (!fullName.trim() || fullName.trim().length < 3) errors.fullName = 'Please enter a name (min. 3 characters).';
        if (!/^[6-9]\d{9}$/.test(phoneNumber)) errors.phoneNumber = 'Please enter a valid 10-digit mobile number.';
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };
    
    const handleDateChange = (newDate: string) => {
        setDate(newDate);
        setValidationErrors(prev => ({ ...prev, date: '' }));
        setIsDatePickerOpen(false);
    };

    const prePaymentCheck = () => {
        if (!user) {
            toastContext?.addToast('Please log in or sign up to continue.', 'info');
            onLoginRequired(); // This will open the login modal
            return false;
        }
        if (!validateForm()) return false;
        return true;
    };
    
    const handlePayment = async (paymentMethod: 'razorpay' | 'phonepe') => {
        if (!prePaymentCheck() || !selectedPackage) return;
        setIsSubmitting(true);
        
        const bookingAddOns = {
            guideLanguage: selectedAddOns.guide ? guideLanguage : undefined,
            pickupDrop: selectedAddOns.pickup,
            poojaItems: selectedAddOns.poojaItems,
            receiveNotifications: receiveNotifications,
        };

        const bookingDetails: Omit<Booking, 'status' | 'userId'> = {
            id: '', // This will be replaced by transactionId
            userEmail: user!.email,
            pujaNameKey: selectedPackage.name, // Use direct name
            templeNameKey: selectedTemple!.nameKey, // Use key for temple
            date,
            price: totalCost,
            isEPuja: false,
            numDevotees,
            fullName,
            phoneNumber,
            addOns: bookingAddOns,
        };

        if (paymentMethod === 'razorpay') {
            try {
                const orderResponse = await createRazorpayOrder(totalCost * 100);
                const { order_id, key_id } = orderResponse.data;

                const options: RazorpayOptions = {
                    key: key_id, amount: totalCost * 100, currency: 'INR', name: 'astrologica',
                    description: `${selectedPackage.name} - ${t(selectedTemple!.nameKey)}`,
                    image: '/public/image/logo white final.png', order_id: order_id,
                    handler: async (response) => {
                        try {
                            await verifyRazorpayPayment({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            });
                            await createBooking({ ...bookingDetails, id: response.razorpay_payment_id });
                            toastContext?.addToast(t('bookingModal.success.title'), 'success');
                            onBack();
                        } catch (error) {
                            toastContext?.addToast(getApiErrorMessage(error), 'error');
                            setIsSubmitting(false);
                        }
                    },
                    prefill: { name: fullName, email: user!.email, contact: phoneNumber },
                    notes: { service: 'queue_assistance', temple_id: selectedTempleId, date: date, package: selectedPackageId, ...selectedAddOns },
                    theme: { color: '#800000' },
                    modal: { ondismiss: () => { toastContext?.addToast('Payment was cancelled.', 'info'); setIsSubmitting(false); } }
                };
                const rzp = new window.Razorpay(options);
                rzp.open();
            } catch (error) {
                toastContext?.addToast(getApiErrorMessage(error), 'error');
                setIsSubmitting(false);
            }
        } else if (paymentMethod === 'phonepe') {
            const paymentPayload: PaymentPayload = {
                amount: totalCost, type: 'booking',
                details: bookingDetails
            };
            try {
                const response = await createPhonepeOrder(paymentPayload);
                if (response.data.redirectUrl) {
                    window.location.href = response.data.redirectUrl;
                } else {
                    throw new Error('Could not initiate PhonePe payment.');
                }
            } catch (error) {
                toastContext?.addToast(getApiErrorMessage(error), 'error');
                setIsSubmitting(false);
            }
        }
    };
    
    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading services...</div>;
    }

    const getAddOnByType = (type: 'guide' | 'pickup' | 'poojaItems') => addOns.find(a => a.type === type);
    const guideAddon = getAddOnByType('guide');
    const pickupAddon = getAddOnByType('pickup');
    const poojaItemsAddon = getAddOnByType('poojaItems');

    return (
        <div className="bg-orange-50/50 min-h-screen">
            <div className="container mx-auto px-4 py-8">
                <button onClick={onBack} className="inline-flex items-center gap-2 text-saffron font-semibold hover:underline mb-6">
                    <ArrowLeft size={20} /> {t('common.backToHome')}
                </button>
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-maroon">{t('queueAssistancePage.title')}</h1>
                    <p className="text-lg text-gray-600 mt-2 max-w-3xl mx-auto">{t('queueAssistancePage.description')}</p>
                </div>

                <div className="max-w-2xl mx-auto bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-orange-100">
                    <LiveQueueStatusCard status={queueStatus} isLoading={isQueueStatusLoading} selectedTempleName={selectedTemple ? t(selectedTemple.nameKey) : ''} />
                    
                    <h3 className="text-2xl font-bold text-maroon mb-6 text-center">{t('queueAssistancePage.formTitle')}</h3>
                    <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <Sparkles size={16} className="text-saffron" />
                                {t('queueAssistancePage.labels.assistanceType')}
                            </label>
                            <div className="space-y-3">
                                {packages.map((pkg) => (
                                    <label key={pkg._id} htmlFor={`package-${pkg._id}`} className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedPackageId === pkg._id ? 'border-saffron bg-orange-50/50 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <input type="radio" id={`package-${pkg._id}`} name="assistancePackage" value={pkg._id} checked={selectedPackageId === pkg._id} onChange={() => setSelectedPackageId(pkg._id)} className="mt-1 h-4 w-4 text-saffron border-gray-300 focus:ring-saffron" />
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-maroon">{pkg.name}</span>
                                                <span className="text-lg font-bold text-gray-800">₹{pkg.price}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">{pkg.description}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="temple-select" className="block text-sm font-medium text-gray-700 mb-1">{t('queueAssistancePage.selectTemple')}</label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <select id="temple-select" value={selectedTempleId} onChange={e => setSelectedTempleId(e.target.value)} required className="w-full pl-10 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-saffron focus:border-saffron appearance-none bg-white">
                                    <option value="" disabled>{t('queueAssistancePage.selectTemple')}</option>
                                    {temples.map(temple => (<option key={temple.id} value={temple.id}>{t(temple.nameKey)}</option>))}
                                </select>
                            </div>
                            <InputError message={validationErrors.selectedTempleId} />
                        </div>

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
                                <label htmlFor="time-slot" className="block text-sm font-medium text-gray-700 mb-1">{t('queueAssistancePage.labels.timeSlot')}</label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <select id="time-slot" value={timeSlot} onChange={e => setTimeSlot(e.target.value)} required className="w-full pl-10 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-saffron focus:border-saffron appearance-none bg-white">
                                        <option value="morning">{t('bookingModal.timeSlots.morning')}</option>
                                        <option value="afternoon">{t('bookingModal.timeSlots.afternoon')}</option>
                                        <option value="evening">{t('bookingModal.timeSlots.evening')}</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="num-devotees" className="block text-sm font-medium text-gray-700 mb-1">{t('bookingModal.labels.devotees')}</label>
                            <div className="relative">
                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="number" id="num-devotees" value={numDevotees} onChange={e => setNumDevotees(Math.max(1, parseInt(e.target.value) || 1))} min="1" required className="w-full pl-10 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-saffron focus:border-saffron" />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-dashed">
                             <label className="block text-sm font-medium text-gray-700 mb-2">{t('queueAssistancePage.addons.title')}</label>
                             <div className="space-y-3">
                                {guideAddon && (
                                    <AddOnCard addon={guideAddon} icon={<Languages size={24} />} isSelected={!!selectedAddOns.guide} onToggle={handleAddOnToggle}>
                                        <div>
                                            <label htmlFor="guide-lang" className="text-xs font-semibold text-gray-600">{t('queueAssistancePage.addons.guide.language')}</label>
                                            <select 
                                                id="guide-lang" 
                                                value={guideLanguage} 
                                                onChange={e => setGuideLanguage(e.target.value)} 
                                                onClick={(e) => e.stopPropagation()} 
                                                className="mt-1 w-full md:w-1/2 p-1.5 border border-gray-300 rounded-md text-sm focus:ring-saffron focus:border-saffron bg-white"
                                            >
                                                {guideLanguages.map(lang => <option key={lang.code} value={lang.code}>{t(lang.nameKey)}</option>)}
                                            </select>
                                        </div>
                                    </AddOnCard>
                                )}
                                {pickupAddon && (
                                    <AddOnCard addon={pickupAddon} icon={<Car size={24} />} isSelected={!!selectedAddOns.pickup} onToggle={handleAddOnToggle} />
                                )}
                                {poojaItemsAddon && (
                                    <AddOnCard addon={poojaItemsAddon} icon={<Flower2 size={24} />} isSelected={!!selectedAddOns.poojaItems} onToggle={handleAddOnToggle} />
                                )}
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
                        
                        <div className="relative p-4 border rounded-lg flex items-center gap-4 bg-orange-50/50">
                            <input type="checkbox" id="notifications" name="notifications" checked={receiveNotifications} onChange={e => setReceiveNotifications(e.target.checked)} className="h-4 w-4 text-saffron border-gray-300 focus:ring-saffron" />
                            <label htmlFor="notifications" className="font-semibold text-gray-800 flex-1">{t('queueAssistancePage.notifications.label')}</label>
                        </div>

                        <div className="pt-5 border-t border-orange-200 space-y-2">
                             <div className="flex justify-between items-center text-sm text-gray-600">
                                <span>{selectedPackage?.name} ({numDevotees} &times; ₹{selectedPackage?.price.toLocaleString('en-IN')})</span>
                                <span>₹{baseCost.toLocaleString('en-IN')}</span>
                            </div>
                            {selectedAddOns.guide && guideAddon && <div className="flex justify-between items-center text-sm text-gray-600 animate-fade-in"><span>{guideAddon.name}</span><span>+ ₹{guideAddon.price.toLocaleString('en-IN')}</span></div>}
                            {selectedAddOns.pickup && pickupAddon && <div className="flex justify-between items-center text-sm text-gray-600 animate-fade-in"><span>{pickupAddon.name}</span><span>+ ₹{pickupAddon.price.toLocaleString('en-IN')}</span></div>}
                            {selectedAddOns.poojaItems && poojaItemsAddon && <div className="flex justify-between items-center text-sm text-gray-600 animate-fade-in"><span>{poojaItemsAddon.name}</span><span>+ ₹{poojaItemsAddon.price.toLocaleString('en-IN')}</span></div>}
                             <div className="pt-2 border-t border-dashed"></div>
                            <div className="flex justify-between items-center"><span className="text-lg font-bold text-gray-800">{t('bookingModal.total')}:</span><span className="text-2xl font-bold text-maroon">₹{totalCost.toLocaleString('en-IN')}</span></div>
                            
                            <div className="space-y-3 pt-3">
                                <button type="button" onClick={() => handlePayment('razorpay')} disabled={isSubmitting} className="w-full bg-saffron text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-500 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-saffron/50 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                    {isSubmitting ? t('bookingModal.buttons.processing') : <><CreditCard size={20} /><span>{t('bookingModal.buttons.confirmRazorpay')}</span></>}
                                </button>
                                <button type="button" onClick={() => handlePayment('phonepe')} disabled={isSubmitting} className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-400/50 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                    {isSubmitting ? t('bookingModal.buttons.processing') : <><Smartphone size={20} /><span>{t('bookingModal.buttons.confirmPhonePe')}</span></>}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {selectedTemple?.layoutImageUrl && (
                    <div className="max-w-2xl mx-auto mt-8">
                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-orange-100">
                             <h3 className="text-xl font-bold text-maroon mb-4 flex items-center gap-2"><Map size={20} /> {t('queueAssistancePage.map.title')}</h3>
                             <div className="bg-gray-100 rounded-lg overflow-hidden border">
                                <img src={selectedTemple.layoutImageUrl} alt={`${t(selectedTemple.nameKey)} Layout`} className="w-full h-auto object-contain" />
                             </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QueueAssistancePage;