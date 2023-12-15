import QuestionView from "core/js/views/questionView";
class NumberInputView extends QuestionView {
  initialize() {
    super.initialize();
    this.listenTo(this.model, "scoreUpdated", this.updateScoreInInputs);
    this.listenTo(this.model, "noScoreAvailable", this.renderGameLink);
  }

  updateScoreInInputs(score) {
    this.model.get("_items").forEach((item, index) => {
      item.userAnswer = score;

      const $input = this.$(`.js-numberinput-numberbox:eq(${index})`);
      $input.val(score);

      this.model.setItemUserAnswer(index, score);
    });
  }
  events() {
    return {
      "focus .js-numberinput-numberbox": "clearValidationError",
      "change .js-numberinput-numberbox": "onInputChanged",
      "keyup .js-numberinput-numberbox": "onInputChanged",
    };
  }

  renderGameLink() {
    const gameLink = this.model.get("_gameLink");
    if (gameLink) {
      this.$(".game-link-container").html(
        `<div> <span>No score found</span> <a href="${gameLink}" target="_blank">Play the Game</a><span> to receive a score</span></div>`
      );
    }
  }

  onQuestionPreRender() {
    const presetScore = this.model.get("_score");
    this.model.get("_items").forEach((item) => {
      item.userAnswer = presetScore;
    });
  }

  updateInputFieldsWithPresetScore() {
    const presetScore = this.model.get("_score");
    this.model.get("_items").forEach((item, index) => {
      const $input = this.$(`.js-numberinput-numberbox:eq(${index})`);
      $input.val(presetScore);
    });
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
    super.onQuestionRendered();
    this.updateInputFieldsWithPresetScore();
    this.setReadyStatus();
  }

  updateInputFieldsWithPresetScore() {
    const presetScore = this.model.get("_score");
    this.model.get("_items").forEach((item, index) => {
      const $input = this.$(`.js-numberinput-numberbox:eq(${index})`);
      $input.val(presetScore);
    });
  }

  clearValidationError() {
    this.$(".js-numberinput-numberbox").removeClass("has-error");
  }

  onCannotSubmit() {
    this.showValidationError();
  }

  showValidationError() {
    this.$(".js-numberinput-numberbox").addClass("has-error");
  }

  showMarking() {
    if (!this.model.get("_canShowMarking")) return;

    this.model.get("_items").forEach((item, i) => {
      const $item = this.$(".js-numberinput-item").eq(i);
      $item
        .removeClass("is-correct is-incorrect")
        .addClass(item._isCorrect ? "is-correct" : "is-incorrect");
    });
  }

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
    const index = $input.parents(".js-numberinput-item").index();

    if (inputVal !== "" && !$.isNumeric(inputVal)) {
      $input.val("");
      this.showValidationError("Please enter a valid number.");
    } else {
      this.model.setItemUserAnswer(index, inputVal);
    }
  }
}

NumberInputView.template = "numberinput.jsx";

export default NumberInputView;
