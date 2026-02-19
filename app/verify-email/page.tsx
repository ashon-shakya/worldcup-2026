import { User } from "@/models/schema";
import connectToDatabase from "@/lib/db";
import Link from 'next/link';

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { token } = await searchParams;

  if (!token || typeof token !== "string") {
    return (
      <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-[url('/bg-2.jpg')] bg-cover bg-center bg-no-repeat bg-scroll sm:bg-fixed">
        <div className="glass-card p-8 sm:mx-auto sm:w-full sm:max-w-sm text-center">
          <h2 className="text-2xl font-bold text-red-500">Invalid Token</h2>
          <p className="mt-2 text-gray-300">Missing or invalid verification token.</p>
          <Link href="/login" className="mt-4 inline-block text-indigo-300 hover:text-indigo-500">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  console.log("Verify Email Token:", token);

  await connectToDatabase();
  const user = await User.findOne({ verificationToken: token });
  console.log("User found for token:", user ? user.email : "null");

  if (!user) {
    return (
      <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-[url('/bg-2.jpg')] bg-cover bg-center bg-no-repeat bg-scroll sm:bg-fixed">
        <div className="glass-card p-8 sm:mx-auto sm:w-full sm:max-w-sm text-center">
          <h2 className="text-2xl font-bold text-red-500">Invalid Token</h2>
          <p className="mt-2 text-gray-300">This token is invalid or has expired.</p>
          <Link href="/login" className="mt-4 inline-block text-indigo-300 hover:text-indigo-500">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  const hasExpired = new Date(user.verificationTokenExpires) < new Date();

  if (hasExpired) {
    return (
      <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-[url('/bg-2.jpg')] bg-cover bg-center bg-no-repeat bg-scroll sm:bg-fixed">
        <div className="glass-card p-8 sm:mx-auto sm:w-full sm:max-w-sm text-center">
          <h2 className="text-2xl font-bold text-red-500">Token Expired</h2>
          <p className="mt-2 text-gray-300">This token has expired. Please sign up again or request a new one.</p>
          <Link href="/signup" className="mt-4 inline-block text-indigo-300 hover:text-indigo-500">
            Go to Signup
          </Link>
        </div>
      </div>
    );
  }

  user.emailVerified = new Date();
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();

  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-[url('/bg-2.jpg')] bg-cover bg-center bg-no-repeat bg-scroll sm:bg-fixed">
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm glass-card p-8 text-center">
          <Link href="/">
            <img className="mx-auto h-16 w-auto rounded-xl shadow-lg shadow-indigo-500/20 hover:opacity-80 transition-opacity mb-4" src="/icon.png" alt="CupQuest" />
          </Link>
          <h2 className="text-2xl font-bold text-green-500">Email Verified!</h2>
          <p className="mt-2 text-gray-200">Your email has been successfully verified.</p>
          <Link
            href="/login"
            className="mt-6 inline-block rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
