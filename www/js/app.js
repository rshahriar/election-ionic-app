angular.module('starter', ['ionic', 'ngCordova', 'starter.controllers', 'notifyme.services'])

    .run(function ($rootScope, $state, $ionicPlatform, $window, $cordovaPush, $http, Commons, Feeds) {

        var androidConfig = {
            "senderID": "341139902696"
        };

        var AIRBOP_APP_KEY = Commons.getAirbopAppKey();
        var AIRBOP_APP_SECRET = Commons.getAirbopAppSecret();

        function initialize() {
            var feed = new google.feeds.Feed(Commons.getBlogFeedUrl());

            feed.load(function(result) {
                if(!result.error) {
                    Feeds.set(result.feed.entries);
                    console.log("Success");
                } else {
                    console.log("Error - "+result.error.message);
                }
            });
        }

        document.addEventListener("deviceready", function () {

            // read the rss feeds
            google.load("feeds", "1", {callback:initialize});

            $cordovaPush.register(androidConfig).then(function (result) {
                // Success
                console.log("Registered with : " + result);
            }, function (err) {
                // Error
                Commons.setRegistrationValue('');
                console.log("Registration failed with : " + err);
            })

            $rootScope.$on('$cordovaPush:notificationReceived', function (event, notification) {
                switch (notification.event) {
                    case 'registered':
                        if (notification.regid.length > 0) {
                            // Set registration id to local storage
                            Commons.setRegistrationValue(notification.regId);

                            // Register with Airdrop
                            var request_uri = Commons.getAirbopRegUrl();
                            var request_body = JSON.stringify({
                                'reg': notification.regid
                            });
                            var timestamp = Math.round(new Date() / 1000);
                            var signature = CryptoJS.SHA256("POST" + request_uri + AIRBOP_APP_KEY
                            + timestamp + request_body + AIRBOP_APP_SECRET);

                            $http({
                                'method': 'POST',
                                'url': request_uri,
                                'dataType': "json",
                                'headers': {
                                    'Content-Type': 'application/json',
                                    'x-app-key': AIRBOP_APP_KEY,
                                    'x-timestamp': timestamp,
                                    'x-signature': signature
                                },
                                'data': request_body
                            }).success(function (data, status, headers, config) {
                                console.log("Connection with Airbop successful with status :" + status);
                            }).error(function (data, status, headers, config) {
                                console.log("Connection with Airbop failed with status :" + status);
                            });
                        }
                        break;

                    case 'message':
                        // this is the actual push notification. its format depends on the data model from the push server
                        //alert('message = ' + notification.message + ' || ' + JSON.stringify(notification));
                        var feed = {
                            'title': notification.payload.title,
                            'message': notification.payload.message,
                            'link': notification.payload.url
                        };
                        $rootScope.$broadcast('refreshFeeds', feed);

                        window.open(notification.payload.url, '_blank', 'location=yes', 'closebuttoncaption=Done');

                        break;

                    case 'error':
                        alert('GCM error = ' + notification.msg);
                        break;

                    default:
                        alert('An unknown GCM event has occurred');
                        break;
                }
            });
        }, false);
    })

    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider

            .state('app', {
                url: "/app",
                abstract: true,
                templateUrl: "templates/menu.html",
                controller: 'AppCtrl'
            })

            .state('app.dashboard', {
                url: "/dashboard",
                views: {
                    'menuContent': {
                        templateUrl: "templates/dashboard.html",
                        controller: 'DashboardCtrl'
                    }
                }
            })

            // menu for north
            .state('app.dcc-north', {
                url: "/dcc-north",
                views: {
                    'menuContent': {
                        templateUrl: "templates/dcc-north-profile.html",
                        controller: 'DccNorthCtrl'
                    }
                }
            })
            .state('app.dcc-north-profile', {
                url: "/dcc-north-profile",
                views: {
                    'menuContent': {
                        templateUrl: "templates/dcc-north-profile.html",
                        controller: 'DccNorthProfileCtrl'
                    }
                }
            })
            .state('app.letter-from-tabith', {
                url: "/letter-from-tabith",
                views: {
                    'menuContent': {
                        templateUrl: "templates/letter-from-tabith.html"
                    }
                }
            })
            .state('app.dcc-north-manifesto', {
                url: "/dcc-north-manifesto",
                views: {
                    'menuContent': {
                        templateUrl: "templates/dcc-north-manifesto.html",
                        controller: 'DccNorthManifestoCtrl'
                    }
                }
            })
            //.state('app.dcc-north-map', {
            //    url: "/dcc-north-map",
            //    views: {
            //        'menuContent': {
            //            templateUrl: "templates/dcc-north-map.html",
            //            controller: 'AppCtrl'
            //        }
            //    }
            //})
            .state('app.dcc-north-vote-facts', {
                url: "/dcc-north-vote-facts",
                views: {
                    'menuContent': {
                        templateUrl: "templates/dcc-north-vote-facts.html",
                        controller: 'DccNorthVoteCtrl'
                    }
                }
            })

            //menu for south
            .state('app.dcc-south', {
                url: "/dcc-south",
                views: {
                    'menuContent': {
                        templateUrl: "templates/dcc-south-profile.html",
                        controller: 'DccSouthCtrl'
                    }
                }
            })
            .state('app.dcc-south-profile', {
                url: "/dcc-south-profile",
                views: {
                    'menuContent': {
                        templateUrl: "templates/dcc-south-profile.html",
                        controller: 'DccSouthProfileCtrl'
                    }
                }
            })
            .state('app.dcc-south-manifesto', {
                url: "/dcc-south-manifesto",
                views: {
                    'menuContent': {
                        templateUrl: "templates/dcc-south-manifesto.html",
                        controller: 'DccSouthManifestoCtrl'
                    }
                }
            })
            //.state('app.dcc-south-map', {
            //    url: "/dcc-south-map",
            //    views: {
            //        'menuContent': {
            //            templateUrl: "templates/dcc-south-map.html",
            //            controller: 'AppCtrl'
            //        }
            //    }
            //})
            .state('app.dcc-south-vote-facts', {
                url: "/dcc-south-vote-facts",
                views: {
                    'menuContent': {
                        templateUrl: "templates/dcc-south-vote-facts.html",
                        controller: 'DccSouthVoteCtrl'
                    }
                }
            })


            .state('app.ideal-dhaka', {
                url: "/ideal-dhaka",
                views: {
                    'menuContent': {
                        templateUrl: "templates/ideal-dhaka.html",
                        controller: 'IdealDhakaIntroCtrl'
                    }
                }
            })

            // right menu
            .state('app.unsubscribe', {
                url: "/unsubscribe",
                views: {
                    'menuContent': {
                        templateUrl: "templates/subscription.html",
                        controller: 'SubscriptionCtrl'
                    }
                }
            })

            .state('app.contact', {
                url: "/contact",
                views: {
                    'menuContent': {
                        templateUrl: "templates/contact.html",
                        controller: 'ContactCtrl'
                    }
                }
            })

            .state('app.abbas-fb-page', {
                url: "/abbas-fb-page",
                views: {
                    'menuContent': {
                        templateUrl: "templates/abbas-fb-page.html",
                        controller: 'MAFBCtrl'
                    }
                }
            })

            .state('app.tabid-fb-page', {
                url: "/tabid-fb-page",
                views: {
                    'menuContent': {
                        templateUrl: "templates/abbas-fb-page.html",
                        controller: 'TAFBCtrl'
                    }
                }
            });

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/app/dashboard');
    });
