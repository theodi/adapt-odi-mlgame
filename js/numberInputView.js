import QuestionView from 'core/js/views/questionView';
class NumberInputView extends QuestionView {
  events() {
    return {
      "focus .js-numberinput-numberbox": "clearValidationError",
      "change .js-numberinput-numberbox": "onInputChanged",
      "keyup .js-numberinput-numberbox": "onInputChanged",
    };
  }

  setupQuestion() {
    this.model.setupRandomisation();
  }

  disableQuestion() {
    this.setAllItemsEnabled(false);
  }

  enableQuestion() {
    this.setAllItemsEnabled(true);
  }

  setAllItemsEnabled(isEnabled) {
    this.model.get("_items").forEach((item, index) => {
      const $itemInput = this.$(".js-numberinput-numberbox").eq(index);

      $itemInput.prop("disabled", !isEnabled);
    });
  }

  onQuestionRendered() {
    this.setReadyStatus();
  }

  clearValidationError() {
    this.$(".js-numberinput-numberbox").removeClass("has-error");
  }

  // Blank method for question to fill out when the question cannot be submitted
  onCannotSubmit() {
    this.showValidationError();
  }

  showValidationError() {
    this.$(".js-numberinput-numberbox").addClass("has-error");
  }

  // This is important and should give the user feedback on how they answered the question
  // Normally done through ticks and crosses by adding classes
  showMarking() {
    if (!this.model.get("_canShowMarking")) return;

    this.model.get("_items").forEach((item, i) => {
      const $item = this.$(".js-numberinput-item").eq(i);
      $item
        .removeClass("is-correct is-incorrect")
        .addClass(item._isCorrect ? "is-correct" : "is-incorrect");
    });
  }

  // Used by the question view to reset the look and feel of the component.
  resetQuestion() {
    this.$(".js-numberinput-numberbox")
      .prop("disabled", !this.model.get("_isEnabled"))
      .val("");

    this.model.set({
      _isAtLeastOneCorrectSelection: false,
      _isCorrect: undefined,
    });
  }

  showCorrectAnswer() {
    const correctAnswers = this.model.get("_answers");

    this.model.get("_items").forEach((item, index) => {
      const correctAnswer = correctAnswers
        ? correctAnswers[index][0]
        : item._answers[0];
      this.$(".js-numberinput-numberbox").eq(index).val(correctAnswer);
    });
  }

  hideCorrectAnswer() {
    this.model.get("_items").forEach((item, index) => {
      this.$(".js-numberinput-numberbox").eq(index).val(item.userAnswer);
    });
  }

  onInputChanged(e) {
    const $input = $(e.target);
    const inputVal = $input.val();

    // Check if the input value is a number
    if (inputVal !== "" && !$.isNumeric(inputVal)) {
      // If not a number, clear the input and optionally show an error
      $input.val("");
      this.showValidationError("Please enter a valid number.");
    } else {
      // If it's a number, update the model with the user's answer
      this.model.setItemUserAnswer(
        $input.parents(".js-numberinput-item").index(),
        inputVal
      );
    }
  }
}

NumberInputView.template = 'numberinput.jsx';

export default NumberInputView;
