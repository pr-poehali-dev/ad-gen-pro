export default function CourseBanner() {
  return (
    <div className="px-4 md:px-12">
      <a
        href="https://учисьпро.рф/courses/marketing"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-5 flex-wrap justify-between max-w-[1100px] mx-auto my-6 px-7 py-6 rounded-3xl text-white no-underline transition-transform hover:scale-[1.01]"
        style={{
          background: "linear-gradient(135deg, #c026d3, #f97316)",
          boxShadow: "0 12px 40px rgba(192,38,211,.35)",
        }}
      >
        <div className="flex items-center gap-[18px] min-w-[260px]">
          <div className="text-[42px] leading-none">📣</div>
          <div>
            <div className="text-[13px] font-bold uppercase tracking-[0.08em] opacity-85">
              Бесплатный курс
            </div>
            <div className="text-[22px] font-extrabold leading-tight mt-0.5">
              Профессия интернет-маркетолог
            </div>
            <div className="text-[15px] opacity-90 mt-1">
              Реклама, рассылки и заработок с нуля. 8 модулей, 40 уроков
            </div>
          </div>
        </div>
        <span
          className="inline-flex items-center gap-2 font-extrabold text-base px-[26px] py-[14px] rounded-[14px] whitespace-nowrap"
          style={{ background: "#fff", color: "#c026d3" }}
        >
          Начать бесплатно →
        </span>
      </a>
    </div>
  );
}
