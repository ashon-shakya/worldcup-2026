import Link from "next/link";
import { ArrowRight, Trophy, Users, BarChart3, ShieldCheck, BookOpen, LogIn } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[url('/bg-2.jpg')] bg-cover bg-center bg-no-repeat bg-scroll sm:bg-fixed font-sans text-gray-100">
      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-50 backdrop-blur-sm bg-black/10 transition-all">
        <nav className="flex items-center justify-between p-4 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1">
            <a href="#" className="-m-1.5 p-1.5 flex items-center gap-2">
              <img src="/icon.png" alt="CupQuest Logo" className="h-8 w-auto rounded-md shadow-lg shadow-indigo-500/20" />
              <span className="text-2xl font-black text-white tracking-tighter drop-shadow-md">CupQuest</span>
            </a>
          </div>
          <div className="flex flex-1 justify-end gap-x-6">
            <Link href="/rules" className="hidden sm:flex items-center gap-2 text-sm font-semibold leading-6 text-gray-300 hover:text-white transition-colors">
              <BookOpen size={18} /> How to Play
            </Link>
            <Link href="/login" className="flex items-center gap-2 text-sm font-semibold leading-6 text-gray-300 hover:text-white transition-colors">
              <LogIn size={18} /> Log in
            </Link>
            <Link href="/signup" className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 hover:shadow-indigo-500/50 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
              Sign up
            </Link>
          </div>
        </nav>
      </header>

      <main className="isolate">
        {/* Hero Section */}
        <div className="relative pt-14 mx-4 sm:mx-6 lg:mx-8 xl:mx-auto max-w-7xl">

          <div className="py-20 sm:py-32 lg:pb-40">
            <div className="mx-auto max-w-7xl p-10 lg:px-8 bg-gray-900/40 backdrop-blur-sm border border-white/10 rounded-3xl">
              <div className="mx-auto max-w-2xl text-center">
                <Link href="/">
                  <img className="mx-auto h-30 w-auto rounded-xl shadow-lg shadow-indigo-500/20 mb-6 hover:opacity-80 transition-opacity" src="/icon.png" alt="CupQuest" />
                </Link>
                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl drop-shadow-xl">
                  Predict the World Cup. <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-500 drop-shadow-sm">Beat your Friends.</span>
                </h1>
                <p className="mt-6 text-lg leading-8 text-white max-w-xl mx-auto drop-shadow-md font-medium">
                  Join the ultimate social prediction game for the FIFA World Cup 2026. Create private leagues, compete on global leaderboards, and prove your football knowledge.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                  <Link
                    href="/signup"
                    className="rounded-full bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/40 hover:bg-indigo-500 hover:shadow-indigo-500/60 transition-all flex items-center gap-2"
                  >
                    Start Predicting <ArrowRight size={16} />
                  </Link>
                  <Link href="#features" className="text-sm font-semibold leading-6 text-gray-100 hover:text-white transition-colors drop-shadow">
                    Learn more <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="relative bottom-0 mt-[-100px] mb-[-30px] w-full z-10 flex items-center justify-between" >
          <img className=" h-30 sm:h-50 md:h-60  w-auto z-10" src="/ronaldo2.gif" alt="CupQuest" />
          <img className=" h-30 sm:h-50 md:h-60  w-auto z-10" src="/messi.gif" alt="CupQuest" />
          <img className=" h-30 sm:h-50 md:h-60  w-auto z-10" src="/mbappe.gif" alt="CupQuest" />
        </div>
        {/* Feature Section */}
        <div id="features" className="mx-4 sm:mx-6 lg:mx-8 xl:mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32 bg-gray-900/40 backdrop-blur-sm border border-white/10 rounded-3xl mb-24 shadow-2xl">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-amber-400 uppercase tracking-widest drop-shadow-sm">Everything you need</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Platform Features
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-200">
              We provide a seamless experience so you can focus on the matches and the banter.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-white">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600/80 shadow-lg shadow-indigo-500/20">
                    <Trophy className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  Private Leagues
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-200">
                  Create groups with friends, colleagues, or family. Share a simple invite code to get everyone in the game.
                </dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-white">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600/80 shadow-lg shadow-indigo-500/20">
                    <BarChart3 className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  Live Scoring
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-200">
                  Points are updated as soon as matches finish. Track your rise (or fall) on the leaderboard in real-time.
                </dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-white">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600/80 shadow-lg shadow-indigo-500/20">
                    <Users className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  Global Competition
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-200">
                  See how you rank against the entire world. Can you make it to the top 50 global leaderboard?
                </dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-white">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600/80 shadow-lg shadow-indigo-500/20">
                    <ShieldCheck className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  Secure & Fair
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-200">
                  Predictions are locked 5 minutes before kickoff. No cheating allowed.
                </dd>


              </div>
            </dl>
          </div>
        </div>
      </main>

      {/* Footer */}

      <footer className="bg-black/20 backdrop-blur-md py-12 border-t border-white/5">

        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center text-gray-100 text-sm">
          <p className="mb-2 flex justify-center ">
            <Link href="/rules" className="flex items-center gap-2 hover:text-indigo-900 transition-colors">
              <BookOpen size={16} /> How to Play
            </Link>
          </p>
          <p>&copy; 2026 CupQuest. Not affiliated with FIFA.</p>
        </div>
      </footer>
    </div>
  );
}
