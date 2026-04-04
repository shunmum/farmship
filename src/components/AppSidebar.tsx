import { Home, Users, ShoppingCart, Settings, Tractor, FileText, LogOut, Clock, Menu, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";

const menuItems = [
  { title: "ダッシュボード", url: "/", icon: Home },
  { title: "顧客管理", url: "/customers", icon: Users },
  { title: "受注管理", url: "/orders", icon: ShoppingCart },
  { title: "配送履歴", url: "/history", icon: Clock },
  { title: "請求書一括", url: "/invoices/batch", icon: FileText },
  { title: "設定", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { signOut } = useAuth();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
  };

  // モバイルでルート変更時にメニューを閉じる
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [isMobile]);

  // モバイル: ハンバーガーメニューボタン
  if (isMobile) {
    return (
      <>
        {/* ハンバーガーメニューボタン */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-4 right-4 z-50 p-2 bg-gradient-to-br from-[#047857] to-[#065F46] text-white rounded-lg shadow-lg hover:shadow-xl transition-all"
          aria-label="メニュー"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* オーバーレイ */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* モバイルメニュー */}
        <div
          className={cn(
            "fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-[#047857] to-[#065F46] shadow-xl flex flex-col transition-transform duration-300 z-40",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* Logo */}
          <div className="flex h-16 items-center px-4 border-b border-white/10 mt-14">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
              <Tractor className="h-6 w-6 text-white" />
            </div>
            <span className="ml-3 text-white font-semibold text-lg">
              FarmShip
            </span>
          </div>

          {/* Menu Items */}
          <nav className="flex flex-col gap-1 p-3 flex-1 overflow-y-auto">
            {menuItems.map((item) => (
              <NavLink
                key={item.title}
                to={item.url}
                end
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-white text-primary shadow-lg"
                      : "text-white hover:bg-white/10"
                  )
                }
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium whitespace-nowrap">
                  {item.title}
                </span>
              </NavLink>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="p-3 border-t border-white/10">
            <Button
              variant="ghost"
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 hover:text-white rounded-lg justify-start"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm font-medium whitespace-nowrap">
                ログアウト
              </span>
            </Button>
          </div>
        </div>
      </>
    );
  }

  // デスクトップ: 通常のサイドバー
  return (
    <div className="group fixed left-0 top-0 h-screen w-16 hover:w-60 bg-gradient-to-b from-[#047857] to-[#065F46] shadow-xl flex flex-col transition-all duration-300 z-50">
      {/* Logo */}
      <div className="flex h-16 items-center px-3 border-b border-white/10">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm flex-shrink-0">
          <Tractor className="h-6 w-6 text-white" />
        </div>
        <span className="ml-3 text-white font-semibold text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          FarmShip
        </span>
      </div>

      {/* Menu Items */}
      <nav className="flex flex-col gap-1 p-2 flex-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            end
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200",
                isActive
                  ? "bg-white text-primary shadow-lg"
                  : "text-white hover:bg-white/10"
              )
            }
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap text-sm font-medium">
              {item.title}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-2 border-t border-white/10">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-3 text-white hover:bg-white/10 hover:text-white rounded-lg justify-start"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap text-sm font-medium">
            ログアウト
          </span>
        </Button>
      </div>
    </div>
  );
}
