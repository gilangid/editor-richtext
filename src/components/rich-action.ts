import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

@customElement("rich-action")
export class RichAction extends LitElement {
  @property({ type: String }) command = "";
  @property({ type: String }) value?: string;
  @property({ type: String }) icon = "info";
  @property({ type: Boolean }) active = false;
  @property({ type: Array, hasChanged: () => true }) values: Option[] = [];

  render() {
    const { icon, command, value, active, values } = this;
    const hasItems = values.length > 0;
    return html`<section class="flex items-center">
      ${hasItems
        ? html` <span class="p-2">${unsafeHTML(icon)}</span>
            <select
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              @change=${(e: Event) => {
                const event = e as CustomEvent;
                const select = event.target as HTMLSelectElement;
                const selectedValue = select.value;
                if (selectedValue === "--") {
                  editorCommand("removeFormat", undefined);
                } else {
                  editorCommand(command, selectedValue);
                }
              }}
            >
              ${values.map(
                (v) =>
                  html`<option value=${v.value} ?selected=${v.value === value}>
                    ${v.name}
                  </option>`
              )}
            </select>`
        : html`<button
            class="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 ${active ? 'bg-gray-300 dark:bg-gray-600' : ''}"
            @click=${() => {
              if (command) {
                editorCommand(command, value);
              } else {
                this.dispatchEvent(
                  new Event("action", {
                    bubbles: true,
                    composed: true,
                  })
                );
              }
            }}
          >${unsafeHTML(icon)}</button>`}
      <div><slot></slot></div>
    </section>`;
  }

  // Create a shadow root
  createRenderRoot() {
    return this;
  }
}

interface Option {
  name: string;
  value: string;
}

export function editorCommand(command: string, value?: string) {
  document.execCommand(command, true, value);
}

declare global {
  interface HTMLElementTagNameMap {
    "rich-action": RichAction;
  }
}
