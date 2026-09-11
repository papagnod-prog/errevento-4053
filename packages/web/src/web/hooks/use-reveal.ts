import { useEffect } from "react";

/**
 * Aggiunge la classe `is-visible` agli elementi `.reveal` quando entrano
 * nel viewport. Un solo observer per pagina, rieseguito quando cambia `key`.
 */
export function useReveal(key: unknown = null) {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (nodes.length === 0) return;

    if (!("IntersectionObserver" in window)) {
      for (const node of nodes) node.classList.add("is-visible");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 },
    );

    for (const node of nodes) {
      if (node.classList.contains("is-visible")) continue;
      observer.observe(node);
    }
    return () => observer.disconnect();
  }, [key]);
}
