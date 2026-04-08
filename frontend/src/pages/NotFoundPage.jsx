import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import Button from "../components/ui/Button";

function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-app-surface px-6 text-center">
      <SEO title="404 — Page Not Found" noindex />
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-primary-soft text-5xl font-black text-brand-primary">
        404
      </div>

      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-app-text">
          Page not found
        </h1>
        <p className="mt-3 text-sm leading-7 text-app-text-soft">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>

      <Link to="/">
        <Button>Back to Home</Button>
      </Link>
    </div>
  );
}

export default NotFoundPage;
