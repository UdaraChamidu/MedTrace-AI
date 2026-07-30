import { AuthPage } from "./pages/AuthPage";
import { CreatePatientPage } from "./pages/CreatePatientPage";
import { LandingPage } from "./pages/LandingPage";
import { PatientDashboardPage } from "./pages/PatientDashboardPage";
import { PatientListPage } from "./pages/PatientListPage";
import { useRouter } from "./lib/router";

export default function App() {
  const { pathname } = useRouter();
  let page = <LandingPage />;

  if (pathname === "/auth") {
    page = <AuthPage />;
  } else if (pathname === "/patients") {
    page = <PatientListPage />;
  } else if (pathname === "/patients/new") {
    page = <CreatePatientPage />;
  } else if (/^\/patients\/[^/]+$/.test(pathname)) {
    page = <PatientDashboardPage />;
  }

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      {page}
    </>
  );
}
