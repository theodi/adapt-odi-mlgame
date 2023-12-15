# number-input

**Number Input** is a *question component* developed by the Open Data Institute, tailored for the [Adapt framework](https://github.com/adaptlearning/adapt_framework).

**Number Input** is designed to allow the user to input a numerical answer in response to a question. It is particularly unique as it only considers the first item's response and treats any numeric input as correct, storing this value as the user's score.

[Visit the **Number Input** wiki](https://github.com/adaptlearning/adapt-textInput/wiki) for more detailed information about its functionality and key properties.

## Installation

As a specialized component developed by the Open Data Institute, **Number Input** can be integrated into Adapt courses. The installation process is similar to other Adapt components:

* To install **Number Input** in the Adapt framework, run the following command with the [Adapt CLI](https://github.com/adaptlearning/adapt-cli):

Alternatively, add `"number-input": "*"` to the *adapt.json* file and then run `adapt install`.

* For installation in the Adapt authoring tool, use the [Plug-in Manager](https://github.com/adaptlearning/adapt_authoring/wiki/Plugin-Manager).

## Settings Overview

**Number Input** is configured in *components.json*, with its configuration formatted as JSON in [*example.json*](https://github.com/adaptlearning/adapt-numberInput/blob/master/example.json).

### Attributes

The component uses several attributes for configuration, including the standard ones for Adapt question components.

**\_component** (string): This must be `number-input`.

**\_classes**, **\_layout**, **instruction**, **ariaQuestion**, **\_attempts**, **\_shouldDisplayAttempts**, **\_isRandom**, **\_questionWeight**, **\_canShowModelAnswer**, **\_canShowFeedback**, **\_canShowMarking**, **\_recordInteraction**, **\_allowsAnyCase**, **\_allowsPunctuation**, and **\_feedback** follow the same structure as in the original Text Input component.

**\_items** (object array): Only the first item's user input is considered for scoring. Each item can contain a **prefix**, **suffix**, and **placeholder**.

### Accessibility
**Number Input** retains the accessibility features from the original component, ensuring a smooth experience for users with assistive technologies.

### Limitations
No known limitations.

---

**Author / maintainer:** Open Data Institute with contributions from the community.
**Accessibility support:** WAI AA
**RTL support:** Yes
**Cross-platform coverage:** Chrome, Chrome for Android, Firefox (ESR + latest version), Edge, IE11, Safari 12+13 for macOS/iOS/iPadOS, Opera
