import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Activity, Share2, Cpu } from 'lucide-react';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

function WiraBadge() {
    return (
        <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md p-2.5 rounded-2xl shadow-xl border border-white/20">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl overflow-hidden bg-white shadow">
                <img
                    src="/images/WhatsApp_Image_2026-09-08_at_07.25.54-removebg-preview.png"
                    alt="WIRA Nusantara"
                    className="h-full w-full object-contain p-0.5"
                />
            </div>
            <div className="flex flex-col text-left">
                <span className="text-sm font-black tracking-widest text-[#FFD200] uppercase leading-none">WIRA</span>
                <span className="text-xs font-bold text-white leading-tight">Nusantara</span>
                <span className="text-[10px] font-semibold text-white/60">PLN NP UP Kendari</span>
            </div>
        </div>
    );
}

export default function Login({ status, canResetPassword }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Login WIRA — PLN NP UP Kendari" />

            <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#1E293B]">
                {/* Background image */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 transform transition-transform duration-1000"
                    style={{ backgroundImage: `url('/images/power_plant_bg.jpg')` }}
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#2F6C8E]/90 via-[#1F4A63]/92 to-[#0F2432]/96 backdrop-blur-[5px]" />

                {/* Ambient glow */}
                <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-[#FFD200]/20 blur-3xl" />
                <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-[#2F6C8E]/50 blur-3xl" />

                {/* Main Responsive Container */}
                <div className="relative z-10 w-full max-w-6xl p-4 sm:p-6 lg:p-8">
                    <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">

                        {/* LEFT COLUMN - desktop only */}
                        <div className="hidden lg:col-span-7 lg:flex flex-col text-left space-y-6">
                            <div>
                                <WiraBadge />
                            </div>

                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFD200]/20 border border-[#FFD200]/40 text-[#FFD200] text-xs font-bold mb-3">
                                    <Cpu className="h-3.5 w-3.5" />
                                    <span>AI ASSISTANT PEMBANGKIT KENDARI</span>
                                </div>
                                <h1 className="text-4xl xl:text-5xl font-black text-white tracking-tight leading-none">
                                    WIRA <span className="text-[#FFD200]">NUSANTARA</span>
                                </h1>
                                <p className="mt-2 text-lg font-semibold text-white/90">
                                    WhatsApp Information &amp; Resource Assistant
                                </p>
                                <p className="mt-2 text-sm text-white/70 leading-relaxed max-w-xl">
                                    Asisten cerdas internal terintegrasi untuk pemantauan data telemetry, kondisi mesin pembangkit, histori pemeliharaan, serta kemudahan broadcast ke grup WhatsApp PLN.
                                </p>
                            </div>

                            {/* Features */}
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md hover:bg-white/15 transition-all cursor-default">
                                        <div className="p-2 rounded-xl bg-[#FFD200]/20 text-[#FFD200] shrink-0">
                                            <Activity className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-white">Monitoring Telemetry</h4>
                                            <p className="text-[11px] text-white/60 mt-0.5">Data real-time unit pembangkit</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md hover:bg-white/15 transition-all cursor-default">
                                        <div className="p-2 rounded-xl bg-emerald-400/20 text-emerald-300 shrink-0">
                                            <Share2 className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-white">WhatsApp Gateway</h4>
                                            <p className="text-[11px] text-white/60 mt-0.5">Kirim laporan ke grup PLN</p>
                                        </div>
                                    </div>
                                </div>
                        </div>

                        {/* RIGHT COLUMN - Login Card */}
                        <div className="w-full lg:col-span-5 mx-auto max-w-md">
                            <div className="overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">

                                {/* Mobile branding */}
                                <div className="mb-6 text-center lg:text-left">
                                    <div className="mb-3 flex justify-center lg:hidden">
                                        <WiraBadge />
                                    </div>
                                    <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                                        Masuk ke WIRA
                                    </h2>
                                    <p className="mt-1 text-xs text-white/70">
                                        Masukkan email/NIP dan kata sandi Anda untuk mulai percakapan.
                                    </p>
                                </div>

                                {/* Login Form */}
                                <form onSubmit={submit} className="flex flex-col gap-5">
                                    <div className="grid gap-4">
                                        <div className="grid gap-1.5">
                                            <Label
                                                htmlFor="email"
                                                className="text-xs font-semibold uppercase tracking-wider text-white/90"
                                            >
                                                Email / NIP Operator
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                name="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                required
                                                autoFocus
                                                tabIndex={1}
                                                autoComplete="email"
                                                placeholder="operator@pln.co.id"
                                                className="h-12 rounded-xl border border-white/20 bg-white/95 px-4 text-gray-900 placeholder-gray-400 font-medium transition-all focus:border-[#FFD200] focus:bg-white focus:ring-2 focus:ring-[#FFD200]/30"
                                            />
                                            <InputError message={errors.email} className="text-red-300 text-xs font-medium" />
                                        </div>

                                        <div className="grid gap-1.5">
                                            <div className="flex items-center justify-between">
                                                <Label
                                                    htmlFor="password"
                                                    className="text-xs font-semibold uppercase tracking-wider text-white/90"
                                                >
                                                    Kata Sandi
                                                </Label>
                                                {canResetPassword && (
                                                    <TextLink
                                                        href="/forgot-password"
                                                        className="text-xs font-semibold text-[#FFD200] transition-colors hover:underline"
                                                        tabIndex={5}
                                                    >
                                                        Lupa kata sandi?
                                                    </TextLink>
                                                )}
                                            </div>
                                            <PasswordInput
                                                id="password"
                                                name="password"
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                required
                                                tabIndex={2}
                                                autoComplete="current-password"
                                                placeholder="••••••••"
                                                className="h-12 rounded-xl border border-white/20 bg-white/95 px-4 text-gray-900 placeholder-gray-400 font-medium transition-all focus:border-[#FFD200] focus:bg-white focus:ring-2 focus:ring-[#FFD200]/30"
                                            />
                                            <InputError message={errors.password} className="text-red-300 text-xs font-medium" />
                                        </div>

                                        <div className="flex items-center space-x-2 pt-1">
                                            <Checkbox
                                                id="remember"
                                                name="remember"
                                                checked={data.remember}
                                                onCheckedChange={(checked) => setData('remember', !!checked)}
                                                tabIndex={3}
                                                className="h-4 w-4 rounded border-white/30 bg-white/10 data-[state=checked]:bg-[#FFD200] data-[state=checked]:text-[#2F6C8E]"
                                            />
                                            <Label
                                                htmlFor="remember"
                                                className="text-xs font-medium text-white/80 cursor-pointer"
                                            >
                                                Ingat sesi saya
                                            </Label>
                                        </div>

                                        <Button
                                            type="submit"
                                            className="mt-2 h-12 w-full rounded-xl bg-[#FFD200] font-bold text-[#2F6C8E] shadow-lg transition-all duration-200 hover:bg-[#FFE043] hover:shadow-xl active:scale-[0.99] disabled:opacity-70"
                                            tabIndex={4}
                                            disabled={processing}
                                        >
                                            {processing ? (
                                                <Spinner className="mr-2 text-[#2F6C8E]" />
                                            ) : (
                                                <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                                </svg>
                                            )}
                                            Masuk ke WIRA Assistant
                                        </Button>
                                    </div>
                                </form>

                                {status && (
                                    <div className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-500/20 p-3 text-center text-xs font-medium text-emerald-100">
                                        {status}
                                    </div>
                                )}

                                {/* Footer */}
                                <div className="mt-6 border-t border-white/10 pt-4 text-center">
                                    <p className="text-[11px] text-white/50">
                                        © 2026 WIRA Nusantara — PLN NP UP Kendari
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}

Login.layout = (page: React.ReactNode) => page;
