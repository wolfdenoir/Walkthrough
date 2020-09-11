# Walkthrough

This is a SharePoint-JSOM app whose purpose is to provide a tutorial walkthrough of a web page. Using an ordered list of messages, it displays them one at a time over a dark overlay, highlighting any DOM elements each time if one is specified in a JQuery selector format.

## Requirements

The app uses JQuery and Bootstrap 3 as well as their stylesheets. It also interacts with a couple of SharePoint lists to perform its functions:

- WalkthroughTracker - tracks each user's usage of a walkthrough session and whether they have completed/opted out of the walkthrough. The list structure is as follows:

  ```
  Staff: People field; Required.
  WalkName: Text field; Required - the name of the walkthrough session.
  Completed: Boolean field; Required -  whether the user has fully completed the walkthrough.
  Cancelled: Boolean field; Required - whether the user has chose to opt out of the walkthrough.
  ```

- WalkthroughSteps - Contains steps for all walkthrough sessions. Each record represents a single step in a walkthrough session. The list structure is as follows:

  ```
  WalkName: Text field; Required - the name of the walkthrough session.
  Selector: Text field; Not required - the JQuery selector of the DOM element(s) to be highlighted in this message.
  Step: Number field; Required - The index which determines the order this message should be displayed in the walkthrough.
  Message: Text field; Required - The walkthrough message.
  ```

## Getting Started

- Include the app.min.js within the html file.
- Ensure the SharePoint lists are available.
- Run the following javascript code:

  ```
  initializeWalkthrough('*Walkthrough Name*');
  ```

  The above function queries the WalkthroughTracker list and determines whether the current user has not completed the walkthrough and has not chosen to opt out. It only runs the walkthrough when both conditions are met.

## Manually Trigger the Walkthrough

Run the following javascript code:

```
beginWalkthrough('*Walkthrough Name*');
```

## Manually Displaying a Single Message

At anytime a single message can be displayed and any DOM elements can be highlighted by running the following code:

```
showWalkMessageBox(*Your Message*, *Step Number*, *JQuery Selector*);
```

Only the first argument is required.

## Built With

- Atom editor
- Bootstrap 3
- SharePoint 2013

## Authors

- **Ray Juei-Fu Liu** - [WolfDeNoir](https://github.com/wolfdenoir)

## License

This project is licensed under the GNU GENERAL PUBLIC LICENSE - see the <LICENSE> file for details
