# Adapt ODI Machine Learning Game

## Introduction
The Adapt ODI Machine Learning Game Component is a specialized module developed by the Open Data Institute, designed specifically for the Adapt framework. This component enhances the learning experience by integrating an interactive game focused on machine learning concepts.

## Functionality
The component's primary function is to collect data from the game hosted on [mlgame.learndata.info](https://mlgame.learndata.info/). It captures the player's score, the decision tree they created, and the data table used in the game. This integration allows users to directly see the results of their decision-making process in the context of machine learning.

## Installation
To incorporate the Adapt ODI Machine Learning Game Component into Adapt courses, follow these steps, similar to installing other Adapt components:

- **Adapt CLI**: Use the command line interface of Adapt to install the component. Run the following command:
  ```
  adapt install adapt-odi-ml-game
  ```
- **Adapt Authoring Tool**: In the Adapt authoring tool, this component can be added through the Plug-in Manager.

## Configuration
The component is configured within the `components.json` file of an Adapt course. The configuration follows the JSON format, outlined in an example file named `example.json`.

### Attributes
- **_component (string)**: This must be set to `adapt-odi-ml-game`.
- The component includes several other attributes for configuration, similar to standard Adapt components, such as `_classes`, `_layout`, `instruction`, and accessibility features.

### Accessibility
The Adapt ODI Machine Learning Game Component maintains all standard accessibility features, ensuring compatibility with various assistive technologies.

## Limitations
Currently, there are no known limitations for this component.

## Additional Information
For more detailed information about its functionality and key properties, visit the Adapt ODI Machine Learning Game Component wiki page.

## Author / Maintainer
The component is developed and maintained by the Open Data Institute with contributions from the Adapt community.

## Support
- **Accessibility Support**: WAI AA
- **RTL (Right-to-Left) Support**: Yes
- **Cross-Platform Coverage**: Supported on major platforms including Chrome, Firefox (ESR + latest version), Edge, IE11, Safari for macOS/iOS/iPadOS, and Opera.
