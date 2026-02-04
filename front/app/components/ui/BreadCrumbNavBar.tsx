import { Link } from "react-router";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

export interface BreadCrumbPage {
  route: string;
  name: string;
}

interface BreadCrumbNavbarProps {
  pages: BreadCrumbPage[];
}

export function BreadCrumbNavbar({ pages }: BreadCrumbNavbarProps) {
  return (
    <nav>
      <ol className="flex items-center gap-1 text-body-sm">
        {pages.map((page, index) => {
          const isLast = index === pages.length - 1;

          return (
            <li key={page.route} className="flex items-center gap-1">
              {index > 0 && (
                <ChevronRightIcon className="size-3.5 text-gray" strokeWidth={2} />
              )}
              {isLast ? (
                <span>{page.name}</span>
              ) : (
                <Link
                  to={page.route}
                  className="hover:text-dark"
                >
                  {page.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
