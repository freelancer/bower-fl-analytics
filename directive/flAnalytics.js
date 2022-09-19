'use strict';
/**
 * @ngdoc overview
 * @name flAnalytics
 * @module flAnalytics
 * @description
 *
 * # flAnalytics
 * The `flAnalytics` module provide a common layer for interaction with Google
 * Analytics. See {@link flAnalytics.Analytics Analytics service} for more
 * info.
 */
angular.module('flAnalytics')
  /**
   * @ngdoc directive
   * @name flAnalytics.Analytics
   *
   * @description
   * A directive which defines a section that is being tracked.
   */
  .directive('flAnalyticsSection', function() {
    return {
      controller: function($attrs) {
        this.section = $attrs.flAnalyticsSection;
      }
    };
  })
  /**
   * @ngdoc directive
   * @name flAnalytics.Analytics
   *
   * @description
   * A directive which defines a subsection that is being tracked.
   */
  .directive('flAnalyticsSubsection', function() {
    return {
      controller: function($attrs) {
        this.subsection = $attrs.flAnalyticsSubsection;
      }
    };
  })
  /**
   * @ngdoc directive
   * @name flAnalytics.Analytics
   *
   * @description
   * A directive which defines an element that is being tracked. The event that
   * is being tracked is inferred by the type of the element.
   */
  .directive('flAnalytics', function ($parse, $log, Analytics) {
    // Infer the DOM event type from the element tagName & type
    function inferEventType(element) {
      if (['button', 'submit'].indexOf(element.type) !== -1) {
        return 'click';
      } else if (['select', 'input', 'textarea']
        .indexOf(element.tagName.toLowerCase()) !== -1) {
        return 'change';
      } else if (element.isContentEditable) {
        // contenteditable elements don't have change events
        return 'blur';
      } else {
        return 'click';
      }
    }
    return {
      // Event section is mandotary, event subsection is optional
      require: ['^flAnalyticsSection', '?^flAnalyticsSubsection'],
      restrict: 'A',
      scope: false,
      link: function (scope, element, attrs, ctrls) {
        // The name of the event (mandatory)
        var name = attrs.flAnalytics;
        // The section on the site (mandatory)
        var section = ctrls[0].section;
        // The subsection (optional)
        var subsection = ctrls[1] ? ctrls[1].subsection : undefined;

        if (name && section) {
          // DOM event type
          var type = inferEventType(element[0]);
          element.on(type, function (e) {
            var el = e.target;
            // Get the event value from the attributes (Angular expression) or
            // use the DOM element value is not specified
            var value = $parse(attrs.flAnalyticsValue)(scope);
            // Get the action from the event type if no action is specified
            var action = attrs.flAnalyticsAction ?
              attrs.flAnalyticsAction : type;
            // Get the element label: if it's a select input & an element is
            // selected, get the selected text, otherwise we use the content
            var label = attrs.flAnalyticsLabel;
            if (!label && !el.isContentEditable) {
              label = (el.value && el.options) ?
                el.options[el.selectedIndex].text : el.textContent.trim();
            }
            var reference = attrs.flAnalyticsReference;
            var referenceId = attrs.flAnalyticsReferenceId;

            Analytics.trackEvent(section, subsection, name,
              action, value, label, reference, referenceId);
          });
        } else {
          $log.warn('invalid event name or section');
        }
      }
    };

  });
