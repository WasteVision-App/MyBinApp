
import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const AdminLayout: React.FC = () => {
  const { signOut, user, isSuperAdmin } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-mybin-primary mr-4">MyBin Admin</h1>
            {isMobile ? (
              <Button variant="ghost" size="sm" onClick={toggleMobileMenu} className="ml-2">
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </Button>
            ) : (
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <Link to="/admin">
                      <NavigationMenuLink 
                        className={cn(
                          "px-3 py-2 hover:bg-gray-100 rounded-md transition-colors text-sm",
                          location.pathname === "/admin" && "font-medium text-mybin-primary"
                        )}
                      >
                        Dashboard
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link to="/admin/companies">
                      <NavigationMenuLink 
                        className={cn(
                          "px-3 py-2 hover:bg-gray-100 rounded-md transition-colors text-sm",
                          location.pathname.startsWith("/admin/companies") && "font-medium text-mybin-primary"
                        )}
                      >
                        Companies
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link to="/admin/users">
                      <NavigationMenuLink 
                        className={cn(
                          "px-3 py-2 hover:bg-gray-100 rounded-md transition-colors text-sm",
                          location.pathname.startsWith("/admin/users") && "font-medium text-mybin-primary"
                        )}
                      >
                        Users
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link to="/admin/submissions">
                      <NavigationMenuLink 
                        className={cn(
                          "px-3 py-2 hover:bg-gray-100 rounded-md transition-colors text-sm",
                          location.pathname.startsWith("/admin/submissions") && "font-medium text-mybin-primary"
                        )}
                      >
                        Submissions
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  {/* Show Bin Types/Contamination Types only for super admin */}
                  {isSuperAdmin && (
                    <>
                      <NavigationMenuItem>
                        <Link to="/admin/bin-types">
                          <NavigationMenuLink
                            className={cn(
                              "px-3 py-2 hover:bg-gray-100 rounded-md transition-colors text-sm",
                              location.pathname.startsWith("/admin/bin-types") && "font-medium text-mybin-primary"
                            )}
                          >
                            Bin Types
                          </NavigationMenuLink>
                        </Link>
                      </NavigationMenuItem>
                      <NavigationMenuItem>
                        <Link to="/admin/contamination-types">
                          <NavigationMenuLink
                            className={cn(
                              "px-3 py-2 hover:bg-gray-100 rounded-md transition-colors text-sm",
                              location.pathname.startsWith("/admin/contamination-types") && "font-medium text-mybin-primary"
                            )}
                          >
                            Contamination
                          </NavigationMenuLink>
                        </Link>
                      </NavigationMenuItem>
                    </>
                  )}
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
                    to="/admin" 
                    className={cn(
                      "block py-2 px-3 rounded-md",
                      location.pathname === "/admin" && "bg-gray-100 font-medium text-mybin-primary"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/admin/companies" 
                    className={cn(
                      "block py-2 px-3 rounded-md",
                      location.pathname.startsWith("/admin/companies") && "bg-gray-100 font-medium text-mybin-primary"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Companies
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/admin/users" 
                    className={cn(
                      "block py-2 px-3 rounded-md",
                      location.pathname.startsWith("/admin/users") && "bg-gray-100 font-medium text-mybin-primary"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Users
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/admin/submissions" 
                    className={cn(
                      "block py-2 px-3 rounded-md",
                      location.pathname.startsWith("/admin/submissions") && "bg-gray-100 font-medium text-mybin-primary"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Submissions
                  </Link>
                </li>
                {isSuperAdmin && (
                  <>
                    <li>
                      <Link 
                        to="/admin/bin-types" 
                        className={cn(
                          "block py-2 px-3 rounded-md",
                          location.pathname.startsWith("/admin/bin-types") && "bg-gray-100 font-medium text-mybin-primary"
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Bin Types
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/admin/contamination-types" 
                        className={cn(
                          "block py-2 px-3 rounded-md",
                          location.pathname.startsWith("/admin/contamination-types") && "bg-gray-100 font-medium text-mybin-primary"
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Contamination Types
                      </Link>
                    </li>
                  </>
                )}
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

export default AdminLayout;
