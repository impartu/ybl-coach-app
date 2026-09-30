import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Bookmark, ArrowRight } from 'lucide-react';
import { cn } from '../utils/cn';

const BENEFITS = [
  {
    image: '/marketing/screenshot-strategy.png',
    alt: 'Auto-Assign Strategy settings: require a handler and rim per period, balance defensive ratings, stagger depth players, and choose a Development or Competitive extra-minutes policy',
    title: 'Auto-rotations built around your strategy — always within YBL rules',
    description:
      "Require a ball-handler and rebounder every period, balance defensive ratings, stagger your bench — or just toggle Development vs. Competitive and let it handle the rest. However you coach, the rotation still meets every YBL rule.",
  },
  {
    image: '/marketing/screenshot-season-stats.png',
    alt: 'Season stats table showing each player\'s total minutes, season total, games played, and average minutes per game',
    title: 'Never get caught off guard by a playing-time question',
    description:
      "Every player's minutes are tracked automatically, game after game, all season. When a parent asks why their kid isn't playing more, you've already got the real numbers — not a guess.",
  },
];

const FEATURES = [
  {
    icon: Users,
    title: 'Roster Management by Role',
    description:
      "Configure your roster with each player's roles, defense rating, and availability, so lineups reflect how your team actually plays.",
  },
  {
    icon: Bookmark,
    title: 'Save and Reuse Favorite Rotations',
    description:
      'Save your best lineups as favorites. Reload them instantly on game day, or use one as the starting point for a new rotation.',
  },
];

export function HomeScreen() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-brand-500 text-white shadow-brand-200 shadow-md">
              <img src="/icon.svg" alt="" className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-800 hidden sm:inline">Coach YBL App</span>
          </div>
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-semibold rounded-lg text-white bg-brand-500 hover:bg-brand-600 shadow-sm transition-colors"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
            Run smarter rotations,{' '}
            <span className="text-brand-500">every game.</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Coach YBL App builds fair, rule-compliant rotations in seconds, tracks every
            player's minutes across the season, and keeps your whole roster organized in
            one place.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg text-white bg-brand-500 hover:bg-brand-600 shadow-sm shadow-brand-200 transition-colors"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#features"
              className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors"
            >
              See Features
            </a>
          </div>
        </div>
        <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200 aspect-[4/3] bg-slate-200">
          <img
            src="/marketing/hero.jpg"
            alt="A youth basketball game in progress"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      </section>

      {/* Screenshots */}
      <section id="features" className="bg-white border-y">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center">
            See it in action
          </h2>
          <p className="mt-2 text-slate-600 text-center max-w-xl mx-auto">
            The rotation grid and player matrix, built for the sideline.
          </p>
          <div className="mt-10 grid sm:grid-cols-2 gap-6">
            <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 aspect-[4/3]">
              <img
                src="/marketing/screenshot-matrix.png"
                alt="Player matrix screenshot showing quick-assign checkboxes per period"
                className="w-full h-full object-cover object-top"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 aspect-[4/3]">
              <img
                src="/marketing/screenshot-grid.png"
                alt="Rotation grid screenshot showing five periods of assigned players"
                className="w-full h-full object-cover object-top"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center">
            What matters most to coaches
          </h2>
          <p className="mt-2 text-slate-600 text-center max-w-xl mx-auto">
            Built around what coaches actually told us they needed.
          </p>

          <div className="mt-12 space-y-14 sm:space-y-20">
            {BENEFITS.map((benefit, idx) => (
              <div key={benefit.title} className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                <div className={idx % 2 === 1 ? 'md:order-2' : ''}>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                    {benefit.title}
                  </h3>
                  <p className="mt-3 text-slate-600 leading-relaxed">{benefit.description}</p>
                </div>
                <div className={cn(
                  'rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50 p-3',
                  idx % 2 === 1 ? 'md:order-1' : ''
                )}>
                  <img
                    src={benefit.image}
                    alt={benefit.alt}
                    className="w-full h-auto rounded-lg"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center">
          Everything a coach needs, nothing they don't
        </h2>
        <div className="mt-10 grid sm:grid-cols-2 gap-6">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="p-6 rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="w-10 h-10 rounded-lg bg-brand-500 text-white flex items-center justify-center shadow-sm">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="mt-4 font-bold text-slate-800">{title}</h3>
              <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Ready to run your next game?
          </h2>
          <p className="mt-2 text-brand-50">Sign in with Google and create your team in seconds.</p>
          <Link
            to="/login"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg text-brand-600 bg-white hover:bg-brand-50 shadow-sm transition-colors"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Coach YBL App
      </footer>
    </div>
  );
}
