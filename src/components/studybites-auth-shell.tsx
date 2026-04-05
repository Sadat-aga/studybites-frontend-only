import Image from "next/image";
import Link from "next/link";
import { ArrowDownIcon, GlobeIcon } from "@/components/studybites-icons";
import { cn } from "@/lib/utils";

const locales = [
  { label: "العربية", flag: "SA" },
  { label: "English", flag: "US" },
  { label: "Deutsch", flag: "DE" },
  { label: "Türkçe", flag: "TR" },
];

export function StudybitesAuthShell({
  children,
  ctaLabel = "Get Started",
  ctaHref = "/authenticate",
}: {
  children: React.ReactNode;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <main className="z-[1] min-h-screen w-screen overflow-x-hidden bg-bg-page font-cairo">
      <nav className="h-20 max-w-full rounded-none bg-transparent px-4 py-2 duration-200 ease-out lg:px-8">
        <div className="flex items-center justify-between text-text-default">
          <Link href="/" className="inline-flex">
            <Image
              src="/images/studybites/bito-logo.svg"
              alt="bito logo"
              width={1936}
              height={483}
              className="h-14 w-36 duration-200 md:h-[70px]"
              priority
            />
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="group/popover relative px-2 sm:px-4">
              <button
                type="button"
                className="flex cursor-pointer items-center gap-1 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:outline-hidden"
                aria-label="Change language"
              >
                <GlobeIcon />
                <ArrowDownIcon />
              </button>
              <div className="light-shadow invisible absolute top-10 end-3 z-50 rounded-2xl bg-bg-default px-3 opacity-0 transition-opacity duration-200 group-hover/popover:visible group-hover/popover:opacity-100 ltr:right-0 rtl:left-0 dark:shadow-none">
                {locales.map((locale) => (
                  <div
                    key={locale.label}
                    className={cn(
                      "relative z-50 flex min-w-[95px] items-center justify-start gap-[13px] rounded p-[14px] text-sm font-medium text-text-default duration-200",
                      "cursor-pointer hover:text-primary",
                    )}
                  >
                    <span className="inline-flex size-4 items-center justify-center rounded-full border border-border bg-white text-[8px] font-bold">
                      {locale.flag}
                    </span>
                    <div>{locale.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <Link
              href={ctaHref}
              className="rounded-xl border border-primary px-10 pb-3 pt-2 text-sm leading-4 font-bold text-primary no-underline"
            >
              {ctaLabel}
            </Link>
          </div>
        </div>
      </nav>

      <div className="relative h-[calc(100vh-5rem)] py-7">
        <div className="relative top-0 flex h-full w-full justify-center pt-28">
          <div className="gradient-blur mx-auto h-3/5 w-2/5 min-w-[280px]" />
        </div>
        <div className="absolute top-3 left-0 z-30 flex w-full">{children}</div>
      </div>
    </main>
  );
}
