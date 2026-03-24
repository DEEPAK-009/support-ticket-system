import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="absolute inset-x-0 top-0 h-56 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800" />
      <div className="relative flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-6 lg:p-8">
        <div className="mx-auto max-w-[1500px]">
          {children}
        </div>
      </div>
      </div>
    </div>
  );
};

export default Layout;
