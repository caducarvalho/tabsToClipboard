var browser = browser || chrome;

class ClipboardCopierController {
  constructor(id) {
    this.submitButton = document.getElementById(id.submitButton);
    this.clipboardForm = document.getElementById(id.clipboardForm);
    this.allTabsOption = document.getElementById(id.allTabsOption);
    this.itemSelectorBox = document.getElementById(id.itemSelectorBox);
    this.itemSelectorList = document.getElementById(id.itemSelectorList);
    this.separationTogglerButton = document.getElementById(id.separationTogglerButton);
    this.quotesTogglerButton = document.getElementById(id.quotesTogglerButton);
    this.styleTogglerButton = document.getElementById(id.styleTogglerButton);
    this.allTabs = this.allTabsOption.checked;

    this.currentTabs = browser.tabs.query({ currentWindow: true });

    this.init = this.init.bind(this);
    this.events = this.events.bind(this);
    this.toggler = this.toggler.bind(this);
    this.onError = this.onError.bind(this);
    this.copyTabs = this.copyTabs.bind(this);
    this.buildString = this.buildString.bind(this);
    this.closeWindow = this.closeWindow.bind(this);
    this.registerTabs = this.registerTabs.bind(this);
    this.getTabsQuery = this.getTabsQuery.bind(this);
    this.buildItemsList = this.buildItemsList.bind(this);
    this.checkPreviousOptions = this.checkPreviousOptions.bind(this);
  }

  init() {
    this.events();
  }

  events() {
    this.checkPreviousOptions();

    this.clipboardForm.addEventListener('submit', this.copyTabs);
    this.allTabsOption.addEventListener('change', this.buildItemsList);
    this.separationTogglerButton.addEventListener('mousedown', this.toggler);
    this.quotesTogglerButton.addEventListener('mousedown', this.toggler);
    this.styleTogglerButton.addEventListener('mousedown', this.toggler);
  }

  checkPreviousOptions() {
    if (browser.storage && browser.storage.sync) {
      browser.storage.sync.get(['separationOption', 'quotesOption', 'styleOption']).then((res) => {
        for (const key in res) {
          document.getElementById(res[key]).checked = true;
        }
      });
    }
  }

  toggler(e) {
    const boxToCollapse = document.getElementById(e.target.dataset.refersTo);

    boxToCollapse.classList.toggle('closed');
    e.target.classList.toggle('closed');
    e.target.classList.toggle('open');
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

      this.currentTabs.then((tabs) => {
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

  wrapInQuotes(item, type) {
    switch (type) {
      case 'option-single-quotes':
        return `'${item}'`;
      case 'option-double-quotes':
        return `"${item}"`;
      case 'option-backtick-quotes':
        return `\`${item}\``;
      case 'option-single-curly-quotes':
        return `‘${item}’`;
      case 'option-double-curly-quotes':
        return `“${item}”`;
      case 'option-german-quotes':
        return `„${item}“`;
      case 'option-polish-quotes':
        return `„${item}”`;
      case 'option-scandinavian-quotes':
        return `”${item}”`;
      case 'option-single-guillemets':
        return `‹${item}›`;
      case 'option-double-guillemets':
        return `«${item}»`;
      case 'option-french-guillemets':
        return `« ${item} »`;
      case 'option-danish-guillemets':
        return `»${item}«`;
      case 'option-scandinavian-guillemets':
        return `»${item}»`;
      case 'option-china-japan-quotes':
        return `「${item}」”`;
      case 'option-korean-quotes':
        return `《${item}》”`;
      default:
        return item;
    }
  }

  composeItem(url, title, type) {
    switch (type) {
      case 'option-title-url':
        return `${title} (${url})`;
      case 'option-csv-item':
        return `"${title}","${url}"`;
      case 'option-html-anchor':
        return `<a href="${url}">${title}</a>`;
      case 'option-markdown-link':
        return `[${title}](${url})`;
      default:
        return url;
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
      case 'option-markdown-ul':
        return `\-\ ${arr.join(`\n\-\ `)}`;
      case 'option-markdown-ol':
        let string = '';

        for (let i = 0; i < arr.length; i++) string += `${i + 1}. ${arr[i]}\n`;

        return string;
      default:
        return false;
    }
  }

  registerTabs(tabs) {
    const separation = document.querySelector('.item-option:checked');
    const quotes = document.querySelector('.quote-option:checked');
    const style = document.querySelector('.style-option:checked');
    const activeTabs = [];

    for (const tab of tabs) {
      activeTabs.push(this.wrapInQuotes(this.composeItem(tab.url, tab.title, style.id), quotes.id));
    }

    if (navigator.clipboard) navigator.clipboard.writeText(this.buildString(activeTabs, separation.id));

    if (browser.storage && browser.storage.sync) browser.storage.sync.set({
      separationOption: separation.id,
      quotesOption: quotes.id,
      styleOption: style.id
    });
  }

  getTabsQuery() {
    if (this.itemSelectorList) {
      const selectedInputs = document.querySelectorAll('.tab-option:checked');
      const selectedTabs = [];

      for (const input of selectedInputs) selectedTabs.push({ url: input.getAttribute('data-url'), title: input.getAttribute('data-title')});

      return selectedTabs;
    }
  }

  copyTabs(e) {
    e.preventDefault();

    if (this.allTabs) {
      this.currentTabs.then(this.registerTabs, this.onError);
    } else {
      this.registerTabs(this.getTabsQuery());
    }

    this.closeWindow();
  }
  
  closeWindow() {
    this.submitButton.disabled = true;
    this.submitButton.innerText = 'Copied to clipboard!'

    setTimeout(window.close, 500);
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
  includeTitleOption: 'option-include-title',
  submitButton: 'submit-button',
  separationTogglerButton: 'separation-options-box-toggler',
  quotesTogglerButton: 'quotes-options-box-toggler',
  styleTogglerButton: 'style-options-box-toggler'
});

clipboardCopier.init();
