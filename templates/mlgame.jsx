import React from 'react';
import { classes, templates } from 'core/js/reactHelpers';

export default function mlgame (props) {
  const {
    _isInteractionComplete,
    _id,
    _isEnabled,
    _isCorrect,
    _shouldShowMarking,
    _globals,
    displayTitle,
    body,
    instruction,
    presetScore,
    ariaQuestion
  } = props;

  return (
    <div className="component__inner mlgame__inner">
      <templates.header {...props} />
      <div className="game-link-container"></div>
      <div className="score-container">Your score: <b className="your-score"></b></div>
      <div className="table-container"></div>
      <div className="list-container"></div>
      {/* complex unless and if combination to set the correct classes for CSS to use in showing marking and disabled states */}
      <div
        className={classes([
          "component__widget mlgame__widget",
          !_isEnabled && "is-disabled",
          _isInteractionComplete && "is-complete is-submitted show-user-answer",
          _isCorrect && "is-correct",
        ])}
        aria-labelledby={
          ariaQuestion
            ? null
            : (displayTitle || body || instruction) && `${_id}-header`
        }
        aria-label={ariaQuestion || null}
      >
        {props._items.map(
          (
            { prefix, _index, input, placeholder, userAnswer, suffix },
            index
          ) => (
            <div
              className={classes([
                "mlgame-item js-mlgame-item",
                _shouldShowMarking && _isCorrect && "is-correct",
                _shouldShowMarking && !_isCorrect && "is-incorrect",
              ])}
              key={_index}
            >
              {prefix && (
                <div className="mlgame-item__prefix-container">
                  <label
                    className="mlgame-item__prefix"
                    id={`${_id}-${index}-aria`}
                    htmlFor={`${_id}-${index}`}
                    aria-label={prefix}
                    dangerouslySetInnerHTML={{ __html: prefix }}
                  ></label>
                </div>
              )}

              <div className="mlgame-item__numberbox-container">
                <div className="mlgame-item__state">
                  <div
                    className="mlgame-item__icon mlgame-item__correct-icon"
                    aria-label={_globals._accessibility._ariaLabels.correct}
                  >
                    <div className="icon" aria-hidden="true" />
                  </div>
                  <div
                    className="mlgame-item__icon mlgame-item__incorrect-icon"
                    aria-label={_globals._accessibility._ariaLabels.incorrect}
                  >
                    <div className="icon" aria-hidden="true" />
                  </div>
                </div>
              </div>

              {suffix && (
                <div className="mlgame-item__suffix-container">
                  <label
                    className="mlgame-item__suffix"
                    id={`${_id}-${index}-aria`}
                    htmlFor={`${_id}-${index}`}
                    aria-label={suffix}
                    dangerouslySetInnerHTML={{ __html: suffix }}
                  ></label>
                </div>
              )}
            </div>
          )
        )}
        </div>

      <div className="btn__container" />
    </div>
  );

}
