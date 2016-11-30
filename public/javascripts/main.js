$(function () {
    $.ajaxSetup({timeout: 5000});
    console.log("Module configurator");
    var serverTimestamp = $("p.moduleTime span").data("unixtime");
    var localTime = new Date().getTime();

    $(".moduleTime .status").text("Module time OK: " + new Date(serverTimestamp));
    $("a.terminal").attr("href", "//" + document.location.hostname + ":1234" + $("a.terminal").attr("href"));

    // 10 min tolerance
    var largeTimeDifference = Math.abs(serverTimestamp - localTime) > (10 * 60 * 1000);
    if (largeTimeDifference) {
        if (confirm("module time does not match your local time. Do you want to update module time? New time will be " + new Date())) {
            $.get("/syncTime", {"newTime": Math.ceil(new Date().getTime() / 1000)},
                function (response) {
                    alert(response);
                })
                .fail(function (data) {
                    alert("error: " + data.responseText);
                });
        } else {
            $(".moduleTime .status")
                .text("WARNING: Module time is not in sync with your device!!! Module time is: " + new Date(serverTimestamp))
                .addClass("warning");
        }
    }

    function bindEvents() {
        $("#closeSession").click(function () {
            if (confirm("Are you sure you want to close this session and restart the module?")) {
                $("body").empty().append("<h1>SESSION CLOSED. MODULE IS RESTARTING IN DEFAULT MODE...WAIT 5 min</h1>");
                $.get("/closeSession");
            }
        });
    }

    bindEvents();

    function getStatus(command, placeholderSelector, multiline) {
        $.get("/execute", {command: command},
            function (response) {
                if (multiline && response.stdout) {
                    $(placeholderSelector).append("<pre class='ok'>" + response.stdout + "</pre>");
                } else {
                    $(placeholderSelector).append("<span class='ok'>" + response.stdout + "</span>");
                }
                if (response.error) {
                    $(placeholderSelector).append("<span class='error'>" + JSON.stringify(response.error) + "</span>");
                }

                if (response.stderr) {
                    $(placeholderSelector).append("<span class='error'>" + response.stderr + "</span>");
                }
            })
            .fail(function (data) {
                $(placeholderSelector).append("<span class='error'>" + data.responseText + "</span>");
            });
    }

    function getStatusFromMonitoringApp(device, placeholderSelector) {
        $.get("http://" + document.location.hostname + ":8080/status", {device: device},
            function (response) {
                $(placeholderSelector).append("<span class='ok'>" + response.status + "</span>");
                if (response.error) {
                    $(placeholderSelector).append("<span class='error'>" + response.error + "</span>");
                }
            })
            .fail(function (data) {
                $(placeholderSelector).append("<span class='error'>Unable to get status for " + device + " Error: " + data.responseText + "</span>");
            });
    }

    if ($("#hardwareStatus").length === 1) {
        console.log("hardware status");
        getStatus("battery-voltage", "#battery");
        getStatus("ls /dev/video0", "#camera");
        getStatus("df -h /media/sdcard/", "#storage", true);
        getStatusFromMonitoringApp("motion", "#motion");
        getStatusFromMonitoringApp("touch", "#touch");
    }
})
;