export default function Problem() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg text-primary deck-body">
      <header className="absolute left-[4vw] right-[4vw] top-[4vh] flex h-[6vh] items-start justify-between border-b border-[#E2E8F0]">
        <div className="flex items-center gap-[1vw]">
          <span className="h-[2vw] w-[2vw] rounded-[0.4vw] bg-accent" />
          <p className="text-[1.5vw] font-semibold">Jumpstart</p>
        </div>
        <p className="text-[1.5vw] text-muted">Project overview</p>
      </header>

      <h1 className="absolute left-[4vw] right-[4vw] top-[15vh] font-display text-[4.5vw] font-extrabold leading-[1.1]">A dead battery needs a nearby solution</h1>

      <main className="absolute left-[4vw] right-[4vw] top-[36vh] bottom-[13vh] grid grid-cols-2 gap-[4vw]">
        <section className="flex flex-col justify-center rounded-[1vw] bg-accent p-[2.4vw] text-white">
          <p className="text-[3.4vw] font-extrabold leading-[1.15]">A driver’s car will not start</p>
          <p className="mt-[4vh] text-[2vw] leading-[1.32]">Nearby drivers may have a portable jump pack or a running car with jumper cables</p>
        </section>
        <section className="flex flex-col justify-center">
          <p className="text-[2.2vw] leading-[1.32]"><span className="font-semibold">The challenge:</span> finding someone available, sharing the location, and agreeing on a price</p>
          <div className="my-[4vh] h-px bg-[#E2E8F0]" />
          <p className="text-[2.2vw] leading-[1.32]">Jumpstart brings those steps into one simple, friendly map-based experience</p>
        </section>
      </main>

      <footer className="absolute bottom-[3vh] left-[4vw] right-[4vw] flex h-[5vh] items-end justify-between border-t border-[#E2E8F0] text-[1.5vw] text-muted">
        <p>Jumpstart</p>
        <p>02 / 06</p>
      </footer>
    </div>
  );
}
