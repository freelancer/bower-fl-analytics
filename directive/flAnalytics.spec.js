'use strict';

describe('Directive: flAnalyticsSection', function() {
  var element, section;
  var $compile, $rootScope, $scope;

  beforeEach(module('flAnalytics'));

  beforeEach(inject(function(_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();

    section = 'someSection';
    element = $compile(angular.element(
      '<div fl-analytics-section="' + section + '"></div>'
    ))($scope);
  }));

  it('should load the section', function() {
    var ctrl = element.controller('flAnalyticsSection');

    expect(ctrl.section).toBe(section);
  });
});

describe('Directive: flAnalyticsSubsection', function() {
  var element, subsection;
  var $compile, $rootScope, $scope;

  beforeEach(module('flAnalytics'));

  beforeEach(inject(function(_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();

    subsection = 'someSubsection';
    element = $compile(angular.element(
      '<div fl-analytics-subsection="' + subsection + '"></div>'
    ))($scope);
  }));

  it('should load the subsection', function() {
    var ctrl = element.controller('flAnalyticsSubsection');

    expect(ctrl.subsection).toBe(subsection);
  });
});

describe('Directive: flAnalytics', function() {
  var action, element, name, section, subsection;
  var $compile, $rootScope, $scope;
  var AnalyticsMock, LogMock;

  beforeEach(module('flAnalytics', function($provide) {
    AnalyticsMock = jasmine.createSpyObj('Analytics', ['trackEvent']);
    LogMock = jasmine.createSpyObj('$log', ['warn']);

    $provide.value('Analytics', AnalyticsMock);
    $provide.value('$log', LogMock);
  }));

  beforeEach(inject(function(_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();

    action = 'someAction';
    name = 'someName';
    section = 'someSection';
    subsection = 'someSubsection';

    element = angular.element(
      '<div fl-analytics-section="' + section + '">' +
      '<div fl-analytics="' + name + '"></div>' + '</div>'
    );
  }));

  describe('inferring element type', function() {
    it('should infer click if element type not listed', function() {
      element = $compile(element)($scope);
      element.find('div').triggerHandler('click');
      $scope.$digest();

      expect(AnalyticsMock.trackEvent).toHaveBeenCalled();
    });

    it('should infer click from button', function() {
      element = $compile(angular.element(
        '<div fl-analytics-section="' + section + '">' +
        '<button fl-analytics="' + name + '"></button>' + '</div>'
      ))($scope);
      element.find('button').triggerHandler('click');
      $scope.$digest();

      expect(AnalyticsMock.trackEvent).toHaveBeenCalled();
    });

    it('should infer change from input', function() {
      element = $compile(angular.element(
        '<div fl-analytics-section="' + section + '">' +
        '<input fl-analytics="' + name + '"></input>' + '</div>'
      ))($scope);
      element.find('input').triggerHandler('change');
      $scope.$digest();

      expect(AnalyticsMock.trackEvent).toHaveBeenCalled();
    });
  });

  it('should log warning if no name', function() {
    element = $compile(angular.element(
      '<div fl-analytics-section="' + section + '">' +
      '<div fl-analytics></div>' + '</div>'
    ))($scope);
    $scope.$digest();

    expect(LogMock.warn).toHaveBeenCalledWith('invalid event name or section');
  });

  it('should have an undefined subsection if there is none', function() {
    element = $compile(element)($scope);
    element.find('div').triggerHandler('click');
    $scope.$digest();

    expect(AnalyticsMock.trackEvent).toHaveBeenCalledWith(
      section, undefined, name, 'click', undefined, '', undefined, undefined);
  });

  it('should have a subsection if there is one', function() {
    element = $compile(angular.element(
      '<div fl-analytics-section="' + section + '">' +
      '<div fl-analytics-subsection="' + subsection + '">' +
      '<div fl-analytics="' + name + '"></div>' + '</div></div>'
    ))($scope);
    element.find('div').triggerHandler('click');
    $scope.$digest();

    expect(AnalyticsMock.trackEvent).toHaveBeenCalledWith(
      section, subsection, name, 'click', undefined, '', undefined, undefined);
  });

  it('should get the action if one is specified', function() {
    element = $compile(angular.element(
      '<div fl-analytics-section="' + section + '">' +
      '<div fl-analytics-action="' + action + '" fl-analytics="' + name +
      '"></div>' + '</div>'
    ))($scope);
    element.find('div').triggerHandler('click');
    $scope.$digest();

    expect(AnalyticsMock.trackEvent).toHaveBeenCalledWith(
      section, undefined, name, action, undefined, '', undefined, undefined);
  });

  it('should get the reference and referenceID if specified', function() {
    var reference = 'freelancer_id';
    var referenceId = '12345';

    element = $compile(angular.element(
      '<div fl-analytics-section="' + section + '">' +
        '<div fl-analytics-action="' + action + '" ' +
          'fl-analytics="' + name + '"' +
          'fl-analytics-reference="' + reference + '"' +
          'fl-analytics-reference-id="' + referenceId + '">' +
        '</div>' +
      '</div>'
    ))($scope);
    element.find('div').triggerHandler('click');
    $scope.$digest();

    expect(AnalyticsMock.trackEvent).toHaveBeenCalledWith(
      section, undefined, name, action, undefined, '', reference, referenceId);
  });
});
