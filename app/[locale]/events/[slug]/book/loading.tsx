export default function EventBookingLoading() {
  return (
    <main aria-busy="true" aria-label="Loading event booking" className="min-h-screen bg-[#050505] px-5 py-40 text-[#F6F0E8] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1160px]">
        <div className="h-4 w-32 animate-pulse bg-[#C9A35C]/15" />
        <div className="mt-8 h-14 max-w-[620px] animate-pulse bg-[#C9A35C]/15" />
        <div className="mt-14 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="h-[430px] animate-pulse bg-[#C9A35C]/10" />
          <div className="h-[290px] animate-pulse bg-[#C9A35C]/10" />
        </div>
      </div>
    </main>
  );
}
