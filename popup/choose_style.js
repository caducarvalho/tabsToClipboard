class ClipboardCopierController {
  constructor(id) {
    this.clipboardForm = document.getElementById(id.clipboardForm);
    this.allTabsOption = document.getElementById(id.allTabsOption);
    this.itemSelectorBox = document.getElementById(id.itemSelectorBox);
    this.itemSelectorList = document.getElementById(id.itemSelectorList);
    this.includeTitleOption = document.getElementById(id.includeTitleOption);
    this.allTabs = this.allTabsOption.checked;
    this.includeTitle = this.includeTitleOption.checked;

    this.init = this.init.bind(this);
    this.events = this.events.bind(this);
    this.onError = this.onError.bind(this);
    this.copyTabs = this.copyTabs.bind(this);
    this.buildString = this.buildString.bind(this);
    this.registerTabs = this.registerTabs.bind(this);
    this.getTabsQuery = this.getTabsQuery.bind(this);
    this.buildItemsList = this.buildItemsList.bind(this);
  }

  init() {
    this.events();
  }

  events() {
    this.clipboardForm.addEventListener('submit', this.copyTabs);
    this.allTabsOption.addEventListener('change', this.buildItemsList);
    this.includeTitleOption.addEventListener('change', ({ target }) => this.includeTitle = target.checked);
  }

  buildItemsList(e) {
    this.allTabs = e.target.checked;

    if (this.allTabs) {
      if (this.itemSelectorList) this.itemSelectorList.remove();
      this.itemSelectorList = undefined;
    } else {
      if (!this.itemSelectorList) {
        this.itemSelectorList = document.createElement('ul');
        this.itemSelectorList.setAttribute('id', 'item-selector-list');
        this.itemSelectorBox.append(this.itemSelectorList);
      }

      browser.tabs.query({}).then((tabs) => {
        for (const tab of tabs) {
          const newTabItem = document.createElement('li');
          const newTabItemLabel = document.createElement('label');
          const newTabItemSpan = document.createElement('span');
          const newTabItemInput = document.createElement('input');

          newTabItemInput.setAttribute('type', 'checkbox');
          newTabItemInput.setAttribute('name', 'itemCollectionTab');
          newTabItemInput.setAttribute('data-url', tab.url);
          newTabItemInput.setAttribute('data-title', tab.title);
          newTabItemInput.setAttribute('checked', true);
          newTabItemInput.classList.add('tab-option');

          newTabItemSpan.innerText = tab.title;

          newTabItemLabel.append(newTabItemInput);
          newTabItemLabel.append(newTabItemSpan);
          newTabItem.append(newTabItemLabel);
          this.itemSelectorList.append(newTabItem);
        }
      }, this.onError);
    }
  }

  getSeparator(item, type) {
    switch (type) {
      case 'option-simple-quotes':
        return `'${item}'`;
      case 'option-double-quotes':
        return `"${item}"`;
      case 'option-smart-quotes':
        return `“${item}”`;
      case 'option-backtick-quotes':
        return `\`${item}\``;
      default:
        return item;
    }
  }

  buildString(arr, type) {
    switch (type) {
      case 'option-simple-line':
        return arr.join('\n');
      case 'option-double-line':
        return arr.join('\n\n');
      case 'option-comma':
        return arr.join(',');
      case 'option-spaced-comma':
        return arr.join(', ');
      case 'option-space':
        return arr.join(' ');
      case 'option-array':
        return `[${arr.join(', ')}]`;
      case 'option-php-array':
        return `array(${arr.join(', ')})`;
      case 'option-html-ul':
        return `<ul>\n\ \ <li>${arr.join(`</li>\n\ \ <li>`)}</li>\n</ul>`;
      case 'option-html-ol':
        return `<ol>\n\ \ <li>${arr.join(`</li>\n\ \ <li>`)}</li>\n</ol>`;
      default:
        return false;
    }
  }

  registerTabs(tabs) {
    const option = document.querySelector('.item-option:checked');
    const separator = document.querySelector('.quote-option:checked');
    const activeTabs = [];

    for (const tab of tabs) {
      activeTabs.push(this.getSeparator(this.includeTitleOption.checked === true ? `${tab.title} (${tab.url})` : tab.url, separator.id));
    }

    console.log(this.buildString(activeTabs, option.id));
    if (navigator.clipboard) navigator.clipboard.writeText(this.buildString(activeTabs, option.id));
  }

  getTabsQuery() {
    if (this.itemSelectorList) {
      const selectedInputs = document.querySelectorAll('.tab-option:checked');
      const selectedTabs = [];

      for (const input of selectedInputs) selectedTabs.push({ url: input.getAttribute('data-url'), title: input.getAttribute('data-title')});
      console.log(selectedTabs);
      return selectedTabs;
    }
  }

  copyTabs(e) {
    e.preventDefault();

    if (this.allTabs)
      browser.tabs.query({}).then(this.registerTabs, this.onError);
    else
      this.registerTabs(this.getTabsQuery());

    window.close();
  }

  onError(error) {
    console.error(`Error: ${error}`);
  }
};

const clipboardCopier = new ClipboardCopierController({
  clipboardForm: 'clipboard-form',
  withQuotesOption: 'option-quotes',
  allTabsOption: 'option-all-tabs',
  itemSelectorBox: 'item-selector-box',
  itemSelectorList: 'item-selector-list',
  includeTitleOption: 'option-include-title'
});

clipboardCopier.init();

/*

Debugging - Runtime / this-firefox (about:debugging#/runtime/this-firefox)

16,456 clipboard icons - Iconfinder (https://www.iconfinder.com/search?q=clipboard)

firefox extension browser_action at DuckDuckGo (https://duckduckgo.com/?q=firefox+extension+browser_action&t=ffab&ia=web)

firefox extension icon dark mode not working - Pesquisa Google (https://www.google.com/search?q=firefox+extension+icon+dark+mode+not+working&sxsrf=AJOqlzUA9fKeB_xzSQf6ItgKvnoseXn7Qw%3A1678162486347&ei=NroGZNPeFJGjptQPr8SJ8AM&oq=firefox+extension+icon+dark+mode+nopt&gs_lcp=Cgxnd3Mtd2l6LXNlcnAQAxgAMgcIIRCgARAKMgcIIRCgARAKMgcIIRCgARAKOgoIABBHENYEELADOgUIIRCgAToICCEQFhAeEB06BAghEBVKBAhBGABQlgRYtw1g-xNoAnABeACAAb4BiAGcBpIBAzAuNpgBAKABAcgBCMABAQ&sclient=gws-wiz-serp)

How to correctly design/color icon to be visible across themes? - Add-ons / Development - Mozilla Discourse (https://discourse.mozilla.org/t/how-to-correctly-design-color-icon-to-be-visible-across-themes/27713/5)

action - Mozilla | MDN (https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/action)

action - Mozilla | MDN (https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/action#choosing_icon_sizes)

browser/content/extension.css (chrome://browser/content/extension.css)

*/