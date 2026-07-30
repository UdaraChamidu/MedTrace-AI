import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";

type NavigateOptions = { replace?: boolean };
type Navigate = (to: string, options?: NavigateOptions) => void;

type RouterState = {
  pathname: string;
  search: string;
  navigate: Navigate;
};

const RouterContext = createContext<RouterState | null>(null);

function currentLocation() {
  return {
    pathname: window.location.pathname,
    search: window.location.search,
  };
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState(currentLocation);

  useEffect(() => {
    const sync = () => setLocation(currentLocation());
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  const navigate = useCallback<Navigate>((to, options) => {
    window.history[options?.replace ? "replaceState" : "pushState"]({}, "", to);
    window.dispatchEvent(new PopStateEvent("popstate"));
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const value = useMemo(
    () => ({ pathname: location.pathname, search: location.search, navigate }),
    [location.pathname, location.search, navigate],
  );

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter() {
  const value = useContext(RouterContext);
  if (!value) {
    throw new Error("RouterProvider is required.");
  }
  return value;
}

export function useNavigate() {
  return useRouter().navigate;
}

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  to: string;
};

export function Link({ to, onClick, children, ...props }: LinkProps) {
  const navigate = useNavigate();

  const follow = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    navigate(to);
  };

  return (
    <a href={to} onClick={follow} {...props}>
      {children}
    </a>
  );
}

type NavLinkProps = Omit<LinkProps, "className"> & {
  className?: string | ((state: { isActive: boolean }) => string);
};

export function NavLink({ className, to, ...props }: NavLinkProps) {
  const { pathname } = useRouter();
  const targetPath = to.split("?")[0];
  const isActive =
    pathname === targetPath ||
    (targetPath !== "/" && pathname.startsWith(`${targetPath}/`));
  const resolvedClassName =
    typeof className === "function" ? className({ isActive }) : className;
  return <Link className={resolvedClassName} to={to} {...props} />;
}

export function useParams() {
  const { pathname } = useRouter();
  const match = /^\/patients\/([^/]+)$/.exec(pathname);
  return { patientId: match ? decodeURIComponent(match[1]) : undefined };
}

type SetSearchParams = (
  params: URLSearchParams,
  options?: NavigateOptions,
) => void;

export function useSearchParams(): [URLSearchParams, SetSearchParams] {
  const { pathname, search, navigate } = useRouter();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const setParams = useCallback<SetSearchParams>(
    (next, options) => {
      const query = next.toString();
      navigate(query ? `${pathname}?${query}` : pathname, options);
    },
    [navigate, pathname],
  );
  return [params, setParams];
}
