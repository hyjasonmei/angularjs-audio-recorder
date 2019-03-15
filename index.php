<html>
    <head>
        <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.5.7/angular.min.js"></script>
        <script>
                var app = angular.module("app",[]);
                app.filter('unsafe', function ($sce) { return $sce.trustAsHtml; });
                app.controller('ctrl', function MainCtrl($scope) {
                    $scope.callback = function(blob){
                        console.log("directive callback=>", blob);
                        url = URL.createObjectURL(blob);
                        console.log(url);
                        $scope.dUrl = url;
                        $scope.$apply();
                    };
                });
                app.config(['$compileProvider', function($compileProvider) {
                    $compileProvider.aHrefSanitizationWhitelist(/^\s*(blob):/);
                }]);
        </script>
        <script src="js/recorder.js"></script>
        <script src="js/directive/audio-recorder.js"></script>
    </head>
    <body ng-app="app">
        <main ng-controller="ctrl">
            <audio-recorder
                worker-path="js/recorderWorker.js"
                on-callback="callback(blob)">
            </audio-recorder>
            <hr/>
            <div>
                <a href="{{ dUrl }}">dl</a>
            </div>
        </main>
    <body>
</html>
