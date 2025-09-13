import { html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { live } from "../utils/live";

import "./rich-toolbar";
import "./rich-viewer";

@customElement("rich-text")
export class RichText extends LitElement {
  @live selection: Selection | null = null;
  @property({ type: Boolean }) readonly = false;
  @property({ type: Object, hasChanged: () => true }) node: Element =
    document.createElement("div");
  @state() sourceViewActive = false;
  @state() sourceCode = '';

  toggleSourceView() {
    this.sourceViewActive = !this.sourceViewActive;
    if (this.sourceViewActive) {
      this.sourceCode = this.node.innerHTML.replace(/<!--\?lit\$[0-9]+\$-->/g, '');
    } else {
      this.node.innerHTML = this.sourceCode;
    }
  }

  render() {
    const { selection, readonly, node, sourceViewActive, sourceCode } = this;
    if (sourceViewActive) {
      return html`
        <div class="fixed inset-0 z-10 flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <rich-toolbar
            class="border-b border-gray-200 dark:border-gray-700"
            .selection=${selection}
            .node=${node}
            .sourceViewActive=${sourceViewActive}
            @set-content=${(e: Event) => {
              const event = e as CustomEvent<string>;
              const parser = new DOMParser();
              const doc = parser.parseFromString(event.detail, "text/html");
              const root = doc.querySelector("body");
              this.node.innerHTML = root?.innerHTML ?? "";
              this.requestUpdate();
            }}
            @toggle-source-view=${this.toggleSourceView}
          ></rich-toolbar>
          <textarea class="flex-1 overflow-y-auto p-4 font-mono bg-gray-100 dark:bg-gray-800 w-full h-full"
            @input=${(e: Event) => {
              const textarea = e.target as HTMLTextAreaElement;
              this.sourceCode = textarea.value;
            }}>${sourceCode}</textarea>
        </div>
      `;
    }

    return html`<main class="flex flex-col h-full w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <rich-toolbar
        class="border-b border-gray-200 dark:border-gray-700"
        .selection=${selection}
        .node=${node}
        .sourceViewActive=${sourceViewActive}
        @set-content=${(e: Event) => {
          const event = e as CustomEvent<string>;
          const parser = new DOMParser();
          const doc = parser.parseFromString(event.detail, "text/html");
          const root = doc.querySelector("body");
          this.node.innerHTML = root?.innerHTML ?? "";
          this.requestUpdate();
        }}
        @toggle-source-view=${this.toggleSourceView}
      ></rich-toolbar>
      <rich-viewer
        class="flex-1 overflow-y-auto p-4"
        ?readonly=${readonly}
        @selection=${(e: Event) => {
          const event = e as CustomEvent;
          this.selection = event.detail;
        }}
        @content-changed=${(e: CustomEvent) => {
          this.node.innerHTML = e.detail;
        }}
        .node=${node}
      >
      </rich-viewer>
    </main>`;
  }

  firstUpdated() {
    const children = this.children;
    if (children.length > 0) {
      // Check if <template> is the first child
      const template = children[0];
      if (template.tagName === "TEMPLATE") {
        const content = template.innerHTML.trim();
        if (content.length > 0) {
          this.node.innerHTML = content;
          this.requestUpdate();
        }
      }
    }
  }

  // Create a shadow root
  createRenderRoot() {
    return this;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "rich-text": RichText;
  }
}
