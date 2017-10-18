(function() {
    'use strict';

    angular
        .module('core.user')
        .factory('User', User);

    User.$inject = ['$cookies'];

    function User($cookies) {
        var orderByCookie = $cookies.get('orderBy');
        var ageCookie = $cookies.get('age');
        var user = {
            orderBy: orderByCookie || 'title',
            age: ageCookie || 'child',
            updateOrderBy: updateOrderBy,
            updateAge: updateAge
        };

        return user;

        function updateOrderBy(newValue) {
            user.orderBy = newValue;
            $cookies.put('orderBy', newValue);
        }

        function updateAge(newValue) {
            user.age = newValue;
            $cookies.put('age', newValue);
        }
    }
})();
