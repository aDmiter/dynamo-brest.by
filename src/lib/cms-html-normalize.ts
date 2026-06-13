const SKIP_LIST_CLASS = 'transport-services__schedule-list';

/** Jodit/Tailwind сбрасывают list-style — восстанавливаем для ul/ol в CMS-контенте. */
export function normalizeCmsListElements(container: HTMLElement): void {
  container.querySelectorAll('ul, ol').forEach((list) => {
    if (list.classList.contains(SKIP_LIST_CLASS)) return;

    const el = list as HTMLElement;
    el.style.removeProperty('list-style');
    el.style.removeProperty('list-style-type');
    el.style.removeProperty('list-style-image');
    el.style.listStyleType = list.tagName === 'OL' ? 'decimal' : 'disc';
    el.style.listStylePosition = 'outside';

    if (!el.style.paddingLeft) {
      el.style.paddingLeft = '1.5em';
    }
    if (!el.style.marginTop && !el.style.marginBottom) {
      el.style.margin = '1em 0';
    }
  });

  container.querySelectorAll('li').forEach((li) => {
    const el = li as HTMLElement;
    el.style.display = 'list-item';
    el.style.removeProperty('list-style');
    el.style.removeProperty('list-style-type');
  });
}
