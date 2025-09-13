import { html, LitElement } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { checkFonts } from "../utils/check-fonts";
import { live } from "../utils/live";

import "./rich-action";
import { editorCommand } from "./rich-action";
import { trashIcon, boldIcon, italicIcon, underlineIcon, bars3BottomLeftIcon, bars3Icon, bars3BottomRightIcon, queueListIcon, listBulletIcon, chatBubbleLeftRightIcon, arrowLeftIcon, arrowRightIcon, linkIcon, linkSlashIcon, paintBrushIcon, swatchIcon, chevronDownIcon, languageIcon, adjustmentsHorizontalIcon, arrowUturnLeftIcon, arrowUturnRightIcon, scissorsIcon, clipboardDocumentIcon, clipboardDocumentListIcon, arrowUpTrayIcon, arrowDownTrayIcon, codeBracketIcon, photoIcon, videoCameraIcon, anchorIcon } from "../icons";

@customElement("rich-toolbar")
export class RichToolbar extends LitElement {
  @live selection: Selection | null = null;
  @query("#fg-color") fgColorInput!: HTMLInputElement;
  @query("#bd-color") bdColorInput!: HTMLInputElement;
  @state() fileHandle?: any;
  @state() isFormatMenuOpen = false;
  @state() isEditMenuOpen = false;
  @state() isFileMenuOpen = false;
  @state() isInsertMenuOpen = false;
  @state() isImageDialogOpen = false;
  @state() isMediaDialogOpen = false;
  @state() originalImageRatio = 0;
  @state() imageWidth = "";
  @state() imageHeight = "";
  @state() imageAlt = "";
  @state() imageUrl = "";
  @state() isRatioLocked = true;

  @property({ type: Boolean }) sourceViewActive = false;
  @property({ type: Object, hasChanged: () => true }) node!: Element;

  render() {
    const tags = this.getTags();
    return html`<header class="relative flex flex-wrap items-center p-2 bg-gray-100 dark:bg-gray-800">
      <div class="relative">
        <button @click=${() => this.isFileMenuOpen = !this.isFileMenuOpen} class="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center">
          File ${unsafeHTML(chevronDownIcon)}
        </button>
        ${this.isFileMenuOpen ? html`
          <div class="absolute top-full left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10 p-2 flex flex-row space-x-2">
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
          </div>
        ` : ''}
      </div>
      <div class="relative">
        <button @click=${() => this.isFormatMenuOpen = !this.isFormatMenuOpen} class="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center">
          Format ${unsafeHTML(chevronDownIcon)}
        </button>
        ${this.isFormatMenuOpen ? html`
          <div class="absolute top-full left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10 p-2 flex flex-row space-x-2 min-w-max">
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
            <rich-action .icon=${arrowLeftIcon} command="outdent"></rich-action>
            <rich-action .icon=${arrowRightIcon} command="indent"></rich-action>
          </div>
        ` : ''}
      </div>
      <div class="relative">
        <button @click=${() => this.isEditMenuOpen = !this.isEditMenuOpen} class="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center">
          Edit ${unsafeHTML(chevronDownIcon)}
        </button>
        ${this.isEditMenuOpen ? html`
          <div class="absolute top-full left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10 p-2 flex flex-row space-x-2">
            <rich-action .icon=${arrowUturnLeftIcon} command="undo"></rich-action>
            <rich-action .icon=${arrowUturnRightIcon} command="redo"></rich-action>
            <rich-action .icon=${scissorsIcon} command="cut"></rich-action>
            <rich-action .icon=${clipboardDocumentIcon} command="copy"></rich-action>
            <rich-action .icon=${clipboardDocumentListIcon} command="paste"></rich-action>
          </div>
        ` : ''}
      </div>
      <div class="relative">
        <button @click=${() => this.isInsertMenuOpen = !this.isInsertMenuOpen} class="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center">
          Insert ${unsafeHTML(chevronDownIcon)}
        </button>
        ${this.isInsertMenuOpen ? html`
          <div class="absolute top-full left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10 p-2 flex flex-col space-y-2">
            <rich-action .icon=${photoIcon} @action=${() => this.isImageDialogOpen = true}>Image</rich-action>
            <rich-action .icon=${videoCameraIcon} @action=${() => this.isMediaDialogOpen = true}>Media</rich-action>
            <rich-action .icon=${anchorIcon} @action=${() => {
              const anchorName = prompt("Enter anchor name");
              if (anchorName) {
                editorCommand("insertHTML", `<a name=\"${anchorName}\"></a>`);
              }
            }}>Anchor</rich-action>
          </div>
        ` : ''}
      </div>
      <div class="w-full border-b border-gray-300 dark:border-gray-600 my-2"></div>
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
        .icon=${codeBracketIcon}
        ?active=${this.sourceViewActive}
        @action=${() => {
          this.dispatchEvent(new CustomEvent('toggle-source-view'));
        }}
      ></rich-action>

      ${this.isImageDialogOpen ? html`
        <div class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-20">
          <div class="bg-white dark:bg-gray-800 p-6 rounded-md shadow-lg w-full max-w-lg">
            <h2 class="text-lg font-bold mb-4">Insert Image</h2>
            <div class="space-y-4">
              <div>
                <label class="block mb-1">Source URL</label>
                <input type="text" .value=${this.imageUrl} @input=${this.handleImageUrlInput} class="w-full p-2 border border-gray-300 rounded-md">
              </div>
              <div>
                <label class="block mb-1">Alt Text</label>
                <input type="text" .value=${this.imageAlt} @input=${(e: Event) => this.imageAlt = (e.target as HTMLInputElement).value} class="w-full p-2 border border-gray-300 rounded-md">
              </div>
              <div class="flex items-center space-x-2">
                <div>
                  <label class="block mb-1">Width</label>
                  <input type="number" .value=${this.imageWidth} @input=${this.handleWidthInput} class="w-full p-2 border border-gray-300 rounded-md">
                </div>
                <div>
                  <label class="block mb-1">Height</label>
                  <input type="number" .value=${this.imageHeight} @input=${this.handleHeightInput} class="w-full p-2 border border-gray-300 rounded-md">
                </div>
                <button @click=${() => this.isRatioLocked = !this.isRatioLocked} class="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">
                  ${this.isRatioLocked ? "Unlock" : "Lock"}
                </button>
              </div>
            </div>
            <div class="mt-6 flex justify-end space-x-2">
              <button @click=${() => this.isImageDialogOpen = false} class="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">Cancel</button>
              <button @click=${this.insertImage} class="p-2 rounded-md bg-blue-500 text-white hover:bg-blue-600">Insert</button>
            </div>
          </div>
        </div>
      ` : ''}

      ${this.isMediaDialogOpen ? html`
        <div class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-20">
          <div class="bg-white dark:bg-gray-800 p-6 rounded-md shadow-lg w-full max-w-lg">
            <h2 class="text-lg font-bold mb-4">Insert Media</h2>
            <div class="space-y-4">
              <div>
                <label class="block mb-1">Source URL</label>
                <input type="text" .value=${this.imageUrl} @input=${this.handleImageUrlInput} class="w-full p-2 border border-gray-300 rounded-md">
              </div>
              <div class="flex items-center space-x-2">
                <div>
                  <label class="block mb-1">Width</label>
                  <input type="number" .value=${this.imageWidth} @input=${this.handleWidthInput} class="w-full p-2 border border-gray-300 rounded-md">
                </div>
                <div>
                  <label class="block mb-1">Height</label>
                  <input type="number" .value=${this.imageHeight} @input=${this.handleHeightInput} class="w-full p-2 border border-gray-300 rounded-md">
                </div>
              </div>
            </div>
            <div class="mt-6 flex justify-end space-x-2">
              <button @click=${() => this.isMediaDialogOpen = false} class="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">Cancel</button>
              <button @click=${this.insertMedia} class="p-2 rounded-md bg-blue-500 text-white hover:bg-blue-600">Insert</button>
            </div>
          </div>
        </div>
      ` : ''}
    </header>`
  }

