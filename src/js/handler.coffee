Error = require './error'



class Handler

	constructor: (@dragify) ->

		@load()
		@setup()
		@listeners()


	load: ->

		# Start the error handler
		@error = (new Error dragify: @dragify).error


	setup: ->

		# Containers must be an array
		return @error 1 if @dragify.containers.constructor isnt Array

		# Setup events
		@dragify.events = {}

		# Store data of the to-be-draged object
		@data =
			start     : {}
			offset    : {}
			treshhold : {}

		# Create mirror container
		@create()


	listeners: ->

		# Dragifyify all objects
		@listen container for container in @dragify.containers

		# Listen for a mouseup in the window
		window.addEventListener 'mouseup', @mouseup


	mouseup: (e) =>

		# Only listen for left mouse
		return if e.button isnt 0

		# Stop listening for the mousemove since we stopped dragging
		window.removeEventListener 'mousemove', @mousemove

		# Reset the mirror back to it's basics
		@reset() if @active


	listen: (container) ->

		# Listen to all child nodes of the provided container
		for node in container.childNodes

			# Listen for a mousedown event on the child node
			node.addEventListener 'mousedown', (ev) => @mousedown ev, node


	mousedown: (ev, @node) =>

		# Only continue if left mouseclick
		return if ev.button isnt 0

		# Store mousedown position
		@data.start.x = ev.x
		@data.start.y = ev.y

		# Determin the mousedown position within the node
		@data.offset =
			x : ev.offsetX
			y : ev.offsetY

		# Start listening for the mousemove event
		window.addEventListener 'mousemove', @mousemove


	mousemove: (@e) =>

		if not @active

			# Check if the tresh hold has been passed
			@active = true if Math.abs(@e.x-@data.start.x) > @dragify.settings.threshold.x
			@active = true if Math.abs(@e.y-@data.start.y) > @dragify.settings.threshold.y

			return if not @active

			# Place the mirror in the DOM
			@set()

		# Set mirror's position
		@position() if @active


	position: ->

		# Update Mirror position
		@mirror.style.transform = "translate(#{@e.x-@data.offset.x}px,#{@e.y-@data.offset.y}px)"

		# Get node behind the cursor
		target = document.elementFromPoint @e.x, @e.y

		# Stop if node is the same as previous
		return if target is @target

		# Store the different node
		@target = target

		console.log '@target', @target

		# Check if target is part of the selected
		# @validate()


	create: ->

		# Create the div containing a mirror of the node to be dragged and dropped
		@mirror = document.createElement 'div'

		# Set className
		@mirror.className = 'dragify--mirror'


	set: ->

		# Create a copy of the node to-be-dragged
		@mirror.appendChild @node.cloneNode true

		# Add the mirror to the DOM
		document.body.appendChild @mirror

		# Split classes by space
		classes = document.body.className.split ''

		# Add class to the list
		classes.push 'dragify--body'

		# Turn the list back to a class names string
		document.body.className = classes.join ' '


	reset: ->

		# Reset active state
		@active = false

		# Empty the mirror
		@mirror.removeChild @mirror.firstChild while @mirror.firstChild

		# Remove the mirrpr from the DOM
		document.body.removeChild @mirror

		# Remove all extra styling (positioning) so it's reset to default
		@mirror.removeAttribute 'style'

		# Retrieve classes used on the body
		classes = document.body.className.split ' '

		# Remove the dragify--body class from the list
		classes.splice classes.indexOf('dragify--body'), 1

		# Check if the class should be reset or removed
		if classes.length is 0

			document.body.removeAttribute 'class'

		else

			# Restore the old className
			document.body.className = classes.join ' '



module.exports = Handler