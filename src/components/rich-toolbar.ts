import { html, LitElement } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { checkFonts } from "../utils/check-fonts";
import { live } from "../utils/live";

import "./rich-action";
import { editorCommand } from "./rich-action";
import { trashIcon, boldIcon, italicIcon, underlineIcon, bars3BottomLeftIcon, bars3Icon, bars3BottomRightIcon, queueListIcon, listBulletIcon, chatBubbleLeftRightIcon, arrowLeftIcon, arrowRightIcon, linkIcon, linkSlashIcon, paintBrushIcon, swatchIcon, chevronDownIcon, languageIcon, adjustmentsHorizontalIcon, arrowUturnLeftIcon, arrowUturnRightIcon, scissorsIcon, clipboardDocumentIcon, clipboardDocumentListIcon, arrowUpTrayIcon, arrowDownTrayIcon, codeBracketIcon } from "../icons";

@customElement("rich-toolbar")
export class RichToolbar extends LitElement {
  @live selection: Selection | null = null;
  @query("#fg-color") fgColorInput!: HTMLInputElement;
  @query("#bd-color") bdColorInput!: HTMLInputElement;
  @state() fileHandle?: any;
  @property({ type: Boolean }) sourceViewActive = false;
  @property({ type: Object, hasChanged: () => true }) node!: Element;

