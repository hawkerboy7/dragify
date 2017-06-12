# NPM
MiniEventEmitter = require "mini-event-emitter"

# Modules
Handler = require "./handler"



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

			else if !!@containers and @containers.constructor is Array

				# Not options are provided
				options = {}

			else

				# Some not allowed value is provided reset all fields
				@containers = []

				# Set as empty
				options = {}

		else

			# Make sure @containers is an array in case a wrong value is provided
			@containers = [] if not @containers or @containers.constructor isnt Array

			# Merge the containers if containers are provided trough the options as well
			@containers = @containers.concat options.containers if options.containers

		# Make sure containers are provided or can be found dynamically
		if @containers.length is 0 and not options.isContainer?

			msg = "Dragify ~ You provided neither the `containers` array nor the 'isContainer` function. At least one is required."

			if console.warn then console.warn msg else console.log msg

			return



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
