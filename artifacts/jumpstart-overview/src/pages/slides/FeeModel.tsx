export default function FeeModel() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg text-primary deck-body">
      <header className="absolute left-[4vw] right-[4vw] top-[4vh] flex h-[6vh] items-start justify-between border-b border-[#E2E8F0]">
        <div className="flex items-center gap-[1vw]">
          <span className="h-[2vw] w-[2vw] rounded-[0.4vw] bg-accent" />
          <p className="text-[1.5vw] font-semibold">Jumpstart</p>
        </div>
        <p className="text-[1.5vw] text-muted">Project overview</p>
      </header>

      <h1 className="absolute left-[4vw] right-[4vw] top-[15vh] font-display text-[5vw] font-extrabold leading-[1.1]">A fee only when the car starts</h1>

      <main className="absolute left-[4vw] right-[4vw] top-[32vh] bottom-[13vh] grid grid-cols-2 gap-[4vw]">
        <section className="flex flex-col justify-center gap-[3vh]">
          <p className="text-[2vw]">Payment is recorded only after the driver confirms success</p>
          <p className="text-[2vw]">Failed, declined, or cancelled jobs have no charge</p>
          <div className="h-px bg-[#E2E8F0]" />
          <p className="text-[2vw] leading-[1.36]"><span className="font-semibold">Demo example:</span> <span className="font-extrabold text-[3.4vw] text-accent">AED 50</span> driver payment = <span className="font-extrabold text-[3.4vw] text-accent">AED 45</span> helper payout + <span className="font-extrabold text-[3.4vw] text-accent">AED 5</span> platform fee</p>
        </section>
        <section className="flex flex-col justify-center gap-[4vh] rounded-[1vw] bg-accent p-[2.4vw] text-white">
          <p className="text-[2vw] leading-[1.35]">The demo fee is <span className="font-extrabold text-[4.4vw]">10%</span>, deducted from the helper’s payout</p>
          <p className="text-[2vw] leading-[1.35]">Dubai, AED, and the 10% fee are demo defaults—not confirmed launch terms</p>
          <p className="text-[2vw] font-semibold">All current payments are simulated</p>
        </section>
      </main>

      <footer className="absolute bottom-[3vh] left-[4vw] right-[4vw] flex h-[5vh] items-end justify-between border-t border-[#E2E8F0] text-[1.5vw] text-muted">
        <p>Jumpstart</p>
        <p>04 / 06</p>
      </footer>
    </div>
  );
}