  render() {
    const tags = this.getTags();
    return html`<header class="flex flex-wrap items-center p-2 bg-gray-100 dark:bg-gray-800">
      <rich-action .icon=${trashIcon} command="removeFormat"></rich-action>
      <rich-action
        .icon=${boldIcon}
        command="bold"
        ?active=${tags.includes("b")}
      ></rich-action>
      <rich-action
        .icon=${italicIcon}
        command="italic"
        ?active=${tags.includes("i")}
      ></rich-action>
      <rich-action
        .icon=${underlineIcon}
        command="underline"
        ?active=${tags.includes("u")}
      ></rich-action>
      <rich-action .icon=${bars3BottomLeftIcon} command="justifyleft"></rich-action>
      <rich-action
        .icon=${bars3Icon}
        command="justifycenter"
      ></rich-action>
      <rich-action
        .icon=${bars3BottomRightIcon}
        command="justifyright"
      ></rich-action>
      <rich-action
        .icon=${queueListIcon}
        command="insertorderedlist"
        ?active=${tags.includes("ol")}
      ></rich-action>
      <rich-action
        .icon=${listBulletIcon}
        command="insertunorderedlist"
        ?active=${tags.includes("ul")}
      ></rich-action>
      <rich-action
        .icon=${chatBubbleLeftRightIcon}
        command="formatblock"
        value="blockquote"
      ></rich-action>
      <rich-action
        .icon=${arrowLeftIcon}
        command="outdent"
      ></rich-action>
      <rich-action .icon=${arrowRightIcon} command="indent"></rich-action>
      <rich-action
        .icon=${linkIcon}
        ?active=${tags.includes("a")}
        @action=${() => {
          const newLink = prompt("Write the URL here", "https://");
          // Check if valid url
          if (newLink && newLink.match(/^(http|https):\/\/[^ \\"]+$/)) {
            editorCommand("createlink", newLink);
          }
        }}
      >
      </rich-action>
      <rich-action
        .icon=${linkSlashIcon}
        ?active=${tags.includes("a")}
        command="unlink"
      >
      </rich-action>
      <rich-action
        .icon=${paintBrushIcon}
        @action=${() => this.fgColorInput.click()}
      >
        <input
          type="color"
          id="fg-color"
          class="w-6 h-6 border-none"
          @input=${(e: Event) => {
            const input = e.target as HTMLInputElement;
            editorCommand("forecolor", input.value);
          }}
        />
      </rich-action>
      <rich-action
        .icon=${swatchIcon}
        @action=${() => this.bdColorInput.click()}
      >
        <input
          type="color"
          id="bd-color"
          class="w-6 h-6 border-none"
          @input=${(e: Event) => {
            const input = e.target as HTMLInputElement;
            editorCommand("backcolor", input.value);
          }}
        />
      </rich-action>
      <rich-action
        .icon=${chevronDownIcon}
        command="formatblock"
        .values=${[
          { name: "Normal Text", value: "--" },
          { name: "Heading 1", value: "h1" },
          { name: "Heading 2", value: "h2" },
          { name: "Heading 3", value: "h3" },
          { name: "Heading 4", value: "h4" },
          { name: "Heading 5", value: "h5" },
          { name: "Heading 6", value: "h6" },
          { name: "Paragraph", value: "p" },
          { name: "Pre-Formatted", value: "pre" },
        ]}
      ></rich-action>
      <rich-action
        .icon=${languageIcon}
        command="fontname"
        .values=${[
          { name: "Font Name", value: "--" },
          ...Array.from(checkFonts()).map((font) => ({
            name: font,
            value: font,
          })),
        ]}
      ></rich-action>
      <rich-action
        .icon=${adjustmentsHorizontalIcon}
        command="fontsize"
        .values=${[
          { name: "Font Size", value: "--" },
          { name: "Very Small", value: "1" },
          { name: "Small", value: "2" },
          { name: "Normal", value: "3" },
          { name: "Medium Large", value: "4" },
          { name: "Large", value: "5" },
          { name: "Very Large", value: "6" },
          { name: "Maximum", value: "7" },
        ]}
      ></rich-action>
      <rich-action .icon=${arrowUturnLeftIcon} command="undo"></rich-action>
      <rich-action .icon=${arrowUturnRightIcon} command="redo"></rich-action>
      <rich-action .icon=${scissorsIcon} command="cut"></rich-action>
      <rich-action .icon=${clipboardDocumentIcon} command="copy"></rich-action>
      <rich-action .icon=${clipboardDocumentListIcon} command="paste"></rich-action>
      <rich-action
        .icon=${arrowUpTrayIcon}
        @action=${async () => {
          if ("showOpenFilePicker" in window) {
            // File system api
            // @ts-ignore
            const [fileHandle] = await window.showOpenFilePicker();
            this.fileHandle = fileHandle;
            if (fileHandle) {
              const file = await fileHandle.getFile();
              const contents = await file.text();
              this.dispatchEvent(
                new CustomEvent("set-content", {
                  detail: contents,
                  bubbles: true,
                  composed: true,
                })
              );
            }
          } else {
            // Fallback to input
            const input = document.createElement("input");
            input.type = "file";
            input.click();
            input.onchange = async () => {
              const file = input.files![0];
              if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                  const data = reader.result as string;
                  this.dispatchEvent(
                    new CustomEvent("set-content", {
                      detail: data,
                      bubbles: true,
                      composed: true,
                    })
                  );
                };
                reader.readAsText(file);
              }
            };
          }
        }}
      ></rich-action>
      <rich-action
        .icon=${arrowDownTrayIcon}
        @action=${async () => {
          const contents = this.node.innerHTML;
          if (this.fileHandle) {
            const writable = await this.fileHandle.createWritable();
            await writable.write(
              [
                `<!DOCTYPE html>`, 
                `<html lang="en">`, 
                `  <head><meta charset="UTF-8" /><title>Document</title></head>`, 
                `  <body>${contents}</body>`, 
                `</html>`
              ].join("\n")
            );
            await writable.close();
          } else {
            // Download file
            const fullHtml = `<!DOCTYPE html>\n<html lang="en">\n  <head><meta charset="UTF-8" /><title>Document</title></head>\n  <body>${contents}</body>\n</html>`;
            const url = window.URL.createObjectURL(
              new Blob([fullHtml], { type: "text/html" })
            );
            const link = document.createElement("a");
            link.href = url;
            link.download = "index.html";
            link.click();
          }
        }}
      ></rich-action>
      <rich-action
        .icon=${codeBracketIcon}
        ?active=${this.sourceViewActive}
        @action=${() => {
          this.sourceViewActive = !this.sourceViewActive;
          this.dispatchEvent(new CustomEvent('toggle-source-view'));
        }}
      ></rich-action>
    </header>`
  }

  getTags() {
    const { selection } = this;
    let tags: string[] = [];
    if (selection) {
      if (selection.type === "Range") {
        // @ts-ignore
        let parentNode = selection?.baseNode;
        if (parentNode) {
          const checkNode = () => {
            const tag = parentNode?.tagName?.toLowerCase()?.trim();
            if (tag) tags.push(tag);
          };
          while (parentNode != null) {
            checkNode();
            parentNode = parentNode?.parentNode;
          }
        }
        // Remove root tag
        tags.pop();
      } else {
        const content = this.selection?.toString() || "";
        tags = (content.match(/<[^>]+>/g) || [])
          .filter((tag) => !tag.startsWith("</"))
          .map((tag) => tag.replace(/<|>/g, ""));
      }
    }
    return tags;
  }

  // Create a shadow root
  createRenderRoot() {
    return this;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "rich-toolbar": RichToolbar;
  }
}