import { Link } from "react-router";

function HomePage() {
  return (
    <div className="mt-30 text-center">
      <div className="flex flex-col items-center gap-4">
        <img
          src="/logo.svg"
          alt=""
          className="object-contain size-32"
          id="hero-img"
        />
        <div className="font-pacifico text-5xl text-primary">petstop</div>
        <div className="font-Raleway font-semibold text-6xl tracking-tight  text-hero-secondary/50 z-10">
          one stop for your purry needs
        </div>
        <div className="flex gap-2 mt-8">
          <Link to="/browse">
            <button className="px-4 py-2 rounded-full bg-primary text-white font-semibold text-sm   transition shadow-[inset_0_1px_2px_rgba(255,255,255,0.25),0_3px_3px_-1.5px_rgba(16,24,40,0.06),0_1px_1px_rgba(16,24,40,0.08)] border border-white/12 hover:bg-primary/80 transition-all ease-out active:scale-95 cursor-pointer" to="/browse">
              Hire a Petsitter
            </button>
          </Link>

          <button className="px-4 py-2 rounded-full border   text-primary font-semibold text-sm shadow-sm hover:text-primary/80   hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.25),0_3px_3px_-1.5px_rgba(16,24,40,0.06),0_1px_1px_rgba(16,24,40,0.08)]  border-white/12    transition-all ease-out active:scale-95 cursor-pointer ">
            Apply as Petsitter
          </button>
        </div>
      </div>
      <div className="py-24 sm:py-32 text-hero-primary">
        <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
          <h2 className="text-center text-base/7 font-semibold italic">
            "sniff sniff"
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-balance text-center text-4xl font-semibold tracking-tight sm:text-5xl">
            From pee-pee to poo-poo, we got it all
          </p>
          {/* <div className="mt-10 grid gap-4 sm:mt-16 lg:grid-cols-3 lg:grid-rows-2">
            <div className="relative lg:row-span-2">
              <div className="absolute inset-px rounded-lg bg-card lg:rounded-l-4xl"></div>
              <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] lg:rounded-l-[calc(2rem+1px)]">
                <div className="px-8 pb-3 pt-8 sm:px-10 sm:pb-0 sm:pt-10">
                  <p className="mt-2 text-lg font-medium tracking-tight  max-lg:text-center">
                    Instant Booking

                  </p>
                  <p className="mt-2 max-w-lg text-sm/6 text-hero-secondary max-lg:text-center">
                    Book verified pet sitters in your area with just a few taps. Real-time availability and instant confirmation.
                  </p>
                </div>
                <div className="relative min-h-120 w-full grow @container max-lg:mx-auto max-lg:max-w-sm">
                  <div className="absolute inset-x-10 bottom-0 top-10 overflow-hidden rounded-t-[12cqw] border-x-[3cqw] border-t-[3cqw] border-border bg-card shadow-2xl">
                    <img
                      className="size-full object-cover object-top"
                      src="https://tailwindui.com/plus/img/component-images/bento-03-mobile-friendly.png"
                      alt=""
                    />
                  </div>
                </div>
              </div>
              <div className="pointer-events-none absolute inset-px rounded-lg shadow-sm ring-1 ring-black/5 lg:rounded-l-4xl"></div>
            </div>
            <div className="relative max-lg:row-start-1">
              <div className="absolute inset-px rounded-lg bg-card max-lg:rounded-t-4xl"></div>
              <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] max-lg:rounded-t-[calc(2rem+1px)]">
                <div className="px-8 pt-8 sm:px-10 sm:pt-10">
                  <p className="mt-2 text-lg font-medium tracking-tight max-lg:text-center">
                    Live Updates
                  </p>
                  <p className="mt-2 max-w-lg text-sm/6 text-hero-secondary max-lg:text-center">
                    Get photos and updates of your pet throughout their stay
                  </p>
                </div>
                <div className="flex flex-1 items-center justify-center px-8 max-lg:pb-12 max-lg:pt-10 sm:px-10 lg:pb-2">
                  <img
                    className="w-full max-lg:max-w-xs"
                    src="https://tailwindui.com/plus/img/component-images/bento-03-performance.png"
                    alt=""
                  />
                </div>
              </div>
              <div className="pointer-events-none absolute inset-px rounded-lg shadow-sm ring-1 ring-black/5 max-lg:rounded-t-4xl"></div>
            </div>
            <div className="relative max-lg:row-start-3 lg:col-start-2 lg:row-start-2">
              <div className="absolute inset-px rounded-lg bg-card"></div>
              <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)]">
                <div className="px-8 pt-8 sm:px-10 sm:pt-10">
                  <p className="mt-2 text-lg font-medium tracking-tight max-lg:text-center">
                    24/7 Support
                  </p>
                  <p className="mt-2 max-w-lg text-sm/6 text-hero-secondary  max-lg:text-center">
                    Round-the-clock customer support for peace of mind
                  </p>
                </div>
                <div className="flex flex-1 items-center @container max-lg:py-6 lg:pb-2">
                  <img
                    className="h-[min(152px,40cqw)] object-cover"
                    src="https://tailwindui.com/plus/img/component-images/bento-03-security.png"
                    alt=""
                  />
                </div>
              </div>
              <div className="pointer-events-none absolute inset-px rounded-lg shadow-sm ring-1 ring-black/5"></div>
            </div>
            <div className="relative lg:row-span-2">
              <div className="absolute inset-px rounded-lg bg-card max-lg:rounded-b-4xl lg:rounded-r-4xl"></div>
              <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] max-lg:rounded-b-[calc(2rem+1px)] lg:rounded-r-[calc(2rem+1px)]">
                <div className="px-8 pb-3 pt-8 sm:px-10 sm:pb-0 sm:pt-10">
                  <p className="mt-2 text-lg font-medium tracking-tight max-lg:text-center">
                    Verified Sitters
                  </p>
                  <p className="mt-2 max-w-lg text-sm/6 text-hero-secondary  max-lg:text-center">
                    All sitters are background-checked and insured for your pet's safety
                  </p>
                </div>

              </div>
              <div className="pointer-events-none absolute inset-px rounded-lg shadow-sm ring-1 ring-black/5 max-lg:rounded-b-4xl lg:rounded-r-4xl"></div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}

HomePage.propTypes = {};

export default HomePage;