  handleImageUrlInput(e: Event) {
    const target = e.target as HTMLInputElement;
    this.imageUrl = target.value;
    if (target.value.startsWith('http')) {
      const img = new Image();
      img.onload = () => {
        this.originalImageRatio = img.width / img.height;
        this.imageWidth = img.width.toString();
        this.imageHeight = img.height.toString();
        this.requestUpdate();
      };
      img.src = target.value;
    }
  }

  handleWidthInput(e: Event) {
    const width = (e.target as HTMLInputElement).value;
    this.imageWidth = width;
    if (this.isRatioLocked && this.originalImageRatio) {
      this.imageHeight = Math.round(parseInt(width) / this.originalImageRatio).toString();
    }
    this.requestUpdate();
  }

  handleHeightInput(e: Event) {
    const height = (e.target as HTMLInputElement).value;
    this.imageHeight = height;
    if (this.isRatioLocked && this.originalImageRatio) {
      this.imageWidth = Math.round(parseInt(height) * this.originalImageRatio).toString();
    }
    this.requestUpdate();
  }

  insertImage() {
    if (this.imageUrl) {
      const img = `<img src="${this.imageUrl}" alt="${this.imageAlt}" width="${this.imageWidth}" height="${this.imageHeight}">`;
      editorCommand("insertHTML", img);
      this.isImageDialogOpen = false;
      this.imageUrl = '';
      this.imageAlt = '';
      this.imageWidth = '';
      this.imageHeight = '';
    }
  }

  insertMedia() {
    if (this.imageUrl) {
      const video = `<video src="${this.imageUrl}" width="${this.imageWidth}" height="${this.imageHeight}" controls></video>`;
      editorCommand("insertHTML", video);
      this.isMediaDialogOpen = false;
      this.imageUrl = '';
      this.imageWidth = '';
      this.imageHeight = '';
    }
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