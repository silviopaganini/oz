class WebCam

    stream   : null
    videoDom : null
    canvas   : null
    ctx      : null

    constructor : ->
        _.extend @, Backbone.Events
        null

    init : =>

        @canvas = document.createElement 'canvas'
        @canvas.width = 512
        @canvas.height = @canvas.width / 1.333333333

        @ctx = @canvas.getContext '2d'
        @ctx.scale -1, 1

        @videoDom = $('<video style="display:none;" autoplay="true"/>')
        $('body').prepend @videoDom

        if !navigator.getUserMedia
            @onUserMediaError()
            return

        if !@stream?
            navigator.getUserMedia { video : true, audio : false }, @onUserMediaSuccess, @onUserMediaError
        else
            @onUserMediaSuccess()

        null

       
    onUserMediaSuccess : (s = null) =>
        @stream = s || @stream
        @trigger 'CAM_READY'
        null

    onUserMediaError :=>
        @trigger 'CAM_FAIL'
        @dispose()
        null

    get : =>

        if !@stream?
            @init()
            return

        video = @dom()
        return unless video?

        # Modern browsers require MediaStream on srcObject.
        if "srcObject" of video
            video.srcObject = @stream
            return @stream

        # Legacy fallback.
        src = null
        if window.URL?.createObjectURL?
            try
                src = window.URL.createObjectURL(@stream)
            catch error
                src = null

        if src?
            video.src = src

        src

    dom : =>
        #return
        @videoDom.get()[0]

    flipImage : =>
        return if !@canvas
        @ctx.drawImage @dom(), -@canvas.width, 0
        # return 
        #@ctx.getImageData 0, 0, @canvas.width, @canvas.height
        return @canvas

    dispose : =>
        if @stream
            if @stream.getTracks?
                @stream.getTracks().forEach (track) -> track.stop()
            else if @stream.stop?
                @stream.stop()
        @stream = null
        @canvas = null
        null
