import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

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
            <Head title="Masuk — WIRA" />

            <div className="wira-gradient relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 py-10">
                <div className="grid w-full max-w-5xl grid-cols-1 items-center gap-12 lg:grid-cols-12">
                    {/* Kolom kiri — editorial, desktop */}
                    <div className="hidden lg:col-span-6 lg:flex lg:flex-col">
                        <div className="flex items-baseline gap-2">
                            <span className="font-mono text-[15px] font-medium tracking-tight text-mist">WIRA</span>
                            <span className="font-mono text-[12px] text-mist/40">PLN NP UP Kendari</span>
                        </div>
                        <h1 className="mt-6 text-[32px] font-medium leading-[1.15] text-mist">
                            Alat kerja untuk operator dan engineer pembangkit.
                        </h1>
                        <p className="mt-4 max-w-[56ch] text-[16px] leading-relaxed text-mist/60">
                            Cari SOP, parameter mesin, dan status pekerjaan dari satu tempat. Masuk dengan akun
                            operator Anda untuk memulai.
                        </p>
                    </div>

                    {/* Kolom kanan — kartu masuk (glass) */}
                    <div className="w-full lg:col-span-6">
                        <div className="glass mx-auto max-w-md rounded-dock p-7 sm:p-8">
                            <h2 className="text-[22px] font-medium text-mist">Masuk ke WIRA</h2>
                            <p className="mt-1 text-[14px] text-mist/60">
                                Masukkan email atau NIP dan kata sandi Anda.
                            </p>

                            <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
                                <div className="grid gap-1.5">
                                    <label htmlFor="email" className="text-[14px] text-mist/80">
                                        Email atau NIP
                                    </label>
                                    <input
                                        id="email"
                                        type="text"
                                        name="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="username"
                                        placeholder="operator@pln.co.id"
                                        className="rounded-[12px] border border-white/15 bg-white/[0.06] px-3.5 py-2.5 text-[15px] text-mist placeholder:text-mist/35 focus:border-signal focus:outline-none focus:ring-1 focus:ring-signal"
                                    />
                                    <InputError message={errors.email} className="text-[13px] text-ember" />
                                </div>

                                <div className="grid gap-1.5">
                                    <div className="flex items-center justify-between">
                                        <label htmlFor="password" className="text-[14px] text-mist/80">
                                            Kata sandi
                                        </label>
                                        {canResetPassword && (
                                            <TextLink
                                                href="/forgot-password"
                                                className="text-[13px] text-signal hover:underline"
                                                tabIndex={5}
                                            >
                                                Lupa kata sandi?
                                            </TextLink>
                                        )}
                                    </div>
                                    <input
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        className="rounded-[12px] border border-white/15 bg-white/[0.06] px-3.5 py-2.5 text-[15px] text-mist placeholder:text-mist/35 focus:border-signal focus:outline-none focus:ring-1 focus:ring-signal"
                                    />
                                    <InputError message={errors.password} className="text-[13px] text-ember" />
                                </div>

                                <label className="mt-1 flex cursor-pointer items-center gap-2 text-[14px] text-mist/70">
                                    <input
                                        type="checkbox"
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        tabIndex={3}
                                        className="h-4 w-4 rounded-[4px] border-white/25 bg-white/10 accent-signal"
                                    />
                                    Ingat sesi saya
                                </label>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    tabIndex={4}
                                    className="mt-2 rounded-[12px] bg-signal px-4 py-2.5 text-[15px] font-medium text-mist transition-colors hover:bg-signal/90 disabled:opacity-60"
                                >
                                    {processing ? 'Memproses…' : 'Masuk'}
                                </button>
                            </form>

                            {status && (
                                <p className="mt-4 rounded-[12px] border border-signal/30 bg-signal/10 p-3 text-center text-[13px] text-mist/80">
                                    {status}
                                </p>
                            )}

                            <p className="mt-6 border-t border-white/10 pt-4 text-center font-mono text-[12px] text-mist/40">
                                © 2026 WIRA · PLN NP UP Kendari
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Login.layout = (page: React.ReactNode) => page;
