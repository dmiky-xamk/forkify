import {mark} from "regenerator-runtime";
import icons from "url:../../img/icons.svg"; // Parcel 2

// ! Export koska tästä ei tehdä instansseja. Käytetään vain parent classina!
export default class View
{
  _data;

  _clearAndInsertHTML(markup)
  {
    this._parentElement.innerHTML = "";
    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  }

  // ? Generatee uuden markupin ja vertaa sitä vanhaan ja korvaa muuttuneet osat
  update(data)
  {
    this._data = data;
    const newMarkup = this._generateMarkup();

    // * Muuta stringi DOM elementiksi jotta voidaan verrata
    const newDOM = document.createRange().createContextualFragment(newMarkup);
    const newElements = Array.from(newDOM.querySelectorAll("*"));
    const curElements = Array.from(this._parentElement.querySelectorAll("*"));

    newElements.forEach((newEl, i) =>
    {
      const curEl = curElements[i];

      // * Update changed TEXT
      if (!newEl.isEqualNode(curEl) && newEl.firstChild?.nodeValue.trim() !== "")
      {
        curEl.textContent = newEl.textContent;
      }

      // * Updates changed ATTRIBUTES (vanhat korvataan uusilla)
      if (!newEl.isEqualNode(curEl))
      {
        Array.from(newEl.attributes)
          .forEach((attr) => curEl.setAttribute(attr.name, attr.value));
      }
    });
  }

  /**
   * Render the received object to the DOM
   * @param {Object | Object[]} data The data to be rendered (e.g. recipe)
   * @param {boolean} [render = true] If false, create markup string instead of rendering to the DOM
   * @returns {undefined | string} A markup string is returned if render = false
   * @this {Object} View instance
   * @author Mikael Kyllönen
   * @todo Finish implementation
   */
  render(data, render = true)
  {
    if (!data || Array.isArray(data) && data.length === 0)
      return this.renderError();

    this._data = data;
    const markup = this._generateMarkup();

    if (!render) return markup;

    this._clearAndInsertHTML(markup);
  }

  renderSpinner()
  {
    const markup = `
      <div class="spinner">
        <svg>
          <use href="${icons}#icon-loader"></use>
        </svg>
      </div>
        `;

    this._clearAndInsertHTML(markup);
  };

  renderError(message = this._errorMessage)
  {
    const markup =
      `
        <div class="error">
            <div>
              <svg>
                <use href="${icons}.svg#icon-alert-triangle"></use>
              </svg>
            </div>
            <p>${message}</p>
          </div>
        `;

    this._clearAndInsertHTML(markup);
  }

  renderMessage(message = this._message)
  {
    const markup =
      `
        <div class="message">
          <div>
            <svg>
              <use href="${icons}#icon-smile"></use>
            </svg>
          </div>
          <p>${message}</p>
        </div>
        `;

    this._clearAndInsertHTML(markup);
  }
}