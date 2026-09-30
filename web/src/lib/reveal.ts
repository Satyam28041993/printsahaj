/**
 * One shared IntersectionObserver for every scroll reveal on the site.
 *
 * Each target is watched on its own (not per container), so a child far down a
 * tall section only animates when it is actually about to be seen. Targets are
 * un-observed after their first reveal. Targets that cross into view in the
 * same observer callback are staggered by writing `--i` (see motion.css).
 */

const SELECTOR = "[data-reveal], .h-reveal";
const STAGGER_CAP = 6;

let observer: IntersectionObserver | null = null;

function shared(): IntersectionObserver {
  if (observer) return observer;
  observer = new IntersectionObserver(
    (entries) => {
      let batch = 0;
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const target = entry.target as HTMLElement;
        // Elements that authored their own --i keep it; the rest stagger by arrival order.
        if (!target.style.getPropertyValue("--i")) {
          target.style.setProperty("--i", String(Math.min(batch, STAGGER_CAP)));
        }
        batch += 1;
        target.classList.add("is-in");
        observer?.unobserve(target);
      }
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
  );
  return observer;
}

/** Watches every reveal target inside `root`. Returns a cleanup function. */
export function observeReveals(root: HTMLElement): () => void {
  const targets = Array.from(root.querySelectorAll<HTMLElement>(SELECTOR));
  if (root.matches(SELECTOR)) targets.push(root);
  // The inline failsafe already showed the page: reveal without observing.
  if (document.documentElement.classList.contains("motion-off")) {
    targets.forEach((target) => target.classList.add("is-in"));
    return () => {};
  }
  const io = shared();
  targets.forEach((target) => {
    if (!target.classList.contains("is-in")) io.observe(target);
  });
  return () => targets.forEach((target) => io.unobserve(target));
}

/** Tells the failsafe timer in the inline script that JS took over. */
export function markMotionReady(): void {
  document.documentElement.classList.add("motion-ready");
}
