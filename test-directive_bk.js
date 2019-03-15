
app.directive("myDirective", function ($interval) {
    return {
        replace: true,
        restrict: "E",
        scope: {
            name: "=",
            onCallback: '&'
        },
        templateUrl: "temp.html",
        link: function ($scope, element, attrs) {
            //micro phone handler start
            var mediaRecorder;
            var handleSuccess = function (stream) {
                const options = { mimeType: 'audio/mpeg;codecs=mp3' };
                const recordedChunks = [];
                mediaRecorder = new MediaRecorder(stream, options);
                mediaRecorder.addEventListener('dataavailable', function (e) {
                    if (e.data.size > 0) {
                        recordedChunks.push(e.data);
                    }
                });
                mediaRecorder.addEventListener('stop', function () {
                    url = URL.createObjectURL(new Blob(recordedChunks));
                    console.log(url);
                    $scope.onCallback({ res: url });
                });
                mediaRecorder.start();
            };
            //micro phone handler end
            var countDownCounter, recordCounter;
            const defaultCountDown = 1;
            const defaultRecordTime = 5;
            const init = function () {
                $scope.countDown = defaultCountDown;
                $scope.recordTime = 0;
                $scope.status = 'ready';
            }
            const countDownHandler = function () {
                if ($scope.countDown === 1) {
                    console.log("go");
                    startRecord();
                } else
                    $scope.countDown--;
            };
            const recordHandler = function () {
                console.log("record...");
                if ($scope.recordTime === defaultRecordTime) {
                    stopRecord();
                } else
                    $scope.recordTime++;
            }
            const stopRecord = function () {
                console.log("stop");
                $interval.cancel(recordCounter);
                mediaRecorder.stop();
            }
            const startRecord = function () {
                console.log("start recoding...");
                $interval.cancel(countDownCounter);
                recordCounter = $interval(recordHandler, 1000);
                navigator.mediaDevices.getUserMedia({ audio: true, video: false })
                    .then(handleSuccess)
                    .catch(function(err){
                        console.log(err);
                        alert("Please allow microphone permission");
                    });
            }
            $scope.stopRecordClick = function () {
                stopRecord();
            }
            $scope.startRecordClick = function () {
                countDownCounter = $interval(countDownHandler, 1000);
            }
            $scope.countDown = 3;
            $scope.recordTime = 0;
            $scope.status = 'ready';
            init();
        }
    };
});