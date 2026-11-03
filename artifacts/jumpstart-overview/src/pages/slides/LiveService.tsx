export default function LiveService() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg text-primary deck-body">
      <header className="absolute left-[4vw] right-[4vw] top-[4vh] flex h-[6vh] items-start justify-between border-b border-[#E2E8F0]">
        <div className="flex items-center gap-[1vw]">
          <span className="h-[2vw] w-[2vw] rounded-[0.4vw] bg-accent" />
          <p className="text-[1.5vw] font-semibold">Jumpstart</p>
        </div>
        <p className="text-[1.5vw] text-muted">Project overview</p>
      </header>

      <h1 className="absolute left-[4vw] right-[4vw] top-[15vh] font-display text-[5vw] font-extrabold leading-[1.1]">From demo to a live service</h1>

      <main className="absolute left-[4vw] right-[4vw] top-[32vh] bottom-[13vh] grid grid-cols-2 gap-[4vw]">
        <section className="flex flex-col justify-center gap-[3vh]">
          <p className="text-[2vw] leading-[1.32]"><span className="font-semibold text-accent">Available now:</span> five-user demo, nearby matching, agreed quotes, and test receipts</p>
          <div className="h-px bg-[#E2E8F0]" />
          <p className="text-[2vw] leading-[1.32]"><span className="font-semibold">Before launch:</span> real accounts, helper onboarding, and location privacy controls</p>
          <p className="text-[2vw] leading-[1.32]"><span className="font-semibold">Before charging:</span> payment processing, helper payouts, and payment safeguards</p>
        </section>
        <section className="flex flex-col justify-center gap-[4vh] border-l border-[#E2E8F0] pl-[3vw]">
          <p className="text-[2.5vw] font-semibold leading-[1.25]">Confirm the launch city, currency, fee rate, and service policies</p>
          <p className="text-[2.5vw] leading-[1.25] text-accent">For safe roadside situations only—not an emergency service</p>
        </section>
      </main>

      <footer className="absolute bottom-[3vh] left-[4vw] right-[4vw] flex h-[5vh] items-end justify-between border-t border-[#E2E8F0] text-[1.5vw] text-muted">
        <p>Jumpstart</p>
        <p>06 / 06</p>
      </footer>
    </div>
  );
}
