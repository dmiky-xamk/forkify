import View from "./View.js";
import icons from "url:../../img/icons.svg";

class PaginationView extends View
{
    _parentElement = document.querySelector(".pagination");

    addHandlerPagination(handler)
    {
        this._parentElement.addEventListener("click", function(e)
        {
            const btn = e.target.closest(".btn--inline");

            if (!btn) return;

            const goTopage = +btn.dataset.goto;

            // * Muutetaan numeroksi
            handler(goTopage);
        });
    }

    // _data on model.state.search
    _generateMarkup()
    {
        const curPage = this._data.page;
        const numPages = Math.ceil(this._data.results.length / this._data.resultsPerPage);

        // Page 1, and there are other pages
        if (curPage === 1 && numPages > 1)
        {
            return this._generateMarkupNextPage(curPage);
        }

        // Last page
        if (curPage === numPages && numPages > 1)
        {
            return this._generateMarkupPrevPage(curPage);
        }

        // Other page
        if (curPage < numPages)
        {
            return `${this._generateMarkupPrevPage(curPage)} ${this._generateMarkupNextPage(curPage)}`;
        }

        // Page 1, and there are NO other pages
        return "";
    }

    _generateMarkupPrevPage(curPage)
    {
        return `
            <button data-goto="${curPage - 1}" class="btn--inline pagination__btn--prev">
                <svg class="search__icon">
                    <use href="${icons}#icon-arrow-left"></use>
                </svg>
                <span>Page ${curPage - 1}</span>
            </button>
            `;
    }

    _generateMarkupNextPage(curPage)
    {
        return `
            <button data-goto="${curPage + 1}" class="btn--inline pagination__btn--next">
                <span>Page ${curPage + 1}</span>
                    <svg class="search__icon">
                        <use href="${icons}#icon-arrow-right"></use>
                    </svg>
            </button>
            `;
    }
}

export default new PaginationView();