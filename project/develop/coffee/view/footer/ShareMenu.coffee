class ShareMenu extends Abstract

    className : 'share_menu'
    soundEnabled: true

    sound_label : "SOUND"
    sound_label_on: "ON"
    sound_label_off: "OFF"

    render : =>

        if @oz().locale.get("sound_button_label") && @oz().locale.get("sound_button_label") != ""
            @sound_label = @oz().locale.get("sound_button_label")

        if @oz().locale.get("sound_button_on") && @oz().locale.get("sound_button_on") != ""
            @sound_label_on = @oz().locale.get("sound_button_on")

        if @oz().locale.get("sound_button_off") && @oz().locale.get("sound_button_off") != ""
            @sound_label_off = @oz().locale.get("sound_button_off")

        # SOUND
        @sound = $("<div class='sound'>#{@sound_label} <span>#{@sound_label_on}</span></div>")
        @sound.bind "mousedown", @toogleSound
        @disableSound()
        @$el.append @sound

    hideSoundButton : =>
        @sound?.css {display : 'none'}

    showSoundButton : =>
        @sound?.css {display : ''}

    enableSound: =>
        @sound?.css { opacity: 1, visibility: "visible" }

    disableSound: =>
        @sound?.css { opacity: 0, visibility: "hidden" }

    toogleSound: =>

        Analytics.track 'menu_click_toggle_sound'

        @soundEnabled = !@soundEnabled
        
        if @soundEnabled

            SoundController.send "sound_on"
            SoundController.resume true
            
            @sound.find("span").html @sound_label_on

        else

            @sound.find("span").html @sound_label_off

            SoundController.paused true
