'use strict';

/**
* Here we test the Analytics service. Everything is fine, coverage is 100%.
* See the next describe block for comments on what happens when I try to use
* shared constants
*/
describe('Service: Analytics', function () {
  var Analytics,
    CookieStore,
    md5Mock,
    $mockWindow;

  beforeEach(module('flAnalytics', function($provide) {
    // We use our shared mock services
    $mockWindow = new WindowMock();
    CookieStore = new CookieStoreMock();
    md5Mock = jasmine.createSpyObj('md5', ['createHash']);

    $provide.value('$window', $mockWindow);
    $provide.value('CookieStore', CookieStore);
    $provide.value('md5', md5Mock);
  }));

  beforeEach(inject(function (_Analytics_) {
    Analytics = _Analytics_;

    // Set some cookies to be used later
    CookieStore.put('GETAFREE_AFPRO', '111');
    CookieStore.put('GETAFREE_AFPRO_ID', '222');
    CookieStore.put('GETAFREE_AFPRO_SESS', '333');
    CookieStore.put('GETAFREE_TTREF', '444');
    CookieStore.put('_tracking_session', 'blahblahblah');
  }));

  it('should have a shared mock $window and CookieStore',
  inject(function ($window, CookieStore) {
    expect(CookieStore).not.toBeNull();
    expect($window).not.toBeNull();
  }));

  it('should track an action', inject(function ($window) {
    Analytics.trackAction('category', 'action', 'result');

    expect($window.dataLayer).toContain({
      event: 'app_action',
      eventCategory: 'category',
      eventAction: 'action',
      eventResult: 'result'
    });
  }));

  it('should track an event', inject(function ($window) {
    Analytics.trackEvent('section', 'subsection', 'name', 'action', 'value',
      'label', 'reference', 'referenceId');

    expect($window.dataLayer).toContain({
      event: 'user_action',
      eventSection: 'section',
      eventSubsection: 'subsection',
      eventName: 'name',
      eventAction: 'action',
      eventValue: 'value',
      eventLabel: 'label',
      eventReference: 'reference',
      eventReferenceId: 'referenceId'
    });
  }));

  it('should push user timing data to Google Tag Manager',
  inject(function ($window) {
    Analytics.trackAjaxTiming('method', 'url', 'status', 'timespent', 'label');

    expect($window.dataLayer).toContain({
      event: 'ajax_timing',
      ajaxMethod: 'method',
      ajaxUrl: 'url',
      ajaxStatus: 'status',
      ajaxValue: 'timespent',
      ajaxLabel: 'label'
    });
  }));

  it('should track an abtest',
  inject(function ($window) {
    Analytics.trackABTest('name', 0.5);

    expect($window.dataLayer).toContain({
      event: 'abtest',
      testName: 'name',
      testVariation: 0.5
    });
  }));

  it('should track user timing in mobile web', inject(function($window) {
    var markName = 'markName';
    var markTime = 1234.56;

    Analytics.trackMobileUserTiming(markName, markTime);

    expect($window.dataLayer).toContain({
      event: 'mobile_user_timing',
      markName: markName,
      markTime: markTime
    });
  }));

  it('should track country domain data in mobile web',
  inject(function($window) {
    var currentDomain = 'freelancer.com';

    Analytics.trackMobileCountryDomain(currentDomain);

    expect($window.dataLayer).toContain({
      currentDomain: currentDomain
    });
  }));

  describe('on tracking GTM conversions', function() {
    var orderId;
    var conversionType;

    beforeEach(function() {
      orderId = 1231;
      conversionType = 'Test Posted';
    });

    it('should push tracking for projects', inject(function($window) {
      var type = 'project';
      $window.dataLayer = [];
      Analytics.trackGTMConversion(type, orderId, conversionType);

      expect($window.dataLayer).toEqual([{ order_id: 'P' + orderId },
        { event: conversionType }, jasmine.any(Object)]);
    }));

    it('should push tracking for contests', inject(function($window) {
      var type = 'contest';
      $window.dataLayer = [];
      Analytics.trackGTMConversion(type, orderId, conversionType);

      expect($window.dataLayer).toEqual([{ order_id: 'C' + orderId },
        { event: conversionType }, jasmine.any(Object)]);
    }));

    it('should send track events once done', function() {
      var type = 'project';
      Analytics.trackEvent = jasmine.createSpy();
      Analytics.trackGTMConversion(type, orderId, conversionType);

      expect(Analytics.trackEvent).toHaveBeenCalledWith('GTMTracking',
        conversionType, false, false, false, 'P' + orderId);
    });
  });

  it('should track the referrer of the page', inject(function($window) {
    var url = '/some/route';
    var referrerUrl = '/some/referrer';

    Analytics.trackPageView(url, referrerUrl);

    expect($window.dataLayer).toContain({
      event: 'page_view',
      referrerUrl: referrerUrl,
      url: url
    });
  }));

  it('should track the location', inject(function ($window) {
    var latitude = 14.553913500000002;
    var longitude = 121.0506986;

    Analytics.trackLocation(
      latitude,
      longitude
    );

    expect($window.dataLayer).toContain({
      event: 'user_location',
      lat: latitude,
      lon: longitude
    });
  }));

  it('should get the affiliate program tracking data',
  inject(function ($window, CookieStore) {
    // When cookies are set
    expect(Analytics.getAFPROHeader())
      .toEqual('afpro=111;afpro_id=222;afro_sess=333');

    // When any of the cookies is missing
    CookieStore.remove('GETAFREE_AFPRO');
    expect(Analytics.getAFPROHeader()).toBeUndefined();
  }));

  it('should get the tracking data', inject(function ($window, CookieStore) {
    // When cookies are set
    expect(Analytics.getTrackingHeader()).toEqual('blahblahblah');

    // When cookie is missing
    CookieStore.remove('_tracking_session');
    expect(Analytics.getTrackingHeader()).toBeUndefined();
  }));

  it('should set the tracking header from md5 generated hash',
  inject(function ($window, CookieStore) {
    md5Mock.createHash.and.returnValue('randomhashgeneratedbynesiri');
    var hashedId = 'randomha-shge-nera-tedb-ynesiri';

    CookieStore.remove('_tracking_session');
    CookieStore.put = jasmine.createSpy();

    var session = Analytics.setTrackingHeader();
    expect(CookieStore.put).toHaveBeenCalledWith('_tracking_session', hashedId,
      jasmine.any(Object));
    expect(session).toBe(hashedId);
  }));

  it('should set the tracking header from existing cookie hash value',
  inject(function ($window, CookieStore) {
    CookieStore.put = jasmine.createSpy();

    var session = Analytics.setTrackingHeader();
    expect(CookieStore.put).not.toHaveBeenCalled();
    expect(session).toBe('blahblahblah');
  }));

  it('should get the TTREF tracking data',
  inject(function ($window, CookieStore) {
    // When cookies are set
    expect(Analytics.getTTREFHeader()).toEqual('444');

    // When cookie is missing
    CookieStore.remove('GETAFREE_TTREF');
    expect(Analytics.getTTREFHeader()).toBeUndefined();
  }));
});

