Events = require 'mini-event-emitter'

Handler = require './handler'



class Dragify extends Events

	constructor: (@containers, settings) ->

		# Run Events constructor to setup the mini event emitter as this classes prototype
		super

		@settings =

			# Determins how much you can move after mousedown before the actual drag will start
			threshold:
				x: settings?.threshold?.x || 2
				y: settings?.threshold?.y || 2

		# Create handler doing all private work
		new Handler this



module.exports = Dragify
