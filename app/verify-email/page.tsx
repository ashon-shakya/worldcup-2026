import { User } from "@/models/schema";
import connectToDatabase from "@/lib/db";
import Link from 'next/link';

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const token = searchParams.token;

  if (!token || typeof token !== "string") {
    return (
      <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8 text-center">
        <h2 className="text-2xl font-bold text-red-600">Invalid Token</h2>
        <p className="mt-2 text-gray-600">Missing or invalid verification token.</p>
        <Link href="/login" className="mt-4 text-indigo-600 hover:text-indigo-500">
          Back to Login
        </Link>
      </div>
    );
  }

  await connectToDatabase();
  const user = await User.findOne({ verificationToken: token });

  if (!user) {
    return (
      <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8 text-center">
        <h2 className="text-2xl font-bold text-red-600">Invalid Token</h2>
        <p className="mt-2 text-gray-600">This token is invalid or has expired.</p>
        <Link href="/login" className="mt-4 text-indigo-600 hover:text-indigo-500">
          Back to Login
        </Link>
      </div>
    );
  }

  const hasExpired = new Date(user.verificationTokenExpires) < new Date();

  if (hasExpired) {
    return (
       <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8 text-center">
        <h2 className="text-2xl font-bold text-red-600">Token Expired</h2>
        <p className="mt-2 text-gray-600">This token has expired. Please sign up again or request a new one.</p>
        <Link href="/signup" className="mt-4 text-indigo-600 hover:text-indigo-500">
          Go to Signup
        </Link>
      </div>
    );
  }

  user.emailVerified = new Date();
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8 text-center">
      <h2 className="text-2xl font-bold text-green-600">Email Verified!</h2>
      <p className="mt-2 text-gray-600">Your email has been successfully verified.</p>
      <Link
        href="/login"
        className="mt-6 inline-block rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        Sign in
      </Link>
    </div>
  );
}
