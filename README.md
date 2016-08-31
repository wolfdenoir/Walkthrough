# Walkthrough
This is a SharePoint-JSOM app whose purpose is to provide a tutorial walkthrough of another SharePoint app.

## Requirements
The app uses the Popover plugin in Bootstrap 3 as well as its stylesheet. It also interacts with a couple of SharePoint lists to perform its functions:

* TutorialTracker - tracks each user's usage of a walkthrough for every app and whether they have completed/opted out of the walkthrough. The list structure is as follows:
```
Staff: People field; Required.
AppName: Text field; Required - the name of the app which the walkthrough is for.
Completed: Boolean field; Required -  whether the user has fully completed the walkthrough.
Canceled: Boolean field; Required - whether the user has chose to opt out of the walkthrough.
```
* TutorialItems - Contains message items for each walkthrough. Each record represents a single message to be displayed as the user progress through the walkthrough session. The list structure is as follows:
```
AppName: Text field; Required - the name of the app which the walkthrough is for.
DOM ID: Text field; Not required - the ID of the DOM element in which this message is intended for. Leaving it blank means the message will stand alone.
Index: Number field; Required - The index which determines the order this message should be displayed in the walkthrough.
Message: Text field; Required - The walkthrough message.
```

## Getting Started

* Include the app.js or app.min.js within the html file.
* Ensure the SharePoint lists are available.
* Run the following javascript code:
```
activateWalkthrough('*Your App Name*');
```
The above function checks the TutorialTracker list and determines whether to run the walkthrough if the user has not completed it and has not chosen to opt out.

## Manually Trigger the Walkthrough
Run the following javascript code:
```
runWalkthrough('*Your App Name*');
```

## Built With

* Atom editor
* Bootstrap 3
* SharePoint 2013

## Authors

* **Ray Juei-Fu Liu** - [WolfDeNoir](https://github.com/wolfdenoir)

## License

This project is licensed under the GNU GENERAL PUBLIC LICENSE - see the [LICENSE](LICENSE) file for details
