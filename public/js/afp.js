(function (d, w) {
    window.addEventListener('click', function(ev){
        var href = '';

        let d = ev.target.parentElement;

        if (ev.target && ev.target.getAttribute('href') ) {
            href = ev.target.getAttribute('href');
        }
        if (ev.target.parentElement && ev.target.parentElement.getAttribute('href') ) {
            href = ev.target.parentElement.getAttribute('href');
        }
        if(href === '' && d && d.parentElement && d.parentElement.getAttribute('href')){
            href = d.parentElement.getAttribute('href');
        }

        if (href.indexOf('//saleframe.') + 1) {
            ev.preventDefault();
            ev.stopPropagation ? ev.stopPropagation() : (ev.cancelBubble=true);

            if ( /Android|AppleWebKit|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && screen.width <= 960 && location.host != 'saleframe.24ats.com') {
                redirectToMobile(href);
            } else {
                openAtsWidget(href);
            }
        }
    });

    window.addEventListener('message', function(msg) {
        if (msg.data && msg.data.action) {
            if (msg.data.action == 'closeFrame') {
                closeWidget()
            }
        }
        if (msg.data.url && (msg.data.url.match('://checkout.bepaid.by') || msg.data.url.match('://gateway.bepaid.by'))) {
            setTimeout(function() {
                try {
                    document.querySelector('iframe.frame-center').src = msg.data.url;
                } catch (err) {
                    document.location = msg.data.url;
                }
            }, 500);
        };
        return false;
    });

    function closeWidget () {
        var overlay = document.querySelector('.arcom__overlay'),
            container = document.querySelector('.arcom__widget-container');

        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        overlay.style.display = 'none';

        // let trigger = false;
        // $(window).on('beforeunload', function(event){
        //     event.preventDefault();
        //     trigger = true;
        //     event.returnValue = '';
        // });

        // for (let i = 0; i < 10; i++)  {
        //     if (trigger == false) {
        //         i++;
        //         // window.history.back();
        //         console.log('step', i);
        //     } else {
        //         console.log('break', i)
        //         break;
        //     }
        // }
    }

    function redirectToMobile (url) {
        var overlay = document.querySelector('.arcom__overlay'),
            container = document.querySelector('.arcom__widget-container'),
            frame = document.createElement('iframe');

        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        overlay.style.display = 'flex';

        frame.setAttribute("src", url);
        frame.style.width = "100%";
        frame.style.height = "100%";
        frame.style.border = "none";
        frame.style.position = "absolute";
        frame.style.top = "0";
        frame.style.bottom = "0";
        frame.style.right = "0";
        frame.style.left = "0";
        frame.style.zIndex = "1000000000";

        container.appendChild(frame);
    }

    function findGetParameter (str, parameterName) {
        var result = null,
            tmp = [];
        str.split('?')[1].split('&').forEach(function(item) {
            tmp = item.split('=')
            if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1])
        })

        return result
    }

    function openAtsWidget (url) {

        var overlay = document.querySelector('.arcom__overlay'),
            container = document.querySelector('.arcom__widget-container'),
            frame = document.createElement('iframe');

        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        overlay.style.display = 'flex';

        frame.setAttribute("src", url);
        frame.style.width = "1030px";
        //frame.style.height = "720px";
        frame.style.height = "720px";
        frame.style.border = "none";
        frame.style.backgroundColor = "darkgray";

        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            // код для мобильных устройств
            frame.style.height = "100%";
        } else {
            // код для обычных устройств
            frame.style.height = "720px";
        }


        container.appendChild(frame);
    }

    function addOverlay () {
        console.log('LOAD OVERLEY');

        var css = '@keyframes fadeIn {'+
                '0% { opacity: 0 }' +
                '100% { opacity: 1 }}',
            head = document.head || document.getElementsByTagName('head')[0],
            style = document.createElement('style'),
            overlay = document.createElement('div'),
            body = document.querySelector('body'),
            container = document.createElement('div');
        style.type = 'text/css';

        container.className = 'arcom__widget-container'; 

        // container.style = 'max-width: 1060px!important;' +
        //     'margin: 0 auto!important;' +
        //     'position: relative;' +
        //     'top: 5vh;' +
        //     'max-height: 90vh;' +
        //     'width: 100%;' +
        //     'background-color: linear-gradient(to bottom,rgba(0,0,0,.6) 0,rgba(0,0,0,.6) 100%);' +
        //     'padding: 0;';

        overlay.className = 'arcom__overlay';
        overlay.style = 'margin: auto!important;' +
            'background-color: rgba(0,0,0,.85)!important;' +
            'display: none;' +
            'position: fixed;' +
            'top: 0;' +
            'right: 0;' +
            'bottom: 0;' +
            'left: 0;' +
            'padding: 0;' +
            'overflow: auto;' +
            'background-color: rgba(0,0,0,.85);' +
            'animation-duration: .35s;' +
            'animation-fill-mode: both;' +
            'z-index: 1000000000;' +
            'animation-name: fadeIn;' +
            'justify-content: center;' +
            'align-items: center;';

        overlay.addEventListener('click', function (ev) {
            if (ev.target === overlay) {
                closeWidget();
            }
        });


        if (style.styleSheet) {
            // This is required for IE8 and below.
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }

        head.appendChild(style);
        overlay.appendChild(container);
        body.appendChild(overlay);
    }

    addOverlay();
})(document, window);
