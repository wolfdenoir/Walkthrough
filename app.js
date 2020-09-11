/**
Decision Factors
- The Modal anchor position
- The modal size derived from its content
- The DOM object size
- the object position
- whether the object is in view

In the presence of a target object, the modal box should prioritize its anchor position and place the target object around it if possible. In the scenario there is an overlap, the following decision tree should be followed:

0. Is the viewport big enough to contain both elements without overlap(Area calculation)? If not, skip all checks and display both without adjustments.
1. If #0, can object be scrolled to outside the modal box overlap?
2. If not #1, can the modal box be resized and object scrolled to fit?
2-1. Is there room for horizonal expansion around the object?
2-2. If not #2-1, is there room for vertical expansion within the threshold set by sentence length?
3. If not #2, can the modal box change its anchor position to fit?
4. If not #3, can #3 plus obj be scrolled to fit?
5. If not #4, can #4 plus the modal size be changed to fit?
6. If not #5, assume original anchor position and display element in view.
**/

var _TRACKER_LIST_ID = '072f3846-7046-4ae3-a492-15325b2ef308';
var _ITEM_LIST_ID = 'b568df2e-fb1d-47cb-898c-5c45d1faf616';
var arrSteps = [];
var _anchor = "CR";

$(document).ready(function() {
  $(".scroll").click(function(event) {
    event.preventDefault();
    walkNext($(this.hash));
    event.stopPropagation();
  });

  $("#modal-one a.btn").click(function(ev) {
    ev.preventDefault();
    walkNext($($(this).data("id")));
    ev.stopPropagation();
  });

  $(".modal a.btn-close").click(function(ev) {
    ev.preventDefault();
    scrollLock(false);
    $("#modal-one").removeClass("walk");
    $(".modal-dialog").addClass("idle");
    $(".modal-dialog").css("top", "");
    $(".modal-dialog").css("right", "");
    $(".modal-dialog").css("bottom", "");
    $(".modal-dialog").css("left", "");
    ev.stopPropagation();
  });

  /**
  (function myLoop(i) {
    $(".scroll").eq(i).trigger("click");
    setTimeout(function() {
      if (i--) myLoop(i);
    }, 1000)
  })($(".scroll").length);
  **/
});

/**
  Checks the Tracker list to see whether the current user has completed or
  opted out of the tutorial for the current app. If both evaluates to false,
  runs the tutorial.
**/
function initializeWalkthrough(walkName) {
  // Evaluate the current user.
  $.ajax({
    url: _spPageContextInfo.webAbsoluteUrl +
      "_api/SP.UserProfiles.PeopleManager/GetMyProperties/AccountName",
    type: "GET",
    headers: {
      "Accept": "application/json; odata=verbose"
    },
    success: function(data) {
      // This async call retrieves the User ID at the SiteCollection level
      // It also ensures the user is available for record creation
      $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/ensureuser",
        type: "POST",
        data: JSON.stringify({
          "logonName": data.d.AccountName
        }),
        headers: {
          "X-RequestDigest": $("#__REQUESTDIGEST").val(),
          "Accept": "application/json; odata=verbose",
          "content-type": "application/json;odata=verbose"
        },
        success: function(data) {
          // Query user's history from TutorialTracker list
          var searchUrl = _spPageContextInfo.webAbsoluteUrl +
            "/_api/web/lists/lists('" + _TRACKER_LIST_ID + "')/items?" +
            "$filter=(StaffId eq " + data.d.Id + " AND walkName eq '" + walkName +
            "')&$select=WalkName,StaffId,Completed,Cancelled&$expand=Staff";

          //console.log(searchUrl);
          $.ajax({
            url: searchUrl,
            type: "GET",
            StaffId: data.d.Id,
            headers: {
              "Accept": "application/json; odata=verbose"
            },
            success: function(data) {
              //console.log(data);
              var results = data.d.results;
              if (results.length > 0) {
                $.each(results, function(index, result) {
                  if (result.Completed == 'Yes' || result.Cancelled == 'Yes')
                    return;
                  else
                    runWalkthrough(walkName);
                });
              } else {
                var jsonData = {
                    "__metadata": {
                      "type": "SP.Data.TutorialTrackerListItem"
                    },
                    "StaffId": StaffId,
                    "WalkName": walkName,
                    "Completed": "No",
                    "Cancelled": "No"
                  }
                  // If no record is found, create it
                $.ajax({
                  url: listURL,
                  method: "POST",
                  data: JSON.stringify(jsonData),
                  headers: {
                    "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                    "accept": "application/json;odata=verbose",
                    "content-type": "application/json;odata=verbose"
                  },
                  success: onCreateJSON,
                  error: onQueryFailedJSON
                });
              }
            },
            error: onQueryFailedJSON
          });

          // If exists, check whether tutorial should be run
          // If it does not exist, run tutorial
        },
        error: onQueryFailedJSON
      });
    },
    error: onQueryFailedJSON
  });
}

