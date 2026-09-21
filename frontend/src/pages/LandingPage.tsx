import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  FolderTree,
  Share2,
  BarChart3,
  ArrowRight,
  Cloud,
  Lock,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

const features = [
  {
    icon: ShieldCheck,
    title: 'Secure Storage',
    description:
      'Your files are encrypted and protected. Only you decide who gets access.',
  },
  {
    icon: FolderTree,
    title: 'Organized Files',
    description:
      'Create folders, navigate with breadcrumbs, and keep everything tidy.',
  },
  {
    icon: Share2,
    title: 'Easy Sharing',
    description:
      'Generate secure links and share files with anyone, no account required.',
  },
  {
    icon: BarChart3,
    title: 'Storage Insights',
    description:
      'Track usage at a glance with a beautiful, real-time storage dashboard.',
  },
];

const stats = [
  { value: '99.9%', label: 'Uptime' },
  { value: '256-bit', label: 'Encryption' },
  { value: '1TB', label: 'Max storage' },
  { value: '0', label: 'Ads, ever' },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Logo />
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-slate-600 transition hover:text-slate-900">
              Features
            </a>
            <a href="#preview" className="text-sm font-medium text-slate-600 transition hover:text-slate-900">
              Preview
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/60 via-white to-white" />
        <div className="absolute -top-24 right-0 h-96 w-96 rounded-full bg-blue-100/40 blur-3xl" />
        <div className="absolute -top-40 left-1/4 h-80 w-80 rounded-full bg-sky-100/40 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3.5 py-1.5 text-xs font-medium text-blue-700">
                <Zap className="h-3.5 w-3.5" />
                Fast, private, and built for you
              </div>
              <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Your files.
                <br />
                Your cloud.
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">
                  Your control.
                </span>
              </h1>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-slate-500">
                CloudVault gives you a premium cloud storage experience with
                secure uploads, smart organization, and effortless sharing —
                all in one elegant workspace.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Sign In
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-slate-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  No credit card
                </span>
                <span className="flex items-center gap-1.5">
                  <Lock className="h-4 w-4 text-emerald-500" />
                  Encrypted
                </span>
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/10 to-sky-400/10 blur-2xl" />
              <div className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-2xl shadow-slate-900/10">
                <img
                  src="https://images.pexels.com/photos/17489163/pexels-photo-17489163.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                  alt="Cloud storage data center"
                  className="h-72 w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                {/* Floating card */}
                <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/40 bg-white/90 p-4 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                      <Cloud className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-800">
                        project-final.zip
                      </p>
                      <p className="text-xs text-slate-400">Uploaded just now</p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">
                      Secure
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-slate-100 bg-slate-50/50">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-10 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-bold text-slate-800">{s.value}</p>
              <p className="mt-1 text-sm text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Everything you need to manage your files
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            A complete cloud storage toolkit designed for speed, privacy, and
            clarity.
          </p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-slate-100 bg-white p-7 transition hover:-translate-y-1 hover:border-blue-100 hover:shadow-xl hover:shadow-slate-900/5"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                <f.icon className="h-6 w-6" strokeWidth={1.75} />
              </div>
              <h3 className="text-base font-semibold text-slate-800">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Preview */}
      <section id="preview" className="bg-slate-50/70 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              A dashboard you'll actually enjoy using
            </h2>
            <p className="mt-4 text-lg text-slate-500">
              Clean, fast, and built around your workflow.
            </p>
          </div>
          <div className="mt-12 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
            {/* Mock browser chrome */}
            <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-rose-300" />
              <div className="h-3 w-3 rounded-full bg-amber-300" />
              <div className="h-3 w-3 rounded-full bg-emerald-300" />
              <div className="ml-3 flex-1 rounded-md bg-white px-3 py-1 text-xs text-slate-400">
                app.cloudvault.io/dashboard
              </div>
            </div>
            {/* Mock dashboard */}
            <div className="grid grid-cols-12">
              {/* sidebar */}
              <div className="col-span-3 hidden border-r border-slate-100 p-5 md:block">
                <Logo size="sm" />
                <div className="mt-8 space-y-2">
                  {['Dashboard', 'My Files', 'Folders', 'Shared', 'Profile'].map(
                    (item, i) => (
                      <div
                        key={item}
                        className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm ${
                          i === 0
                            ? 'bg-blue-50 font-medium text-blue-700'
                            : 'text-slate-400'
                        }`}
                      >
                        <div className="h-4 w-4 rounded bg-current opacity-60" />
                        {item}
                      </div>
                    )
                  )}
                </div>
                <div className="mt-8 rounded-xl border border-slate-100 p-4">
                  <div className="mb-2 flex justify-between text-xs text-slate-400">
                    <span>Storage</span>
                    <span>6.4 / 15 GB</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full w-[43%] rounded-full bg-blue-500" />
                  </div>
                </div>
              </div>
              {/* main */}
              <div className="col-span-12 p-6 md:col-span-9">
                <p className="text-lg font-semibold text-slate-800">
                  Good morning, Alex
                </p>
                <p className="text-sm text-slate-400">
                  Here's what's happening with your CloudVault.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                  {[
                    { label: 'Storage Used', value: '6.4 GB' },
                    { label: 'Available', value: '8.6 GB' },
                    { label: 'Files', value: '142' },
                    { label: 'Folders', value: '18' },
                  ].map((c) => (
                    <div
                      key={c.label}
                      className="rounded-xl border border-slate-100 p-4"
                    >
                      <p className="text-xs text-slate-400">{c.label}</p>
                      <p className="mt-1 text-xl font-bold text-slate-800">
                        {c.value}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-xl border border-slate-100">
                  <div className="border-b border-slate-100 px-4 py-3 text-sm font-medium text-slate-600">
                    Recent Files
                  </div>
                  {[
                    'quarterly-report.pdf',
                    'team-photo.png',
                    'budget.xlsx',
                  ].map((name) => (
                    <div
                      key={name}
                      className="flex items-center gap-3 border-b border-slate-50 px-4 py-3 last:border-0"
                    >
                      <div className="h-8 w-8 rounded-lg bg-blue-50" />
                      <span className="flex-1 text-sm text-slate-600">{name}</span>
                      <span className="text-xs text-slate-400">2 MB</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-sky-500 px-8 py-14 text-center shadow-xl shadow-blue-600/20">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <h2 className="text-3xl font-bold text-white">
              Start storing smarter today
            </h2>
            <p className="mx-auto mt-3 max-w-md text-blue-100">
              Join CloudVault and take control of your files in minutes.
            </p>
            <Link
              to="/register"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-blue-700 shadow-lg transition hover:bg-blue-50"
            >
              Create your account
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <Logo />
            <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
              <a href="#features" className="transition hover:text-slate-800">
                Features
              </a>
              <a href="#preview" className="transition hover:text-slate-800">
                Preview
              </a>
              <Link to="/login" className="transition hover:text-slate-800">
                Sign In
              </Link>
              <Link to="/register" className="transition hover:text-slate-800">
                Get Started
              </Link>
            </nav>
          </div>
          <div className="mt-8 border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} CloudVault. Built for secure file management.
          </div>
        </div>
      </footer>
    </div>
  );
}
