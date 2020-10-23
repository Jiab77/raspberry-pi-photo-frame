"use strict";
$(function (event) {
    console.group('App');
    console.info('DOM loaded.', event);
    console.groupEnd();

    // Demo settings
    var loadDemo = false;
    var demoDuration = 60000;
    var infiniteDemo = true;

    // Slideshow settings
    var imagesPath = 'http://127.0.0.1:8001/images';
    var infiniteSlideshow = true;
    var slideshowAnimationEnter = 'fade in';
    var slideshowAnimationLeave = 'fade out';
    var slideshowPauseDuration = 8000;
    var animationDuration = 800;
    var animationLoadingTime = 800;

    // Do not change settings below
    var demoStopped = false;
    var slideshowStopped = false;
    var slideshowDisplayDuration = (slideshowPauseDuration - 1000);
    var checkInterval = 100;
    var modalHideTimeout = 1000;

    // Internal dimmer settings
    $('.image .bottom.dimmer').dimmer({
        transition: 'fade up',
    });

    // Fullscreen event handler on keypress
    document.addEventListener("keypress", function(e) {
        if (e.keyCode === 13) {
            console.log('User want to go fullscreen.', e);
            toggleFullScreen();
        }
    }, false);

    // Fullscreen event handler on double click
    document.addEventListener("dblclick", function(e) {
        console.log('User want to go fullscreen.', e);
        toggleFullScreen();
    }, false);

    // Fullscreen function
    function toggleFullScreen() {
        if (!document.fullscreenElement) {
            console.log('Init fullscreen...');
            document.documentElement.requestFullscreen();

            // Hide slideshow header nicely
            console.log('Hiding slideshow header...');
            $('.ui.overlay.fullscreen.inverted.modal .header').hide('show');
        }
        else {
            // User entered 'Esc' key
            if (document.exitFullscreen) {
                console.log('Exit fullscreen...');
                document.exitFullscreen();
            }
        }
    }

    function random(min, max) {
        const num = Math.floor(Math.random() * (max - min + 1)) + min;
        return num;
    }

    function loadSlideshow(images, source) {
        console.log('Loading slideshow...');
        console.log('Loaded image list:', images);
        console.log('Slideshow mode:', (infiniteSlideshow !== true ? 'Ends when all pictures are displayed' : 'Infinite'));

        // Hide mouse cursor during slideshow
        $('html').css('cursor', 'none');

        // Changing metas display style (required for left alignment)
        $('#picture-metas').css('width', 'inherit');
        // $('#picture-metas').css('padding-left', '1rem');

        // Adjust slideshow size
        if (document.fullscreenElement) {
            $('.image.content .dimmable').css('height', '97vh');
        }
        else {
            $('.image.content .dimmable').css('height', '90vh');
        }

        var limit = images.length;
        var baseURL = imagesPath;
        if (typeof source !== 'undefined') {
            var limit = images.length;
            var baseURL = source;
        }

        console.log('Total pictures:', limit);
        console.log('Base URL:', baseURL);

        // Init slideshow
        var slideshowStop = setInterval(function () {
            // All pictures displayed, stopping
            if (limit === 0 && infiniteSlideshow === false) {
                slideshowStopped = true;

                if (slideshow) {
                    console.log('End of slideshow.');
                    clearInterval(slideshow);
                }

                console.log('No more pictures to display.');

                // Hiding modal
                var delayedModalHide = setTimeout(function () {
                    $('.modal').modal('hide');

                    if ($('.modal').modal('is active') === false) {
                        console.log('Modal closed.');
                    }

                    clearTimeout(delayedModalHide);
                }, modalHideTimeout);

                // Show mouse cursor when slideshow is finished
                $('html').css('cursor', 'default');

                // Update main container content
                $('.ui.basic.inverted.segment').addClass('very padded center aligned');
                $('.ui.basic.inverted.segment').html('<h1>End of slideshow</h1><br><button class="ui inverted primary button" onclick="window.location.reload();">Restart</button>');

                clearInterval(slideshowStop);
            }

            // All pictures displayed, reloading
            if (limit === 0 && infiniteSlideshow === true) {
                console.log('End of slideshow.');
                console.log('Reloading in 5 seconds...');

                // Hiding modal
                var delayedModalHide = setTimeout(function () {
                    $('.modal').modal('hide');

                    if ($('.modal').modal('is active') === false) {
                        console.log('Modal closed.');
                    }

                    clearTimeout(delayedModalHide);
                }, modalHideTimeout);

                // Show mouse cursor when slideshow is finished
                $('html').css('cursor', 'default');

                // Update main container content
                $('.ui.basic.inverted.segment').addClass('very padded center aligned');
                $('.ui.basic.inverted.segment').html('<h1>End of slideshow</h1><br><button class="ui inverted primary button" id="btnReload">Reloading...</button>');

                // Reload counter
                var reloadTimeInSeconds = 5;
                var reloadCounter = setInterval(function () {
                    $('#btnReload').html('Reload in ' + reloadTimeInSeconds + ' seconds...');

                    if (reloadTimeInSeconds === 0) {
                        // Clear all intervals
                        clearInterval(reloadCounter);
                        clearInterval(slideshow);
                        clearInterval(slideshowStop);

                        // Reload slideshow
                        loadSlideshow(images);
                    }

                    reloadTimeInSeconds--;
                }, 1000);
            }
        }, slideshowPauseDuration);

        // Display all received pictures
        if (limit !== 0) {
            // Load initial picture
            loadPictures(images, baseURL);

            // Load all other pictures
            var slideshow = setInterval(function () {
                // Continue till we have pictures to display
                if (limit !== 0) {
                    limit--;

                    // Display slideshow header nicely
                    if ($('.ui.overlay.fullscreen.inverted.modal .header').css('display') === 'none' && !document.fullscreenElement) {
                        console.log('Display slideshow header...');
                        $('.ui.overlay.fullscreen.inverted.modal .header').show('slow');
                    }

                    // Adjust slideshow size
                    if (document.fullscreenElement) {
                        $('.image.content .dimmable').css('height', '97vh');
                    }
                    else {
                        $('.image.content .dimmable').css('height', '90vh');
                    }

                    console.log('Pictures left:', limit);

                    loadPictures(images, imagesPath);
                }
            }, slideshowPauseDuration);
        }
    }

    function loadPictures(images, source) {
        var totalImages = images.length;
        var randomImageId = random(0, (totalImages-1));

        console.log('==> Random ID:', randomImageId);

        if (typeof images[randomImageId] !== 'undefined' && slideshowStopped === false) {
            // Top level images
            if (images[randomImageId].type !== 'folder') {
                var randomPicture = images[randomImageId];
                var randomPictureURL = source + '/' + randomPicture.name;

                console.log('Analyzing file extension...');

                // Avoid displaying videos for now
                var parsedName = String(randomPicture.name).split('.');
                var fileExtension = parsedName[(parsedName.length-1)];

                // Gather time details
                var fileDate = new Date(Date.parse(randomPicture.time));
                var fileDateLang = window.navigator.language;
                var fileDateOptions = {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                };

                console.log('Found extension:', fileExtension);

                if (String(fileExtension).toLowerCase() === 'mp4' || String(fileExtension).toLowerCase() === '3gp') {
                    console.log('Video detected, skipping it...');
                    loadPictures(images, source);
                    return;
                }

                console.log('New image:', randomPicture);
                console.log('Loading new picture [' + randomPictureURL + '].');

                // Assign new random image
                $('#slideshow-image')[0].src = randomPictureURL;
                // $('#slideshow-image')[0].width = (window.innerWidth - 40);
                $('#slideshow-image')[0].height = (document.fullscreenElement ? (window.innerHeight - 40) : (window.innerHeight - 100));
                // $('#slideshow-image')[0].height = (window.innerHeight - 10);
                // $('#slideshow-image').css('height', '90vh');
                // $('#slideshow-image')[0].height = (window.innerHeight - 100) * (window.innerWidth - 40) / $('#slideshow-image')[0].width;
                // $('#slideshow-image')[0].width = (window.innerWidth - 40);

                // Show image with delay
                var checkImage = setInterval(function () {
                    if ($('#slideshow-image')[0].src !== '') {
                        if ($('.modal').modal('is active') === false) {
                            $('.modal').modal('show');
                        }
                        if ($('.ui.basic.inverted.segment').hasClass('loading')) {
                            $('.ui.basic.inverted.segment').removeClass('loading');
                        }

                        var delayedAnimation = setTimeout(function () {
                            console.log('Picture loaded, running animation.');
                            $('#slideshow-image').transition(slideshowAnimationEnter, animationDuration);

                            if (typeof randomPicture.name !== 'undefined') {
                                var html  = '<div class="ui basic left aligned segment">';
                                    html += '<strong>File:</strong>&nbsp;<span>' + randomPicture.name + '</span>';
                                    html += '<br><br>';
                                    html += '<strong>Date:</strong>&nbsp;<span>' + fileDate.toLocaleDateString(fileDateLang, fileDateOptions) + '</span>';
                                    html += '</div>';

                                $('#picture-metas').html(html);

                                var delayedDimmerAnimation = setTimeout(function () {
                                    console.log('Metas defined, showing dimmer.');

                                    $('.image .bottom.dimmer').dimmer('show');

                                    clearTimeout(delayedDimmerAnimation);
                                }, animationLoadingTime);
                            }

                            clearTimeout(delayedAnimation);
                        }, animationLoadingTime);

                        clearInterval(checkImage);
                    }
                }, checkInterval);

                // Hide image nicely
                var displayTime = setTimeout(function () {
                    if ($('#slideshow-image')[0].src !== '') {
                        console.log('Display timeout reached, hidding dimmer and picture.');

                        $('.image .bottom.dimmer').dimmer('hide');

                        $('#slideshow-image').transition(slideshowAnimationLeave, animationDuration, function () {
                            $('#slideshow-image')[0].src = '';
                        });
                    }

                    clearTimeout(displayTime);
                }, slideshowDisplayDuration);
            }

            // Images from subfolders
            else {
                console.log('Sub folder found:', images[randomImageId].name);
                console.log('Sub folder content:', images[randomImageId].children);
                console.log('Sub folder path:', source + '/' + images[randomImageId].name);

                loadPictures(images[randomImageId].children, source + '/' + images[randomImageId].name);
            }
        }
    }

    function loadDemoSlideshow(images) {
        console.log('Loading demo slideshow...');
        console.log('Loaded image list:', images);
        console.log('Demo duration:', (infiniteDemo !== true ? demoDuration : 'Infinite'));

        // Hide mouse cursor during slideshow
        $('html').css('cursor', 'none');

        // Adjust slideshow size
        if (document.fullscreenElement) {
            $('.image.content .dimmable').css('height', '99vh');
        }
        else {
            $('.image.content .dimmable').css('height', '90vh');
        }

        var limit = images.length;
        var imagesPath = 'https://picsum.photos/id/';

        console.log('Total pictures:', limit);
        console.log('Base URL:', imagesPath);

        // Init demo slideshow
        var demoStop = setTimeout(function () {
            // Demo duration reached, stopping
            if (infiniteDemo === false) {
                demoStopped = true;

                if (slideshow) {
                    console.log('Slideshow finished.');
                    clearInterval(slideshow);
                }

                console.log('End of demo slideshow.');

                // Hiding modal
                var delayedModalHide = setTimeout(function () {
                    $('.modal').modal('hide');

                    if ($('.modal').modal('is active') === false) {
                        console.log('Modal closed.');
                    }

                    clearTimeout(delayedModalHide);
                }, modalHideTimeout);

                // Show mouse cursor when slideshow is finished
                $('html').css('cursor', 'default');

                // Update main container content
                $('.ui.basic.inverted.segment').addClass('very padded center aligned');
                $('.ui.basic.inverted.segment').html('<h1>End of demo slideshow</h1><br><button class="ui inverted primary button" onclick="window.location.reload();">Restart</button>');

                clearTimeout(demoStop);
            }

            // All pictures displayed, reloading
            if (limit === 0 && infiniteDemo === true) {
                console.log('End of demo slideshow.');
                console.log('Reloading in 5 seconds...');

                // Hiding modal
                var delayedModalHide = setTimeout(function () {
                    $('.modal').modal('hide');

                    if ($('.modal').modal('is active') === false) {
                        console.log('Modal closed.');
                    }

                    clearTimeout(delayedModalHide);
                }, modalHideTimeout);

                // Show mouse cursor when slideshow is finished
                $('html').css('cursor', 'default');

                // Update main container content
                $('.ui.basic.inverted.segment').addClass('very padded center aligned');
                $('.ui.basic.inverted.segment').html('<h1>End of demo slideshow</h1><br><button class="ui inverted primary button" id="btnReload">Reloading...</button>');

                // Reload counter
                var reloadTimeInSeconds = 5;
                var reloadCounter = setInterval(function () {
                    $('#btnReload').html('Reload in ' + reloadTimeInSeconds + ' seconds...');

                    if (reloadTimeInSeconds === 0) {
                        // Clear all intervals
                        clearInterval(reloadCounter);
                        clearInterval(slideshow);
                        clearInterval(demoStop);

                        // Reload demo slideshow
                        loadDemoSlideshow(images);
                    }

                    reloadTimeInSeconds--;
                }, 1000);
            }
        }, demoDuration);

        // Display all received pictures
        if (limit !== 0) {
            // Load initial picture
            loadDemoPictures(images, imagesPath);

            // Load all other pictures
            var slideshow = setInterval(function () {
                // Continue till we have pictures to display
                if (limit !== 0) {
                    limit--;

                    // Display slideshow header nicely
                    if ($('.ui.overlay.fullscreen.inverted.modal .header').css('display') === 'none' && !document.fullscreenElement) {
                        console.log('Display slideshow header...');
                        $('.ui.overlay.fullscreen.inverted.modal .header').show('slow');
                    }

                    // Adjust slideshow size
                    if (document.fullscreenElement) {
                        $('.image.content .dimmable').css('height', '99vh');
                    }
                    else {
                        $('.image.content .dimmable').css('height', '90vh');
                    }

                    console.log('Pictures left:', limit);

                    loadDemoPictures(images, imagesPath);
                }
            }, slideshowPauseDuration);
        }
    }

    function loadDemoPictures(images, source) {
        var totalImages = images.length;
        var randomImageId = random(0, (totalImages-1));

        console.log('==> Random ID:', randomImageId);

        if (typeof images[randomImageId] !== 'undefined' && demoStopped === false) {
            var randomPicture = images[randomImageId];
            var randomPictureURL = source + images[randomImageId].id + '/' + (window.innerWidth - 40) + '/' + (window.innerHeight - 100);

            console.log('New image:', randomPicture);
            console.log('Loading new picture [' + randomPictureURL + '].');

            // Assign new random image
            $('#slideshow-image')[0].src = randomPictureURL;

            // Show image with delay
            var checkImage = setInterval(function () {
                if ($('#slideshow-image')[0].src !== '') {
                    if ($('.modal').modal('is active') === false) {
                        $('.modal').modal('show');
                    }
                    if ($('.ui.basic.inverted.segment').hasClass('loading')) {
                        $('.ui.basic.inverted.segment').removeClass('loading');
                    }

                    var delayedAnimation = setTimeout(function () {
                        console.log('Picture loaded, running animation.');
                        $('#slideshow-image').transition(slideshowAnimationEnter, animationDuration);

                        if (typeof randomPicture.author !== 'undefined') {
                            var html  = '<p>';
                                html += '<strong>Author</strong>';
                                html += '&nbsp;&ndash;&nbsp;';
                                html += '<span>' + randomPicture.author + '</span>';
                                html += '</p>';

                            $('#picture-metas').html(html);

                            var delayedDimmerAnimation = setTimeout(function () {
                                console.log('Metas defined, showing dimmer.');

                                $('.image .bottom.dimmer').dimmer('show');

                                clearTimeout(delayedDimmerAnimation);
                            }, animationLoadingTime);
                        }

                        clearTimeout(delayedAnimation);
                    }, animationLoadingTime);

                    clearInterval(checkImage);
                }
            }, checkInterval);

            // Hide image nicely
            var displayTime = setTimeout(function () {
                if ($('#slideshow-image')[0].src !== '') {
                    console.log('Display timeout reached, hidding dimmer and picture.');

                    $('.image .bottom.dimmer').dimmer('hide');

                    $('#slideshow-image').transition(slideshowAnimationLeave, animationDuration, function () {
                        $('#slideshow-image')[0].src = '';
                    });
                }

                clearTimeout(displayTime);
            }, slideshowDisplayDuration);
        }
    }

    if (loadDemo === true) {
        // Get demo pictures from JSON list
        $.getJSON('https://picsum.photos/list')
            .done(function (imagesList) {
                loadDemoSlideshow(imagesList);
            })
            .fail(function (jqxhr, error, textResponse) {
                console.error(error, textResponse, jqxhr);
            });
    }
    else {
        // Get local pictures from JSON list
        $.getJSON(imagesPath)
            .done(function (imagesList) {
                loadSlideshow(imagesList);
            })
            .fail(function (jqxhr, error, textResponse) {
                console.error(error, textResponse, jqxhr);
            });
    }
});
