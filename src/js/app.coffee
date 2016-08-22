# Require | Browserify, Node
MiniEventEmitter = require 'mini-event-emitter'

Handler = require './handler'



# Check if MiniEventEmitter is defined
if not MiniEventEmitter?

	# Make sure the MiniEventEmitter is defined
	msg = 'Dragify depends on the MiniEventEmitter.\nhttps://github.com/hawkerboy7/mini-event-emitter\nDefine it before Dragify'

	# Log the message to the console (as a warning if available)
	if console.warn then console.warn msg else console.log msg



class Dragify extends MiniEventEmitter

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



# --------------------------------------------------
# Expose
# --------------------------------------------------

# Require | Browserify, Node
module.exports = Dragify

# Distribution | Browser
# window.Dragify = Dragify
