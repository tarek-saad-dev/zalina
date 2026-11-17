export default function EventsLoading() {
  return (
    <main aria-busy="true" aria-label="Loading events" className="min-h-screen bg-[#050505] px-5 pb-20 pt-40 text-[#F6F0E8] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1280px]">
        <div className="h-3 w-40 animate-pulse bg-[#C9A35C]/25" />
        <div className="mt-7 h-14 max-w-[620px] animate-pulse bg-[#C9A35C]/10" />
        <div className="mt-4 h-5 max-w-[500px] animate-pulse bg-[#C9A35C]/10" />
        <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((id) => (
            <div key={id} className="overflow-hidden border border-[#C9A35C]/15 bg-[#0A0908]">
              <div className="aspect-[4/3] animate-pulse bg-[#C9A35C]/10" />
              <div className="space-y-4 p-6">
                <div className="h-4 w-24 animate-pulse bg-[#C9A35C]/10" />
                <div className="h-8 w-4/5 animate-pulse bg-[#C9A35C]/10" />
                <div className="h-4 w-full animate-pulse bg-[#C9A35C]/10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
