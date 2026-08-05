import { visit } from 'unist-util-visit';
import type { Root } from 'mdast';

/**
 * Preserves a fenced block's meta string across the remark → rehype boundary.
 *
 * `mdast-util-to-hast` drops everything after the language on a fence, so by
 * the time a rehype plugin sees the element, `title="main.go"`, `{3,7-9}` and
 * `verify` are gone. Copying it into `hProperties` first is the supported way
 * to carry it through.
 */
export function remarkCodeMeta() {
  return function transformer(tree: Root): void {
    visit(tree, 'code', (node) => {
      if (!node.meta) return;
      const data = (node.data ??= {});
      const props = ((data as { hProperties?: Record<string, unknown> }).hProperties ??= {});
      props['data-meta'] = node.meta;
    });
  };
}
