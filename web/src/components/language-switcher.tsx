"use client";

import { useRouter } from "next/navigation";
import type { Locale } from "@/content/types";

type LanguageSwitcherProps = {
  className: string;
  dividerClassName: string;
  initialLanguage: Locale;
  optionClassName: string;
};

export function LanguageSwitcher({
  className,
  dividerClassName,
  initialLanguage,
  optionClassName,
}: LanguageSwitcherProps) {
  const router = useRouter();

  const selectLanguage = async (language: Locale) => {
    await fetch("/api/language", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ language }),
    });
    router.refresh();
  };

  return (
    <div
      aria-label={
        initialLanguage === "es" ? "Selector de idioma" : "Language selector"
      }
      className={className}
      role="group"
    >
      {(["en", "es"] as const).map((language, index) => (
        <span key={language}>
          {index > 0 ? (
            <span aria-hidden="true" className={dividerClassName}>
              /{" "}
            </span>
          ) : null}
          <button
            aria-pressed={initialLanguage === language}
            className={optionClassName}
            data-active={initialLanguage === language || undefined}
            lang={language}
            onClick={() => selectLanguage(language)}
            type="button"
          >
            {language.toUpperCase()}
          </button>
        </span>
      ))}
    </div>
  );
}
