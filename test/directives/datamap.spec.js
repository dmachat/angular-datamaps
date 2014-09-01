'use strict';

describe('datamap', function () {

  var $compile, $rootScope;

  beforeEach(function () {
    angular.mock.module('datamaps');

    inject(function ($injector) {
      $compile = $injector.get('$compile');
      $rootScope = $injector.get('$rootScope');
    });
  });

  it('should display datamap', function () {
    var element = $compile('<datamap />')($rootScope);
    $rootScope.$digest();
    expect(element.html()).toContain('svg');
  });

});
