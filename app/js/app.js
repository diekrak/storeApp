'use strict';

var App = angular.module('myApp', ['angular-storage', 'ui.router', 'appServices','appControllers']);


App.constant('ENDPOINT_URI', 'http://0.0.0.0:3009/api/')
    .config(function($stateProvider, $urlRouterProvider, $httpProvider) {
        $stateProvider
            .state('login', {
                url: '/login',
                templateUrl: 'partials/login.html',
                controller: 'LoginCtrl',
                controllerAs: 'login'
            })
            .state('welcome', {
                url: '/welcome',
                templateUrl: 'partials/welcome.html',
                controller: 'LoginCtrl',
                controllerAs: 'dashboard'
            })
            .state('register', {
                url: '/register',
                templateUrl: 'partials/register.html',
                controller: 'LoginCtrl',
                controllerAs: 'login'
            })
            .state('adminOrder', {
                url: '/adminOrder',
                templateUrl: 'partials/adminOrder.html',
                controller: 'AdminOrdersCtr',
                controllerAs: 'dashboard'
            })
            .state('orders', {
                url: '/orders',
                templateUrl: 'partials/orders.html',
                controller: 'OrdersCtrl',
                controllerAs: 'dashboard'
            })
            .state('deliveryStatus', {
            url: '/deliveryStatus',
            templateUrl: 'partials/deliveryStatus.html',
            controller: 'DeliveryCtr',
            controllerAs: 'dashboard'
        })
        ;

        $urlRouterProvider.otherwise('/welcome');

        $httpProvider.interceptors.push('APIInterceptor');
    })
    .constant('weblogngConfig', {
        apiKey: '48548598-f079-4c57-bb39-d9ca8344abd7',
        options: {
            publishNavigationTimingMetrics: true,
            publishUserActive: true,
            application: 'simple-rest-website'
        }
    })
    ;