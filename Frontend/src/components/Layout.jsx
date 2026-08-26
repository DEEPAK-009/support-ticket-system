import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  return (
    <div className="h-screen w-full bg-[#0B0F19] text-slate-100 flex overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background ambient glows (Linear style) */}
      <div className="fixed top-0 left-1/3 w-[600px] h-[350px] bg-indigo-600/10 blur-[140px] pointer-events-none rounded-full z-0" />
      <div className="fixed top-1/2 right-10 w-[500px] h-[350px] bg-violet-600/8 blur-[160px] pointer-events-none rounded-full z-0" />

      {/* Static Fixed Sidebar */}
      <Sidebar />

      {/* Independently Scrollable Main Area */}
      <main className="flex-1 h-screen overflow-y-auto p-5 md:p-8 z-10">
        <div className="mx-auto max-w-7xl pb-12">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
