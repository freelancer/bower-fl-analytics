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
angular.module('flAnalytics', ['configs', 'flCookies', 'angular-md5'])
  /**
   * @ngdoc service
   * @name flAnalytics.Analytics
   *
   * @description
   * A factory which creates a service that allows you to perform common tasks
   * on Google Analytics.
   */
  .factory('Analytics', function Analytics($window, CookieStore, md5) {
    return {
      /**
       * @ngdoc method
       * @name flAnalytics.Analytics#trackAction
       * @methodOf flAnalytics.Analytics
       *
       * @description
       * Tracks an event/action, i.e. something the app is doing
       *
       * @param {String} category The `eventCategory` parameter
       * @param {String} action The `eventAction` parameter
       * @param {String} result The `eventResult` parameter
       */
      trackAction: function(category, action, result) {
        $window.dataLayer.push({
          'event': 'app_action',
          'eventCategory': category,
          'eventAction': action,
          'eventResult': result,
        });
      },
      /**
       * @ngdoc method
       * @name flAnalytics.Analytics#trackEvent
       * @methodOf flAnalytics.Analytics
       *
       * @description
       * Track a DOM event / user action, e.g. a `click` on a button or
       * a `change` on a select input
       *
       * @param {String} section The `eventSection` parameter
       * @param {String} subsection The `eventSubsection` parameter
       * @param {String} name The `eventName` parameter
       * @param {String} action The `eventAction` parameter
       * @param {String} value The `eventValue` parameter
       * @param {String} label The `eventLabel` parameter
       * @param {String} reference The `eventReference` parameter
       * @param {String} referenceId The `eventReferenceId` parameter
       */
      trackEvent: function(section, subsection, name, action, value, label,
        reference, referenceId) {
        $window.dataLayer.push({
          'event': 'user_action',
          'eventSection': section,
          'eventSubsection': subsection,
          'eventName': name,
          'eventAction': action,
          'eventValue': value,
          'eventLabel': label,
          'eventReference': reference,
          'eventReferenceId': referenceId
        });
      },
      /**
      * @ngdoc method
      * @name flAnalytics.Analytics#trackAjaxTiming
      * @methodOf flAnalytics.Analytics
      *
      * @description
      * Push user timing data to Google Tag Manager
      *
      * @param {String} method The `ajaxMethod` parameter
      * @param {String} url The `ajaxUrl` parameter
      * @param {String} status The `ajaxStatus` parameter
      * @param {String} timeSpent The `ajaxValue` parameter
      * @param {String} label The `ajaxLabel` parameter
      */
      trackAjaxTiming: function(method, url, status, timeSpent, label) {
        $window.dataLayer.push({
          'event': 'ajax_timing',
          'ajaxMethod': method,
          'ajaxUrl': url,
          'ajaxStatus': status,
          'ajaxValue': timeSpent,
          'ajaxLabel': label
        });
      },
      /**
      * @ngdoc method
      * @name flAnalytics.Analytics#trackAjaxTiming
      * @methodOf flAnalytics.Analytics
      *
      * @description
      * Track an error (not a JS error, an app error)
      *
      * @param {String} category The `eventCategory` parameter
      * @param {String} action The `eventAction` parameter
      * @param {String} result The `eventResult` parameter
      * @param {String} error The `eventData` parameter
      */
      trackError: function(category, action, result, error) {
        $window.dataLayer.push({
          'event': 'app_error',
          'eventCategory': category,
          'eventAction': action,
          'eventResult': result,
          'eventLabel': error ? JSON.stringify(error) : undefined
        });
      },
      /**
      * @ngdoc method
      * @name flAnalytics.Analytics#trackABTest
      * @methodOf flAnalytics.Analytics
      *
      * @description
      * Track an ab test with variation
      *
      * @param {String} category The `test` parameter
      * @param {String} variation The `variation` parameter
      */
      trackABTest: function(name, variation) {
        $window.dataLayer.push({
          'event': 'abtest',
          'testName': name,
          'testVariation': variation
        });
      },
      /**
      * @ngdoc method
      * @name flAnalytics.Analytics#trackMobileUserTiming
      * @methodOf flAnalytics.Analytics
      *
      * @description
      * Push user timing data in Mobile Web to Google Tag Manager
      *
      * @param {String} markName The name of the user timing mark
      * @param {String} markTime The time when the mark was recorded
      */
      trackMobileUserTiming: function(markName, markTime) {
        $window.dataLayer.push({
          'event': 'mobile_user_timing',
          'markName': markName,
          'markTime': markTime
        });
      },

      /**
       * @ngdoc method
       * @name flAnalytics.Analytics#trackMobileCountryDomain
       * @methodOf flAnalytics.Analytics
       *
       * @description
       * Push country domain data in Mobile Web to data layer
       *
       * @param {String} currentDomain The country domain being used
      */
      trackMobileCountryDomain: function(currentDomain) {
        $window.dataLayer.push({
          currentDomain: currentDomain
        });
      },

      /**
      * @ngdoc method
      * @name flAnalytics.Analytics#trackGTMConversion
      * @methodOf flAnalytics.Analytics
      *
      * @description
      * Push GTM conversion tracking first with orderId, then conversion
      * type and then fire a QTS event together with the GTM tracking
      *
      * @param {String} type The order type, i.e. can be either 'project' or
      * 'contest'
      * @param {String} orderId The order Id
      * @param {String} conversionType The name of conversion type as
      * specified in the GTM console
      */
      trackGTMConversion: function(type, orderId, conversionType) {
        var formattedOrderId;
        if (type === 'project') {
          formattedOrderId = 'P' + orderId;
        } else if (type === 'contest') {
          formattedOrderId = 'C' + orderId;
        } else {
          return;
        }

        $window.dataLayer.push({ order_id: formattedOrderId });
        $window.dataLayer.push({ event: conversionType });

        this.trackEvent('GTMTracking', conversionType, false, false,
          false, formattedOrderId);
      },

     /**
      * @ngdoc method
      * @name flAnalytics.Analytics#trackPageView
      * @methodOf flAnalytics.Analytics
      *
      * @description
      * Track the referrer of the given URL
      *
      * @param {String} url of the page
      * @param {String} referrer of the page
      */
      trackPageView: function(url, referrer) {
        $window.dataLayer.push({
          event: 'page_view',
          referrerUrl: referrer,
          url: url
        });
      },

      /**
       * @ngdoc method
       * @name flAnalytics.Analytics#trackLocation
       * @methodOf flAnalytics.Analytics
       *
       * @description
       * Tracks the latitude and longitude of the user
       */
      trackLocation: function (latitude, longitude) {
        $window.dataLayer.push({
          event: 'user_location',
          lat: latitude,
          lon: longitude
        });
      },

      /**
      * @ngdoc method
      * @name flAnalytics.Analytics#getAFPROHeader
      * @methodOf flAnalytics.Analytics
      *
      * @description
      * Get the affiliate program tracking data. The affiliate tracking
      * cookies are set by GAF when redirecting marketing campaigns links,
      * a.k.a. with a pattern like
      * https://www.freelancer.com/campaign/0XYZ123/.
      *
      * @returns {String} a string containing the encoded value
      * of the affiliate tracking cookies
      */
      getAFPROHeader: function() {
        var program = CookieStore.get('GETAFREE_AFPRO');
        var programId = CookieStore.get('GETAFREE_AFPRO_ID');
        var session = CookieStore.get('GETAFREE_AFPRO_SESS');
        if (!program || !programId || !session) {
          // Don't set the header if there's no data
          return;
        } else {
          return 'afpro=' + encodeURIComponent(program) + ';afpro_id=' +
            encodeURIComponent(programId) + ';afro_sess=' +
            encodeURIComponent(session);
        }
      },
      /**
      * @ngdoc method
      * @name flAnalytics.Analytics#getTrackingHeader
      * @methodOf flAnalytics.Analytics
      *
      * @description
      * Get the tracking data (QTS session ID for now).
      *
      * @returns {String} a string containing the encoded value
      * of the affiliate tracking session cookie
      */
      getTrackingHeader: function() {
        var tracking = CookieStore.get('_tracking_session');
        // Don't set the header if there's no data
        if (!tracking) {
          return;
        } else {
          return encodeURIComponent(tracking);
        }
      },
      /**
       * @ngdoc method
       * @name flAnalytics.Analytics#setTrackingHeader
       * @methodOf flAnalytics.Analytics
       *
       * @description
       * Generates session ID cookie from md5 hash
       *
       * @returns {String} Session ID string
       */
      setTrackingHeader: function () {
        var sessionId = this.getTrackingHeader();
        if (!sessionId) {
          var date = new Date();
          var hashed = md5.createHash(Math.random().toString());
          var md5SessionId = hashed.substr(0, 8) + '-' + hashed.substr(8, 4) +
            '-' + hashed.substr(12, 4) + '-' + hashed.substr(16, 4) + '-' +
            hashed.substr(20, 12);

          CookieStore.put('_tracking_session', md5SessionId, {
            expires: date.getTime() + (60 * 60 * 24 * 365),
            domain: CookieStore.getDomain($window.location.hostname),
          });

          return md5SessionId;
        }
        return sessionId;
      },
      /**
      * @ngdoc method
      * @name flAnalytics.Analytics#getTTREFHeader
      * @methodOf flAnalytics.Analytics
      *
      * @description
      * Get the TTREF tracking data. The TTREF tracking cookies are used to
      * store the entry points (e.g., button click) that lead to a certain
      * action (e.g., post project).
      *
      * @returns {String} a string containing the encoded value
      * of the GETAFREE_TTREF cookie
      */
      getTTREFHeader: function() {
        var ttref = CookieStore.get('GETAFREE_TTREF');
        // Don't set the header if there's no data
        if (!ttref) {
          return;
        } else {
          return ttref;
        }
      }
    };
  })

  // HTTP interceptor for tracking ajax requests timings
  .factory('AjaxTimingInterceptor', function AjaxTimingInterceptor($q,
        Analytics, API_BASE_URL, AUTH_BASE_URL, GAF_BASE_URL) {
    var startTime = {};
    var logTimeSpent = function(response) {
      // Compute the request end time
      var endTime = new Date().getTime();
      var timeSpent = endTime - startTime[response.config.url].shift();
      // Label the timing event
      var label;
      var url = response.config.url;
      if (url.match(/^\/views\//)) {
        label = 'HTML_PARTIAL';
      } else if (url.match(/^\/data\//)) {
        label = 'JSON_DATA';
      } else if (url.indexOf(API_BASE_URL) === 0) {
        label = 'REST_API';
      } else if (url.indexOf(AUTH_BASE_URL) === 0) {
        label = 'AUTH';
      } else if (url.indexOf(GAF_BASE_URL) === 0) {
        label = 'GAF';
      }
      // Log the data
      Analytics.trackAjaxTiming(response.config.method,
      response.config.url, response.status, timeSpent, label);
      // Do not leak memory!
      if (startTime[response.config.url].length === 0) {
        delete startTime[response.config.url];
      }
    };
    return {
      request: function(config) {
        // Save the request start time
        if (!startTime[config.url]) {
          startTime[config.url] = [];
        }
        startTime[config.url].push(new Date().getTime());
        return config;
      },
      response: function(response) {
        logTimeSpent(response);
        return response;
      },
      responseError: function(response) {
        logTimeSpent(response);
        return $q.reject(response);
      }
    };
  })

  // Insert the affiliate tracking header on user GET & POST requests
  .factory('AFPROInterceptor', function AFPROInterceptor(API_BASE_URL,
    Analytics) {
    return {
      request: function(config) {
        if (config.url.match(API_BASE_URL + '/users/0.1/users/')) {
          config.headers['Freelancer-AFPRO'] = Analytics.getAFPROHeader();
        }
        return config;
      }
    };
  })

  // Insert the tracking header on all request to the REST API
  .factory('TrackingInterceptor', function TTREFInterceptor(API_BASE_URL,
    Analytics) {
    return {
      request: function(config) {
        if (config.url.match(API_BASE_URL)) {
          config.headers['Freelancer-Tracking'] = Analytics.getTrackingHeader();
        }
        return config;
      }
    };
  })

  // Insert the TTREF tracking header on POST project request
  .factory('TTREFInterceptor', function TTREFInterceptor(API_BASE_URL,
    Analytics) {
    return {
      request: function(config) {
        if (config.url.match(API_BASE_URL + '/projects/0.1/projects/') &&
          config.method === 'POST') {
          config.headers['Freelancer-TTREF'] = Analytics.getTTREFHeader();
        }
        return config;
      }
    };
  })

  .config(function($httpProvider) {
    $httpProvider.interceptors.push('AjaxTimingInterceptor');
    $httpProvider.interceptors.push('AFPROInterceptor');
    $httpProvider.interceptors.push('TrackingInterceptor');
    $httpProvider.interceptors.push('TTREFInterceptor');
  })

  .run(function($window) {

    // Log User Agent string.
    // Let's make sure the string is kinda safe while keeping it readable.
    var userAgent = encodeURIComponent($window.navigator.userAgent)
      .replace(/%20/g, ' ')
      .replace(/%2F/g, '/')
      .replace(/%3B/g, ';')
      .replace(/%2C/g, ',');

    $window.dataLayer.push({
      'event': 'user_agent',
      'uaString': userAgent
    });
  });
