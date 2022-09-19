'use strict';
/* exported AnalyticsMock */

/**
 * Mock version of our Analytics service
 */
function AnalyticsMock () {
  this.trackAction = function() {};
  
  this.trackError = function() {};

  this.trackAjaxTiming = function () {};

  this.getAFPROHeader = function () {
    return 'mockAFPROHeader';
  };

  this.getTrackingHeader = function () {
    return 'mockTrackingHeader';
  };

  this.getTTREFHeader = function() {
    return 'mockTTREFHeader';
  };
}