/**
  Loads items from TutorialItems list and prepares the first tutorial message.
**/
function runWalkthrough(walkName) {
  this.arrSteps = [];
  var searchUrl = _spPageContextInfo.webAbsoluteUrl +
    "/_api/web/lists/lists('" + _ITEM_LIST_ID + "')/items?" +
    "$filter=(walkName='" + walkName + "')&" +
    "$select=WalkName,Selector,Index,Message&" +
    "$orderby=Index asc";

  //console.log(searchUrl);
  $.ajax({
    url: searchUrl,
    type: "GET",
    headers: {
      "Accept": "application/json; odata=verbose"
    },
    success: function(data) {
      var results = data.d.results;
      if (results.length > 0) {
        $.each(results, function(index, result) {
          arrSteps.push(result);
        });

        // Activate the first message.
        showWalkBox(arrSteps[0].Message, arrSteps[1].Selector);
      }
    },
    error: onQueryFailedJSON
  });
}

/**
  Function callback for each successive tutorial dialog to load the next message.
**/
function nextWalkBox(ev) {
  $(selector).css("pointer-events", "auto");
}

/**
  Displays a Walkthrough Message. It brings the overlay div to the front of
  every control except the DOM element(s) specified by the selector argument.
  Then it instantiates a message modal and displays it beside the element(s).
  The modal contains buttons for user to decide the next action: Next Message,
  Skip Tutorial, and a checkbox to Never Ask to Run the Walkthrough again.
**/
function showWalkBox(message, selector) {
  $(selector).addClass("expose");
  $(selector).css("pointer-events", "none");
  $(this).append($("<div/>", {
    "class": "modal-dialog"
  }).html('<div class="modal-header"><h2>Modal in CSS?</h2>' +
    '<a href="#" class="btn-close" aria-hidden="true">×</a></div>' +
    '<div class="modal-body"><p>One modal example here! :D</p></div>' +
    '<div class="modal-footer"><a href="#" class="btn">Nice!</a></div>'))
}

function onCreateJSON(data) {
  console.log("itemID " + data.d.ID + " created");
}

function onQueryFailedJSON(data, errorCode, errorMessage) {
  if (data.responseJSON != null)
    console.log(data.responseJSON.error.code + ': ' + data.responseJSON.error.message.value);
  else
    console.log(data);
}

function scrollLock(isLock) {
  if (isLock) {
    $('body').css({
      'overflow': 'hidden'
    });
    $(document).bind('scroll', function() {
      window.scrollTo(window.pageXOffset, window.pageYOffset);
    });
  } else {
    $(document).unbind('scroll');
    $('body').css({
      'overflow': 'visible'
    });
  }
}

function walkNext(obj) {
  scrollLock(false);
  $(".btn").data("id", "#" + obj.nextAll("h3").eq(0).attr("id"));
  $(".expose").removeClass("expose");
  obj.addClass("expose");
  $("#modal-one p").html(obj.html());

  if (!isElementInViewport(obj)) {
    $('html,body').animate({
      scrollTop: obj.offset().top
    });
  }
  $('html,body').promise().done(function() {
    var anchor = getAnchor($(".modal-dialog"), _anchor);

    $("#modal-one").addClass("walk");
    console.log($(".modal-dialog")[0].getBoundingClientRect());
    //$(".modal-dialog").removeClass("idle");
    console.log($(".modal-dialog")[0].getBoundingClientRect());
    $(".modal-dialog").animate(anchor);
    scrollLock(true);
  });

  if ($(window).width() * $(window).height() < ($(".modal-dialog").width() * $(".modal-dialog").height() + obj.width() * obj.height()))
    return false; // The objects will definitely overlap.
}

