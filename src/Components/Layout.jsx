import Sidebar from "../Components/Sidebar";
import Mainbar from "../Components/Mainbar";

function Layout() {
  return (
    <>
      <div className="flex min-h-screen">
        {/* Sidebar fixed left */}
        <div className="w-[260px] h-screen sticky top-0 left-0">
            <Sidebar />
        </div>

        {/* Right side content */}
        <div className="flex-1">
            <Mainbar />
        </div>
    </div>
      
    </>
  );
}

export default Layout;