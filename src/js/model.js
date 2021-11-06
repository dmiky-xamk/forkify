import {async} from "regenerator-runtime";
import {API_URL, RES_PER_PAGE, KEY} from "./config.js";
// import {getJSON, sendJSON} from "./helpers.js";
import {AJAX} from "./helpers.js";

// * Contains all the data we need for the application
export const state =
{
    recipe: {},
    search:
    {
        query: "",
        results: [],
        page: 1,
        resultsPerPage: RES_PER_PAGE
    },
    bookmarks: [],
};

const createRecipeObject = function(data)
{
    // ? Otetaan data ja tehdään siitä uusi olio camelCase nimillä
    const {recipe} = data.data;

    return {
        id: recipe.id,
        title: recipe.title,
        publisher: recipe.publisher,
        sourceUrl: recipe.source_url,
        image: recipe.image_url,
        servings: recipe.servings,
        cookingTime: recipe.cooking_time,
        ingredients: recipe.ingredients,

        // * Conditional property add to an object
        // * Jos recipe.key on olemassa, suoritetaan toinen osa ja spreadataan se jotta saadaan key: recipe.key
        ...(recipe.key && {key: recipe.key})
    };
};

// ? Responsible for fetching the data
// * Ei palauta mitään sillä täällä muokattu state on muokattu myös controller.js
export const loadRecipe = async function(id)
{
    try
    {
        // * AJAX sisältää error handlerin
        const data = await AJAX(`${API_URL}${id}?key=${KEY}`);

        state.recipe = createRecipeObject(data);

        // * Lisätään bookmark tieto kaikkiin resepteihin heti alussa
        state.bookmarks.some((bookmark) => bookmark.id === id)
            ? state.recipe.bookmarked = true
            : state.recipe.bookmarked = false;
    }

    catch (err)
    {
        // * Promise rejectaa kun throwataan error, muuten ei
        throw err;
    }
};

export const loadSearchResults = async function(query)
{
    try
    {
        state.search.query = query;

        const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);

        state.search.results = data.data.recipes.map((rec) =>
        {
            return {
                id: rec.id,
                image: rec.image_url,
                publisher: rec.publisher,
                title: rec.title,
                ...(rec.key && {key: rec.key})
            };
        });

        state.search.page = 1;
    }

    catch (err)
    {
        throw err;
    }
};

export const getSearchResultsPage = function(page = state.search.page)
{
    state.search.page = page;

    const start = (page - 1) * state.search.resultsPerPage;
    const end = page * state.search.resultsPerPage;

    return state.search.results.slice(start, end);
};

export const updateServings = function(newServings)
{
    state.recipe.ingredients.forEach(function(ing)
    {
        ing.quantity = ing.quantity * newServings / state.recipe.servings;
        // newQt = oldQt * newServings / oldServings
    });

    state.recipe.servings = newServings;
};

const persistBookmarks = function()
{
    localStorage.setItem("bookmarks", JSON.stringify(state.bookmarks));
};

// ? Lisääminen toimii yleensä kokonaisella objektilla
export const addBookmark = function(recipe)
{
    // Add bookmark
    state.bookmarks.push(recipe);
    console.log(state.bookmarks);

    // Mark current recipe as bookmark
    if (recipe.id === state.recipe.id)
    {
        state.recipe.bookmarked = true;
    }

    persistBookmarks();
};

// ? Delete toimii yleensä pelkällä id
export const deleteBookmark = function(id)
{
    // Delete bookmark
    const index = state.bookmarks.findIndex((el) => el.id === id);
    console.log(index);
    state.bookmarks.splice(index, 1);

    if (id === state.recipe.id)
    {
        state.recipe.bookmarked = false;
    }

    persistBookmarks();
};

const init = function()
{
    const storage = localStorage.getItem("bookmarks");
    if (!storage) return;

    state.bookmarks = JSON.parse(storage);
};
init();

// DEBUG
const clearBookmarks = function()
{
    localStorage.clear("bookmarks");
};
// clearBookmarks();

export const uploadRecipe = async function(newRecipe)
{
    try
    {
        const ingredients = Object.entries(newRecipe)
            .filter((entry) => entry[0].startsWith("ingredient") && entry[1] !== "")
            .map((ing) =>
            {
                // const ingArr = ing[1].replaceAll(' ', '').split(",");
                const ingArr = ing[1].split(",").map((el) => el.trim());

                if (ingArr.length !== 3)
                {
                    throw new Error("Wrong ingredient format! Please use the correct format :)");
                }

                const [quantity, unit, description] = ingArr;
                return {quantity: quantity ? +quantity : null, unit, description};
            });


        // * Tehdään uusi recipe joka lähetetään API:lle
        const recipe =
        {
            title: newRecipe.title,
            source_url: newRecipe.sourceUrl,
            image_url: newRecipe.image,
            publisher: newRecipe.publisher,
            cooking_time: +newRecipe.cookingTime,
            servings: +newRecipe.servings,
            ingredients,
        };

        const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);

        // Luodaan näytettävä objekti saadusta datasta
        state.recipe = createRecipeObject(data);

        // Lisää upload kirjanmerkkeihin
        addBookmark(state.recipe);
    }

    catch (err)
    {
        throw err;
    }

};