/* ==========================================================================
   EFECTOS DE SCROLL
   Revela los elementos con [data-reveal] cuando entran a la pantalla.
   Los estilos de cada efecto están en css/motion.css.

   - [data-reveal-group]: sus [data-reveal] entran uno tras otro.
   - [data-count]: el número cuenta desde 0 al aparecer.
   ========================================================================== */

(function () {
  "use strict";

  const root = document.documentElement;
  if (!root.classList.contains("motion")) return;

  // Avisa al script del <head> que todo cargó bien (si no, apaga .motion)
  window.__motionReady = true;

  /* Cuenta desde 0 hasta data-count, con el formato colombiano (36.900) */
  function countUp(element) {
    const target = Number(element.dataset.count);
    const prefix = element.dataset.countPrefix || "";
    const format = new Intl.NumberFormat("es-CO");
    const duration = 1600;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 4);
      element.textContent = prefix + format.format(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  function reveal(element) {
    element.classList.add("is-revealed");
    if (element.dataset.count) countUp(element);
  }

  // Orden de entrada dentro de cada grupo
  document.querySelectorAll("[data-reveal-group]").forEach((group) => {
    group.querySelectorAll("[data-reveal]").forEach((element, index) => {
      element.style.setProperty("--reveal-i", index);
    });
  });

  // Elemento vigilado -> elementos que se revelan cuando él entra
  const pending = new Map();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        pending.get(entry.target).forEach(reveal);
        pending.delete(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.15 }
  );

  function watch(target, element) {
    if (!pending.has(target)) {
      pending.set(target, []);
      observer.observe(target);
    }
    pending.get(target).push(element);
  }

  document.querySelectorAll("[data-reveal]").forEach((element) => {
    // Lo que ya quedó arriba (al recargar a mitad de página) se muestra directo
    if (element.getBoundingClientRect().bottom < 0) {
      reveal(element);
      return;
    }

    // El telón empieza recortado del todo y el observador lo vería con área
    // cero, así que para ese efecto se vigila a su contenedor
    const target = element.dataset.reveal === "clip" ? element.parentElement : element;
    watch(target, element);
  });
})();
