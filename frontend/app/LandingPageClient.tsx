'use client'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useState, useEffect, memo } from 'react'
import GradientText from '@/components/GradientText/GradientText'
import ElectricBorder from '@/components/ElectricBorder/ElectricBorder'

const GridScan = dynamic(() => import('@/components/GridScan/GridScan'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/50 to-blue-950/50" />
})
const MagicBento = dynamic(() => import('@/components/MagicBento/MagicBento'), {
  ssr: false,
  loading: () => <div className="h-96 animate-pulse bg-white/5 rounded-2xl" />
})

interface LandingPageClientProps {
  isAuthenticated: boolean
}

const LandingPageClient = memo(function LandingPageClient({ isAuthenticated }: LandingPageClientProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    let rafId: number
    const handleMouseMove = (e: MouseEvent) => {
      if (rafId) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        setMousePosition({ x: e.clientX, y: e.clientY })
      })
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div className='relative w-full overflow-x-hidden bg-[#0a0a0a]'>
      {/* Island Navbar */}
      <nav className='fixed left-1/2 top-6 z-50 -translate-x-1/2'>
        <div className='flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-4 py-2.5 shadow-2xl backdrop-blur-xl'>
          <Link href='/' className='flex items-center gap-2 pr-3 transition-opacity hover:opacity-80'>
            <div className='relative flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20'>
              <svg className='h-4 w-4 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 10V3L4 14h7v7l9-11h-7z' />
              </svg>
            </div>
            <span className='whitespace-nowrap text-base font-bold text-white'>Flowspace</span>
          </Link>
          <div className='hidden items-center gap-1 border-l border-white/10 pl-3 md:flex'>
            <Link href='#features' className='rounded-full px-3 py-1.5 text-sm font-medium text-white/70 transition-all hover:bg-white/10 hover:text-white'>
              Features
            </Link>
            <Link href='#showcase' className='rounded-full px-3 py-1.5 text-sm font-medium text-white/70 transition-all hover:bg-white/10 hover:text-white'>
              Showcase
            </Link>
            <Link href='#pricing' className='rounded-full px-3 py-1.5 text-sm font-medium text-white/70 transition-all hover:bg-white/10 hover:text-white'>
              Pricing
            </Link>
          </div>
          <Link href={isAuthenticated ? '/app' : '/signin'} className='ml-2'>
            <button className='rounded-full bg-white px-4 py-1.5 text-sm font-medium text-black transition-all hover:scale-105 hover:shadow-lg'>
              {isAuthenticated ? 'Dashboard' : 'Get Started'}
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className='relative flex min-h-screen w-full items-center justify-center overflow-hidden pt-16'>
        {/* GridScan Background */}
        <div className='absolute inset-0'>
          <GridScan
            sensitivity={0.6}
            lineThickness={1.2}
            linesColor="#1e3a8a"
            gridScale={0.08}
            scanColor="#06b6d4"
            scanOpacity={0.5}
            enablePost
            bloomIntensity={0.7}
            chromaticAberration={0.001}
            noiseIntensity={0.005}
            scanDirection="pingpong"
            scanDuration={3.0}
            scanDelay={1.5}
            scanGlow={1.2}
            scanSoftness={2.5}
          />
        </div>

        {/* Subtle overlay for content readability */}
        <div className='absolute inset-0 bg-black/20' />

        {/* Grid Overlay - Removed blur effects */}
        <div className='absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]' />

        {/* Content */}
        <div className='relative z-10 mx-auto max-w-7xl px-6 py-32 text-center'>
          {/* Badge */}
          <div className='mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-xl'>
            <div className='h-2 w-2 animate-pulse rounded-full bg-green-400' />
            <span className='text-xs font-medium text-white/80'>Now in Beta</span>
          </div>

          {/* Heading */}
          <h1 className='mb-6 text-5xl font-bold leading-[1.1] tracking-tight text-white sm:text-6xl md:text-7xl'>
            Your team's
            <br />
            <GradientText
              colors={['#06b6d4', '#3b82f6', '#6366f1', '#3b82f6', '#06b6d4']}
              animationSpeed={4}
              showBorder={false}
              className="text-5xl sm:text-6xl md:text-7xl font-bold"
            >
              virtual office
            </GradientText>
          </h1>

          {/* Subheading */}
          <p className='mx-auto mb-10 max-w-2xl text-base text-white/50 sm:text-lg'>
            Experience work reimagined. Build immersive spaces where your team naturally connects, collaborates, and thrives.
          </p>

          {/* CTA Buttons */}
          <div className='flex flex-col items-center justify-center gap-4 sm:flex-row'>
            <Link href={isAuthenticated ? '/app' : '/signin'}>
              <button className='group relative overflow-hidden rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-black transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]'>
                Start building free
                <svg className='ml-2 inline h-4 w-4 transition-transform group-hover:translate-x-1' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 7l5 5m0 0l-5 5m5-5H6' />
                </svg>
              </button>
            </Link>
          </div>

          {/* Stats */}
          <div className='mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4'>
            <div>
              <div className='text-2xl font-bold text-white'>99.9%</div>
              <div className='mt-1 text-xs text-white/40'>Uptime</div>
            </div>
            <div>
              <div className='text-2xl font-bold text-white'>&lt;50ms</div>
              <div className='mt-1 text-xs text-white/40'>Latency</div>
            </div>
            <div>
              <div className='text-2xl font-bold text-white'>∞</div>
              <div className='mt-1 text-xs text-white/40'>Possibilities</div>
            </div>
            <div>
              <div className='text-2xl font-bold text-white'>Free</div>
              <div className='mt-1 text-xs text-white/40'>To start</div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className='absolute bottom-8 left-1/2 -translate-x-1/2'>
          <div className='flex h-12 w-7 items-start justify-center rounded-full border border-white/20 p-2'>
            <div className='h-2 w-1 animate-bounce rounded-full bg-white/50' />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id='features' className='relative px-6 py-24'>
        <div className='mx-auto max-w-7xl'>
          {/* Section Header */}
          <div className='mb-12 text-center'>
            <div className='mb-3 inline-block rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-1 text-xs font-medium text-purple-300'>
              FEATURES
            </div>
            <h2 className='mb-3 text-4xl font-bold text-white md:text-5xl'>
              Everything you need
            </h2>
            <p className='mx-auto max-w-2xl text-base text-white/40'>
              Powerful features that make remote work feel natural
            </p>
          </div>

          {/* Magic Bento Grid */}
          <div className='flex justify-center'>
            <MagicBento
              features={[
                {
                  icon: (
                    <svg className='h-6 w-6 text-purple-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
                    </svg>
                  ),
                  title: 'Real-time Presence',
                  description: 'See teammates move and interact naturally',
                  label: 'Live',
                  color: '#0a0014'
                },
                {
                  icon: (
                    <svg className='h-6 w-6 text-cyan-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M13 10V3L4 14h7v7l9-11h-7z' />
                    </svg>
                  ),
                  title: 'Instant',
                  description: 'Lightning-fast with sub-50ms latency',
                  label: 'Speed',
                  color: '#0a0014'
                },
                {
                  icon: (
                    <svg className='h-6 w-6 text-pink-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' />
                    </svg>
                  ),
                  title: 'Video & Voice',
                  description: 'Crystal-clear communication built in',
                  label: 'Connect',
                  color: '#0a0014'
                },
                {
                  icon: (
                    <svg className='h-6 w-6 text-orange-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z' />
                    </svg>
                  ),
                  title: 'Build Your World',
                  description: 'Design custom spaces with intuitive editor',
                  label: 'Create',
                  color: '#0a0014'
                },
                {
                  icon: (
                    <svg className='h-6 w-6 text-green-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' />
                    </svg>
                  ),
                  title: 'Analytics',
                  description: 'Track presence and activity insights',
                  label: 'Insights',
                  color: '#0a0014'
                },
                {
                  icon: (
                    <svg className='h-6 w-6 text-indigo-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
                    </svg>
                  ),
                  title: 'Secure',
                  description: 'Enterprise-grade security & privacy',
                  label: 'Protected',
                  color: '#0a0014'
                }
              ]}
              textAutoHide={true}
              enableStars={true}
              enableSpotlight={true}
              enableBorderGlow={true}
              enableTilt={true}
              enableMagnetism={true}
              clickEffect={true}
              spotlightRadius={300}
              particleCount={12}
              glowColor="132, 0, 255"
            />
          </div>
        </div>
      </section>

      {/* Showcase Section */}
      <section id='showcase' className='relative px-6 py-24'>
        <div className='mx-auto max-w-7xl'>
          <div className='relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-white/5 to-transparent p-12 backdrop-blur-xl md:p-16'>
            <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]' />
            <div className='relative grid gap-10 md:grid-cols-2 md:items-center'>
              <div>
                <div className='mb-3 inline-block rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1 text-xs font-medium text-cyan-300'>
                  SHOWCASE
                </div>
                <h2 className='mb-4 text-3xl font-bold text-white md:text-4xl'>
                  See it in action
                </h2>
                <p className='mb-6 text-base text-white/50'>
                  Watch how teams around the world are using Flowspace to reimagine remote work. From daily standups to casual hangouts.
                </p>
                <Link href={isAuthenticated ? '/app' : '/signin'}>
                  <button className='rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black transition-all hover:scale-105'>
                    Try it yourself
                  </button>
                </Link>
              </div>
              <div className='relative'>
                <a href="https://www.youtube.com/watch?v=ef4lweW_3ik&feature=youtu.be" target="_blank" rel="noopener noreferrer" className='block transition-transform hover:scale-[1.02]'>
                  <div className='aspect-video overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl'>
                    <div className='flex h-full items-center justify-center'>
                      <div className='flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur-xl transition-all hover:scale-110 hover:bg-white/20'>
                        <svg className='h-6 w-6 text-white' fill='currentColor' viewBox='0 0 24 24'>
                          <path d='M8 5v14l11-7z' />
                        </svg>
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id='pricing' className='relative px-6 py-24'>
        <div className='mx-auto max-w-7xl'>
          <div className='mb-16 text-center'>
            <div className='mb-3 inline-block rounded-full border border-green-500/20 bg-green-500/10 px-4 py-1 text-xs font-medium text-green-300'>
              PRICING
            </div>
            <h2 className='mb-3 text-4xl font-bold text-white md:text-5xl'>
              Start for free
            </h2>
            <p className='mx-auto max-w-2xl text-base text-white/40'>
              No credit card required. Upgrade when you're ready.
            </p>
          </div>

          <div className='grid gap-6 md:grid-cols-3'>
            {/* Free Plan */}
            <div className='rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-xl'>
              <h3 className='mb-2 text-xl font-bold text-white'>Free</h3>
              <div className='mb-6'>
                <span className='text-4xl font-bold text-white'>$0</span>
                <span className='text-white/40'>/month</span>
              </div>
              <ul className='mb-6 space-y-2.5'>
                <li className='flex items-center gap-2 text-sm text-white/60'>
                  <svg className='h-4 w-4 text-green-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                  </svg>
                  Up to 10 members
                </li>
                <li className='flex items-center gap-2 text-sm text-white/60'>
                  <svg className='h-4 w-4 text-green-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                  </svg>
                  1 custom realm
                </li>
                <li className='flex items-center gap-2 text-sm text-white/60'>
                  <svg className='h-4 w-4 text-green-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                  </svg>
                  Basic analytics
                </li>
              </ul>
              <Link href={isAuthenticated ? '/app' : '/signin'}>
                <button className='w-full rounded-full border border-white/10 bg-white/5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/10'>
                  Get started
                </button>
              </Link>
            </div>

            {/* Pro Plan - with Electric Border */}
            <ElectricBorder
              color="#06b6d4"
              speed={1.2}
              chaos={0.6}
              thickness={2}
              style={{ borderRadius: 24 }}
            >
              <div className='relative overflow-hidden rounded-3xl bg-gradient-to-b from-cyan-500/10 to-transparent p-6 backdrop-blur-xl'>
                <div className='absolute right-4 top-4 rounded-full bg-cyan-500 px-2.5 py-1 text-xs font-semibold text-white shadow-lg shadow-cyan-500/50'>
                  Popular
                </div>
                <h3 className='mb-2 text-xl font-bold text-white'>Pro</h3>
                <div className='mb-6'>
                  <span className='text-4xl font-bold text-white'>$29</span>
                  <span className='text-white/40'>/month</span>
                </div>
                <ul className='mb-6 space-y-2.5'>
                  <li className='flex items-center gap-2 text-sm text-white/80'>
                    <svg className='h-4 w-4 text-cyan-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                    </svg>
                    Unlimited members
                  </li>
                  <li className='flex items-center gap-2 text-sm text-white/80'>
                    <svg className='h-4 w-4 text-cyan-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                    </svg>
                    Unlimited realms
                  </li>
                  <li className='flex items-center gap-2 text-sm text-white/80'>
                    <svg className='h-4 w-4 text-cyan-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                    </svg>
                    Advanced analytics
                  </li>
                  <li className='flex items-center gap-2 text-sm text-white/80'>
                    <svg className='h-4 w-4 text-cyan-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                    </svg>
                    Priority support
                  </li>
                </ul>
                <button className='w-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/50'>
                  Coming soon
                </button>
              </div>
            </ElectricBorder>

            {/* Enterprise Plan */}
            <div className='rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-xl'>
              <h3 className='mb-2 text-xl font-bold text-white'>Enterprise</h3>
              <div className='mb-6'>
                <span className='text-4xl font-bold text-white'>Custom</span>
              </div>
              <ul className='mb-6 space-y-2.5'>
                <li className='flex items-center gap-2 text-sm text-white/60'>
                  <svg className='h-4 w-4 text-green-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                  </svg>
                  Everything in Pro
                </li>
                <li className='flex items-center gap-2 text-sm text-white/60'>
                  <svg className='h-4 w-4 text-green-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                  </svg>
                  Custom integrations
                </li>
                <li className='flex items-center gap-2 text-sm text-white/60'>
                  <svg className='h-4 w-4 text-green-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                  </svg>
                  Dedicated support
                </li>
                <li className='flex items-center gap-2 text-sm text-white/60'>
                  <svg className='h-4 w-4 text-green-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                  </svg>
                  SLA guarantee
                </li>
              </ul>
              <button className='w-full rounded-full border border-white/10 bg-white/5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/10'>
                Contact sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className='relative px-6 py-24'>
        <div className='mx-auto max-w-4xl text-center'>
          <h2 className='mb-4 text-4xl font-bold text-white md:text-5xl'>
            Ready to get started?
          </h2>
          <p className='mb-8 text-base text-white/40'>
            Join the future of remote work today
          </p>
          <Link href={isAuthenticated ? '/app' : '/signin'}>
            <button className='rounded-full bg-white px-8 py-3.5 text-base font-semibold text-black transition-all hover:scale-105 hover:shadow-[0_0_50px_rgba(255,255,255,0.3)]'>
              Start building now
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className='relative overflow-hidden border-t border-white/5 px-6 py-20'>
        <div className='mx-auto max-w-7xl'>
          {/* Modern Large Branding */}
          <div className='mb-20 overflow-hidden'>
            <div className='relative'>
              <h2 className='text-center font-bold leading-[0.85] tracking-tighter'>
                <span className='block bg-gradient-to-b from-white/20 via-white/10 to-transparent bg-clip-text text-transparent text-[clamp(4rem,15vw,12rem)]'>
                  FLOWSPACE
                </span>
              </h2>
              <div className='absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent' />
            </div>
          </div>

          {/* Footer Content */}
          <div className='grid gap-12 md:grid-cols-2 lg:grid-cols-4'>
            {/* Brand Column */}
            <div className='lg:col-span-2'>
              <div className='mb-4 flex items-center gap-3'>
                <div className='relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30'>
                  <svg className='h-6 w-6 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 10V3L4 14h7v7l9-11h-7z' />
                  </svg>
                </div>
                <span className='text-xl font-bold text-white'>Flowspace</span>
              </div>
              <p className='mb-6 max-w-sm text-sm text-white/40'>
                The next generation virtual office platform. Build immersive spaces where teams naturally connect and collaborate.
              </p>
              <div className='flex gap-3'>
                <a href='#' className='flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-white/40 transition-all hover:bg-white/10 hover:text-white'>
                  <svg className='h-5 w-5' fill='currentColor' viewBox='0 0 24 24'><path d='M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84' /></svg>
                </a>
                <a href='#' className='flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-white/40 transition-all hover:bg-white/10 hover:text-white'>
                  <svg className='h-5 w-5' fill='currentColor' viewBox='0 0 24 24'><path d='M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z' /></svg>
                </a>
                <a href='#' className='flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-white/40 transition-all hover:bg-white/10 hover:text-white'>
                  <svg className='h-5 w-5' fill='currentColor' viewBox='0 0 24 24'><path d='M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z' /></svg>
                </a>
              </div>
            </div>

            {/* Product Column */}
            <div>
              <h3 className='mb-4 text-sm font-semibold text-white'>Product</h3>
              <ul className='space-y-2.5'>
                <li><Link href='#features' className='text-sm text-white/40 transition-colors hover:text-white'>Features</Link></li>
                <li><Link href='#pricing' className='text-sm text-white/40 transition-colors hover:text-white'>Pricing</Link></li>
                <li><Link href='#' className='text-sm text-white/40 transition-colors hover:text-white'>Integrations</Link></li>
                <li><Link href='#' className='text-sm text-white/40 transition-colors hover:text-white'>Changelog</Link></li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h3 className='mb-4 text-sm font-semibold text-white'>Company</h3>
              <ul className='space-y-2.5'>
                <li><Link href='#' className='text-sm text-white/40 transition-colors hover:text-white'>About</Link></li>
                <li><Link href='#' className='text-sm text-white/40 transition-colors hover:text-white'>Blog</Link></li>
                <li><Link href='#' className='text-sm text-white/40 transition-colors hover:text-white'>Careers</Link></li>
                <li><Link href='#' className='text-sm text-white/40 transition-colors hover:text-white'>Contact</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className='mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 text-xs text-white/30 sm:flex-row'>
            <p>© 2025 Flowspace, Inc. All rights reserved.</p>
            <div className='flex gap-6'>
              <Link href='/privacy-policy' className='transition-colors hover:text-white/60'>Privacy Policy</Link>
              <Link href='#' className='transition-colors hover:text-white/60'>Terms of Service</Link>
              <Link href='#' className='transition-colors hover:text-white/60'>Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
})

export default LandingPageClient
