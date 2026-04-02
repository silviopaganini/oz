class Locale

    lang : null
    data : null

    constructor : ->

        _.extend @, Backbone.Events

        @loadBackup()

        null
            

    onSuccess : (event) =>
        d = null

        if event.responseText
            d = JSON.parse event.responseText
        else 
            d = event

        @data = new LocaleModel d
        @trigger 'complete'
        null


    loadBackup : =>
        $.ajax 
            url      : '/locale/en/strings.txt'
            dataType : 'text'
            complete : @onSuccess
            error    : => console.log 'error on loading backup'

        null


    get : (id) =>
        return @data.get('strings')[id] || ""