import React, { useState, useEffect, useContext } from 'react';
import { XCircle, Loader, AlertTriangle } from 'lucide-react';
import { LanguageContext } from '../contexts/LanguageContext';
import { ToastContext } from '../contexts/ToastContext';
import { verifyPhonepePayment, getApiErrorMessage } from '../services/api';

interface PaymentStatusProps {
    onNavigateToDashboard: () => void;
    onBackToHome: () => void;
}

// Removed 'success' state, as a successful verification will now immediately redirect.
type Status = 'verifying' | 'failed';

const PaymentStatus: React.FC<PaymentStatusProps> = ({ onNavigateToDashboard, onBackToHome }) => {
    const [status, setStatus] = useState<Status>('verifying');
    const [message, setMessage] = useState('');
    const { t } = useContext(LanguageContext);
    const toastContext = useContext(ToastContext);

    useEffect(() => {
        const verify = async () => {
            // When using hash routing, params are in the hash. Fallback to search for regular routing.
            const params = new URLSearchParams(window.location.hash.split('?')[1] || window.location.search);
            const merchantTransactionId = params.get('merchantTransactionId');

            if (!merchantTransactionId) {
                setStatus('failed');
                setMessage('Transaction ID not found in URL.');
                return;
            }

            try {
                const response = await verifyPhonepePayment(merchantTransactionId);
                if (response.data.success) {
                    const successMessage = response.data.data?.frequency 
                        ? t('subscriptionModal.success.title')
                        : t('bookingModal.success.title');
                    
                    // On success, show a toast and redirect to the dashboard.
                    toastContext?.addToast(successMessage, 'success');
                    onNavigateToDashboard();
                } else {
                    setStatus('failed');
                    setMessage(response.data.message || 'Payment verification failed.');
                }
            } catch (error) {
                setStatus('failed');
                setMessage(getApiErrorMessage(error));
                toastContext?.addToast(getApiErrorMessage(error), 'error');
            }
        };

        verify();
    }, [t, toastContext, onNavigateToDashboard]);

    const renderContent = () => {
        switch (status) {
            case 'verifying':
                return (
                    <>
                        <Loader className="animate-spin text-saffron" size={48} />
                        <h2 className="text-3xl font-bold text-maroon mt-4">{t('paymentStatus.verifying')}</h2>
                        <p className="text-gray-600 mt-2">{t('paymentStatus.pleaseWait')}</p>
                    </>
                );
            case 'failed':
                return (
                    <>
                        <XCircle className="text-red-500" size={48} />
                        <h2 className="text-3xl font-bold text-maroon mt-4">{t('paymentStatus.failedTitle')}</h2>
                        <div className="mt-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 max-w-md">
                            <div className="flex">
                                <AlertTriangle className="flex-shrink-0 h-5 w-5 mr-3" />
                                <div className="text-left">
                                    <p className="font-bold">Error Details</p>
                                    <p>{message || t('paymentStatus.failedMessage')}</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onBackToHome}
                            className="mt-8 bg-saffron text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-orange-500 transition-all"
                        >
                            {t('paymentStatus.tryAgain')}
                        </button>
                    </>
                );
        }
    };

    return (
        <div className="bg-orange-50/50 min-h-[calc(100vh-200px)] flex items-center justify-center">
            <div className="container mx-auto px-4 py-12 text-center">
                <div className="bg-white p-8 md:p-12 rounded-xl shadow-lg inline-flex flex-col items-center">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default PaymentStatus;