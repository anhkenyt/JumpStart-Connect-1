export default function Journey() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg text-primary deck-body">
      <header className="absolute left-[4vw] right-[4vw] top-[4vh] flex h-[6vh] items-start justify-between border-b border-[#E2E8F0]">
        <div className="flex items-center gap-[1vw]">
          <span className="h-[2vw] w-[2vw] rounded-[0.4vw] bg-accent" />
          <p className="text-[1.5vw] font-semibold">Jumpstart</p>
        </div>
        <p className="text-[1.5vw] text-muted">Project overview</p>
      </header>

      <h1 className="absolute left-[4vw] right-[4vw] top-[15vh] font-display text-[4.5vw] font-extrabold leading-[1.1]">From a location pin to a successful start</h1>

      <main className="absolute left-[4vw] right-[4vw] top-[34vh] bottom-[13vh]">
        <div className="grid h-[8.6vh] grid-cols-[6vw_1fr] items-center gap-[2vw] border-b border-[#E2E8F0]">
          <p className="text-[3.2vw] font-extrabold leading-none text-accent">1</p>
          <p className="text-[2vw]">Driver shares GPS location or places a pin on the map</p>
        </div>
        <div className="grid h-[8.6vh] grid-cols-[6vw_1fr] items-center gap-[2vw] border-b border-[#E2E8F0]">
          <p className="text-[3.2vw] font-extrabold leading-none text-accent">2</p>
          <p className="text-[2vw]">Available helpers appear nearby, ordered by distance</p>
        </div>
        <div className="grid h-[8.6vh] grid-cols-[6vw_1fr] items-center gap-[2vw] border-b border-[#E2E8F0]">
          <p className="text-[3.2vw] font-extrabold leading-none text-accent">3</p>
          <p className="text-[2vw]">Driver reviews the helper’s quote and sends a request</p>
        </div>
        <div className="grid h-[8.6vh] grid-cols-[6vw_1fr] items-center gap-[2vw] border-b border-[#E2E8F0]">
          <p className="text-[3.2vw] font-extrabold leading-none text-accent">4</p>
          <p className="text-[2vw]">Helper explicitly accepts the price and marks arrival</p>
        </div>
        <div className="grid h-[8.6vh] grid-cols-[6vw_1fr] items-center gap-[2vw] border-b border-[#E2E8F0]">
          <p className="text-[3.2vw] font-extrabold leading-none text-accent">5</p>
          <p className="text-[2vw]">Driver confirms “Car started” or “Didn’t start”</p>
        </div>
        <p className="mt-[2vh] text-[2vw] text-muted">Distances and travel times are approximate</p>
      </main>

      <footer className="absolute bottom-[3vh] left-[4vw] right-[4vw] flex h-[5vh] items-end justify-between border-t border-[#E2E8F0] text-[1.5vw] text-muted">
        <p>Jumpstart</p>
        <p>03 / 06</p>
      </footer>
    </div>
  );
}