describe('AjaxTimingInterceptor', function() {
  var AjaxTimingInterceptor,
    mockAnalytics,
    $mockWindow,
    CookieStore;

  // Provide dependencies to the service
  beforeEach(module('flAnalytics', function($provide) {
    $mockWindow = new WindowMock();
    CookieStore = new CookieStoreMock();
    mockAnalytics = new AnalyticsMock();

    $provide.value('$window', $mockWindow);
    $provide.value('Analytics', mockAnalytics);
  }));

  // Inject the service
  beforeEach(inject(function(_AjaxTimingInterceptor_) {
    AjaxTimingInterceptor = _AjaxTimingInterceptor_;
  }));

  it('should intercept requests, responses and responseErrors',
  inject(function($q, Analytics, $rootScope, API_BASE_URL, GAF_BASE_URL,
    AUTH_BASE_URL) {

    var requestConfig = {url: '/views/'};

    expect(AjaxTimingInterceptor.request(requestConfig))
      .toEqual(requestConfig);

    // AjaxTimingInterceptor.request
    requestConfig.url = '/data/';
    expect(AjaxTimingInterceptor.request(requestConfig))
      .toEqual(requestConfig);

    requestConfig.url = API_BASE_URL;
    expect(AjaxTimingInterceptor.request(requestConfig))
      .toEqual(requestConfig);

    requestConfig.url = AUTH_BASE_URL;
    expect(AjaxTimingInterceptor.request(requestConfig))
      .toEqual(requestConfig);

    requestConfig.url = GAF_BASE_URL;
    expect(AjaxTimingInterceptor.request(requestConfig))
      .toEqual(requestConfig);

    // AjaxTimingInterceptor.response
    var responseConfig = {config: {url: '/views/'}};
    expect(AjaxTimingInterceptor.response(responseConfig))
      .toEqual(responseConfig);

    responseConfig.config.url = '/data/';
    expect(AjaxTimingInterceptor.response(responseConfig))
      .toEqual(responseConfig);

    responseConfig.config.url = API_BASE_URL;
    expect(AjaxTimingInterceptor.response(responseConfig))
      .toEqual(responseConfig);

    responseConfig.config.url = AUTH_BASE_URL;
    expect(AjaxTimingInterceptor.response({config: {url: AUTH_BASE_URL}}))
      .toEqual(responseConfig);

    responseConfig.config.url = GAF_BASE_URL;
    expect(AjaxTimingInterceptor.response({config: {url: GAF_BASE_URL}}))
      .toEqual(responseConfig);

    // AjaxTimingInterceptor.responseError
    var responseErrorConfig = {url: 'responseError'};
    expect(AjaxTimingInterceptor.request(responseErrorConfig))
      .toEqual(responseErrorConfig);

    responseErrorConfig = {config: responseErrorConfig};

    // Set some handlers functions for our promise so we can spy on them
    var handlers = {
      onResolve: function () {},
      onReject: function () {}
    };

    spyOn(handlers, 'onResolve');
    spyOn(handlers, 'onReject');

    AjaxTimingInterceptor.responseError(responseErrorConfig)
      .then(function() {
          handlers.onResolve();
        }, function() {
          handlers.onReject();
        }
      );

    // Before digest
    expect(handlers.onResolve).not.toHaveBeenCalled();
    expect(handlers.onReject).not.toHaveBeenCalled();

    $rootScope.$apply();

    // After digest
    expect(handlers.onResolve).not.toHaveBeenCalled();
    expect(handlers.onReject).toHaveBeenCalled();
  }));
});

