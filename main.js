"use strict";
$(function (event) {
    console.group('App');
    console.info('DOM loaded.', event);
    console.groupEnd();

    // Demo settings
    var loadDemo = true;
    var demoDuration = 60000;
    var demoStopped = false;

    // Slideshow settings
    var imagesPath = '/images';
    var slideshowStopped = false;
    var slideshowAnimationEnter = 'fade in';
    var slideshowAnimationLeave = 'fade out';
    var slideshowPauseDuration = 5000;
    var slideshowDisplayDuration = (slideshowPauseDuration - 1000);
    var animationDuration = 800;
    var animationLoadingTime = 800;
    var checkInterval = 100;
    var modalHideTimeout = 1000;

    // Internal dimmer settings
    $('.image .bottom.dimmer').dimmer({
        transition: 'fade up',
    });

    // Fullscreen event handler
    document.addEventListener("keypress", function(e) {
        if (e.keyCode === 13) {
            toggleFullScreen();
        }
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

        // Hide mouse cursor during slideshow
        $('html').css('cursor', 'none');

        // Adjust slideshow size
        if (document.fullscreenElement) {
            $('.image.content.dimmable').css('height', '99vh');
            // $('#slideshow-image').css('height', '100vh');
        }
        else {
            $('.image.content.dimmable').css('height', '93vh');
            // $('#slideshow-image').css('height', '93vh');
        }

        var limit = images.length;
        var baseURL = imagesPath;
        if (typeof source !== 'undefined') {
            var limit = images.length;
            var baseURL = source;
        }

        console.log('Total pictures:', limit);
        console.log('Base URL:', baseURL);

        // Stop slideshow when all pictures are displayed
        var slideshowStop = setInterval(function () {
            if (limit === 0) {
                slideshowStopped = true;

                if (slideshow) {
                    console.log('Slideshow finished.');
                    clearInterval(slideshow);
                }

                console.log('No more pictures to display.');

                // Show mouse cursor when slideshow is finished
                $('html').css('cursor', 'default');

                // Update main container content
                $('.ui.basic.inverted.segment').addClass('very padded center aligned');
                $('.ui.basic.inverted.segment').html('<h1>End of slideshow</h1><br><button class="ui inverted primary button" onclick="window.location.reload();">Restart</button>');

                var delayedModalHide = setTimeout(function () {
                    $('.modal').modal('hide');

                    if ($('.modal').modal('is active') === false) {
                        console.log('Modal closed.');
                    }

                    clearTimeout(delayedModalHide);
                }, modalHideTimeout);

                clearInterval(slideshowStop);
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
                        $('.image.content.dimmable').css('height', '99vh');
                        // $('#slideshow-image').css('height', '100%');
                    }
                    else {
                        $('.image.content.dimmable').css('height', '93vh');
                        // $('#slideshow-image').css('height', '93vh');
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

                // Avoid displaying videos for now
                var parsedName = String(randomPicture.name).split('.');
                var fileExtension = parsedName[(parsedName.length-1)];
                console.log('Analyzing file extension...', fileExtension);
                if (String(fileExtension).toLowerCase() === 'mp4') {
                    console.log('Video detected, skipping item...');
                    return;
                }

                console.log('New image:', randomPicture);
                console.log('Loading new picture [' + randomPictureURL + '].');

                // Assign new random image
                $('#slideshow-image')[0].src = randomPictureURL;
                // $('#slideshow-image')[0].width = (window.innerWidth - 40);
                // $('#slideshow-image')[0].height = (window.innerHeight - 100);
                $('#slideshow-image')[0].height = (window.innerHeight + 100);
                // $('#slideshow-image').css('height', '93vh');
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
                                    // html += '&nbsp;&ndash;&nbsp;';
                                    html += '<br><br>';
                                    html += '<strong>Date:</strong>&nbsp;<span>' + randomPicture.time + '</span>';
                                    html += '</div>';

                                $('#picture-metas').html(html);
                                $('.image .bottom.dimmer').dimmer('show');
                            }

                            clearTimeout(delayedAnimation);
                        }, animationLoadingTime);

                        clearInterval(checkImage);
                    }
                }, checkInterval);

                // Hide image nicely
                var displayTime = setTimeout(function () {
                    if ($('#slideshow-image')[0].src !== '') {
                        console.log('Display timeout, hidding picture.');
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

        // Hide mouse cursor during slideshow
        $('html').css('cursor', 'none');

        var limit = images.length;
        var imagesPath = 'https://picsum.photos/id/';

        console.log('Total pictures:', limit);
        console.log('Base URL:', imagesPath);

        // Stop demo after defined time
        var demoStop = setTimeout(function () {
            demoStopped = true;

            if (slideshow) {
                console.log('Slideshow finished.');
                clearInterval(slideshow);
            }

            console.log('End of demo.');

            // Show mouse cursor when slideshow is finished
            $('html').css('cursor', 'default');

            // Update main container content
            $('.ui.basic.inverted.segment').addClass('very padded center aligned');
            $('.ui.basic.inverted.segment').html('<h1>End of demo</h1><br><button class="ui inverted primary button" onclick="window.location.reload();">Restart</button>');

            var delayedModalHide = setTimeout(function () {
                $('.modal').modal('hide');

                if ($('.modal').modal('is active') === false) {
                    console.log('Modal closed.');
                }

                clearTimeout(delayedModalHide);
            }, modalHideTimeout);

            clearTimeout(demoStop);
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
                            $('#picture-metas').html('<p><strong>Author</strong>&nbsp;&ndash;&nbsp;<span>' + randomPicture.author + '</span></p><p></p>');
                            $('.image .bottom.dimmer').dimmer('show');
                        }

                        clearTimeout(delayedAnimation);
                    }, animationLoadingTime);

                    clearInterval(checkImage);
                }
            }, checkInterval);

            // Hide image nicely
            var displayTime = setTimeout(function () {
                if ($('#slideshow-image')[0].src !== '') {
                    console.log('Display timeout, hidding picture.');
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
