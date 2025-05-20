
import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuList, NavigationMenuTrigger, NavigationMenuLink } from '@/components/ui/navigation-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const SiteAdminLayout: React.FC = () => {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-mybin-primary mr-4">MyBin Site Admin</h1>
            {isMobile ? (
              <Button variant="ghost" size="sm" onClick={toggleMobileMenu} className="ml-2">
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </Button>
            ) : (
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <Link 
                      to="/site-admin"
                      className={cn(
                        "px-4 py-2 hover:bg-gray-100 rounded-md transition-colors inline-block",
                        location.pathname === "/site-admin" && "font-medium text-mybin-primary"
                      )}
                    >
                      Dashboard
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link 
                      to="/site-admin/bin-tally-forms"
                      className={cn(
                        "px-4 py-2 hover:bg-gray-100 rounded-md transition-colors inline-block",
                        location.pathname.startsWith("/site-admin/bin-tally-forms") && "font-medium text-mybin-primary"
                      )}
                    >
                      Bin Tally Forms
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link 
                      to="/site-admin/submissions"
                      className={cn(
                        "px-4 py-2 hover:bg-gray-100 rounded-md transition-colors inline-block",
                        location.pathname.startsWith("/site-admin/submissions") && "font-medium text-mybin-primary"
                      )}
                    >
                      Submissions
                    </Link>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline">
              {user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={signOut}>
              Logout
            </Button>
          </div>
        </div>
        
        {/* Mobile navigation menu */}
        {isMobile && mobileMenuOpen && (
          <div className="bg-white px-4 py-2 border-t border-gray-100 shadow-md">
            <nav>
              <ul className="space-y-1">
                <li>
                  <Link 
                    to="/site-admin" 
                    className={cn(
                      "block py-2 px-3 rounded-md",
                      location.pathname === "/site-admin" && "bg-gray-100 font-medium text-mybin-primary"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/site-admin/bin-tally-forms" 
                    className={cn(
                      "block py-2 px-3 rounded-md",
                      location.pathname.startsWith("/site-admin/bin-tally-forms") && "bg-gray-100 font-medium text-mybin-primary"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Bin Tally Forms
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/site-admin/submissions" 
                    className={cn(
                      "block py-2 px-3 rounded-md",
                      location.pathname.startsWith("/site-admin/submissions") && "bg-gray-100 font-medium text-mybin-primary"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Submissions
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </header>
      <main className="container mx-auto px-4 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default SiteAdminLayout;
