var appControllers = angular.module('appControllers', []);

appControllers.controller('LoginCtrl', function($rootScope, $state, LoginService, UserService){
        var login = this;

        function signIn(user) {
            LoginService.login(user)
                .then(function(response) {
                    console.log("ACCEDIO ", response);
                    if (response.status == 401)
                    {
                        $state.go('login');
                    }else {
                        user.access_token = response.data.id;
                        user.userId = response.data.userId;
                        UserService.setCurrentUser(user);
                        $rootScope.$broadcast('authorized');
                        $state.go('welcome');
                    }
                });
        }

        function signInAndRegister(user) {
            LoginService.login(user)
                .then(function(response) {
                    console.log("Access Por new register", response);
                    if (response.status == 401)
                    {
                        $state.go('login');
                    }else {
                        user.access_token = response.data.id;
                        user.userId = response.data.userId;
                        UserService.setCurrentUser(user);
                        LoginService.registerFacade(user);
                        $rootScope.$broadcast('authorized');
                        $state.go('welcome');
                    }
                });
        }

        function registerNewUser(user) {
            LoginService.register(user)
                .then(function(response) {
                    signInAndRegister(user);
                });
        }

        function submit(user) {
            console.log("Summit");
            signIn(user);
        }

        login.newUser = false;
        login.submit = submit;
        login.registerNewUser = registerNewUser;
    })
    .controller('MainCtrl', function ($rootScope, $state, LoginService, UserService) {
        var main = this;

        function logout() {
            LoginService.logout()
                .then(function(response) {
                    main.currentUser = UserService.setCurrentUser(null);
                    $state.go('welcome');
                }, function(error) {
                    console.log(error);
                });
        }

        $rootScope.$on('authorized', function() {
            main.currentUser = UserService.getCurrentUser();
        });

        $rootScope.$on('unauthorized', function() {
            main.currentUser = UserService.setCurrentUser(null);
            $state.go('welcome');
        });

        main.logout = logout;
        main.currentUser = UserService.getCurrentUser();
    })


    .controller('OrdersCtrl', function(OrderModel, OrderAdmin, UserService,DeliveryStatus, DeliveryService){
        var orders = this;

        function getItems() {

            console.log("Se trae los items ", orders.currentOrder);
            OrderModel.allByOrder(orders.currentOrder.id)
                .then(function (result) {
                    orders.items = result.data;
                    console.log("ITEMS detalle ", orders.items );
                });
        }

        function createItem(item) {
            item.id=Math.floor((Math.random() * 10000000) + 1);
            item.orderId = orders.currentOrder.id;
            console.log("Itema crear ", item);
            //item.measure = "asd";
            OrderModel.create(item)
                .then(function (result) {
                    initCreateForm();
                    getItems();
                });
        }

        function updateItem(item) {
            OrderModel.update(item.id, item)
                .then(function (result) {
                    cancelEditing();
                    getItems();
                });
        }

        function deleteItem(itemId) {
            OrderModel.destroy(itemId)
                .then(function (result) {
                    cancelEditing();
                    getItems();
                });
        }

        function initCreateForm() {
            console.log("INICIALIZAR FORM ", orders.currentOrder);

            //select si hay una order en curso (estado 1)
            if (orders.currentOrder == undefined)
            {
                console.log("NO hay ordenes en memoria");
                //Buscar en BD
                orders.currentUser = UserService.getCurrentUser();
                ordStatusBegin = DeliveryStatus.getUserCreateStatusId();
                orderTmp = {orderStatusId : ordStatusBegin, costumerId: orders.currentUser.userId };
                console.log("ORDER TMP:",orderTmp );
                OrderAdmin.findOne(orderTmp)
                    .then(function (result) {
                        orders.currentOrder = null;
                        if (result.statusText=="OK")
                        {
                            orders.currentOrder = result.data;
                            console.log("De BD esta: " , orders.currentOrder);
                            getItems();
                        }
                    });
            }

            console.log("ACA esta : " , orders.currentOrder);
            orders.newItem = { name: '', description: '' };
        }

        function setEditedItem(item) {
            orders.editedItem = angular.copy(item);
            orders.isEditing = true;
        }

        function isCurrentItem(itemId) {
            return orders.editedItem !== null && orders.editedItem.id === itemId;
        }

        function cancelEditing() {
            orders.editedItem = null;
            orders.isEditing = false;
        }

        function createOrder() {

            //orderTmp = {date: "2016-01-01" , orderStatusId : 0, costumerId:1 }
            orders.currentUser = UserService.getCurrentUser();
            ordStatusBegin = DeliveryStatus.getUserCreateStatusId();

            OrderAdmin.count()
                .then(function (result){
                        console.log("total ",result );
                        total = result.data.count + 1;
                        orderTmp = {id:total ,dateIn: new Date() ,storeId:1 , orderStatusId : ordStatusBegin, costumerId: orders.currentUser.userId };
                        console.log("ORDER TMP:",orderTmp );
                        //crear uno nuevo
                        OrderAdmin.create(orderTmp)
                            .then(function (result){
                                    orders.currentOrder = null;
                                    if (result.statusText=="OK")
                                    {
                                        orders.currentOrder = result.data;
                                        console.log("Se creo en DB: " , orders.currentOrder);

                                        //Crear orden en serivicio de delivery
                                        deliveryOrder = {id: orders.currentOrder.id , locationId: 1, deliveryManId: 101, costumerId: orders.currentOrder.costumerId};
                                        DeliveryService.createOrder(deliveryOrder);
                                    }
                                    console.log("intento crearla");
                                }
                            );
                    }
                );
            console.log("ORDER created" ,orders.currentOrder)
        }

        function endOrder() {
            orders.currentOrder.orderStatusId = DeliveryStatus.getUserReadyStatusId();
            OrderAdmin.update(orders.currentOrder.id,orders.currentOrder)
                .then(function (result){
                    console.log("INTENTO UPD: ",result);

                    deliveryOrder = {id: orders.currentOrder.id , locationId: 2};
                    DeliveryService.updateOrder(deliveryOrder);
                    orders.currentOrder = null;
                    orders.items = null;
                });

        }


        orders.items = [];
        orders.editedItem = null;
        orders.isEditing = false;
        orders.getItems = getItems;
        orders.createItem = createItem;
        orders.updateItem = updateItem;
        orders.deleteItem = deleteItem;
        orders.setEditedItem = setEditedItem;
        orders.isCurrentItem = isCurrentItem;
        orders.cancelEditing = cancelEditing;
        orders.createOrder = createOrder;
        orders.endOrder = endOrder;

        initCreateForm();

    })




    .controller('AdminOrdersCtr', function(OrderAdmin, DeliveryStatus, DeliveryService){
        var orders = this;

        function getItems() {
            OrderAdmin.all()
                .then(function (result) {
                    orders.items = result.data;
                    console.log("ITems entoncrados ", orders.items);
                    orders.items.forEach(function(item) {
                        item.estado = orders.options[item.orderStatusId - 1].name;
                        console.log("ESTA ES: ",item);
                    });

                    console.log("ADMIN GOTTEN ", orders.items );
                });
        }

        function createItem(item) {
            OrderAdmin.create(item)
                .then(function (result) {
                    initCreateForm();
                    getItems();
                });
        }

        function updateItem(item) {
            item.orderStatusId = orders.selectedOption.id;
            console.log("UPDATE ",item);
            OrderAdmin.update(item.id, item)
                .then(function (result) {
                    //Update DeliveryService
                    locationID = item.orderStatusId;
                    deliveryOrder = {id: item.id , locationId: locationID};
                    DeliveryService.updateOrder(deliveryOrder);
                    cancelEditing();
                    getItems();
                });
        }

        function deleteItem(itemId) {
            OrderAdmin.destroy(itemId)
                .then(function (result) {
                    cancelEditing();
                    getItems();
                });
        }

        function initCreateForm() {
            orders.newItem = { name: '', description: '' };
        }

        function setEditedItem(item) {
            orders.editedItem = angular.copy(item);
            orders.selectedOption = orders.options[(item.orderStatusId - 1 )];
            orders.isEditing = true;
        }

        function isCurrentItem(itemId) {
            return orders.editedItem !== null && orders.editedItem.id === itemId;
        }

        function cancelEditing() {
            orders.editedItem = null;
            orders.isEditing = false;
        }

        function getOptions() {
            DeliveryStatus.all()
                .then(function (result) {
                    orders.options = result.data;
                    console.log("opciones status ",orders.options);
                });
        }

        orders.items = [];
        orders.editedItem = null;
        orders.isEditing = false;
        orders.getItems = getItems;
        orders.createItem = createItem;
        orders.updateItem = updateItem;
        orders.deleteItem = deleteItem;
        orders.setEditedItem = setEditedItem;
        orders.isCurrentItem = isCurrentItem;
        orders.cancelEditing = cancelEditing;
        getOptions();
        initCreateForm();
        getItems();

    })




    .controller('DeliveryCtr', function(DeliveryService, UserService){
        var orders = this;

        function getItems() {
            currentUser = UserService.getCurrentUser();
            DeliveryService.getOrderByCostumer(currentUser)
                .then(function (result) {
                    console.log("ITEMS " , result);
                    orders.items = result.data;
                    getLocations();
                    console.log("ITEMS2 " , orders.items);
                });
        }

        function getLocations() {
            DeliveryService.allLocations()
                .then(function (result) {
                    orders.locations = result.data;
                    console.log("Locaciones ",orders.locations);

                    orders.items.forEach(function(item) {
                        item.location = orders.locations[item.locationId - 1].place;
                        item.deliveryManId  = "Felipe";
                    });
                });
        }

        function initCreateForm() {
            orders.newItem = { name: '', description: '' };
        }

        function setEditedItem(item) {
            orders.editedItem = angular.copy(item);
            orders.isEditing = true;
        }

        function isCurrentItem(itemId) {
            return orders.editedItem !== null && orders.editedItem.id === itemId;
        }

        function cancelEditing() {
            orders.editedItem = null;
            orders.isEditing = false;
        }

        orders.items = [];
        orders.editedItem = null;
        orders.isEditing = false;
        orders.getItems = getItems;
        orders.setEditedItem = setEditedItem;
        orders.isCurrentItem = isCurrentItem;
        orders.cancelEditing = cancelEditing;

        initCreateForm();
        getItems();
    })

;
