import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { Lock, ArrowLeft, Save, ShieldCheck, Key } from 'lucide-react';

const ChangePasswordPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        old_password: '',
        new_password: '',
        new_password_confirm: '',
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.new_password !== formData.new_password_confirm) {
            toast.error('Nové heslá sa nezhodujú.');
            return;
        }

        setLoading(true);
        try {
            await authAPI.changePassword(formData);
            toast.success('Heslo bolo úspešne zmenené. 🎉');
            navigate('/profile');
        } catch (error) {
            console.error('Password change error:', error);
            // Error handling is managed by axios interceptor
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-lg min-h-[calc(100vh-80px)] flex flex-col animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/profile')}
                    className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-primary hover:border-primary/20 transition-all shadow-sm group"
                >
                    <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                </button>
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Zmena hesla</h1>
                    <p className="text-gray-500 font-medium">Zabezpečte svoj účet silným heslom</p>
                </div>
            </div>

            <div className="flex-1">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Main Form Card */}
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 p-8 space-y-6 relative overflow-hidden">
                        {/* Decorative background element */}
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

                        <div className="space-y-4">
                            {/* Old Password */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Staré heslo</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-accent transition-colors">
                                        <Key size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        name="old_password"
                                        value={formData.old_password}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-gray-50/50 border-2 border-transparent focus:border-accent/20 focus:bg-white rounded-2xl py-4 pl-12 pr-4 text-gray-700 font-medium focus:outline-none transition-all shadow-inner"
                                        placeholder="Tvoje aktuálne heslo"
                                    />
                                </div>
                            </div>

                            <div className="h-px bg-gray-100/80 mx-2" />

                            {/* New Password */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Nové heslo</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-accent transition-colors">
                                        <ShieldCheck size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        name="new_password"
                                        value={formData.new_password}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-gray-50/50 border-2 border-transparent focus:border-accent/20 focus:bg-white rounded-2xl py-4 pl-12 pr-4 text-gray-700 font-medium focus:outline-none transition-all shadow-inner"
                                        placeholder="Aspoň 8 znakov"
                                    />
                                </div>
                            </div>

                            {/* Confirm New Password */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Potvrdiť nové heslo</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-accent transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        name="new_password_confirm"
                                        value={formData.new_password_confirm}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-gray-50/50 border-2 border-transparent focus:border-accent/20 focus:bg-white rounded-2xl py-4 pl-12 pr-4 text-gray-700 font-medium focus:outline-none transition-all shadow-inner"
                                        placeholder="Zopakuj nové heslo"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !formData.old_password || !formData.new_password}
                            className={`w-full bg-gradient-to-r from-accent to-accent-dark text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-accent/20 flex items-center justify-center gap-3 relative overflow-hidden group active:scale-95 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-2xl hover:shadow-accent/30 hover:-translate-y-0.5'}`}
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Save size={20} className="group-hover:rotate-12 transition-transform" />
                                    <span className="uppercase tracking-widest text-sm">Uložiť nové heslo</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Tip Card */}
                    <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 flex gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm shrink-0">
                            <span>💡</span>
                        </div>
                        <p className="text-sm text-gray-600 font-medium leading-relaxed">
                            Po úspešnej zmene hesla zostanete prihlásení v tomto zariadení, ale budete sa musieť nanovo prihlásiť v ostatných zariadeniach.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordPage;
