"use client";

import { signup } from "@/app/actions/auth";
import { useActionState } from "react";
import Link from 'next/link';
import { useFormStatus } from "react-dom";

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
            disabled={pending}
        >
            {pending ? "Signing up..." : "Sign up"}
        </button>
    );
}

export default function SignupPage() {
    const [state, dispatch] = useActionState(signup, undefined);

    return (
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-white">
                    Create an account
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm glass-card p-8">
                <form action={dispatch} className="space-y-6">
                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium leading-6 text-gray-200"
                        >
                            Full Name
                        </label>
                        <div className="mt-2">
                            <input
                                id="name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                required
                                className="block w-full rounded-md border-0 py-1.5 text-white bg-white/5 shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 pl-2"
                            />
                        </div>
                    </div>

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
                            <p className="text-sm text-green-500">Account created! Check your email to verify.</p>
                        ) : (
                            state && <p className="text-sm text-red-500">{state}</p>
                        )}
                    </div>
                </form>

                <p className="mt-10 text-center text-sm text-gray-400">
                    Already a member?{" "}
                    <Link
                        href="/login"
                        className="font-semibold leading-6 text-indigo-400 hover:text-indigo-300"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
