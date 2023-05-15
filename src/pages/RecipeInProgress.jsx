import React, { useContext, useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Header from '../components/Header';
import { RecipeDetailsContext } from '../context/RecipeDetailsProvider';
import './RecipeInProgress.css';
import blackHeartIcon from '../images/blackHeartIcon.svg';
import whiteHeartIcon from '../images/whiteHeartIcon.svg';
import shareIcon from '../images/shareIcon.svg';

const copy = require('clipboard-copy');

function RecipesInProgress() {
  const {
    currentRecipe, setCurrentRecipe, fetchApi,
    setRecipeIngredients, recipeIngredients, setRecipeMeasures, recipeMeasures,
  } = useContext(RecipeDetailsContext);

  const { location: { pathname } } = useHistory();
  const history = useHistory();

  const id = pathname.split('/')[2];
  const recipeType = pathname.split('/')[1];

  const [checkedIngredients, setCheckedIngredients] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showLinkCopied, setShowLinkCopied] = useState(false);

  const verifyFavoriteInStorage = useCallback((currRecipe) => {
    if (localStorage.getItem('favoriteRecipes')) {
      const favoriteRecipesStorage = JSON.parse(localStorage.getItem('favoriteRecipes'));
      const check = favoriteRecipesStorage
        .some((e) => e.id === currRecipe.idDrink || currRecipe.idMeal);
      setIsFavorite(check);
    }
  }, []);

  const getRecipeDetails = useCallback(async () => {
    let API_URL;
    const PATHNAME_PAGE = pathname.split('/')[1];
    const PATHNAME_ID = pathname.split('/')[2];
    if (PATHNAME_PAGE === 'meals') {
      API_URL = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${PATHNAME_ID}`;
    } else {
      API_URL = `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${PATHNAME_ID}`;
    }
    const response = await fetchApi(API_URL);
    const recipeDetails = response.meals || response.drinks;
    verifyFavoriteInStorage(recipeDetails[0]);
    setCurrentRecipe(recipeDetails);

    const recipeEntries = Object.entries(recipeDetails[0]);

    const ingredients = recipeEntries
      .filter(([key, value]) => key.includes('strIngredient') && value)
      .map((item) => item[1]);

    const measures = recipeEntries
      .filter(([key, value]) => key.includes('strMeasure') && value)
      .map((item) => item[1]);

    setRecipeIngredients(ingredients);
    setRecipeMeasures(measures);
  }, [fetchApi, pathname,
    setCurrentRecipe, setRecipeIngredients, setRecipeMeasures, verifyFavoriteInStorage]);

  const getLocalStorageIngredients = () => {
    if (localStorage.getItem('inProgressRecipes')) {
      const storageArray = JSON.parse(localStorage.getItem('inProgressRecipes'));
      setCheckedIngredients(storageArray[recipeType][id]);
    }
  };

  const handleFavoriteClick = (item) => {
    const recipeInfo = {
      id: item.idMeal || item.idDrink,
      type: item.idMeal ? 'meal' : 'drink',
      nationality: item.strArea || '',
      category: item.strCategory,
      alcoholicOrNot: item.strAlcoholic || '',
      name: item.strMeal || item.strDrink,
      image: item.strMealThumb || item.strDrinkThumb,
    };
    if (localStorage.getItem('favoriteRecipes')) {
      const favoriteRecipesStorage = JSON.parse(localStorage.getItem('favoriteRecipes'));
      if (favoriteRecipesStorage.some((e) => e.id === recipeInfo.id)) {
        const filtered = favoriteRecipesStorage.filter((e) => e.id !== recipeInfo.id);
        localStorage.setItem('favoriteRecipes', JSON.stringify(filtered));
        verifyFavoriteInStorage(item);
        return;
      }
      localStorage.setItem(
        'favoriteRecipes',
        JSON.stringify([...favoriteRecipesStorage, recipeInfo]),
      );
      verifyFavoriteInStorage(item);
      return;
    }
    localStorage.setItem('favoriteRecipes', JSON.stringify([recipeInfo]));
    verifyFavoriteInStorage(item);
  };

  const handleShareClick = () => {
    setShowLinkCopied(true);
    const path = window.location.href;
    const link = path.split('/').filter((e, i, arr) => i !== arr.length - 1);
    copy(link.join('/'));
  };

  const handleFinishRecipe = (item) => {
    const date = new Date();
    const recipeInfo = {
      id: item.idMeal || item.idDrink,
      type: item.idMeal ? 'meal' : 'drink',
      nationality: item.strArea || '',
      category: item.strCategory,
      alcoholicOrNot: item.strAlcoholic || '',
      name: item.strMeal || item.strDrink,
      image: item.strMealThumb || item.strDrinkThumb,
      doneDate: date.toISOString(),
      tags: item.strTags ? item.strTags.split(',') : [],
    };

    if (localStorage.getItem('doneRecipes')) {
      const doneRecipesStorage = JSON.parse(localStorage.getItem('doneRecipes'));
      if (doneRecipesStorage.some((e) => e.id === recipeInfo.id)) {
        const filtered = doneRecipesStorage.filter((e) => e.id !== recipeInfo.id);
        localStorage.setItem('doneRecipes', JSON.stringify(filtered));
        return;
      }
      localStorage.setItem(
        'doneRecipes',
        JSON.stringify([...doneRecipesStorage, recipeInfo]),
      );
      return;
    }
    localStorage.setItem('doneRecipes', JSON.stringify([recipeInfo]));
    history.push('/done-recipes');
  };

  useEffect(() => {
    getRecipeDetails();
    getLocalStorageIngredients();
  }, []);

  const handleIngredientToggle = (event, ingred) => {
    if (event.target.checked) {
      setCheckedIngredients([...checkedIngredients, ingred]);
      return;
    }
    setCheckedIngredients(checkedIngredients.filter((e) => e !== ingred));
  };

  useEffect(() => {
    let template;
    if (localStorage.getItem('inProgressRecipes')) {
      const data = JSON.parse(localStorage.getItem('inProgressRecipes'));

      if (recipeType === 'drinks') {
        template = {
          drinks: {
            ...data.drinks, [id]: checkedIngredients,
          },
          meals: {
            ...data.meals,
          },
        };
        localStorage.setItem(
          'inProgressRecipes',
          JSON.stringify(template),
        );
      } else {
        template = {
          drinks: {
            ...data.drinks,
          },
          meals: {
            ...data.meals, [id]: checkedIngredients,
          },
        };
        localStorage.setItem(
          'inProgressRecipes',
          JSON.stringify(template),
        );
      }
    } else {
      template = {
        [recipeType]: {
          [id]: checkedIngredients,
        },
      };
    }
    localStorage.setItem(
      'inProgressRecipes',
      JSON.stringify(template),
    );
  }, [checkedIngredients]);

  return (
    <div>
      <Header />
      {pathname.includes('meals')
        ? (
          <section>
            {currentRecipe.map((meal) => (
              <section key={ meal.idMeal }>
                <img
                  src={ meal.strMealThumb }
                  alt={ meal.strMealThumb }
                  data-testid="recipe-photo"
                  width={ 260 }
                />
                <h2 data-testid="recipe-title">{meal.strMeal}</h2>
                <h3 data-testid="recipe-category">{meal.strCategory}</h3>
                <div>
                  {recipeIngredients.map((ing, index) => (
                    <label
                      key={ index }
                      data-testid={ `${index}-ingredient-step` }
                      htmlFor="ingredient"
                      className={ checkedIngredients.includes(ing) ? 'checked' : '' }
                    >
                      {`${recipeMeasures[index]} ${ing}`}
                      <input
                        type="checkbox"
                        value={ ing }
                        id="check"
                        checked={ checkedIngredients.includes(ing) }
                        onChange={ (event) => handleIngredientToggle(event, ing) }
                      />
                    </label>
                  ))}
                </div>
                <span data-testid="instructions">{meal.strInstructions}</span>
              </section>
            ))}
          </section>)
        : (
          <section>
            {currentRecipe.map((drink) => (
              <section key={ drink.idDrink }>
                <img
                  src={ drink.strDrinkThumb }
                  alt={ drink.strDrink }
                  data-testid="recipe-photo"
                  width={ 260 }
                />
                <h2 data-testid="recipe-title">{drink.strDrink}</h2>
                <h3 data-testid="recipe-category">
                  {drink.strCategory}
                  <span data-testid="instructions">{drink.strInstructions}</span>
                  {' '}
                  {drink.strAlcoholic}
                </h3>
                <div>
                  {recipeIngredients.map((ing, index) => (
                    <label
                      key={ index }
                      data-testid={ `${index}-ingredient-step` }
                      htmlFor="ingredient"
                      className={ checkedIngredients.includes(ing) ? 'checked' : '' }
                    >
                      {`${recipeMeasures[index]} ${ing}`}
                      <input
                        type="checkbox"
                        value={ ing }
                        id="check"
                        checked={ checkedIngredients.includes(ing) }
                        onChange={ (event) => handleIngredientToggle(event, ing) }
                      />
                    </label>
                  ))}
                </div>
                <span data-testid="instructions">{drink.strInstructions}</span>
              </section>
            ))}
          </section>)}
      <button data-testid="share-btn" onClick={ handleShareClick }>
        <img src={ shareIcon } alt="share icon" />
      </button>
      {showLinkCopied && <small>Link copied!</small>}
      <button
        onClick={ () => handleFavoriteClick(currentRecipe[0]) }
      >
        <img
          src={ isFavorite ? blackHeartIcon : whiteHeartIcon }
          data-testid="favorite-btn"
          alt="favorite icon"
        />
      </button>
      <button
        data-testid="finish-recipe-btn"
        disabled={ checkedIngredients.length !== recipeIngredients.length }
        onClick={ () => handleFinishRecipe(currentRecipe[0]) }
      >
        Finalizar
      </button>
    </div>
  );
}

export default RecipesInProgress;