describe('AFPROInterceptor', function() {
  var AFPROInterceptor,
    $mockWindow,
    $mockAnalytics;

  beforeEach(module('flAnalytics', function($provide) {
    $mockWindow = new WindowMock();
    $mockAnalytics = new AnalyticsMock();

    $provide.value('$window', $mockWindow);
    $provide.value('Analytics', $mockAnalytics);
  }));

  beforeEach(inject(function(_AFPROInterceptor_) {
    AFPROInterceptor = _AFPROInterceptor_;
  }));

  it('should intercept requests', inject(function(API_BASE_URL) {
    var requestConfig = {
      url: API_BASE_URL + '/users/0.1/users/',
      headers: {}
    };

    expect(AFPROInterceptor.request(requestConfig).headers)
      .not.toBeUndefined();

    expect(AFPROInterceptor.request(requestConfig).headers['Freelancer-AFPRO'])
      .not.toBeUndefined();

    expect(AFPROInterceptor.request(requestConfig).headers['Freelancer-AFPRO'])
      .toEqual('mockAFPROHeader');
  }));
});

describe('TrackingInterceptor', function() {
  var TrackingInterceptor,
    $mockWindow,
    $mockAnalytics;

  beforeEach(module('flAnalytics', function($provide) {
    $mockWindow = new WindowMock();
    $mockAnalytics = new AnalyticsMock();

    $provide.value('$window', $mockWindow);
    $provide.value('Analytics', $mockAnalytics);
  }));

  beforeEach(inject(function(_TrackingInterceptor_) {
    TrackingInterceptor = _TrackingInterceptor_;
  }));

  it('should intercept requests', inject(function(API_BASE_URL) {
    var requestConfig = {
      url: API_BASE_URL,
      headers: {}
    };

    expect(TrackingInterceptor.request(requestConfig).headers)
      .not.toBeUndefined();

    expect(TrackingInterceptor.request(requestConfig)
      .headers['Freelancer-Tracking']).not.toBeUndefined();

    expect(TrackingInterceptor.request(requestConfig)
      .headers['Freelancer-Tracking']).toEqual('mockTrackingHeader');
  }));
});

describe('TTREFInterceptor', function() {
  var TTREFInterceptor,
    $mockWindow,
    $mockAnalytics;

  beforeEach(module('flAnalytics', function($provide) {
    $mockWindow = new WindowMock();
    $mockAnalytics = new AnalyticsMock();

    $provide.value('$window', $mockWindow);
    $provide.value('Analytics', $mockAnalytics);
  }));

  beforeEach(inject(function(_TTREFInterceptor_) {
    TTREFInterceptor = _TTREFInterceptor_;
  }));

  it('should intercept requests', inject(function(API_BASE_URL) {
    var requestConfig = {
      url: API_BASE_URL + '/projects/0.1/projects/',
      headers: {},
      method: 'POST'
    };

    expect(TTREFInterceptor.request(requestConfig).headers)
      .not.toBeUndefined();

    expect(TTREFInterceptor.request(requestConfig)
      .headers['Freelancer-TTREF']).not.toBeUndefined();

    expect(TTREFInterceptor.request(requestConfig)
      .headers['Freelancer-TTREF']).toEqual('mockTTREFHeader');
  }));
});
