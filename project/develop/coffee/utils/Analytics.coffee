class Analytics

    @tags : null
    @started : false

    @GA_ACCOUNT : '37524215-3'

    @start : =>
        window._gaq = window._gaq or []
        window._gaq.push ['_setAccount',"UA-#{@GA_ACCOUNT}"]
        window._gaq.push ['_trackPageview']

        @tags = JSON.parse window.oz.baseAssets.get('trackingTags').result
        @started = true
        null

    @track : (param) =>

        if !@started
            @start()

        if param
            tag = []
            tag.push '_trackEvent'
            v = @tags[param]
            if v?
                for i in [0...v.length]
                    tag.push v[i]
                window._gaq.push tag

        null
