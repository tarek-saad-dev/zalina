export default function EventLoading() {
  return (
    <main aria-busy="true" aria-label="Loading event details" className="min-h-screen bg-[#050505] text-[#F6F0E8]">
      <div className="flex min-h-[670px] flex-col justify-end bg-[#100d0a] px-5 pb-20 pt-40 sm:px-8 lg:px-12">
        <div className="mx-auto w-full max-w-[1280px] space-y-5">
          <div className="h-4 w-32 animate-pulse bg-[#C9A35C]/20" />
          <div className="h-16 max-w-[700px] animate-pulse bg-[#C9A35C]/10" />
          <div className="h-5 max-w-[420px] animate-pulse bg-[#C9A35C]/10" />
        </div>
      </div>
      <div className="mx-auto grid max-w-[1280px] gap-6 px-5 py-14 sm:grid-cols-3 sm:px-8 lg:px-12">
        {[1, 2, 3].map((id) => <div key={id} className="h-20 animate-pulse bg-[#C9A35C]/10" />)}
      </div>
    </main>
  );
}
