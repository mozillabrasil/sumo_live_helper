[<img align="right" src="https://img.shields.io/github/issues/mozillabrasil/sumo_live_helper.svg">](https://github.com/mozillabrasil/sumo_live_helper/issues)
[<img align="right" src="https://img.shields.io/github/license/mozillabrasil/sumo_live_helper.svg">](https://github.com/mozillabrasil/sumo_live_helper/blob/master/LICENSE)
[<img align="right" src="https://img.shields.io/github/forks/mozillabrasil/sumo_live_helper.svg">](https://github.com/mozillabrasil/sumo_live_helper/network/members)
[<img align="right" src="https://img.shields.io/github/stars/mozillabrasil/sumo_live_helper.svg">](https://github.com/mozillabrasil/sumo_live_helper/stargazers)
[<img align="right" src="https://img.shields.io/github/release/mozillabrasil/sumo_live_helper.svg">](https://github.com/mozillabrasil/sumo_live_helper/releases)

# SUMO Live Helper [<img align="right" src="https://addons.cdn.mozilla.net/static/img/addons-buttons/AMO-button_2.png">](https://addons.mozilla.org/en-US/firefox/addon/sumo-live-helper-/)
The goal of this Add-on is give to all volunteers of SUMO (Support Mozilla) a tool to see when there are new support questions in the forums that have not yet been answered. This will help to improve the Mozilla products user experience by getting answers to their problems more quickly.

![Interface of SUMO Live Helper](sumo-live-helper.png)

<!--
![SUMO_Live_Helper gif](sumo_live_helper.gif)
-->

## Requirements
* Firefox 62.0 or later

## Features
This Add-on shows how many questions are open and without answer on the support forum. By clicking the extension icon on the toolbar, a popup will open, allowing you to select an unanswered question. Selecting an unanswered question will open it in a new tab.

There are additional settings that can be accessed through the wrench in the popup or through the Add-ons Manager. These settings are:
- Language: Choose a language to search for questions opened recently and without answer
    - Čeština
    - Español
    - English
    - Magyar
    - Português (do Brasil)
- Time in minutes to query the API: set how often the extension should check for new questions posted to the forum
- Show browser notifications: receive a browser notification when a new question is opened
- Sidebar you can open the questions in a sidebar
- Choose one or more products to search for opened questions, the following products are supported:
    - Firefox for Desktop
    - Firefox for Enterprise
    - Firefox for Android
    - Firefox for iOS
    - Thunderbird
- SUMO Live Helper has also been localized in the following languages
    - Čeština
    - Español
    - English
    - Português (do Brasil)

If you have any suggestions, would like to see your locale added, or want to see the Add-on localized in your language, feel free to open a PR or an issue. 

## Informations
1. The search of new opened questions at support forum is in English for default, but you can change in the preferences page and set the time to search for questions as well (the default is each 15 minutes).
2. The Add-on will show to you the questions that have been opened giving to you the option to choose and open in a new tab.

## Future implementations
We are looking forward to see what you think is a good idea implement in the future, please to do that open a new [issue](https://github.com/mozillabrasil/sumo_live_helper/issues).

## How to test this Add-on
1. Clone this repository git clone ```https://github.com/mozillabrasil/sumo_live_helper.git```
2. In the Firefox address bar type ```about:debugging```
3. Click ```Load Temporary Add-on```, a dialog window opens
4. In the cloned repository, select the ```manifest.json``` file. The Add-on icon will appear in your toolbar.

## How Contribute
Have a suggestion, doubt or encountered an error? Please open a new [issue](https://github.com/mozillabrasil/sumo_live_helper/issues).

Contributions are welcome, feel free to submit a pull :)

## Learn More
To learn more about webextensions development, see this [Mozilla developer Network documentation](https://developer.mozilla.org/en-US/Add-ons/WebExtensions).

### License
This repository is available under the [Mozilla Public License 2.0](https://github.com/mozillabrasil/sumo_live_helper/blob/master/LICENSE).

### Credits
Thank you [philipp-sumo](https://github.com/philipp-sumo/) for your helpfull tips and time to revive this project.
