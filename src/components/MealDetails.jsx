import React from 'react';
import PropTypes from 'prop-types';

function MealDetails({
  strMealThumb, strMeal, strCategory,
  recipeIngredients, recipeMeasures, strInstructions, strYoutube, imgClass,
}) {
  return (
    <>
      <section className="img-title">
        <img
          src={ strMealThumb }
          alt={ strMeal }
          data-testid="recipe-photo"
          className={ imgClass }
        />
        <h2 data-testid="recipe-title" className="recipe-title">{ strMeal }</h2>
      </section>
      <h3 data-testid="recipe-category" className="recipe-category">{ strCategory }</h3>
      <hr />
      <section className="ingredients">
        <h3>Ingredients</h3>
        <ul className="ingredients-list">
          { recipeIngredients.map((ingredient, index) => {
            const measure = recipeMeasures[index];
            if (!ingredient) return null;
            return (
              <li data-testid={ `${index}-ingredient-name-and-measure` } key={ index }>
                {ingredient}
                {measure ? ` - ${measure}` : ''}
              </li>
            );
          })}
        </ul>
      </section>
      <section className="instructions">
        <h3>Instructions</h3>
        <p data-testid="instructions">{ strInstructions }</p>
      </section>
      <section className="video">
        <h3>Video</h3>
        <iframe
          title="Recipe"
          width="280px"
          data-testid="video"
          allowFullScreen
          src={ strYoutube }
        />
      </section>
    </>
  );
}

MealDetails.propTypes = {
  strMealThumb: PropTypes.string.isRequired,
  strMeal: PropTypes.string.isRequired,
  strCategory: PropTypes.string.isRequired,
  strYoutube: PropTypes.string.isRequired,
  recipeIngredients: PropTypes.arrayOf(PropTypes.string).isRequired,
  recipeMeasures: PropTypes.arrayOf(PropTypes.string).isRequired,
  strInstructions: PropTypes.string.isRequired,
  imgClass: PropTypes.string.isRequired,
};

export default MealDetails;
