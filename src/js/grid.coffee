Error = require "./error"



class Grid

	constructor: (@dragify) ->

		return if @dragify.options.grid?

		@load()
		@setup()
		@listeners()


	load: ->

		# Start the error handler
		@error = (new Error dragify: @dragify).error


	setup: ->



	listeners: ->

		# Listen for a mouseup in the window which stops the drag
		# window.addEventListener "mouseup", @mouseup

		# Listen for a mousedown in the window which start checking if the target is a valid dragify target
		window.addEventListener "mousedown", @mousedown


	mousedown: (ev) =>

		# Only continue if left mouseclick
		return if ev.button isnt 0

		# Check if this target is a valid node or has a valid node in its ancestry
		return if not @node = @validMousedown ev.target

		console.log "@node", @node

		# Start listening for the mousemove event
		window.addEventListener "mousemove", @mousemove


	validMousedown: (target) ->

		check = (el) =>

			try
				@validContainer el
			catch e
				false

		validate = (node) ->

			# Check if the parent of this node is a valid dragify container
			return node if check node.parentNode

			# Try to validate the parent of this node since the current node was not valid
			return validate node.parentNode if node.parentNode

			# No valid parent is found
			false

		# Check if the parent node is valid
		validate target


	validContainer: (el) ->

		# Null or document are not valid containers to drop into
		return false if not el or el is document

		@dragify.containers.indexOf(el) isnt -1 or @dragify.options.isContainer el






module.exports = Grid
