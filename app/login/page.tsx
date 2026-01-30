"use client";

import { authenticate } from "@/app/actions/auth";
import { useActionState } from "react";
import Link from 'next/link';
import { useFormStatus } from "react-dom";
import { Home } from "lucide-react";

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
            disabled={pending}
        >
            {pending ? "Signing in..." : "Sign in"}
        </button>
    );
}

export default function LoginPage() {
    const [errorMessage, dispatch] = useActionState(authenticate, undefined);

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
                            Sign in to your account
                        </h2>
                    </div>
                    <form action={dispatch} className="space-y-6">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium leading-6 text-gray-200"
                            >
                                Email address
                            </label>
                            <div className="mt-2">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="block w-full rounded-md border-0 py-1.5 text-white bg-white/5 shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 pl-2"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium leading-6 text-gray-200"
                                >
                                    Password
                                </label>
                            </div>
                            <div className="mt-2">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
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
                            {errorMessage && (
                                <p className="text-sm text-red-500">{errorMessage}</p>
                            )}
                        </div>
                    </form>

                    <p className="mt-1 text-center text-sm text-gray-200">
                        Not a member?{" "}
                        <Link
                            href="/signup"
                            className="font-semibold leading-6 text-indigo-300 hover:text-indigo-500"
                        >
                            Sign up now
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
