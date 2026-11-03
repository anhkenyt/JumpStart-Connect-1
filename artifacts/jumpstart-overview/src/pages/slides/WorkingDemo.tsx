const base = import.meta.env.BASE_URL;

export default function WorkingDemo() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg text-primary deck-body">
      <header className="absolute left-[4vw] right-[4vw] top-[4vh] flex h-[6vh] items-start justify-between border-b border-[#E2E8F0]">
        <div className="flex items-center gap-[1vw]">
          <span className="h-[2vw] w-[2vw] rounded-[0.4vw] bg-accent" />
          <p className="text-[1.5vw] font-semibold">Jumpstart</p>
        </div>
        <p className="text-[1.5vw] text-muted">Project overview</p>
      </header>

      <h1 className="absolute left-[4vw] right-[4vw] top-[15vh] font-display text-[5vw] font-extrabold leading-[1.1]">A working demo of both sides</h1>

      <main className="absolute left-[4vw] right-[4vw] top-[31vh] bottom-[13vh] grid grid-cols-2 gap-[4vw]">
        <section className="flex flex-col justify-center gap-[2vh]">
          <p className="text-[2vw] leading-[1.25]">Real interactive map with GPS and manual location pins</p>
          <p className="text-[2vw] leading-[1.25]">Five fake users; switch identities to try driver and helper roles</p>
          <p className="text-[2vw] leading-[1.25]">Helpers control availability, equipment, location, and their quote</p>
          <p className="text-[2vw] leading-[1.25]">Test requests, acceptance, arrival, outcomes, and receipts</p>
          <p className="text-[2vw] leading-[1.25]">Saved requests remain available after a reload</p>
        </section>
        <figure className="flex min-h-0 flex-col justify-center">
          <figcaption className="mb-[1.6vh] text-[1.5vw] font-semibold text-accent">Demo interface · test payments</figcaption>
          <img src={`${base}jumpstart-demo.jpg`} crossOrigin="anonymous" alt="Screenshot of the Jumpstart demo map with nearby helpers, AED quotes, GPS controls, and a clearly labelled demo identity" className="w-full rounded-[1vw] border border-[#E2E8F0] object-contain" />
        </figure>
      </main>

      <footer className="absolute bottom-[3vh] left-[4vw] right-[4vw] flex h-[5vh] items-end justify-between border-t border-[#E2E8F0] text-[1.5vw] text-muted">
        <p>Jumpstart</p>
        <p>05 / 06</p>
      </footer>
    </div>
  );
}
