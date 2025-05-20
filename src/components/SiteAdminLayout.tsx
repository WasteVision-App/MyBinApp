
import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuList, NavigationMenuTrigger, NavigationMenuLink } from '@/components/ui/navigation-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const SiteAdminLayout: React.FC = () => {
  const { signOut, user } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-mybin-primary">MyBin Site Admin</h1>
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
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={signOut}>
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default SiteAdminLayout;
