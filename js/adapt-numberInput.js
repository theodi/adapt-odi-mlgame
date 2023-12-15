import components from 'core/js/components';
import NumberInputView from './numberInputView';
import NumberInputModel from './numberInputModel';

export default components.register('numberinput', {
  view: NumberInputView,
  model: NumberInputModel
});
