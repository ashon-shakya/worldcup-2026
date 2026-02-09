"use client";

import { resetPassword } from "@/app/actions/auth";
import { useActionState, Suspense } from "react";
import Link from 'next/link';
import { useFormStatus } from "react-dom";
import { Home, ArrowLeft } from "lucide-react";
import { useSearchParams } from 'next/navigation';

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
            disabled={pending}
        >
            {pending ? "Resetting..." : "Reset Password"}
        </button>
    );
}

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [state, dispatch] = useActionState(resetPassword, undefined);

    if (!token) {
        return (
            <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-[url('/bg-2.jpg')] bg-cover bg-center bg-no-repeat bg-scroll sm:bg-fixed">
                <div className="glass-card p-8 sm:mx-auto sm:w-full sm:max-w-sm text-center">
                    <h2 className="text-2xl font-bold text-red-500">Invalid Link</h2>
                    <p className="mt-2 text-gray-300">Missing or invalid reset token.</p>
                    <Link href="/forgot-password" className="mt-4 inline-block text-indigo-300 hover:text-indigo-500">
                        Request a new link
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-[url('/bg-2.jpg')] bg-cover bg-center bg-no-repeat bg-scroll sm:bg-fixed">
            <Link href="/" className="absolute top-4 left-4 p-2 text-gray-400 hover:text-white transition-colors bg-black/20 rounded-full backdrop-blur-sm z-50">
                <Home size={20} />
            </Link>
            <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm glass-card p-8">
                    <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                        <Link href="/">
                            <img className="mx-auto h-16 w-auto rounded-xl shadow-lg shadow-indigo-500/20 hover:opacity-80 transition-opacity" src="/icon.png" alt="CupQuest" />
                        </Link>
                        <h2 className="my-2 text-center text-2xl font-bold leading-9 tracking-tight text-white">
                            Reset Password
                        </h2>
                    </div>

                    <form action={dispatch} className="mt-6 space-y-6">
                        <input type="hidden" name="token" value={token} />
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium leading-6 text-gray-200"
                            >
                                New Password
                            </label>
                            <div className="mt-2">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="block w-full rounded-md border-0 py-1.5 text-white bg-white/5 shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 pl-2"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="block text-sm font-medium leading-6 text-gray-200"
                            >
                                Confirm Password
                            </label>
                            <div className="mt-2">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    className="block w-full rounded-md border-0 py-1.5 text-white bg-white/5 shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 pl-2"
                                />
                            </div>
                        </div>

                        <div>
                            <SubmitButton />
                        </div>
                        <div
                            className="flex h-8 items-end space-x-1"
                            aria-live="polite"
                            aria-atomic="true"
                        >
                            {state === "success" ? (
                                <p className="text-sm text-green-500">Password reset! You can now log in.</p>
                            ) : (
                                state && <p className="text-sm text-red-500">{state}</p>
                            )}
                        </div>
                    </form>

                    {state === "success" && (
                        <p className="mt-4 text-center text-sm text-gray-200">
                            <Link
                                href="/login"
                                className="flex items-center justify-center gap-2 font-semibold leading-6 text-indigo-300 hover:text-indigo-500"
                            >
                                <ArrowLeft size={16} /> Go to Sign in
                            </Link>
                        </p>
                    )}

                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense>
            <ResetPasswordForm />
        </Suspense>
    );
}
