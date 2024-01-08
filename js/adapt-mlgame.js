import components from 'core/js/components';
import mlGameView from './mlGameView';
import mlGameModel from './mlGameModel';

export default components.register('mlgame', {
  view: mlGameView,
  model: mlGameModel
});
