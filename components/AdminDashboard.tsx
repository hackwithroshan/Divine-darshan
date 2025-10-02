import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import {
    LogOut, Settings, Search, Bell, ChevronDown, LayoutDashboard, Building2, Users, BookOpen, CreditCard,
    BarChart2, FileText, Settings2, PlusCircle, Edit, Trash2, X, Image as ImageIcon, ChevronsUpDown, MoreHorizontal, AlertTriangle, ArrowUp, ArrowDown, Sparkles as SparklesIcon, ClipboardList, Languages, Car, Flower2, Tag
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import { User, Temple, Booking, Puja, BookingStatus, PopulatedUser, SeasonalEvent, Testimonial, AppSettings, Service, QueueAssistancePackage, QueueAssistanceAddOn } from '../types';
import { AuthContext } from '../contexts/AuthContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { ToastContext } from '../contexts/ToastContext';
import { 
    getAllBookings, getTemples, getUsers, updateTemple, deleteTemple, updateUser, createUser, deleteUser, addTemple, getApiErrorMessage, 
    getSeasonalEvent, updateSeasonalEvent, getTestimonials, addTestimonial, updateTestimonial, deleteTestimonial,
    getAppSettings, updateAppSettings, getServices, addService, updateService, deleteService,
    getQueuePackages, addQueuePackage, updateQueuePackage, deleteQueuePackage,
    getQueueAddOns, addQueueAddOn, updateQueueAddOn, deleteQueueAddOn
} from '../services/api';

interface AdminDashboardProps {
    onLogout: () => void;
}

type AdminView = 'dashboard' | 'temples' | 'users' | 'bookings' | 'services' | 'payments' | 'reports' | 'content' | 'settings' | 'queue_assistance';

// --- MAIN COMPONENT ---

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
    const [view, setView] = useState<AdminView>('dashboard');
    const { user } = useContext(AuthContext);
    const { t } = useContext(LanguageContext);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const renderView = () => {
        switch (view) {
            case 'dashboard':
                return <DashboardHome />;
            case 'temples':
                return <TempleManagement />;
            case 'users':
                return <UserManagement />;
            case 'bookings':
                return <BookingManagement />;
            case 'services':
                return <ServiceManagement />;
            case 'payments':
                return <PaymentManagement />;
            case 'reports':
                return <ReportsView />;
            case 'content':
                return <ContentManagement />;
            case 'settings':
                return <SettingsView />;
            case 'queue_assistance':
                return <QueueAssistanceManagement />;
            default:
                return <div className="p-8"><h2 className="text-2xl font-bold">{t(`adminDashboard.menu.${view}`)}</h2><p>This section is under construction.</p></div>;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <Sidebar currentView={view} setView={setView} onLogout={onLogout} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
                <AdminHeader user={user} onLogout={onLogout} />
                <main className="flex-1 p-6 overflow-y-auto">
                    {renderView()}
                </main>
            </div>
        </div>
    );
};

// --- SUB-COMPONENTS (within the same file) ---

const Sidebar: React.FC<{ currentView: AdminView, setView: (view: AdminView) => void, onLogout: () => void, isOpen: boolean, setIsOpen: (isOpen: boolean) => void }> = ({ currentView, setView, isOpen }) => {
    const { t } = useContext(LanguageContext);

    const menuItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: t('adminDashboard.menu.dashboard') },
        { id: 'temples', icon: Building2, label: t('adminDashboard.menu.temples') },
        { id: 'users', icon: Users, label: t('adminDashboard.menu.users') },
        { id: 'bookings', icon: BookOpen, label: t('adminDashboard.menu.bookings') },
        { id: 'queue_assistance', icon: ClipboardList, label: t('adminDashboard.menu.queueAssistance') },
        { id: 'services', icon: SparklesIcon, label: t('adminDashboard.menu.services') },
        { id: 'payments', icon: CreditCard, label: t('adminDashboard.menu.payments') },
        { id: 'reports', icon: BarChart2, label: t('adminDashboard.menu.reports') },
        { id: 'content', icon: FileText, label: t('adminDashboard.menu.content') },
        { id: 'settings', icon: Settings2, label: t('adminDashboard.menu.settings') },
    ];

    return (
        <aside className={`fixed top-0 left-0 h-full bg-maroon text-white w-64 flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex items-center justify-center h-20 border-b border-saffron/20 px-4">
                <img src="/public/image/logo white final.png " alt="astrologica logo" className="h-10" />
            </div>
            <nav className="flex-1 py-4">
                <ul>
                    {menuItems.map(item => (
                        <li key={item.id} className="px-4 py-1">
                            <a
                                href="#"
                                onClick={(e) => { e.preventDefault(); setView(item.id as AdminView); }}
                                className={`flex items-center p-2 rounded-md transition-colors ${currentView === item.id ? 'bg-saffron text-maroon font-bold' : 'hover:bg-red-900'}`}
                            >
                                <item.icon size={20} className="mr-3" />
                                <span>{item.label}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};


const AdminHeader: React.FC<{ user: User | null; onLogout: () => void }> = ({ user, onLogout }) => {
    const { t } = useContext(LanguageContext);
    return (
        <header className="bg-white shadow-sm h-20 flex items-center justify-between px-6">
            <div className="flex items-center">
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input type="text" placeholder={t('adminDashboard.searchPlaceholder')} className="w-full pl-10 pr-4 py-2 border rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-saffron" />
                </div>
            </div>
            <div className="flex items-center space-x-6">
                <button className="relative text-gray-600 hover:text-maroon">
                    <Bell size={24} />
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
                </button>
                <div className="relative">
                    <button className="flex items-center space-x-2">
                        <div className="w-10 h-10 rounded-full bg-saffron text-maroon flex items-center justify-center font-bold">
                            {user?.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="font-semibold text-sm">{user?.name}</p>
                            <p className="text-xs text-gray-500">{user?.role.replace('_', ' ')}</p>
                        </div>
                        <ChevronDown size={16} />
                    </button>
                </div>
            </div>
        </header>
    );
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ElementType }> = ({ title, value, icon: Icon }) => (
    <div className="bg-white p-6 rounded-lg shadow flex items-center space-x-4">
        <div className="p-3 bg-orange-100 rounded-full">
            <Icon className="text-saffron" size={28} />
        </div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-maroon">{value}</p>
        </div>
    </div>
);

const DashboardHome: React.FC = () => {
    const { user } = useContext(AuthContext);
    const { t, language } = useContext(LanguageContext);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const bookingsRes = await getAllBookings();
                // Sort bookings once on fetch
                const sortedBookings = bookingsRes.data.data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                setBookings(sortedBookings);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const dashboardData = useMemo(() => {
        const totalBookings = bookings.length;
        const totalRevenue = bookings.reduce((sum, b) => sum + b.price, 0);

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const last7DaysBookings = bookings.filter(b => new Date(b.date) >= sevenDaysAgo);
        const last7DaysRevenue = last7DaysBookings.reduce((sum, b) => sum + b.price, 0);

        const recentBookings = bookings.slice(0, 5);

        return {
            totalBookings,
            totalRevenue,
            last7DaysBookingCount: last7DaysBookings.length,
            last7DaysRevenue,
            recentBookings
        };
    }, [bookings]);

    const statusColors: Record<BookingStatus, string> = {
        Confirmed: 'bg-green-100 text-green-800',
        Completed: 'bg-blue-100 text-blue-800',
        Cancelled: 'bg-red-100 text-red-800',
    };
    
    const getUserName = (userId: string | PopulatedUser, fallbackName: string) => {
        if (typeof userId === 'object' && userId !== null && 'name' in userId) {
            return userId.name;
        }
        return fallbackName;
    };


    return (
        <div className="space-y-6">
            <div>
                 <h1 className="text-3xl font-bold text-gray-800">{t('adminDashboard.menu.dashboard')}</h1>
                 <p className="text-gray-600">{t('dashboard.welcome', { name: user?.name })}</p>
            </div>
           
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title={t('adminDashboard.stats.totalRevenue')} value={`₹${dashboardData.totalRevenue.toLocaleString('en-IN')}`} icon={CreditCard} />
                <StatCard title={t('adminDashboard.stats.totalBookings')} value={dashboardData.totalBookings.toString()} icon={BookOpen} />
                <StatCard title={t('adminDashboard.stats.activeSubscriptions')} value="N/A" icon={Users} />
                <StatCard title={t('adminDashboard.stats.pendingRefunds')} value="0" icon={AlertTriangle} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left Column: 7 Day Overview */}
                <div className="xl:col-span-1 bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-bold text-maroon mb-4">Last 7 Days Overview</h2>
                    {isLoading ? <p>Loading...</p> : (
                    <div className="space-y-5">
                        <div className="flex justify-between items-center">
                            <p className="text-gray-600">Revenue</p>
                            <p className="text-xl font-bold text-gray-800">₹{dashboardData.last7DaysRevenue.toLocaleString('en-IN')}</p>
                        </div>
                         <div className="flex justify-between items-center">
                            <p className="text-gray-600">Bookings</p>
                            <p className="text-xl font-bold text-gray-800">{dashboardData.last7DaysBookingCount}</p>
                        </div>
                    </div>
                    )}
                </div>

                {/* Right Column: Recent Bookings */}
                <div className="xl:col-span-2 bg-white p-6 rounded-lg shadow">
                     <h2 className="text-xl font-bold text-maroon mb-4">Recent Bookings</h2>
                     <div className="overflow-x-auto">
                        {isLoading ? <p>Loading...</p> : dashboardData.recentBookings.length > 0 ? (
                        <table className="min-w-full">
                            <thead className="border-b-2 border-gray-200">
                                <tr>
                                    <th className="pb-3 text-left text-sm font-semibold text-gray-500">User</th>
                                    <th className="pb-3 text-left text-sm font-semibold text-gray-500">Puja</th>
                                    <th className="pb-3 text-right text-sm font-semibold text-gray-500">Amount</th>
                                    <th className="pb-3 text-center text-sm font-semibold text-gray-500">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dashboardData.recentBookings.map(booking => (
                                    <tr key={booking.id} className="border-b border-gray-100">
                                        <td className="py-3 pr-3">
                                            <p className="font-medium text-gray-800">{getUserName(booking.userId, booking.fullName)}</p>
                                            <p className="text-xs text-gray-500">{booking.userEmail}</p>
                                        </td>
                                        <td className="py-3 pr-3">
                                            <p className="font-medium text-gray-800">{t(booking.pujaNameKey)}</p>
                                            <p className="text-xs text-gray-500">{t(booking.templeNameKey)}</p>
                                        </td>
                                        <td className="py-3 pr-3 text-right font-semibold text-gray-700">₹{booking.price.toLocaleString('en-IN')}</td>
                                        <td className="py-3 text-center">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[booking.status]}`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        ) : (
                            <p className="text-center text-gray-500 py-8">No recent bookings found.</p>
                        )}
                     </div>
                </div>
            </div>
        </div>
    );
};


