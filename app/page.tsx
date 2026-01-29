import Link from "next/link";
import { ArrowRight, Trophy, Users, BarChart3, ShieldCheck } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="bg-white">
      {/* Header */}
      <header className="absolute inset-x-0 top-0 z-50">
        <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1">
            <a href="#" className="-m-1.5 p-1.5 flex items-center gap-2">
              <img src="/icon.png" alt="CupQuest Logo" className="h-8 w-auto rounded-md" />
              <span className="text-2xl font-black text-indigo-600 tracking-tighter">CupQuest</span>
            </a>
          </div>
          <div className="flex flex-1 justify-end gap-x-6">
            <Link href="/rules" className="text-sm font-semibold leading-6 text-gray-900 hover:text-indigo-600">
              How to Play
            </Link>
            <Link href="/login" className="text-sm font-semibold leading-6 text-gray-900 hover:text-indigo-600">
              Log in
            </Link>
            <Link href="/signup" className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
              Sign up
            </Link>
          </div>
        </nav>
      </header>

      <main className="isolate">
        {/* Hero Section */}
        <div className="relative pt-14">
          <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
            <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
          </div>

          <div className="py-24 sm:py-32 lg:pb-40">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-2xl text-center">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                  Predict the World Cup. <br />
                  <span className="text-indigo-600">Beat your Friends.</span>
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  Join the ultimate social prediction game for the FIFA World Cup 2026. Create private leagues, compete on global leaderboards, and prove your football knowledge.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                  <Link
                    href="/signup"
                    className="rounded-full bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 flex items-center gap-2"
                  >
                    Start Predicting <ArrowRight size={16} />
                  </Link>
                  <Link href="#features" className="text-sm font-semibold leading-6 text-gray-900">
                    Learn more <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Section */}
        <div id="features" className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32 bg-gray-50 rounded-3xl mb-24">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-600">Everything you need</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Platform Features
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              We provide a seamless experience so you can focus on the matches and the banter.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                    <Trophy className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  Private Leagues
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Create groups with friends, colleagues, or family. Share a simple invite code to get everyone in the game.
                </dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                    <BarChart3 className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  Live Scoring
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Points are updated as soon as matches finish. Track your rise (or fall) on the leaderboard in real-time.
                </dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                    <Users className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  Global Competition
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  See how you rank against the entire world. Can you make it to the top 50 global leaderboard?
                </dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                    <ShieldCheck className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  Secure & Fair
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Predictions are locked 5 minutes before kickoff. No cheating allowed.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center text-gray-500 text-sm">
          <p className="mb-2">
            <Link href="/rules" className="hover:text-indigo-600 transition-colors">How to Play</Link>
          </p>
          <p>&copy; 2026 CupQuest. Not affiliated with FIFA.</p>
        </div>
      </footer>
    </div>
  );
}
