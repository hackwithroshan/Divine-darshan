import React, { useState, useRef, useEffect, useContext } from 'react';
import { Phone, MessageCircle, Globe, User, ChevronDown, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { LanguageContext } from '../contexts/LanguageContext';
import { AuthContext } from '../contexts/AuthContext';

interface HeaderProps {
    onNavigateToDashboard: () => void;
    onNavigateHome: () => void;
}

const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'ta', name: 'தமிழ்' },
    { code: 'te', name: 'తెలుగు' },
    { code: 'bn', name: 'বাংলা' },
];

const Header: React.FC<HeaderProps> = ({ onNavigateToDashboard, onNavigateHome }) => {
    const [isLangDropdownOpen, setLangDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { language, setLanguage, t } = useContext(LanguageContext);
    const { isAuthenticated, logout } = useContext(AuthContext);
    const langDropdownRef = useRef<HTMLDivElement>(null);

    // DERIVED STATE: The selected language is derived directly from context,
    // removing the need for extra state and effects to keep them in sync.
    const selectedLanguage = languages.find(l => l.code === language) || languages[0];

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // This checks both desktop and mobile dropdowns
            if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
                setLangDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

    const handleLanguageSelect = (languageCode: string) => {
        setLanguage(languageCode);
        setLangDropdownOpen(false); // Close dropdown on selection
    };

    return (
        <header className="sticky top-0 z-50 bg-maroon shadow-lg text-white">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                {/* Logo and Name */}
                <a 
                    href="/"
                    onClick={(e) => {
                        e.preventDefault();
                        onNavigateHome();
                    }}
                    className="flex items-center space-x-3" 
                    aria-label="Go to homepage"
                >
                    <img src="/public/image/logo white final.png " alt="astrologica logo" className="h-12" />
                </a>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-6">
                    <a href="#" className="flex items-center space-x-2 hover:text-saffron transition-colors">
                        <MessageCircle size={20} />
                        <span>{t('header.whatsapp')}</span>
                    </a>
                    <a href="#" className="flex items-center space-x-2 hover:text-saffron transition-colors">
                        <Phone size={20} />
                        <span>{t('header.helpline')}</span>
                    </a>
                    <div className="relative" ref={langDropdownRef}>
                        <button
                            onClick={() => setLangDropdownOpen(!isLangDropdownOpen)}
                            className="flex items-center space-x-1 cursor-pointer hover:text-saffron transition-colors focus:outline-none"
                            aria-haspopup="true"
                            aria-expanded={isLangDropdownOpen}
                        >
                            <Globe size={20} />
                            <span>{selectedLanguage.name}</span>
                            <ChevronDown size={16} className={`transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isLangDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-1 z-50 animate-fade-in-up" style={{ animationDuration: '0.15s' }}>
                                {languages.map(lang => (
                                    <a
                                        key={lang.code}
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleLanguageSelect(lang.code);
                                        }}
                                        className={`block px-4 py-2 text-sm transition-colors ${
                                            lang.code === language 
                                                ? 'bg-saffron text-maroon font-bold' 
                                                : 'text-gray-700 hover:bg-orange-100 hover:text-maroon'
                                        }`}
                                        aria-current={lang.code === language ? 'true' : 'false'}
                                    >
                                        {lang.name}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                    {isAuthenticated ? (
                         <div className="flex items-center space-x-4">
                            <button
                                onClick={onNavigateToDashboard}
                                className="flex items-center space-x-2 text-white font-bold hover:text-saffron transition-all"
                            >
                                <LayoutDashboard size={20} />
                                <span>{t('header.dashboard')}</span>
                            </button>
                             <button
                                onClick={logout}
                                className="flex items-center space-x-2 bg-saffron text-maroon font-bold py-2 px-4 rounded-full hover:bg-opacity-90 transition-all"
                            >
                                <LogOut size={20} />
                                <span>{t('header.logout')}</span>
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={onNavigateToDashboard}
                            className="flex items-center space-x-2 bg-saffron text-maroon font-bold py-2 px-4 rounded-full hover:bg-opacity-90 transition-all"
                        >
                            <User size={20} />
                            <span>{t('header.login')}</span>
                        </button>
                    )}
                </div>

                {/* Mobile Menu Icon */}
                <div className="md:hidden">
                    <button onClick={() => setMobileMenuOpen(true)} className="focus:outline-none" aria-label="Open menu">
                        <Menu size={28} />
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-maroon z-[100] md:hidden flex flex-col animate-fade-in"
                    style={{ animationDuration: '0.3s' }}
                >
                    <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                        <span className="text-xl font-bold tracking-wider text-white">Menu</span>
                        <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
                            <X size={28} className="text-white" />
                        </button>
                    </div>
                    <nav className="flex flex-col items-center justify-center flex-grow space-y-6 text-white text-lg">
                        <a href="#" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-2 hover:text-saffron transition-colors">
                            <MessageCircle size={20} />
                            <span>{t('header.whatsapp')}</span>
                        </a>
                        <a href="#" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-2 hover:text-saffron transition-colors">
                            <Phone size={20} />
                            <span>{t('header.helpline')}</span>
                        </a>
                        <div className="relative" ref={langDropdownRef}>
                            <button
                                onClick={() => setLangDropdownOpen(!isLangDropdownOpen)}
                                className="flex items-center space-x-1 cursor-pointer hover:text-saffron transition-colors focus:outline-none"
                                aria-haspopup="true"
                                aria-expanded={isLangDropdownOpen}
                            >
                                <Globe size={20} />
                                <span>{selectedLanguage.name}</span>
                                <ChevronDown size={16} className={`transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isLangDropdownOpen && (
                                <div className="absolute left-1/2 -translate-x-1/2 mt-4 w-56 bg-white rounded-lg shadow-2xl py-2 z-50 animate-fade-in-up border border-saffron/20" style={{ animationDuration: '0.15s' }}>
                                    {languages.map(lang => (
                                        <a
                                            key={lang.code}
                                            href="#"
                                            onClick={(e) => { e.preventDefault(); handleLanguageSelect(lang.code); }}
                                            className={`block w-full text-left px-4 py-3 text-base transition-colors ${
                                                lang.code === language 
                                                ? 'bg-saffron text-maroon font-bold' 
                                                : 'text-gray-700 hover:bg-orange-100'
                                            }`}
                                            aria-current={lang.code === language ? 'true' : 'false'}
                                        >
                                            {lang.name}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="border-t border-saffron/20 w-3/4 my-2"></div>
                        {isAuthenticated ? (
                            <>
                                <button
                                    onClick={() => { onNavigateToDashboard(); setMobileMenuOpen(false); }}
                                    className="flex items-center space-x-2 font-bold hover:text-saffron"
                                >
                                    <LayoutDashboard size={20} />
                                    <span>{t('header.dashboard')}</span>
                                </button>
                                <button
                                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                                    className="flex items-center space-x-2 bg-saffron text-maroon font-bold py-2 px-6 rounded-full"
                                >
                                    <LogOut size={20} />
                                    <span>{t('header.logout')}</span>
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => { onNavigateToDashboard(); setMobileMenuOpen(false); }}
                                className="flex items-center space-x-2 bg-saffron text-maroon font-bold py-2 px-6 rounded-full"
                            >
                                <User size={20} />
                                <span>{t('header.login')}</span>
                            </button>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;