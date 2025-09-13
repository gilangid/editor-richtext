import { html, LitElement } from "lit";
import { customElement, property, query } from "lit/decorators.js";

@customElement("rich-viewer")
export class RichViewer extends LitElement {
  @query("#content") content!: HTMLDivElement;
  @property({ type: Boolean }) readonly = false;
  @property({ type: Object, hasChanged: () => true }) node!: Element;

  render() {
    const { readonly, node } = this;
    return html`<article
      id="content"
      class="p-4 w-full h-full focus:outline-none"
      contenteditable=${readonly ? "false" : "true"}
      @input=${() => {
        this.updateSelection();
        this.dispatchEvent(new CustomEvent('content-changed', {
          detail: this.content.innerHTML,
          bubbles: true,
          composed: true
        }));
      }}
      @keydown=${this.handleEnter}
    >
      ${node}
    </article>`;
  }

  handleEnter(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const parent = range.startContainer.parentElement;

        if (parent && parent.tagName === 'P' && (parent.textContent.trim() === '' || parent.innerHTML.trim() === '<br>')) {
            event.preventDefault();
            document.execCommand('insertHTML', false, '<br>');
        }
      }
    }
  }

  updateSelection() {
    // @ts-ignore
    const shadowSelection = this.shadowRoot?.getSelection
      ? // @ts-ignore
        this.shadowRoot!.getSelection()
      : null;
    const selection =
      shadowSelection || document.getSelection() || window.getSelection();
    this.dispatchEvent(
      new CustomEvent("selection", {
        detail: selection,
        bubbles: true,
        composed: true,
      })
    );
  }

  firstUpdated() {
    document.addEventListener("selectionchange", () => {
      this.updateSelection();
    });
    window.addEventListener("selectionchange", () => {
      this.updateSelection();
    });
    document.addEventListener("keydown", () => {
      this.updateSelection();
    });
  }

  // Create a shadow root
  createRenderRoot() {
    return this;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "rich-viewer": RichViewer;
  }
}