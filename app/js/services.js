var appServices = angular.module('appServices', []);



appServices.service('APIInterceptor', function($rootScope, UserService) {
        var service = this;

        service.request = function(config) {
            var currentUser = UserService.getCurrentUser(),
                access_token = currentUser ? currentUser.access_token : null;
            console.log("Current user: ", currentUser);
            if (access_token) {
                config.headers.authorization = access_token;
            }
            return config;
        };

        service.responseError = function(response) {
            if (response.status === 401) {
                $rootScope.$broadcast('unauthorized');
            }
            return response;
        };
    })
    .service('UserService', function(store) {
        var service = this,
            currentUser = null;

        service.setCurrentUser = function(user) {
            currentUser = user;
            store.set('user', user);
            return currentUser;
        };

        service.getCurrentUser = function() {
            if (!currentUser) {
                currentUser = store.get('user');
            }
            return currentUser;
        };
    })
    .service('LoginService', function($http) {
        var service = this,
            path = 'People/',
            costumerDeliveryApi = "http://0.0.0.0:4000/api/Costumers/",
            costumerOrderApi = "http://0.0.0.0:3000/api/Costumers/";

        function getUrl() {         
            return "http://0.0.0.0:3009/api/" + path;
        }

        function getLogUrl(action) {
            return getUrl() + action;
        }

        service.login = function(credentials) {

            console.log("Credenciales ",credentials);
            return $http.post(getLogUrl('login'), credentials);
        };

        service.logout = function() {
            return $http.post(getLogUrl('logout'));
        };

        service.register = function(user) {
            console.log("register ", user);
            return $http.post(getUrl(), user);
        };

        service.registerFacade = function(user) {
            $http.post(costumerDeliveryApi, user);
            $http.post(costumerOrderApi, user);
        };
    })


    .service('OrderModel', function ($http) {
        var service = this,
            path = 'Products/';

        function getUrl() {
            return "http://0.0.0.0:3000/api/"  + path;
        }

        function getUrlForId(itemId) {
            return getUrl(path) + itemId;
        }

        service.all = function () {
            return $http.get(getUrl());
        };

        service.allByOrder = function (orderId) {
            return $http.get(getUrl() + "?filter={\"where\": {\"orderId\":"+ orderId + "}}");
        };
        service.fetch = function (itemId) {
            return $http.get(getUrlForId(itemId));
        };

        service.create = function (item) {
            console.log("Produtc " ,item);
            return $http.post(getUrl(), item);
        };

        service.update = function (itemId, item) {
            return $http.put(getUrlForId(itemId), item);
        };

        service.destroy = function (itemId) {
            return $http.delete(getUrlForId(itemId));
        };
    })



    .service('OrderAdmin', function ($http) {
        var service = this,
            path = 'Orders/';

        function getUrl() {
            return "http://0.0.0.0:3000/api/" + path;
        }

        function getUrlForId(itemId) {
            return getUrl(path) + itemId;
        }

        service.all = function () {
            return $http.get(getUrl());
        };

        service.fetch = function (itemId) {
            return $http.get(getUrlForId(itemId));
        };

        service.create = function (item) {
            return $http.post(getUrl(), item);
        };

        service.update = function (itemId, item) {
            return $http.put(getUrl(itemId), item);
        };

        service.destroy = function (itemId) {
            return $http.delete(getUrlForId(itemId));
        };

        service.count = function () {
            return $http.get(getUrl()+ "count/");
        };

        service.findOne = function (order) {
            return $http.get(getUrl()+ "findOne?filter={\"where\": {\"orderStatusId\":"+ order.orderStatusId +" , \"costumerId\":"+ order.costumerId +" }}");
        };

    })




    .service('DeliveryStatus', function ($http) {
        var delivery = this,
            path = 'OrderStatuses/';

        function getUrl() {
            return "http://0.0.0.0:3000/api/" + path;
        }

        delivery.all = function () {
            return $http.get(getUrl());
        };

        delivery.getUserCreateStatusId = function () {
            return 1;
        };


        delivery.getUserReadyStatusId = function () {
            return 2;
        };

        delivery.options = delivery.all;
    })






    .service('DeliveryService', function ($http) {
        var service = this,
            path = 'items/',
            apiOrder = "http://0.0.0.0:4000/api/Orders/",
            apiCostumer = "http://0.0.0.0:4000/api/Costumers/",
            apiLocation = "http://0.0.0.0:4000/api/Locations/";


        service.createOrder = function (order) {
            console.log("Crear orden en delivery: " ,order);
            return $http.post(apiOrder, order);
        };

        service.updateOrder = function (order) {
            console.log("Update orden en delivery: " ,order);
            return $http.put(apiOrder, order);
        };


        service.getOrderByCostumer = function (costumer) {
            console.log("CONSUMER", costumer);
            return $http.get(apiOrder + "?filter={\"where\": {\"costumerId\":"+ costumer.userId +" }}");
        };

        service.allLocations = function () {
            return $http.get(apiLocation);
        };

    })
;