// src/ui.ts

import { Modal, Setting, App } from "obsidian";

/** Modal that prompts the user to enter a Coursera course URL before importing. */
export class UrlPromptModal extends Modal {
  private url = "";

  constructor(app: App, private onSubmit: (url: string) => void) {
    super(app);
  }

  onOpen() {
    const { contentEl } = this;
    new Setting(contentEl).setName("Import Course from URL").setHeading();

    new Setting(contentEl)
      .setName("Course URL")
      .setDesc("Paste the full URL of a Coursera course.")
      .addText((text) =>
        text
          .setPlaceholder("https://www.coursera.org/learn/…")
          .onChange((val) => (this.url = val))
      );

    new Setting(contentEl).addButton((btn) =>
      btn
        .setButtonText("Import")
        .setCta()
        .onClick(() => {
          this.close();
          this.onSubmit(this.url);
        })
    );
  }

  onClose() {
    this.contentEl.empty();
  }
}
