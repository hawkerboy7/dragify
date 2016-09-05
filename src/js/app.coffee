# --------------------------------------------------
# Expose
# --------------------------------------------------

# Require | Browserify, Node
MiniEventEmitter = require "mini-event-emitter"

# Always
Handler = require "./handler"



# Log the message to the console (as a warning if available)
log = (msg) -> if console.warn then console.warn msg else console.log msg

# Check if MiniEventEmitter is defined
if not MiniEventEmitter?

	# Make sure the MiniEventEmitter is defined
	log "Dragify ~ Dragify depends on the MiniEventEmitter.\nhttps://github.com/hawkerboy7/mini-event-emitter\nDefine it before Dragify"



class Dragify extends MiniEventEmitter

	constructor: (@containers, options) ->

		# Run Events constructor to setup the mini event emitter as this classes prototype
		super

		# Check if options are provided
		if not options

			# Check if only options are provided
			if !!@containers and @containers.constructor is Object

				# Correctly store the options
				options = @containers

				# Define the containers to be empty
				@containers = []

			else if @containers.constructor is Array

				# Not options are provided
				options = {}

			else

				# Some not allowed value is provided reset all fields
				@containers = []

				# Set as empty
				options = {}

		# Make sure containers are provided or can be found dynamically
		return log "Dragify ~ You provided neither the `options.containers` nor the 'isContainer` function. At least one is required." if @containers.length is 0 and not options.isContainer?

		# --------------------------------------------------
		# Default options
		# --------------------------------------------------

		# Define options used within dragula
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

			# Define logic which whould allow an element to be a valid parent container
			isContainer: (el) -> false


		# --------------------------------------------------
		# Overwrite options if user provided different options
		# --------------------------------------------------

		# Assign transition option
		@options.transition = options.transition if options.transition?

		# Assign threshold options
		@options.threshold.x = x if (x = options.threshold?.x)?
		@options.threshold.y = y if (y = options.threshold?.y)?

		# Assign the isContainer function
		@options.isContainer = options.isContainer if options.isContainer?

		# Create handler doing all private work
		new Handler this



# --------------------------------------------------
# Expose
# --------------------------------------------------

# Require | Browserify, Node
module.exports = Dragify

# Distribution | Browser
# window.Dragify = Dragify
