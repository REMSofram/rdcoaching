"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DownboardingPage() {
  const router = useRouter();

  useEffect(() => {
    // Après clic sur le magic link, l'utilisateur est authentifié.
    // On redirige immédiatement vers l'onboarding tant que cette page n'a pas de contenu dédié.
    const t = setTimeout(() => router.replace("/onboarding"), 300);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-2xl font-semibold">Validation en cours…</h1>
      <p className="mt-2 text-gray-600">
        Merci d'avoir confirmé votre adresse. Vous allez être redirigé vers l'onboarding.
      </p>
    </div>
  );
}
