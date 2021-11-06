import * as model from "./model.js";
import {MODAL_CLOSE_SEC} from "./config.js";
import recipeView from "./views/recipeView.js";
import searchView from "./views/searchView.js";
import resultsView from "./views/resultsView.js";
import paginationView from "./views/paginationView.js";
import bookmarksView from "./views/bookmarksView.js";
import addRecipeView from "./views/addRecipeView.js";

import "core-js/stable";
import "regenerator-runtime/runtime";

// if (module.hot)
// {
//   module.hot.accept();
// }

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

const controlRecipes = async function()
{
  try
  {
    const id = window.location.hash.slice(1);

    if (!id) return;

    recipeView.renderSpinner();

    // 0) Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());

    // 1) Updating bookmarks view
    bookmarksView.update(model.state.bookmarks);

    // * 2) Loading recipe
    await model.loadRecipe(id);

    // * 3) Rendering recipe
    recipeView.render(model.state.recipe);

  }

  catch (err)
  {
    recipeView.renderError();
  }
};

const controlSearchRecipes = async function()
{
  try 
  {
    resultsView.renderSpinner();

    // 1) Get search query & clear input field
    const query = searchView.getQuery();

    if (!query) return;

    // 2) Load results
    await model.loadSearchResults(query);

    // 3) Render results per page
    resultsView.render(model.getSearchResultsPage());

    // 4) Render initial pagination buttons
    console.log("CONTROLLER:", model.state.search);
    paginationView.render(model.state.search);
  }

  catch (err) 
  {
    resultsView.renderError();
  }
};

// ? Sivunvaihdos
const controlPagination = function(goTopage)
{
  // 3) Render results after page change
  resultsView.render(model.getSearchResultsPage(goTopage));

  // 4) Render pagination buttons
  paginationView.render(model.state.search);
};

// ? Ei tehä omaa viewiä koska nämä napit on jo recipe viewssä
const controlServings = function(newServings)
{
  // 1) Update the recipe servings (in state)
  model.updateServings(newServings);

  // 2) Update text and attributes in DOM
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function()
{
  // 1) Add/remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // 2) Update recipe view
  recipeView.update(model.state.recipe);

  // 3) Render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function()
{
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function(newRecipe)
{
  try
  {
    // Show loading spinner
    addRecipeView.renderSpinner();

    // Upload the new recipe data
    await model.uploadRecipe(newRecipe);

    // Render recipe
    recipeView.render(model.state.recipe);

    // Success message
    addRecipeView.renderMessage();

    // Render bookmark view (ei update koska laitetaan kokonaan uusi elementti)
    bookmarksView.render(model.state.bookmarks);

    // Change ID in URL (without reloading the page)
    console.log(model.state.recipe.id);
    window.history.pushState(null, "", `#${model.state.recipe.id}`);

    // Close the form
    setTimeout(function()
    {
      addRecipeView._toggleWindow(); // BUG
    }, MODAL_CLOSE_SEC * 1000);
  }

  catch (err)
  {
    console.log("💥💥", err);
    addRecipeView.renderError(err.message);
  }
};

// ? Publisher Subscriber Pattern
const init = function()
{
  // * Subscribers
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchRecipes);
  paginationView.addHandlerPagination(controlPagination);
  addRecipeView.addHandlerUploadRecipe(controlAddRecipe);
  console.log("Welcome");
};
init();