function getAnchor(obj, anchor) {
  var anchors = {
    "TL": "top left",
    "T": "top center",
    "TR": "top right",
    "CL": "center left",
    "C": "center",
    "CR": "center right",
    "BL": "bottom left",
    "B": "bottom center",
    "BR": "bottom right"
  };

  if (!anchors[anchor])
    return false; // invalid anchor key

  var points = {};
  switch (anchors[anchor]) {
    case "top left":
      points.top = "0px";
      points.left = "0px";
      break;
    case "top center":
      points.top = "0px";
      points.left = Math.round(($(window).width() - obj.width()) / 2) + "px";
      break;
    case "top right":
      points.top = "0px";
      points.right = "0px";
      break;
    case "center left":
      points.top = Math.round(($(window).height() - obj.height()) / 2) + "px";
      points.left = "0px";
      break;
    case "center":
      points.top = Math.round(($(window).height() - obj.height()) / 2) + "px";
      points.left = Math.round(($(window).width() - obj.width()) / 2) + "px";
      break;
    case "center right":
      points.top = Math.round(($(window).height() - obj.height()) / 2) + "px";
      points.right = "0px";
      break;
    case "bottom left":
      points.left = "0px";
      points.bottom = "0px";
      break;
    case "bottom center":
      points.left = Math.round(($(window).width() - obj.width()) / 2) + "px";
      points.bottom = "0px";
      break;
    case "bottom right":
      points.bottom = "0px";
      points.right = "0px";
      break;
    default:
      points.top = Math.round(($(window).height() - obj.height()) / 2) + "px";
      points.left = Math.round(($(window).width() - obj.width()) / 2) + "px";
  }

  return points;
}

function getArea(obj) {
  if (obj instanceof jQuery)
    return obj.width() * obj.height();
  else
    return obj.style.width * obj.style.height;
}

/**
  Determines whether the two JQuery elements are overlapping
  one another. If an anchor is present, it instead determines
  whether obj1 is going to overlap with obj2 when obj1 is
  positioned at the anchor position.
**/
function isOverlap(obj1, obj2, anchor) {
  if (!isElementInViewport(obj1) && anchor === undefined ||
    !isElementInViewport(obj2))
    return false;

  var rect1 = obj1[0].getBoundingClientRect();
  var rect2 = obj2[0].getBoundingClientRect();

  // If an anchor is present, it means rect1 is going to be moved. So the function should return whether the new position is going to result in an overlap.
  if (anchor !== null && anchor !== undefined) {
    var rect11 = {};

    // Resolve the missing coordinates for calculation purpose
    if (anchor.top !== undefined) {
      rect11.top = parseFloat(anchor.top);
      rect11.bottom = rect1.bottom + rect1.top - rect11.top;
    } else {
      rect11.bottom = parseFloat(anchor.bottom);
      rect11.top = rect1.top + rect1.bottom - rect11.bottom;
    }

    if (anchor.right !== undefined) {
      rect11.right = parseFloat(anchor.right);
      rect11.left = rect1.left + rect1.right - rect11.right;
    } else {
      rect11.left = parseFloat(anchor.left);
      rect11.right = rect1.right + rect1.left - rect11.left;
    }

    console.log(rect1);
    console.log(rect11);
    console.log(rect2);
    return !(rect11.right < rect2.left ||
      rect11.left > rect2.right ||
      rect11.bottom < rect2.top ||
      rect11.top > rect2.bottom);
  }

  return !(rect1.right < rect2.left ||
    rect1.left > rect2.right ||
    rect1.bottom < rect2.top ||
    rect1.top > rect2.bottom);
}

function isElementInViewport(el) {
  //special bonus for those using jQuery
  if (typeof jQuery === "function" && el instanceof jQuery) {
    el = el[0];
  }

  var rect = el.getBoundingClientRect();

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
    rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
  );
}
