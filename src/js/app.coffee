Events = require 'mini-event-emitter'

Handler = require './handler'



class Dragify extends Events

	constructor: (@containers, options) ->

		# Run Events constructor to setup the mini event emitter as this classes prototype
		super

		@options =

			# Determins how much you can move after mousedown before the actual drag will start
			threshold:
				x: options?.threshold?.x || 3
				y: options?.threshold?.y || 3

		# Create handler doing all private work
		new Handler this



module.exports = Dragify
