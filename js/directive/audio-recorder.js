
app.directive("audioRecorder", function ($interval) {
    return {
        replace: true,
        restrict: "E",
        scope: {
            workerPath: "@",
            onCallback: '&'
        },
        templateUrl: "js/directive/audio-recorder-template.html",
        link: function ($scope, element, attrs) {
            //micro phone handler start
            var audioContext = null;
            var audioInput = null,
                realAudioInput = null,
                inputPoint = null,
                audioRecorder = null;
            function gotStream(stream) {
                inputPoint = audioContext.createGain();
                realAudioInput = audioContext.createMediaStreamSource(stream);
                audioInput = realAudioInput;
                audioInput.connect(inputPoint);
                analyserNode = audioContext.createAnalyser();
                analyserNode.fftSize = 2048;
                inputPoint.connect(analyserNode);
                audioRecorder = new Recorder(inputPoint, { workerPath: $scope.workerPath });
                zeroGain = audioContext.createGain();
                zeroGain.gain.value = 0.0;
                inputPoint.connect(zeroGain);
                zeroGain.connect(audioContext.destination);
            }
            function initAudio() {
                try {
                    audioContext = new AudioContext();
                }
                catch (e) {
                    console.log('Web Audio API is not supported in this browser');
                }
                if (!navigator.getUserMedia)
                    navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
                if (!navigator.cancelAnimationFrame)
                    navigator.cancelAnimationFrame = navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;
                if (!navigator.requestAnimationFrame)
                    navigator.requestAnimationFrame = navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame;
                navigator.getUserMedia(
                    {
                        "audio": {
                            "mandatory": {
                                "googEchoCancellation": "false",
                                "googAutoGainControl": "false",
                                "googNoiseSuppression": "false",
                                "googHighpassFilter": "false"
                            },
                            "optional": []
                        },
                    },
                    gotStream,
                    function (e) {
                        alert('Error getting audio: ' + e.Message);
                        console.log(e);
                        return false;
                    });
                return true;
            }
            function doneEncoding( blob, cb ) {
                $scope.onCallback({ blob: blob });
                init();
            }
            function gotBuffers( buffers ) {
                audioRecorder.exportMonoWAV( doneEncoding );
            }
            //micro phone handler end
            var countDownCounter, recordCounter;
            const init = function () {
                console.log($scope.workerPath);
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
                audioRecorder.stop();
                audioRecorder.getBuffers( gotBuffers );
            }
            const startRecord = function () {
                console.log("start recoding...");
                $interval.cancel(countDownCounter);
                recordCounter = $interval(recordHandler, 1000);
                audioRecorder.clear();
                audioRecorder.record();
            }
            $scope.stopRecordClick = function () {
                stopRecord();
            }
            $scope.startRecordClick = function () {
                initAudio();
                countDownCounter = $interval(countDownHandler, 1000);
            }
            const defaultCountDown = 3;
            const defaultRecordTime = 10;
            $scope.countDown = defaultCountDown;
            $scope.recordTime = 0;
            $scope.status = 'ready';
            init();
        }
    };
});