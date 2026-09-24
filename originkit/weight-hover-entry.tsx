import * as React from "react";
import { createRoot } from "react-dom/client";
import WeightHover from "./WeightHover";

// Mount the supplied component on text nodes, preserving links and nested markup.
const selector = 'a, button, h1, h2, p, small, .header-note, .intro, .home-caption, .card-caption, .work-info, .section-kicker, .contact-signature, .page-footer';
const roots = new Map();
function enhance() {
    for (const [host, root] of roots) {
        if (!host.isConnected) { root.unmount(); roots.delete(host); }
    }
    const nodes = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
        const node = walker.currentNode;
        const parent = node.parentElement;
        if (!node.textContent.trim() || !/[\p{L}\p{N}]/u.test(node.textContent)) continue;
        if (!parent?.closest(selector) || parent.closest('[data-weight-hover], script, style, .mark, #brand-intro')) continue;
        nodes.push(node);
    }
    for (const node of nodes) {
        const computed = getComputedStyle(node.parentElement);
        const host = document.createElement('span');
        host.dataset.weightHover = '';
        const label = node.textContent;
        node.replaceWith(host);
        const root = createRoot(host);
        roots.set(host, root);
        root.render(<WeightHover label={label} fromWeight={parseInt(computed.fontWeight) || 400}
            fontSize="inherit" color="inherit" style={{ cursor: 'inherit' }} />);
    }
}
enhance();
const observer = new MutationObserver(records => {
    if (records.some(record => !record.target.parentElement?.closest('[data-weight-hover]') &&
        !(record.target instanceof Element && record.target.closest('[data-weight-hover]')))) enhance();
});
observer.observe(document.body, {childList: true, subtree: true});
