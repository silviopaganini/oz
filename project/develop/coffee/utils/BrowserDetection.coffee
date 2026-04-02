class BrowserDetection

    browser         : null
    browserVersion  : null
    gl              : null
    webGL           : false
    webGLContext    : false
    webGLAdvanced   : false
    forcePass       : false

    constructor: ->
        @browser = BrowserDetect.browser
        @browserVersion = BrowserDetect.version
        try
            @webGLContext = @testWebGLContext()
            @webGLAdvanced = @testWebGLAdvancedFeats()
        catch error
            
        @webGL = Modernizr.webgl && @webGLContext

    init: ->
        @compare()

    compare: =>
        # All modern browsers support WebGL — skip the 2013 Chrome-only gate.
        if @forcePass or ( @webGL and @webGLAdvanced )
            @onSuccess()
        else if !window.WebGLRenderingContext
            @onError
                message : 'NoWebGLRenderingContext_message'
                buttons : ['NoWebGLRenderingContext_button1', 'NoWebGLRenderingContext_button2']
        else if !@webGLContext
            @onError
                message : 'NoWebGL_message'
                buttons : ['NoWebGL_button1', 'NoWebGL_button2']
        else
            # WebGL present but advanced features missing — let them in anyway.
            @onSuccess()

    onSuccess: =>
        @onError
            message : 'Chrome_NoWebGL_message'
            buttons : ['Chrome_NoWebGL_button1', 'Chrome_NoWebGL_button2']

    onError: ( error ) =>

    testWebGLContext:()=>
        result = false

        try 
            _canvas = document.createElement( 'canvas' )
            if ( ! ( @gl = _canvas.getContext( 'experimental-webgl', { alpha: 1, premultipliedAlpha: true, antialias: false, stencil: true, preserveDrawingBuffer: false } ) ) )
                #failed webgl initialization
                result = false
            else
                result = true
        catch error
            # error doing stuff
            result =  false

        return result


    testWebGLAdvancedFeats:()->
        if !@gl?
            return false

        # test dxt texture support
        _glExtensionCompressedTextureS3TC = (
            @gl.getExtension( 'WEBGL_compressed_texture_s3tc' ) || 
            @gl.getExtension( 'MOZ_WEBGL_compressed_texture_s3tc' ) ||
            @gl.getExtension( 'WEBKIT_WEBGL_compressed_texture_s3tc' ) )


        formats = @gl.getParameter(@gl.COMPRESSED_TEXTURE_FORMATS)

        dxt5Supported       = false;
        dxt3Supported       = false;
        dxt1Supported       = false;
        dxt1rgbaSupported   = false;

        if formats?
            for format in formats
                switch format
                    when _glExtensionCompressedTextureS3TC.COMPRESSED_RGBA_S3TC_DXT5_EXT  then dxt5Supported     = true
                    when _glExtensionCompressedTextureS3TC.COMPRESSED_RGB_S3TC_DXT1_EXT   then dxt1Supported     = true
                    when _glExtensionCompressedTextureS3TC.COMPRESSED_RGBA_S3TC_DXT1_EXT  then dxt1rgbaSupported = true
                    when _glExtensionCompressedTextureS3TC.COMPRESSED_RGBA_S3TC_DXT3_EXT  then dxt3Supported     = true
        
        # test anisotropic texture support
        _glExtensionTextureFilterAnisotropic = (
            @gl.getExtension( 'EXT_texture_filter_anisotropic' ) || 
            @gl.getExtension( 'MOZ_EXT_texture_filter_anisotropic' ) || 
            @gl.getExtension( 'WEBKIT_EXT_texture_filter_anisotropic' ) )


        # @gl.activeTexture( @gl.TEXTURE0 + 0 )
        # err = @gl.getError()
        # if err != 0
        #     return false
        
        # @gl.bindTexture( @gl.TEXTURE_2D, @gl.createTexture() )
        # err = @gl.getError()
        # if err != 0
        #     return false

        # @gl.compressedTexImage2D( @gl.TEXTURE_2D, 0, _glExtensionCompressedTextureS3TC.COMPRESSED_RGBA_S3TC_DXT5_EXT, 16, 16, 0,  new Uint8Array(16*16) )
        # err = @gl.getError()
        # if err != 0
        #     return false

        return _glExtensionCompressedTextureS3TC && _glExtensionTextureFilterAnisotropic && dxt5Supported && dxt3Supported && dxt1Supported && dxt1rgbaSupported