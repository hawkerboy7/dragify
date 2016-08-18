Events = require 'mini-event-emitter'

Handler = require './handler'



class Dragify extends Events

	constructor: (@containers, options) ->

		# Run Events constructor to setup the mini event emitter as this classes prototype
		super

		@options =

			# Determins how much you can move in each direction after mousedown before the actual drag will start
			# By default a user can move -3px <=> 3px in X and -3px <=> 3px in Y before the drag starts.
			threshold:
				x: 3
				y: 3

			# Will transition the opacity of an element that's being draged or dropped. Due to the time it takes
			# for the transition the dragify--transition class will still be on the element while dropping. If this
			# is unwanted you can remove it by settings this value to false
			transition: true

		# Assign transition option
		@options.transition = options.transition if options?.transition?

		# Assign threshold options
		@options.threshold.x = x if (x = options?.threshold?.x)?
		@options.threshold.y = y if (y = options?.threshold?.y)?

		# Create handler doing all private work
		new Handler this



module.exports = Dragify