// --- Temple Management ---

const TempleManagement: React.FC = () => {
    const { t } = useContext(LanguageContext);
    const toastContext = useContext(ToastContext);
    const [temples, setTemples] = useState<Temple[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedTemple, setSelectedTemple] = useState<Temple | null>(null);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

    const fetchTemples = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await getTemples();
            setTemples(res.data.data);
            setError(null);
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTemples();
    }, [fetchTemples]);

    const handleOpenAdd = () => {
        setSelectedTemple(null);
        setModalMode('add');
        setIsModalOpen(true);
    };

    const handleOpenEdit = (temple: Temple) => {
        setSelectedTemple(temple);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleOpenDelete = (temple: Temple) => {
        setSelectedTemple(temple);
        setIsConfirmOpen(true);
    };

    const handleCloseModals = () => {
        setIsModalOpen(false);
        setIsConfirmOpen(false);
        setSelectedTemple(null);
    };

    const handleSave = async (templeData: Partial<Temple>) => {
        try {
            if (modalMode === 'edit' && selectedTemple) {
                await updateTemple(selectedTemple.id, templeData);
                toastContext?.addToast('Temple updated successfully!', 'success');
            } else {
                await addTemple(templeData);
                toastContext?.addToast('Temple added successfully!', 'success');
            }
            handleCloseModals();
            fetchTemples();
        } catch (err) {
            toastContext?.addToast(getApiErrorMessage(err), 'error');
        }
    };

    const handleDelete = async () => {
        if (!selectedTemple) return;
        try {
            await deleteTemple(selectedTemple.id);
            toastContext?.addToast('Temple deleted successfully!', 'success');
            handleCloseModals();
            fetchTemples();
        } catch (err) {
            toastContext?.addToast(getApiErrorMessage(err), 'error');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">{t('adminDashboard.temples.title')}</h1>
                <button onClick={handleOpenAdd} className="flex items-center gap-2 bg-saffron text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-500">
                    <PlusCircle size={20} />
                    {t('adminDashboard.temples.addNew')}
                </button>
            </div>
            <div className="bg-white rounded-lg shadow overflow-x-auto">
                 {isLoading ? <div className="p-6 text-center">Loading temples...</div> :
                 error ? <div className="p-6 text-center text-red-500">Error: {error}</div> :
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminDashboard.temples.table.image')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminDashboard.temples.table.name')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminDashboard.temples.table.location')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminDashboard.temples.table.deity')}</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminDashboard.temples.table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {temples.map(temple => (
                            <tr key={temple.id}>
                                <td className="px-6 py-4 whitespace-nowrap"><img src={temple.imageUrl} alt={t(temple.nameKey)} className="w-16 h-10 object-cover rounded"/></td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{t(temple.nameKey)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t(temple.locationKey)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t(temple.deityKey)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleOpenEdit(temple)} className="text-indigo-600 hover:text-indigo-900 mr-4" aria-label={`Edit ${t(temple.nameKey)}`}><Edit size={18} /></button>
                                    <button onClick={() => handleOpenDelete(temple)} className="text-red-600 hover:text-red-900" aria-label={`Delete ${t(temple.nameKey)}`}><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                }
            </div>
            {isModalOpen && <TempleFormModal isOpen={isModalOpen} onClose={handleCloseModals} onSave={handleSave} temple={selectedTemple} mode={modalMode} />}
            {isConfirmOpen && <ConfirmationModal isOpen={isConfirmOpen} onClose={handleCloseModals} onConfirm={handleDelete} title={t('adminDashboard.temples.confirmDelete')} message={`You are about to delete ${t(selectedTemple?.nameKey ?? 'this temple')}. This action is permanent.`} />}
        </div>
    );
};


const TempleFormModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (data: Partial<Temple>) => Promise<void>; temple: Temple | null; mode: 'add' | 'edit' }> = ({ isOpen, onClose, onSave, temple, mode }) => {
    const { t } = useContext(LanguageContext);
    const [formData, setFormData] = useState<Partial<Temple>>({ faq: [], benefitsKey: [], gallery: [], pujas: [], reviewIds: [] });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (temple) {
            setFormData(temple);
        } else {
            setFormData({ nameKey: '', locationKey: '', deityKey: '', imageUrl: '', descriptionKey: '', famousPujaKey: '', faq: [], benefitsKey: [], gallery: [], pujas: [], reviewIds: [] });
        }
    }, [temple, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleFaqChange = (index: number, field: 'questionKey' | 'answerKey', value: string) => {
        const newFaqs = [...(formData.faq || [])];
        newFaqs[index] = { ...newFaqs[index], [field]: value };
        setFormData(prev => ({ ...prev, faq: newFaqs }));
    };

    const addFaq = () => {
        const newFaqs = [...(formData.faq || []), { questionKey: '', answerKey: '' }];
        setFormData(prev => ({ ...prev, faq: newFaqs }));
    };

    const removeFaq = (index: number) => {
        if (confirm(t('adminDashboard.temples.confirmDeleteFaq'))) {
            const newFaqs = [...(formData.faq || [])];
            newFaqs.splice(index, 1);
            setFormData(prev => ({ ...prev, faq: newFaqs }));
        }
    };

    const handleBenefitChange = (index: number, value: string) => {
        const newBenefits = [...(formData.benefitsKey || [])];
        newBenefits[index] = value;
        setFormData(prev => ({ ...prev, benefitsKey: newBenefits }));
    };

    const addBenefit = () => {
        const newBenefits = [...(formData.benefitsKey || []), ''];
        setFormData(prev => ({ ...prev, benefitsKey: newBenefits }));
    };

    const removeBenefit = (index: number) => {
        const newBenefits = [...(formData.benefitsKey || [])];
        newBenefits.splice(index, 1);
        setFormData(prev => ({ ...prev, benefitsKey: newBenefits }));
    };

    const handlePujaChange = (index: number, field: keyof Puja, value: string | number | boolean) => {
        const newPujas = [...(formData.pujas || [])];
        const pujaToUpdate = { ...newPujas[index] };
        (pujaToUpdate as any)[field] = value;
        newPujas[index] = pujaToUpdate;
        setFormData(prev => ({ ...prev, pujas: newPujas }));
    };

    const addPuja = () => {
        const existingPujas = formData.pujas || [];
        const newPujaId = existingPujas.length > 0 ? Math.max(...existingPujas.map(p => p.id)) + 1 : 1;
        const newPuja: Puja = {
            id: newPujaId,
            nameKey: '',
            descriptionKey: '',
            price: 0,
            isEPuja: false,
        };
        setFormData(prev => ({ ...prev, pujas: [...(prev.pujas || []), newPuja] }));
    };

    const removePuja = (index: number) => {
        if (confirm('Are you sure you want to remove this puja?')) {
            const newPujas = [...(formData.pujas || [])];
            newPujas.splice(index, 1);
            setFormData(prev => ({ ...prev, pujas: newPujas }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        await onSave(formData);
        setIsSubmitting(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 animate-fade-in" style={{animationDuration: '0.2s'}}>
            <div className="bg-gray-50 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-maroon">{mode === 'edit' ? t('adminDashboard.temples.editTemple') : t('adminDashboard.temples.addNew')}</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto">
                    {/* Basic Info Fields */}
                    <fieldset className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <legend className="text-xl font-semibold text-gray-800 mb-4 col-span-full">Basic Information</legend>
                        <div><label className="block text-sm font-semibold text-gray-700 mb-1">Name Key</label><input type="text" name="nameKey" value={formData.nameKey || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-saffron focus:border-saffron" required /></div>
                        <div><label className="block text-sm font-semibold text-gray-700 mb-1">Location Key</label><input type="text" name="locationKey" value={formData.locationKey || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-saffron focus:border-saffron" required /></div>
                        <div><label className="block text-sm font-semibold text-gray-700 mb-1">Deity Key</label><input type="text" name="deityKey" value={formData.deityKey || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-saffron focus:border-saffron" required /></div>
                        <div className="lg:col-span-2"><label className="block text-sm font-semibold text-gray-700 mb-1">Image URL</label><input type="text" name="imageUrl" value={formData.imageUrl || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-saffron focus:border-saffron" required /></div>
                        <div><label className="block text-sm font-semibold text-gray-700 mb-1">Famous Puja Key</label><input type="text" name="famousPujaKey" value={formData.famousPujaKey || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-saffron focus:border-saffron" required /></div>
                        <div className="md:col-span-2 lg:col-span-3"><label className="block text-sm font-semibold text-gray-700 mb-1">Description Key</label><textarea name="descriptionKey" value={formData.descriptionKey || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-saffron focus:border-saffron" rows={4} required /></div>
                    </fieldset>
                    
                    {/* Spiritual Benefits Section */}
                    <fieldset>
                        <legend className="text-xl font-semibold text-gray-800 mb-4">{t('adminDashboard.temples.form.benefitsTitle')}</legend>
                        <div className="p-4 bg-white border border-gray-200 rounded-lg space-y-4">
                            {(formData.benefitsKey || []).map((benefit, index) => (
                                <div key={index} className="flex items-center gap-3 animate-fade-in" style={{ animationDuration: '0.2s' }}>
                                    <input
                                        type="text"
                                        name={`benefit-${index}`}
                                        value={benefit}
                                        onChange={(e) => handleBenefitChange(index, e.target.value)}
                                        placeholder="Enter benefit translation key (e.g., data.temples.some.benefit)"
                                        className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-saffron focus:border-saffron"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeBenefit(index)}
                                        className="p-2.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors flex-shrink-0"
                                        aria-label={`Remove benefit ${index + 1}`}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                             <button
                                type="button"
                                onClick={addBenefit}
                                className="mt-2 flex items-center gap-2 bg-saffron/10 text-saffron-dark font-semibold py-2 px-4 rounded-lg hover:bg-saffron/20 transition-colors text-sm"
                            >
                                <PlusCircle size={18} />
                                {t('adminDashboard.temples.buttons.addBenefit')}
                            </button>
                        </div>
                    </fieldset>

                    {/* Pujas Section */}
                    <fieldset>
                        <legend className="text-xl font-semibold text-gray-800 mb-4">{t('adminDashboard.temples.form.pujasTitle')}</legend>
                        <div className="space-y-6">
                            {(formData.pujas || []).map((puja, index) => (
                                <div key={puja.id} className="bg-white border border-gray-200 rounded-xl p-6 relative group transition-shadow hover:shadow-md">
                                    <button type="button" onClick={() => removePuja(index)} className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" aria-label={`Remove Puja #${index+1}`}>
                                        <Trash2 size={18} />
                                    </button>
                                    <h4 className="font-bold text-lg text-maroon mb-4">Puja #{index + 1}</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">{t('adminDashboard.temples.form.pujaNameKey')}</label>
                                            <input type="text" value={puja.nameKey} onChange={e => handlePujaChange(index, 'nameKey', e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-saffron focus:border-saffron" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">{t('adminDashboard.temples.form.price')}</label>
                                            <input type="number" value={puja.price} onChange={e => handlePujaChange(index, 'price', parseFloat(e.target.value) || 0)} className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-saffron focus:border-saffron" />
                                        </div>
                                        <div className="col-span-full">
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">{t('adminDashboard.temples.form.pujaDescriptionKey')}</label>
                                            <textarea value={puja.descriptionKey} onChange={e => handlePujaChange(index, 'descriptionKey', e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-saffron focus:border-saffron" rows={2} />
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center gap-3 bg-orange-50 p-3 rounded-lg">
                                        <input type="checkbox" id={`isEPuja-${puja.id}`} checked={puja.isEPuja || false} onChange={e => handlePujaChange(index, 'isEPuja', e.target.checked)} className="h-5 w-5 rounded border-gray-300 text-saffron focus:ring-saffron" />
                                        <label htmlFor={`isEPuja-${puja.id}`} className="text-sm font-semibold text-gray-800">{t('adminDashboard.temples.form.isEPuja')}</label>
                                    </div>
                                    {puja.isEPuja && (
                                        <div className="mt-4 pl-4 border-l-4 border-saffron space-y-4 animate-fade-in-up" style={{animationDuration: '0.3s'}}>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">{t('adminDashboard.temples.form.ePujaDetailsKey')}</label>
                                                <input type="text" value={puja.detailsKey || ''} onChange={e => handlePujaChange(index, 'detailsKey', e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-saffron focus:border-saffron" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">{t('adminDashboard.temples.form.virtualTourLink')}</label>
                                                <input type="text" value={puja.virtualTourLink || ''} onChange={e => handlePujaChange(index, 'virtualTourLink', e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-saffron focus:border-saffron" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">{t('adminDashboard.temples.form.requirementsKey')}</label>
                                                <input type="text" value={puja.requirementsKey || ''} onChange={e => handlePujaChange(index, 'requirementsKey', e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-saffron focus:border-saffron" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <button type="button" onClick={addPuja} className="w-full text-center py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-semibold hover:border-saffron hover:text-saffron transition-colors flex items-center justify-center gap-2">
                                <PlusCircle size={20} />
                                {t('adminDashboard.temples.buttons.addPuja')}
                            </button>
                        </div>
                    </fieldset>

                    {/* FAQs Section */}
                    <fieldset>
                        <legend className="text-xl font-semibold text-gray-800 mb-4">{t('adminDashboard.temples.form.faqsTitle')}</legend>
                        <div className="space-y-6">
                            {(formData.faq || []).map((faq, index) => (
                                <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 relative group transition-shadow hover:shadow-md">
                                     <button type="button" onClick={() => removeFaq(index)} className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" aria-label={`Remove FAQ #${index+1}`}>
                                        <Trash2 size={18} />
                                    </button>
                                    <h4 className="font-bold text-lg text-maroon mb-4">FAQ #{index + 1}</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Question Key</label>
                                            <input type="text" value={faq.questionKey} onChange={e => handleFaqChange(index, 'questionKey', e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-saffron focus:border-saffron" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Answer Key</label>
                                            <textarea value={faq.answerKey} onChange={e => handleFaqChange(index, 'answerKey', e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-saffron focus:border-saffron" rows={3} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                         <button type="button" onClick={addFaq} className="mt-6 w-full text-center py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-semibold hover:border-saffron hover:text-saffron transition-colors flex items-center justify-center gap-2">
                            <PlusCircle size={20} />
                            {t('adminDashboard.temples.buttons.addFaq')}
                        </button>
                    </fieldset>
                </form>
                <div className="flex justify-end p-6 border-t border-gray-200 bg-white/50 sticky bottom-0">
                    <button onClick={onClose} type="button" className="mr-3 py-2.5 px-6 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition-colors">{t('adminDashboard.temples.buttons.cancel')}</button>
                    <button onClick={handleSubmit} type="submit" disabled={isSubmitting} className="py-2.5 px-6 rounded-lg bg-saffron text-white font-bold hover:bg-orange-500 disabled:bg-gray-400 transition-colors">
                        {isSubmitting ? 'Saving...' : t('adminDashboard.temples.buttons.save')}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ConfirmationModal: React.FC<{ isOpen: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string }> = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-full"><AlertTriangle className="text-red-600" size={24} /></div>
                        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                    </div>
                    <p className="mt-4 text-gray-600">{message}</p>
                </div>
                <div className="flex justify-end p-4 bg-gray-50">
                    <button onClick={onClose} className="mr-2 py-2 px-4 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
                    <button onClick={onConfirm} className="py-2 px-4 rounded bg-red-600 text-white hover:bg-red-700">Confirm</button>
                </div>
            </div>
        </div>
    );
};


// --- User Management ---
const UserManagement: React.FC = () => {
    const { t } = useContext(LanguageContext);
    const toastContext = useContext(ToastContext);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

    const fetchUsers = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await getUsers();
            setUsers(res.data.data);
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleOpenAdd = () => {
        setSelectedUser(null);
        setModalMode('add');
        setIsModalOpen(true);
    };

    const handleOpenEdit = (user: User) => {
        setSelectedUser(user);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleOpenDelete = (user: User) => {
        setSelectedUser(user);
        setIsConfirmOpen(true);
    };

    const handleCloseModals = () => {
        setIsModalOpen(false);
        setIsConfirmOpen(false);
        setSelectedUser(null);
    };

    const handleSave = async (userData: User) => {
        try {
            if (modalMode === 'edit' && selectedUser) {
                await updateUser(selectedUser.id, userData);
                toastContext?.addToast('User updated successfully!', 'success');
            } else {
                await createUser(userData);
                toastContext?.addToast('User added successfully!', 'success');
            }
            handleCloseModals();
            fetchUsers();
        } catch (err) {
            toastContext?.addToast(getApiErrorMessage(err), 'error');
        }
    };
    
    const handleDelete = async () => {
        if (!selectedUser) return;
        try {
            await deleteUser(selectedUser.id);
            toastContext?.addToast('User deleted successfully!', 'success');
            handleCloseModals();
            fetchUsers();
        } catch (err) {
            toastContext?.addToast(getApiErrorMessage(err), 'error');
        }
    };


    if (error) return <div className="text-red-500">Error: {error}</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">{t('adminDashboard.users.title')}</h1>
                <button onClick={handleOpenAdd} className="flex items-center gap-2 bg-saffron text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-500">
                    <PlusCircle size={20} />
                    {t('adminDashboard.users.addNew')}
                </button>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                 {isLoading ? <div className="p-6 text-center">Loading users...</div> :
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminDashboard.users.table.name')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminDashboard.users.table.email')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminDashboard.users.table.role')}</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminDashboard.users.table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map(user => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t(`adminDashboard.users.roles.${user.role}`)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleOpenEdit(user)} className="text-indigo-600 hover:text-indigo-900 mr-4"><Edit size={18} /></button>
                                    <button onClick={() => handleOpenDelete(user)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                }
            </div>
            {isModalOpen && <UserFormModal isOpen={isModalOpen} onClose={handleCloseModals} onSave={handleSave} user={selectedUser} mode={modalMode} />}
            {isConfirmOpen && <ConfirmationModal isOpen={isConfirmOpen} onClose={handleCloseModals} onConfirm={handleDelete} title={t('adminDashboard.users.confirmDelete')} message={`You are about to delete ${selectedUser?.name}. This action is permanent.`} />}
        </div>
    );
};

const UserFormModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (data: User) => Promise<void>; user: User | null; mode: 'add' | 'edit' }> = ({ isOpen, onClose, onSave, user, mode }) => {
    const { t } = useContext(LanguageContext);
    const toastContext = useContext(ToastContext);
    const [formData, setFormData] = useState<User>({ id: '', email: '', name: '', role: 'user', password: '' });
    const [temples, setTemples] = useState<Temple[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({ ...user, password: '' }); // Clear password for edit form
        } else {
            setFormData({ id: '', email: '', name: '', role: 'user', password: '', mobile: '' });
        }
    }, [user, isOpen]);

    useEffect(() => {
        const fetchTemplesForSelect = async () => {
            try {
                const res = await getTemples();
                setTemples(res.data.data);
            } catch (err) {
                toastContext?.addToast('Could not load temples for assignment.', 'error');
            }
        };
        fetchTemplesForSelect();
    }, [toastContext]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updated = { ...prev, [name]: value };
            // If role is changed away from temple_manager, clear the assigned temple
            if (name === 'role' && value !== 'temple_manager') {
                updated.assignedTempleId = undefined;
            }
            return updated;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === 'add' && !formData.password) {
            toastContext?.addToast('Password is required for new users.', 'error');
            return;
        }
        setIsSubmitting(true);
        await onSave(formData);
        setIsSubmitting(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-maroon">{mode === 'edit' ? t('adminDashboard.users.editUser') : t('adminDashboard.users.addNew')}</h2>
                    <button onClick={onClose}><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium">{t('adminDashboard.users.form.name')}</label><input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded" required /></div>
                        <div><label className="block text-sm font-medium">{t('adminDashboard.users.form.email')}</label><input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-2 border rounded" required /></div>
                        <div><label className="block text-sm font-medium">{t('adminDashboard.users.form.mobile')}</label><input type="tel" name="mobile" value={formData.mobile || ''} onChange={handleChange} className="w-full p-2 border rounded" /></div>
                        <div><label className="block text-sm font-medium">{t('adminDashboard.users.form.role')}</label>
                            <select name="role" value={formData.role} onChange={handleChange} className="w-full p-2 border rounded bg-white">
                                <option value="user">{t('adminDashboard.users.roles.user')}</option>
                                <option value="admin">{t('adminDashboard.users.roles.admin')}</option>
                                <option value="temple_manager">{t('adminDashboard.users.roles.temple_manager')}</option>
                            </select>
                        </div>
                    </div>
                     {formData.role === 'temple_manager' && (
                        <div className="animate-fade-in-up" style={{animationDuration: '0.3s'}}>
                            <label className="block text-sm font-medium">{t('adminDashboard.users.form.assignedTemple')}</label>
                            <select name="assignedTempleId" value={formData.assignedTempleId || ''} onChange={handleChange} className="w-full p-2 border rounded bg-white" required>
                                <option value="">{t('adminDashboard.users.form.selectTemple')}</option>
                                {temples.map(temple => (
                                    <option key={temple.id} value={temple.id}>{t(temple.nameKey)}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium">{t('adminDashboard.users.form.password')}</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full p-2 border rounded" placeholder={mode === 'edit' ? t('adminDashboard.users.form.passwordHint') : ''} />
                    </div>
                </form>
                <div className="flex justify-end p-4 border-t bg-gray-50">
                    <button onClick={onClose} type="button" className="mr-2 py-2 px-4 rounded bg-gray-200 hover:bg-gray-300">{t('adminDashboard.temples.buttons.cancel')}</button>
                    <button onClick={handleSubmit} type="submit" disabled={isSubmitting} className="py-2 px-4 rounded bg-saffron text-white hover:bg-orange-500 disabled:bg-gray-400">
                        {isSubmitting ? 'Saving...' : t('adminDashboard.temples.buttons.save')}
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Bookings Management ---
const BookingManagement: React.FC = () => {
    const { t, language } = useContext(LanguageContext);
    const toastContext = useContext(ToastContext);

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
    type SortKey = keyof Booking | 'user';
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>({ key: 'date', direction: 'descending' });

    const fetchBookings = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await getAllBookings();
            setBookings(res.data.data);
        } catch (err) {
            const errorMessage = getApiErrorMessage(err);
            setError(errorMessage);
            toastContext?.addToast(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [toastContext]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const getUserName = (userId: string | PopulatedUser, fallbackName: string) => {
        if (typeof userId === 'object' && userId !== null && 'name' in userId) {
            return userId.name;
        }
        return fallbackName;
    };

    const processedBookings = useMemo(() => {
        let filtered = bookings.filter(booking => {
            if (statusFilter !== 'all' && booking.status !== statusFilter) {
                return false;
            }
            const lowerSearchTerm = searchTerm.toLowerCase();
            return (
                t(booking.pujaNameKey).toLowerCase().includes(lowerSearchTerm) ||
                t(booking.templeNameKey).toLowerCase().includes(lowerSearchTerm) ||
                booking.userEmail.toLowerCase().includes(lowerSearchTerm) ||
                booking.fullName.toLowerCase().includes(lowerSearchTerm) ||
                booking.id.toLowerCase().includes(lowerSearchTerm)
            );
        });

        if (sortConfig !== null) {
            filtered.sort((a, b) => {
                let aValue, bValue;
                if (sortConfig.key === 'user') {
                    aValue = getUserName(a.userId, a.fullName);
                    bValue = getUserName(b.userId, b.fullName);
                } else {
                    aValue = a[sortConfig.key as keyof Booking];
                    bValue = b[sortConfig.key as keyof Booking];
                }
                
                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return filtered;
    }, [bookings, searchTerm, statusFilter, sortConfig, t]);

    const requestSort = (key: SortKey) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const SortableHeader: React.FC<{ sortKey: SortKey; label: string }> = ({ sortKey, label }) => (
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort(sortKey)}>
            <span className="flex items-center">
                {label}
                {sortConfig?.key === sortKey ? (sortConfig.direction === 'ascending' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />) : <ChevronsUpDown size={14} className="ml-1 opacity-40" />}
            </span>
        </th>
    );

    const statusColors: Record<BookingStatus, string> = {
        Confirmed: 'bg-green-100 text-green-800',
        Completed: 'bg-blue-100 text-blue-800',
        Cancelled: 'bg-red-100 text-red-800',
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">{t('adminDashboard.bookings.title')}</h1>
            
            <div className="mb-4 flex items-center gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        placeholder={t('adminDashboard.bookings.searchPlaceholder')}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-saffron" 
                    />
                </div>
                <div>
                    <label htmlFor="statusFilter" className="sr-only">{t('adminDashboard.bookings.filterByStatus')}</label>
                    <select 
                        id="statusFilter"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value as any)}
                        className="py-2 px-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-saffron"
                    >
                        <option value="all">{t('adminDashboard.bookings.allStatuses')}</option>
                        <option value="Confirmed">{t('dashboard.statuses.confirmed')}</option>
                        <option value="Completed">{t('dashboard.statuses.completed')}</option>
                        <option value="Cancelled">{t('adminDashboard.bookings.statusCancelled')}</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-x-auto">
                {isLoading ? <div className="p-6 text-center">Loading bookings...</div> :
                error ? <div className="p-6 text-center text-red-500">Error: {error}</div> :
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminDashboard.bookings.bookingId')}</th>
                            <SortableHeader sortKey="user" label={t('adminDashboard.bookings.user')} />
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminDashboard.bookings.puja')}</th>
                            <SortableHeader sortKey="date" label={t('adminDashboard.bookings.date')} />
                            <SortableHeader sortKey="price" label={t('adminDashboard.bookings.amount')} />
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminDashboard.bookings.status')}</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminDashboard.bookings.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {processedBookings.map(booking => (
                            <tr key={booking.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono" title={booking.id}>{booking.id.substring(booking.id.length - 10)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{getUserName(booking.userId, booking.fullName)}</div>
                                    <div className="text-sm text-gray-500">{booking.userEmail}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{t(booking.pujaNameKey)}</div>
                                    <div className="text-sm text-gray-500">{t(booking.templeNameKey)}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(booking.date + 'T00:00:00').toLocaleDateString(language, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">₹{booking.price.toLocaleString('en-IN')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[booking.status]}`}>
                                        {booking.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-gray-500 hover:text-gray-800"><MoreHorizontal size={20} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                }
            </div>
        </div>
    );
};

// --- Queue Assistance Management ---
const AddOnsDisplay: React.FC<{ addOns?: Booking['addOns'] }> = ({ addOns }) => {
    if (!addOns || (!addOns.guideLanguage && !addOns.pickupDrop && !addOns.poojaItems)) {
        return <span className="text-gray-400">-</span>;
    }
    const activeAddOns = [];
    if (addOns.guideLanguage) activeAddOns.push({ icon: Languages, label: `Guide (${addOns.guideLanguage})` });
    if (addOns.pickupDrop) activeAddOns.push({ icon: Car, label: 'Transport' });
    if (addOns.poojaItems) activeAddOns.push({ icon: Flower2, label: 'Pooja Items' });

    return (
        <div className="flex items-center gap-1.5">
            {activeAddOns.map(({ icon: Icon, label }) => (
                <div key={label} title={label} className="p-1.5 bg-gray-100 rounded-md">
                    <Icon size={16} className="text-gray-600" />
                </div>
            ))}
        </div>
    );
};

const QueueAssistanceDetailsModal: React.FC<{ isOpen: boolean; onClose: () => void; booking: Booking | null }> = ({ isOpen, onClose, booking }) => {
    const { t, language } = useContext(LanguageContext);
    if (!isOpen || !booking) return null;

    const statusColors: Record<BookingStatus, string> = {
        Confirmed: 'bg-green-100 text-green-800',
        Completed: 'bg-blue-100 text-blue-800',
        Cancelled: 'bg-red-100 text-red-800',
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-maroon">{t('adminDashboard.queueAssistance.detailsTitle')}</h2>
                    <button onClick={onClose}><X size={24} /></button>
                </div>
                <div className="p-6 space-y-6 overflow-y-auto">
                    {/* Main Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm text-gray-500">{t('adminDashboard.bookings.bookingId')}</p>
                            <p className="font-mono text-sm text-gray-800">{booking.id}</p>
                        </div>
                        <div className="text-right">
                             <span className={`px-3 py-1 text-sm leading-5 font-semibold rounded-full ${statusColors[booking.status]}`}>
                                {booking.status}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">{t('adminDashboard.queueAssistance.package')}</p>
                            <p className="font-semibold text-gray-800">{booking.pujaNameKey}</p>
                        </div>
                         <div>
                            <p className="text-sm text-gray-500">{t('adminDashboard.temples.table.name')}</p>
                            <p className="font-semibold text-gray-800">{t(booking.templeNameKey)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">{t('adminDashboard.bookings.date')}</p>
                            <p className="font-semibold text-gray-800">{new Date(booking.date + 'T00:00:00').toLocaleDateString(language, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">{t('bookingModal.labels.devotees')}</p>
                            <p className="font-semibold text-gray-800">{booking.numDevotees}</p>
                        </div>
                    </div>
                    {/* User Details */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                         <h3 className="font-bold text-gray-800 mb-2">{t('dashboard.details.devoteeInfo')}</h3>
                         <p><span className="font-semibold">Name:</span> {booking.fullName}</p>
                         <p><span className="font-semibold">Email:</span> {booking.userEmail}</p>
                         <p><span className="font-semibold">Phone:</span> {booking.phoneNumber}</p>
                    </div>
                    {/* Add-ons */}
                    {booking.addOns && (
                        <div className="bg-orange-50 p-4 rounded-lg">
                            <h3 className="font-bold text-maroon mb-2">{t('queueAssistancePage.addons.title')}</h3>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                <li><span className="font-semibold">Local Guide:</span> {booking.addOns.guideLanguage ? `Yes (${t(`queueAssistancePage.languages.${booking.addOns.guideLanguage.toLowerCase()}`)})` : 'No'}</li>
                                <li><span className="font-semibold">Pickup & Drop:</span> {booking.addOns.pickupDrop ? 'Yes' : 'No'}</li>
                                <li><span className="font-semibold">Pooja Items Kit:</span> {booking.addOns.poojaItems ? 'Yes' : 'No'}</li>
                                <li><span className="font-semibold">SMS/WhatsApp Notifications:</span> {booking.addOns.receiveNotifications ? 'Yes' : 'No'}</li>
                            </ul>
                        </div>
                    )}
                    {/* Payment */}
                     <div className="text-right">
                         <p className="text-sm text-gray-500">{t('adminDashboard.bookings.amount')}</p>
                         <p className="text-2xl font-bold text-maroon">₹{booking.price.toLocaleString('en-IN')}</p>
                     </div>
                </div>
                 <div className="flex justify-end p-4 border-t bg-gray-50">
                    <button onClick={onClose} type="button" className="mr-2 py-2 px-4 rounded bg-gray-200 hover:bg-gray-300">Close</button>
                    {/* Add more actions here later, e.g., Mark as Complete */}
                </div>
            </div>
        </div>
    );
};

const QueueBookingsView: React.FC = () => {
    const { t, language } = useContext(LanguageContext);
    const toastContext = useContext(ToastContext);

    const [allBookings, setAllBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
    type SortKey = keyof Booking | 'user';
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>({ key: 'date', direction: 'descending' });
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    const fetchBookings = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await getAllBookings();
            setAllBookings(res.data.data);
        } catch (err) {
            const errorMessage = getApiErrorMessage(err);
            setError(errorMessage);
            toastContext?.addToast(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [toastContext]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const getUserName = (userId: string | PopulatedUser, fallbackName: string) => (typeof userId === 'object' && userId !== null ? userId.name : fallbackName);

    const processedBookings = useMemo(() => {
        let filtered = allBookings.filter(b => b.pujaNameKey.startsWith('queueAssistancePage.packages.') || packages.some(p => p.name === b.pujaNameKey));

        if (statusFilter !== 'all') {
            filtered = filtered.filter(b => b.status === statusFilter);
        }
        
        const lowerSearchTerm = searchTerm.toLowerCase();
        if (lowerSearchTerm) {
            filtered = filtered.filter(booking =>
                t(booking.pujaNameKey).toLowerCase().includes(lowerSearchTerm) ||
                booking.pujaNameKey.toLowerCase().includes(lowerSearchTerm) ||
                t(booking.templeNameKey).toLowerCase().includes(lowerSearchTerm) ||
                booking.userEmail.toLowerCase().includes(lowerSearchTerm) ||
                booking.fullName.toLowerCase().includes(lowerSearchTerm) ||
                booking.id.toLowerCase().includes(lowerSearchTerm)
            );
        }
        
        if (sortConfig !== null) {
            filtered.sort((a, b) => {
                let aValue, bValue;
                if (sortConfig.key === 'user') { aValue = getUserName(a.userId, a.fullName); bValue = getUserName(b.userId, b.fullName); } 
                else { aValue = a[sortConfig.key as keyof Booking]; bValue = b[sortConfig.key as keyof Booking]; }
                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return filtered;
    }, [allBookings, searchTerm, statusFilter, sortConfig, t]);

    const requestSort = (key: SortKey) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') { direction = 'descending'; }
        setSortConfig({ key, direction });
    };

    const SortableHeader: React.FC<{ sortKey: SortKey; label: string }> = ({ sortKey, label }) => (
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort(sortKey)}>
            <span className="flex items-center">
                {label}
                {sortConfig?.key === sortKey ? (sortConfig.direction === 'ascending' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />) : <ChevronsUpDown size={14} className="ml-1 opacity-40" />}
            </span>
        </th>
    );
    
    // Fetch packages to resolve names correctly
    const [packages, setPackages] = useState<QueueAssistancePackage[]>([]);
    useEffect(() => {
        getQueuePackages().then(res => setPackages(res.data.data)).catch(console.error);
    }, []);

    const statusColors: Record<BookingStatus, string> = { Confirmed: 'bg-green-100 text-green-800', Completed: 'bg-blue-100 text-blue-800', Cancelled: 'bg-red-100 text-red-800' };

    return (
         <div>
            <div className="mb-4 flex items-center gap-4">
                <div className="relative flex-grow"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input type="text" placeholder={t('adminDashboard.bookings.searchPlaceholder')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-saffron" />
                </div>
                <div><label htmlFor="statusFilter" className="sr-only">{t('adminDashboard.bookings.filterByStatus')}</label>
                    <select id="statusFilter" value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="py-2 px-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-saffron">
                        <option value="all">{t('adminDashboard.bookings.allStatuses')}</option><option value="Confirmed">{t('dashboard.statuses.confirmed')}</option><option value="Completed">{t('dashboard.statuses.completed')}</option><option value="Cancelled">{t('adminDashboard.bookings.statusCancelled')}</option>
                    </select>
                </div>
            </div>
            <div className="bg-white rounded-lg shadow overflow-x-auto">
                {isLoading ? <div className="p-6 text-center">Loading bookings...</div> :
                error ? <div className="p-6 text-center text-red-500">Error: {error}</div> :
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <SortableHeader sortKey="user" label={t('adminDashboard.bookings.user')} />
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminDashboard.temples.table.name')}</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminDashboard.queueAssistance.package')}</th>
                            <SortableHeader sortKey="date" label={t('adminDashboard.bookings.date')} />
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminDashboard.queueAssistance.addOns')}</th>
                            <SortableHeader sortKey="price" label={t('adminDashboard.bookings.amount')} />
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminDashboard.bookings.status')}</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminDashboard.bookings.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {processedBookings.map(booking => (
                            <tr key={booking.id}>
                                <td className="px-4 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{getUserName(booking.userId, booking.fullName)}</div><div className="text-sm text-gray-500">{booking.userEmail}</div></td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800">{t(booking.templeNameKey)}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{booking.pujaNameKey}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(booking.date + 'T00:00:00').toLocaleDateString(language, { month: 'short', day: 'numeric' })}</td>
                                <td className="px-4 py-4 whitespace-nowrap"><AddOnsDisplay addOns={booking.addOns} /></td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">₹{booking.price.toLocaleString('en-IN')}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[booking.status]}`}>{booking.status}</span></td>
                                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => setSelectedBooking(booking)} className="text-gray-500 hover:text-gray-800"><MoreHorizontal size={20} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                }
            </div>
            <QueueAssistanceDetailsModal isOpen={!!selectedBooking} onClose={() => setSelectedBooking(null)} booking={selectedBooking} />
        </div>
    );
};

// ... More new components below ...
const PackageFormModal: React.FC<{isOpen: boolean; onClose: () => void; onSave: (data: Partial<QueueAssistancePackage>) => Promise<void>; pkg: Partial<QueueAssistancePackage> | null; mode: 'add' | 'edit'}> = ({ isOpen, onClose, onSave, pkg, mode }) => {
    const { t } = useContext(LanguageContext);
    const [formData, setFormData] = useState<Partial<QueueAssistancePackage>>({ name: '', description: '', price: 0, active: true, order: 0 });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setFormData(pkg || { name: '', description: '', price: 0, active: true, order: 0 });
    }, [pkg, isOpen]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
             setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else {
             setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        await onSave(formData);
        setIsSubmitting(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in" style={{animationDuration: '0.2s'}}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b"><h2 className="text-xl font-bold text-maroon">{mode === 'edit' ? t('adminDashboard.queueAssistance.packages.edit') : t('adminDashboard.queueAssistance.packages.addNew')}</h2><button onClick={onClose}><X size={24} /></button></div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div><label className="block text-sm font-medium">{t('adminDashboard.queueAssistance.packages.form.name')}</label><input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="w-full p-2 border rounded" required /></div>
                    <div><label className="block text-sm font-medium">{t('adminDashboard.queueAssistance.packages.form.description')}</label><textarea name="description" value={formData.description || ''} onChange={handleChange} className="w-full p-2 border rounded" rows={3} required /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium">{t('adminDashboard.queueAssistance.packages.form.price')}</label><input type="number" name="price" value={formData.price || 0} onChange={handleChange} className="w-full p-2 border rounded" required /></div>
                        <div><label className="block text-sm font-medium">{t('adminDashboard.queueAssistance.packages.form.order')}</label><input type="number" name="order" value={formData.order || 0} onChange={handleChange} className="w-full p-2 border rounded" required /></div>
                    </div>
                    <div className="flex items-center gap-3"><input type="checkbox" id="pkg-active" name="active" checked={formData.active} onChange={handleChange} className="h-5 w-5 rounded border-gray-300 text-saffron focus:ring-saffron" /><label htmlFor="pkg-active" className="text-sm font-medium">{t('adminDashboard.queueAssistance.packages.form.active')}</label></div>
                </form>
                <div className="flex justify-end p-4 border-t bg-gray-50"><button onClick={onClose} type="button" className="mr-2 py-2 px-4 rounded bg-gray-200 hover:bg-gray-300">{t('adminDashboard.temples.buttons.cancel')}</button><button onClick={handleSubmit} type="submit" disabled={isSubmitting} className="py-2 px-4 rounded bg-saffron text-white hover:bg-orange-500 disabled:bg-gray-400">{isSubmitting ? 'Saving...' : t('adminDashboard.temples.buttons.save')}</button></div>
            </div>
        </div>
    );
};

const QueuePackagesView: React.FC = () => {
    const { t } = useContext(LanguageContext);
    const toastContext = useContext(ToastContext);
    const [packages, setPackages] = useState<QueueAssistancePackage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<Partial<QueueAssistancePackage> | null>(null);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

    const fetchData = useCallback(async () => {
        try {setIsLoading(true); const res = await getQueuePackages(); setPackages(res.data.data); } 
        catch (err) { toastContext?.addToast(getApiErrorMessage(err), 'error'); } 
        finally { setIsLoading(false); }
    }, [toastContext]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleOpenAdd = () => { setSelectedPackage(null); setModalMode('add'); setIsModalOpen(true); };
    const handleOpenEdit = (pkg: QueueAssistancePackage) => { setSelectedPackage(pkg); setModalMode('edit'); setIsModalOpen(true); };
    const handleOpenDelete = (pkg: QueueAssistancePackage) => { setSelectedPackage(pkg); setIsConfirmOpen(true); };
    const handleCloseModals = () => { setIsModalOpen(false); setIsConfirmOpen(false); setSelectedPackage(null); };

    const handleSave = async (data: Partial<QueueAssistancePackage>) => {
        try {
            if (modalMode === 'edit' && selectedPackage?._id) { await updateQueuePackage(selectedPackage._id, data); toastContext?.addToast('Package updated!', 'success'); } 
            else { await addQueuePackage(data); toastContext?.addToast('Package added!', 'success'); }
            handleCloseModals(); fetchData();
        } catch (err) { toastContext?.addToast(getApiErrorMessage(err), 'error'); }
    };
    
    const handleDelete = async () => {
        if (!selectedPackage?._id) return;
        try { await deleteQueuePackage(selectedPackage._id); toastContext?.addToast('Package deleted!', 'success'); handleCloseModals(); fetchData(); } 
        catch (err) { toastContext?.addToast(getApiErrorMessage(err), 'error'); }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-maroon">{t('adminDashboard.queueAssistance.packages.title')}</h2><button onClick={handleOpenAdd} className="flex items-center gap-2 bg-saffron text-white font-bold py-2 px-3 rounded-lg text-sm hover:bg-orange-500"><PlusCircle size={18} />{t('adminDashboard.queueAssistance.packages.addNew')}</button></div>
            <div className="bg-white rounded-lg shadow overflow-x-auto">
                {isLoading ? <p className="p-6 text-center">Loading...</p> : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminDashboard.queueAssistance.table.name')}</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminDashboard.queueAssistance.table.price')}</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminDashboard.queueAssistance.table.status')}</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminDashboard.queueAssistance.table.actions')}</th></tr></thead>
                        <tbody className="bg-white divide-y divide-gray-200">{packages.map(pkg => (<tr key={pkg._id}><td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{pkg.name}</div><div className="text-sm text-gray-500 max-w-md truncate">{pkg.description}</div></td><td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">₹{pkg.price}</td><td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${pkg.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{pkg.active ? t('adminDashboard.queueAssistance.table.active') : t('adminDashboard.queueAssistance.table.inactive')}</span></td><td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><button onClick={() => handleOpenEdit(pkg)} className="text-indigo-600 hover:text-indigo-900 mr-4"><Edit size={18} /></button><button onClick={() => handleOpenDelete(pkg)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button></td></tr>))}</tbody>
                    </table>
                )}
            </div>
            {isModalOpen && <PackageFormModal isOpen={isModalOpen} onClose={handleCloseModals} onSave={handleSave} pkg={selectedPackage} mode={modalMode} />}
            {isConfirmOpen && <ConfirmationModal isOpen={isConfirmOpen} onClose={handleCloseModals} onConfirm={handleDelete} title={t('adminDashboard.queueAssistance.packages.confirmDelete')} message={`You are about to delete "${selectedPackage?.name}".`} />}
        </div>
    );
};

const AddOnFormModal: React.FC<{isOpen: boolean; onClose: () => void; onSave: (data: Partial<QueueAssistanceAddOn>) => Promise<void>; addOn: Partial<QueueAssistanceAddOn> | null; mode: 'add' | 'edit'}> = ({ isOpen, onClose, onSave, addOn, mode }) => {
    const { t } = useContext(LanguageContext);
    const [formData, setFormData] = useState<Partial<QueueAssistanceAddOn>>({ name: '', description: '', price: 0, active: true, type: 'guide' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setFormData(addOn || { name: '', description: '', price: 0, active: true, type: 'guide' });
    }, [addOn, isOpen]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') { setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked })); }
        else { setFormData(prev => ({ ...prev, [name]: value })); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        await onSave(formData);
        setIsSubmitting(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in" style={{animationDuration: '0.2s'}}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b"><h2 className="text-xl font-bold text-maroon">{mode === 'edit' ? t('adminDashboard.queueAssistance.addons.edit') : t('adminDashboard.queueAssistance.addons.addNew')}</h2><button onClick={onClose}><X size={24} /></button></div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div><label className="block text-sm font-medium">{t('adminDashboard.queueAssistance.addons.form.name')}</label><input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="w-full p-2 border rounded" required /></div>
                    <div><label className="block text-sm font-medium">{t('adminDashboard.queueAssistance.addons.form.description')}</label><textarea name="description" value={formData.description || ''} onChange={handleChange} className="w-full p-2 border rounded" rows={3} required /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium">{t('adminDashboard.queueAssistance.addons.form.price')}</label><input type="number" name="price" value={formData.price || 0} onChange={handleChange} className="w-full p-2 border rounded" required /></div>
                        <div><label className="block text-sm font-medium">{t('adminDashboard.queueAssistance.addons.form.type')}</label>
                            <select name="type" value={formData.type} onChange={handleChange} disabled={mode === 'edit'} className="w-full p-2 border rounded bg-white disabled:bg-gray-100">
                                <option value="guide">{t('adminDashboard.queueAssistance.addons.types.guide')}</option>
                                <option value="pickup">{t('adminDashboard.queueAssistance.addons.types.pickup')}</option>
                                <option value="poojaItems">{t('adminDashboard.queueAssistance.addons.types.poojaItems')}</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex items-center gap-3"><input type="checkbox" id="addon-active" name="active" checked={formData.active} onChange={handleChange} className="h-5 w-5 rounded border-gray-300 text-saffron focus:ring-saffron" /><label htmlFor="addon-active" className="text-sm font-medium">{t('adminDashboard.queueAssistance.addons.form.active')}</label></div>
                </form>
                <div className="flex justify-end p-4 border-t bg-gray-50"><button onClick={onClose} type="button" className="mr-2 py-2 px-4 rounded bg-gray-200 hover:bg-gray-300">{t('adminDashboard.temples.buttons.cancel')}</button><button onClick={handleSubmit} type="submit" disabled={isSubmitting} className="py-2 px-4 rounded bg-saffron text-white hover:bg-orange-500 disabled:bg-gray-400">{isSubmitting ? 'Saving...' : t('adminDashboard.temples.buttons.save')}</button></div>
            </div>
        </div>
    );
};

const QueueAddOnsView: React.FC = () => {
    const { t } = useContext(LanguageContext);
    const toastContext = useContext(ToastContext);
    const [addOns, setAddOns] = useState<QueueAssistanceAddOn[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedAddOn, setSelectedAddOn] = useState<Partial<QueueAssistanceAddOn> | null>(null);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

    const fetchData = useCallback(async () => {
        try { setIsLoading(true); const res = await getQueueAddOns(); setAddOns(res.data.data); } 
        catch (err) { toastContext?.addToast(getApiErrorMessage(err), 'error'); } 
        finally { setIsLoading(false); }
    }, [toastContext]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleOpenAdd = () => { setSelectedAddOn(null); setModalMode('add'); setIsModalOpen(true); };
    const handleOpenEdit = (addOn: QueueAssistanceAddOn) => { setSelectedAddOn(addOn); setModalMode('edit'); setIsModalOpen(true); };
    const handleOpenDelete = (addOn: QueueAssistanceAddOn) => { setSelectedAddOn(addOn); setIsConfirmOpen(true); };
    const handleCloseModals = () => { setIsModalOpen(false); setIsConfirmOpen(false); setSelectedAddOn(null); };

    const handleSave = async (data: Partial<QueueAssistanceAddOn>) => {
        try {
            if (modalMode === 'edit' && selectedAddOn?._id) { await updateQueueAddOn(selectedAddOn._id, data); toastContext?.addToast('Add-on updated!', 'success'); } 
            else { await addQueueAddOn(data); toastContext?.addToast('Add-on added!', 'success'); }
            handleCloseModals(); fetchData();
        } catch (err) { toastContext?.addToast(getApiErrorMessage(err), 'error'); }
    };
    
    const handleDelete = async () => {
        if (!selectedAddOn?._id) return;
        try { await deleteQueueAddOn(selectedAddOn._id); toastContext?.addToast('Add-on deleted!', 'success'); handleCloseModals(); fetchData(); } 
        catch (err) { toastContext?.addToast(getApiErrorMessage(err), 'error'); }
    };
    
    const addonTypeIcons: Record<string, React.ElementType> = { guide: Languages, pickup: Car, poojaItems: Flower2 };

    return (
        <div>
            <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-maroon">{t('adminDashboard.queueAssistance.addons.title')}</h2><button onClick={handleOpenAdd} className="flex items-center gap-2 bg-saffron text-white font-bold py-2 px-3 rounded-lg text-sm hover:bg-orange-500"><PlusCircle size={18} />{t('adminDashboard.queueAssistance.addons.addNew')}</button></div>
            <div className="bg-white rounded-lg shadow overflow-x-auto">
                {isLoading ? <p className="p-6 text-center">Loading...</p> : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminDashboard.queueAssistance.table.name')}</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminDashboard.queueAssistance.addons.form.type')}</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminDashboard.queueAssistance.table.price')}</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminDashboard.queueAssistance.table.status')}</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminDashboard.queueAssistance.table.actions')}</th></tr></thead>
                        <tbody className="bg-white divide-y divide-gray-200">{addOns.map(addOn => {
                            const Icon = addonTypeIcons[addOn.type] || Tag;
                            return (<tr key={addOn._id}><td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{addOn.name}</div><div className="text-sm text-gray-500 max-w-md truncate">{addOn.description}</div></td><td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center gap-2 text-sm text-gray-600"><Icon size={18} /><span>{t(`adminDashboard.queueAssistance.addons.types.${addOn.type}`)}</span></div></td><td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">₹{addOn.price}</td><td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${addOn.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{addOn.active ? t('adminDashboard.queueAssistance.table.active') : t('adminDashboard.queueAssistance.table.inactive')}</span></td><td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><button onClick={() => handleOpenEdit(addOn)} className="text-indigo-600 hover:text-indigo-900 mr-4"><Edit size={18} /></button><button onClick={() => handleOpenDelete(addOn)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button></td></tr>)
                        })}</tbody>
                    </table>
                )}
            </div>
            {isModalOpen && <AddOnFormModal isOpen={isModalOpen} onClose={handleCloseModals} onSave={handleSave} addOn={selectedAddOn} mode={modalMode} />}
            {isConfirmOpen && <ConfirmationModal isOpen={isConfirmOpen} onClose={handleCloseModals} onConfirm={handleDelete} title={t('adminDashboard.queueAssistance.addons.confirmDelete')} message={`You are about to delete "${selectedAddOn?.name}".`} />}
        </div>
    );
};

const QueueAssistanceManagement: React.FC = () => {
    const { t } = useContext(LanguageContext);
    const [activeTab, setActiveTab] = useState('bookings'); // 'bookings', 'packages', or 'addons'

    const renderTabContent = () => {
        switch (activeTab) {
            case 'bookings': return <QueueBookingsView />;
            case 'packages': return <QueuePackagesView />;
            case 'addons': return <QueueAddOnsView />;
            default: return null;
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">{t('adminDashboard.menu.queueAssistance')}</h1>
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('bookings')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'bookings' ? 'border-saffron text-saffron' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>{t('adminDashboard.queueAssistance.tabs.bookings')}</button>
                    <button onClick={() => setActiveTab('packages')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'packages' ? 'border-saffron text-saffron' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>{t('adminDashboard.queueAssistance.tabs.packages')}</button>
                    <button onClick={() => setActiveTab('addons')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'addons' ? 'border-saffron text-saffron' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>{t('adminDashboard.queueAssistance.tabs.addons')}</button>
                </nav>
            </div>
            {renderTabContent()}
        </div>
    );
};


// --- Payments Management ---
const PaymentManagement: React.FC = () => {
    const { t, language } = useContext(LanguageContext);
    const toastContext = useContext(ToastContext);

    const [payments, setPayments] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    type SortKey = keyof Booking | 'user';
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>({ key: 'date', direction: 'descending' });

    const fetchPayments = useCallback(async () => {
        try {
            setIsLoading(true);
            // Using bookings as the source for payments
            const res = await getAllBookings();
            setPayments(res.data.data);
        } catch (err) {
            const errorMessage = getApiErrorMessage(err);
            setError(errorMessage);
            toastContext?.addToast(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [toastContext]);

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    const getUserName = (userId: string | PopulatedUser, fallbackName: string) => {
        if (typeof userId === 'object' && userId !== null && 'name' in userId) {
            return userId.name;
        }
        return fallbackName;
    };

    const processedPayments = useMemo(() => {
        let filtered = payments.filter(payment => {
            const lowerSearchTerm = searchTerm.toLowerCase();
            return (
                t(payment.pujaNameKey).toLowerCase().includes(lowerSearchTerm) ||
                payment.userEmail.toLowerCase().includes(lowerSearchTerm) ||
                payment.fullName.toLowerCase().includes(lowerSearchTerm) ||
                payment.id.toLowerCase().includes(lowerSearchTerm)
            );
        });

        if (sortConfig !== null) {
            filtered.sort((a, b) => {
                let aValue, bValue;
                if (sortConfig.key === 'user') {
                    aValue = getUserName(a.userId, a.fullName);
                    bValue = getUserName(b.userId, b.fullName);
                } else {
                    aValue = a[sortConfig.key as keyof Booking];
                    bValue = b[sortConfig.key as keyof Booking];
                }
                
                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return filtered;
    }, [payments, searchTerm, sortConfig, t]);

    const requestSort = (key: SortKey) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const SortableHeader: React.FC<{ sortKey: SortKey; label: string }> = ({ sortKey, label }) => (
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort(sortKey)}>
            <span className="flex items-center">
                {label}
                {sortConfig?.key === sortKey ? (sortConfig.direction === 'ascending' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />) : <ChevronsUpDown size={14} className="ml-1 opacity-40" />}
            </span>
        </th>
    );

    const paymentStatusColors: Record<BookingStatus, string> = {
        Confirmed: 'bg-green-100 text-green-800',
        Completed: 'bg-green-100 text-green-800', // Completed is also a success
        Cancelled: 'bg-red-100 text-red-800',
    };
    
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">{t('adminDashboard.payments.title')}</h1>
            
            <div className="mb-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        placeholder={t('adminDashboard.searchPlaceholder')}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full max-w-sm pl-10 pr-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-saffron" 
                    />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-x-auto">
                {isLoading ? <div className="p-6 text-center">Loading payments...</div> :
                error ? <div className="p-6 text-center text-red-500">Error: {error}</div> :
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminDashboard.payments.table.transactionId')}</th>
                            <SortableHeader sortKey="user" label={t('adminDashboard.payments.table.user')} />
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminDashboard.payments.table.paymentFor')}</th>
                            <SortableHeader sortKey="date" label={t('adminDashboard.payments.table.date')} />
                            <SortableHeader sortKey="price" label={t('adminDashboard.payments.table.amount')} />
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminDashboard.payments.table.status')}</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminDashboard.payments.table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {processedPayments.map(payment => (
                            <tr key={payment.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono" title={payment.id}>{payment.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{getUserName(payment.userId, payment.fullName)}</div>
                                    <div className="text-sm text-gray-500">{payment.userEmail}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{t(payment.pujaNameKey)}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(payment.date + 'T00:00:00').toLocaleDateString(language, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">₹{payment.price.toLocaleString('en-IN')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${paymentStatusColors[payment.status]}`}>
                                        {payment.status === 'Cancelled' ? 'Refunded' : 'Success'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-gray-500 hover:text-gray-800"><MoreHorizontal size={20} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                }
            </div>
        </div>
    );
};


// --- Reports View ---
const ReportsView: React.FC = () => {
    const { t } = useContext(LanguageContext);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const toastContext = useContext(ToastContext);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const bookingsRes = await getAllBookings();
                setBookings(bookingsRes.data.data);
            } catch (error) {
                toastContext?.addToast(getApiErrorMessage(error), 'error');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [toastContext]);

    const reportData = useMemo(() => {
        const totalRevenue = bookings.reduce((sum, b) => sum + b.price, 0);
        const totalBookings = bookings.length;
        const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

        const monthlyData: { [key: string]: { bookings: number; revenue: number } } = {};
        
        bookings.forEach(booking => {
            const month = new Date(booking.date + 'T00:00:00').toLocaleString('default', { month: 'short', year: 'numeric' });
            if (!monthlyData[month]) {
                monthlyData[month] = { bookings: 0, revenue: 0 };
            }
            monthlyData[month].bookings += 1;
            monthlyData[month].revenue += booking.price;
        });

        const chartData = Object.keys(monthlyData).map(month => ({
            name: month,
            [t('adminDashboard.reports.chartBookings')]: monthlyData[month].bookings,
            [t('adminDashboard.reports.chartRevenue')]: monthlyData[month].revenue,
        })).sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
        

        return { totalRevenue, totalBookings, averageBookingValue, chartData };
    }, [bookings, t]);

    if (isLoading) {
        return <div className="text-center p-10">Generating reports...</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('adminDashboard.reports.title')}</h1>
            <p className="text-gray-500 mb-6">{t('adminDashboard.reports.subtitle')}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard title={t('adminDashboard.reports.totalRevenue')} value={`₹${reportData.totalRevenue.toLocaleString('en-IN')}`} icon={CreditCard} />
                <StatCard title={t('adminDashboard.stats.totalBookings')} value={reportData.totalBookings.toString()} icon={BookOpen} />
                <StatCard title={t('adminDashboard.reports.averageBookingValue')} value={`₹${reportData.averageBookingValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} icon={BarChart2} />
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold text-maroon mb-4">{t('adminDashboard.reports.monthlyPerformance')}</h2>
                <div style={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer>
                        <BarChart
                            data={reportData.chartData}
                            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} />
                            <Legend />
                            <Bar dataKey={t('adminDashboard.reports.chartBookings')} fill="#FF9933" />
                            <Bar dataKey={t('adminDashboard.reports.chartRevenue')} fill="#800000" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

// --- Content & CMS ---
const ContentManagement: React.FC = () => {
    const { t } = useContext(LanguageContext);
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">{t('adminDashboard.menu.content')}</h1>
            <div className="space-y-8">
                <SeasonalEventEditor />
                <TestimonialsEditor />
            </div>
        </div>
    );
};

const SeasonalEventEditor: React.FC = () => {
    const { t } = useContext(LanguageContext);
    const toastContext = useContext(ToastContext);
    const [event, setEvent] = useState<Partial<SeasonalEvent>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await getSeasonalEvent();
                setEvent(res.data.data);
            } catch (err) {
                toastContext?.addToast(getApiErrorMessage(err), 'error');
            } finally {
                setIsLoading(false);
            }
        };
        fetchEvent();
    }, [toastContext]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setEvent(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateSeasonalEvent(event);
            toastContext?.addToast(t('adminDashboard.content.seasonalEvent.saveSuccess'), 'success');
        } catch (err) {
            toastContext?.addToast(getApiErrorMessage(err), 'error');
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold text-maroon mb-4">{t('adminDashboard.content.seasonalEvent.title')}</h2>
            {isLoading ? <p>Loading event data...</p> : (
            <form onSubmit={handleSave} className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium">{t('adminDashboard.content.seasonalEvent.formTitle')}</label>
                    <input type="text" name="title" value={event.title || ''} onChange={handleChange} className="w-full p-2 border rounded" required />
                </div>
                 <div>
                    <label className="block text-sm font-medium">{t('adminDashboard.content.seasonalEvent.formDescription')}</label>
                    <textarea name="description" value={event.description || ''} onChange={handleChange} className="w-full p-2 border rounded" rows={3} required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium">{t('adminDashboard.content.seasonalEvent.formCta')}</label>
                        <input type="text" name="cta" value={event.cta || ''} onChange={handleChange} className="w-full p-2 border rounded" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium">{t('adminDashboard.content.seasonalEvent.formImageUrl')}</label>
                        <input type="text" name="imageUrl" value={event.imageUrl || ''} onChange={handleChange} className="w-full p-2 border rounded" required />
                    </div>
                </div>
                <div className="text-right">
                    <button type="submit" disabled={isSaving} className="py-2 px-6 rounded bg-saffron text-white hover:bg-orange-500 disabled:bg-gray-400">
                        {isSaving ? 'Saving...' : t('adminDashboard.temples.buttons.save')}
                    </button>
                </div>
            </form>
            )}
        </div>
    );
};

const TestimonialsEditor: React.FC = () => {
    const { t } = useContext(LanguageContext);
    const toastContext = useContext(ToastContext);
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

    const fetchTestimonials = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await getTestimonials();
            setTestimonials(res.data.data);
        } catch (err) {
            toastContext?.addToast(getApiErrorMessage(err), 'error');
        } finally {
            setIsLoading(false);
        }
    }, [toastContext]);

    useEffect(() => {
        fetchTestimonials();
    }, [fetchTestimonials]);

    const handleOpenAdd = () => {
        setSelectedTestimonial(null);
        setModalMode('add');
        setIsModalOpen(true);
    };

    const handleOpenEdit = (testimonial: Testimonial) => {
        setSelectedTestimonial(testimonial);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleOpenDelete = (testimonial: Testimonial) => {
        setSelectedTestimonial(testimonial);
        setIsConfirmOpen(true);
    };

    const handleCloseModals = () => {
        setIsModalOpen(false);
        setIsConfirmOpen(false);
        setSelectedTestimonial(null);
    };

    const handleSave = async (data: Partial<Testimonial>) => {
        try {
            if (modalMode === 'edit' && selectedTestimonial) {
                await updateTestimonial(selectedTestimonial.id, data);
                toastContext?.addToast('Testimonial updated!', 'success');
            } else {
                await addTestimonial(data);
                toastContext?.addToast('Testimonial added!', 'success');
            }
            handleCloseModals();
            fetchTestimonials();
        } catch (err) {
            toastContext?.addToast(getApiErrorMessage(err), 'error');
        }
    };
    
    const handleDelete = async () => {
        if (!selectedTestimonial) return;
        try {
            await deleteTestimonial(selectedTestimonial.id);
            toastContext?.addToast('Testimonial deleted!', 'success');
            handleCloseModals();
            fetchTestimonials();
        } catch (err) {
            toastContext?.addToast(getApiErrorMessage(err), 'error');
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-maroon">{t('adminDashboard.content.testimonials.title')}</h2>
                <button onClick={handleOpenAdd} className="flex items-center gap-2 bg-saffron text-white font-bold py-2 px-3 rounded-lg text-sm hover:bg-orange-500">
                    <PlusCircle size={18} />
                    {t('adminDashboard.content.testimonials.addNew')}
                </button>
            </div>
            {isLoading ? <p>Loading testimonials...</p> : (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-3/5">{t('adminDashboard.content.testimonials.table.quote')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminDashboard.content.testimonials.table.author')}</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminDashboard.content.testimonials.table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {testimonials.map(item => (
                            <tr key={item.id}>
                                <td className="px-6 py-4 whitespace-normal text-sm text-gray-600 italic">"{item.quote}"</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.author}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleOpenEdit(item)} className="text-indigo-600 hover:text-indigo-900 mr-4"><Edit size={18} /></button>
                                    <button onClick={() => handleOpenDelete(item)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            )}
            {isModalOpen && <TestimonialFormModal isOpen={isModalOpen} onClose={handleCloseModals} onSave={handleSave} testimonial={selectedTestimonial} mode={modalMode} />}
            {isConfirmOpen && <ConfirmationModal isOpen={isConfirmOpen} onClose={handleCloseModals} onConfirm={handleDelete} title={t('adminDashboard.content.testimonials.confirmDelete')} message="This action is permanent and cannot be undone." />}
        </div>
    );
};

const TestimonialFormModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (data: Partial<Testimonial>) => Promise<void>; testimonial: Testimonial | null; mode: 'add' | 'edit' }> = ({ isOpen, onClose, onSave, testimonial, mode }) => {
    const { t } = useContext(LanguageContext);
    const [formData, setFormData] = useState<Partial<Testimonial>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setFormData(testimonial || { quote: '', author: '', location: '' });
    }, [testimonial, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        await onSave(formData);
        setIsSubmitting(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-maroon">{mode === 'edit' ? t('adminDashboard.content.testimonials.edit') : t('adminDashboard.content.testimonials.addNew')}</h2>
                    <button onClick={onClose}><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium">{t('adminDashboard.content.testimonials.form.quote')}</label>
                        <textarea name="quote" value={formData.quote || ''} onChange={handleChange} className="w-full p-2 border rounded" rows={4} required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium">{t('adminDashboard.content.testimonials.form.author')}</label>
                            <input type="text" name="author" value={formData.author || ''} onChange={handleChange} className="w-full p-2 border rounded" required />
                        </div>
                         <div>
                            <label className="block text-sm font-medium">{t('adminDashboard.content.testimonials.form.location')}</label>
                            <input type="text" name="location" value={formData.location || ''} onChange={handleChange} className="w-full p-2 border rounded" required />
                        </div>
                    </div>
                </form>
                 <div className="flex justify-end p-4 border-t bg-gray-50">
                    <button onClick={onClose} type="button" className="mr-2 py-2 px-4 rounded bg-gray-200 hover:bg-gray-300">{t('adminDashboard.temples.buttons.cancel')}</button>
                    <button onClick={handleSubmit} type="submit" disabled={isSubmitting} className="py-2 px-4 rounded bg-saffron text-white hover:bg-orange-500 disabled:bg-gray-400">
                        {isSubmitting ? 'Saving...' : t('adminDashboard.temples.buttons.save')}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Settings View ---
const SettingsView: React.FC = () => {
    const { t } = useContext(LanguageContext);
    const toastContext = useContext(ToastContext);
    const [settings, setSettings] = useState<Partial<AppSettings>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await getAppSettings();
                setSettings(res.data.data);
            } catch (err) {
                toastContext?.addToast(getApiErrorMessage(err), 'error');
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, [toastContext]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSettings(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateAppSettings(settings);
            toastContext?.addToast(t('adminDashboard.settings.saveSuccess'), 'success');
        } catch (err) {
            toastContext?.addToast(getApiErrorMessage(err), 'error');
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">{t('adminDashboard.settings.title')}</h1>
            <div className="bg-white p-6 rounded-lg shadow max-w-2xl">
                 <h2 className="text-xl font-bold text-maroon mb-4">{t('adminDashboard.settings.form.contactInfo')}</h2>
                {isLoading ? <p>Loading settings...</p> : (
                <form onSubmit={handleSave} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium">{t('adminDashboard.settings.form.helpline')}</label>
                        <input type="text" name="helpline" value={settings.helpline || ''} onChange={handleChange} className="w-full p-2 border rounded" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">{t('adminDashboard.settings.form.whatsapp')}</label>
                        <input type="text" name="whatsapp" value={settings.whatsapp || ''} onChange={handleChange} className="w-full p-2 border rounded" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">{t('adminDashboard.settings.form.email')}</label>
                        <input type="email" name="email" value={settings.email || ''} onChange={handleChange} className="w-full p-2 border rounded" required />
                    </div>
                    <div className="text-right pt-2">
                        <button type="submit" disabled={isSaving} className="py-2 px-6 rounded bg-saffron text-white font-bold hover:bg-orange-500 disabled:bg-gray-400">
                            {isSaving ? 'Saving...' : t('adminDashboard.settings.buttons.save')}
                        </button>
                    </div>
                </form>
                )}
            </div>
        </div>
    );
};

// --- Services Management ---
const ServiceManagement: React.FC = () => {
    const { t } = useContext(LanguageContext);
    const toastContext = useContext(ToastContext);
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

    const fetchServices = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await getServices();
            setServices(res.data.data);
        } catch (err) {
            toastContext?.addToast(getApiErrorMessage(err), 'error');
        } finally {
            setIsLoading(false);
        }
    }, [toastContext]);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    const handleOpenAdd = () => {
        setSelectedService(null);
        setModalMode('add');
        setIsModalOpen(true);
    };

    const handleOpenEdit = (service: Service) => {
        setSelectedService(service);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleOpenDelete = (service: Service) => {
        setSelectedService(service);
        setIsConfirmOpen(true);
    };

    const handleCloseModals = () => {
        setIsModalOpen(false);
        setIsConfirmOpen(false);
        setSelectedService(null);
    };

    const handleSave = async (data: Partial<Service>) => {
        try {
            if (modalMode === 'edit' && selectedService) {
                await updateService(selectedService.id, data);
                toastContext?.addToast('Service updated successfully!', 'success');
            } else {
                await addService(data);
                toastContext?.addToast('Service added successfully!', 'success');
            }
            handleCloseModals();
            fetchServices();
        } catch (err) {
            toastContext?.addToast(getApiErrorMessage(err), 'error');
        }
    };

    const handleDelete = async () => {
        if (!selectedService) return;
        try {
            await deleteService(selectedService.id);
            toastContext?.addToast('Service deleted successfully!', 'success');
            handleCloseModals();
            fetchServices();
        } catch (err) {
            toastContext?.addToast(getApiErrorMessage(err), 'error');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">{t('adminDashboard.services.title')}</h1>
                <button onClick={handleOpenAdd} className="flex items-center gap-2 bg-saffron text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-500">
                    <PlusCircle size={20} />
                    {t('adminDashboard.services.addNew')}
                </button>
            </div>
            <div className="bg-white rounded-lg shadow overflow-x-auto">
                {isLoading ? <p className="p-6 text-center">Loading services...</p> : (
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminDashboard.services.table.title')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminDashboard.services.table.description')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminDashboard.services.table.icon')}</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminDashboard.services.table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {services.map(service => (
                            <tr key={service.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{t(service.titleKey)}</td>
                                <td className="px-6 py-4 whitespace-normal text-sm text-gray-500">{t(service.descriptionKey)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{service.icon}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleOpenEdit(service)} className="text-indigo-600 hover:text-indigo-900 mr-4"><Edit size={18} /></button>
                                    <button onClick={() => handleOpenDelete(service)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                )}
            </div>
             {isModalOpen && <ServiceFormModal isOpen={isModalOpen} onClose={handleCloseModals} onSave={handleSave} service={selectedService} mode={modalMode} />}
            {isConfirmOpen && <ConfirmationModal isOpen={isConfirmOpen} onClose={handleCloseModals} onConfirm={handleDelete} title={t('adminDashboard.services.confirmDelete')} message="Are you sure you want to delete this service?" />}
        </div>
    );
};

const ServiceFormModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (data: Partial<Service>) => Promise<void>; service: Service | null; mode: 'add' | 'edit' }> = ({ isOpen, onClose, onSave, service, mode }) => {
    const { t } = useContext(LanguageContext);
    const [formData, setFormData] = useState<Partial<Service>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setFormData(service || { titleKey: '', descriptionKey: '', icon: '' });
    }, [service, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        await onSave(formData);
        setIsSubmitting(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-maroon">{mode === 'edit' ? t('adminDashboard.services.editService') : t('adminDashboard.services.addNew')}</h2>
                    <button onClick={onClose}><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium">{t('adminDashboard.services.form.titleKey')}</label>
                        <input type="text" name="titleKey" value={formData.titleKey || ''} onChange={handleChange} className="w-full p-2 border rounded" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium">{t('adminDashboard.services.form.descriptionKey')}</label>
                        <input type="text" name="descriptionKey" value={formData.descriptionKey || ''} onChange={handleChange} className="w-full p-2 border rounded" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium">{t('adminDashboard.services.form.icon')}</label>
                        <input type="text" name="icon" value={formData.icon || ''} onChange={handleChange} className="w-full p-2 border rounded" required />
                         <p className="text-xs text-gray-500 mt-1">{t('adminDashboard.services.form.iconHint')}</p>
                    </div>
                </form>
                 <div className="flex justify-end p-4 border-t bg-gray-50">
                    <button onClick={onClose} type="button" className="mr-2 py-2 px-4 rounded bg-gray-200 hover:bg-gray-300">{t('admilogo nDashboard.temples.buttons.cancel')}</button>
                    <button onClick={handleSubmit} type="submit" disabled={isSubmitting} className="py-2 px-4 rounded bg-saffron text-white hover:bg-orange-500 disabled:bg-gray-400">
                        {isSubmitting ? 'Saving...' : t('adminDashboard.temples.buttons.save')}
                    </button>
                </div>
            </div>
        </div>
    );
};


export default AdminDashboard;