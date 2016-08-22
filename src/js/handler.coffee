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

		# Set the  data storage var
		@setData()

		# Create mirror container
		@create()


	setData: ->

		# Store and reset data of the to-be-draged object
		@data =
			index     : null
			start     : {}
			offset    : {}
			source    : null
			parent    : null
			treshhold : {}

		# Store previously found target and valid targets
		@previous = {}


	listeners: ->

		# Dragifyify all objects =D
		@listen container for container in @dragify.containers

		# Listen for a mouseup in the window which stops the drag
		window.addEventListener 'mouseup', @mouseup


	mouseup: (e) =>

		# Only listen for left mouseup
		return if e.button isnt 0

		# Stop listening for the mousemove since we stopped dragging
		window.removeEventListener 'mousemove', @mousemove

		# Reset the mirror back to it's basics
		@reset() if @active


	listen: (container) ->

		# Function is used to keep a correct reference to the node
		set = (node) =>

			# Listen for a mousedown event on the child node
			node.addEventListener 'mousedown', (ev) => @mousedown ev, node

		# Listen to all child nodes of the provided container
		set node for node in container.childNodes


	mousedown: (ev, node) =>

		# Only continue if left mouseclick
		return if ev.button isnt 0

		# Store the node that has been 'mousedowned' upon
		@node = node

		# Store the source where the node came from
		@data.source = node.parentNode

		# Store the current index of the node
		@data.index = @getIndex node

		# Store mousedown position
		@data.start.x = ev.x || ev.clientX
		@data.start.y = ev.y || ev.clientY

		# Store offset of the click
		x = ev.offsetX
		y = ev.offsetY

		# Path available in chrome
		if ev.path

			# Loop over the path to check if the dragified element was pressed or one of it's children('s children etc.)
			for el in ev.path

				# Stop checkking
				if el is node
					found = true
					break

				# Add to the offset so the position relative to the dragified element gets calculated
				x += el.offsetLeft
				y += el.offsetTop
		else

			check = (target) ->

				return found = true if target is node

				# Add to the offset so the position relative to the dragified element gets calculated
				x += target.offsetLeft
				y += target.offsetTop

				# Only check parent again if the parent exists
				check target.parentNode if target.parentNode

			# Start the loop that cho
			check ev.target

		# The node must always be found otherwise something is wrong with the path or the assumtion the node will always be avaiable in the path
		return @error 2 if not found

		# Determin the mousedown position within the node
		@data.offset =
			x : x
			y : y

		# Start listening for the mousemove event
		window.addEventListener 'mousemove', @mousemove


	mousemove: (@e) =>

		# Prevent any default actions while dragging (text-selection, cursor change)
		@e.preventDefault()

		# Fix for events that don't have a 'x' or 'y'
		@e.x or= @e.clientX
		@e.y or= @e.clientY

		if not @active

			# Check if the tresh hold has been passed
			@active = true if Math.abs(@e.x-@data.start.x) > @dragify.options.threshold.x
			@active = true if Math.abs(@e.y-@data.start.y) > @dragify.options.threshold.y

			return if not @active

			# Place the mirror in the DOM
			@set()

		# Set mirror's position
		@position() if @active


	position: ->

		# Update mirror position using transform
		@mirror.style.transform = "translate(#{@e.x-@data.offset.x}px,#{@e.y-@data.offset.y}px)"

		# Get node behind the cursor
		target = document.elementFromPoint @e.x, @e.y

		# Stop if the target is the same as the previous target (outside viewport target is null)
		return if target and target is @previous.target

		# Store the new node
		@previous.target = target

		# Check if new target is valid and make sure it returns the to-be-dragged target and not one of it's children
		return if not target = @valid target

		# Stop if the valid target is the same as the previous valid target
		return if target is @previous.valid

		# Act as if the original node does not exist
		return if @node is target

		# Store the new node
		@previous.valid = target

		# Switch because a new valid target has been found
		@switch target


	valid: (target) ->

		# Target must be defined (no dragging outside the viewport)
		return if not target

		# By default assume is not valid
		valid = false

		# Check if this target is a valid dragify parent
		valid = target if -1 isnt @dragify.containers.indexOf target

		# Find-correct-parent loop function
		find = (el) =>

			# Check if this target's parent node is a valid dragify parent
			if -1 is @dragify.containers.indexOf el.parentNode

				# Check if this element's parent is valid if the parent exists
				find el.parentNode if el.parentNode

			else

				# Store the valid element
				valid = el

		# Start the find loop
		find target

		# Return a valid element or false
		valid


	switch: (@target) ->

		# Target is a parent
		if -1 isnt @dragify.containers.indexOf @target

			# Transfer to a new parent if the node's parent is different from the target
			@transfer() if @node.parentNode isnt @target

			# Don't do anything if the node's parent is targeted
			return

		# Check if the target or node has a higher index but first also check if the node is already within this parent
		if @target.parentNode isnt @node.parentNode or (@getIndex @node) > (@getIndex @target)

			# Insert befire the target
			@insert @target.parentNode, @node, @target
		else

			# Insert after the target
			@insert @target.parentNode, @node, @target.nextSibling


	insert: (parent, node, target) ->

		# Insert after the target
		parent.insertBefore node, target

		# Determin if placed in a parent or replaced another element
		replaced = if @target isnt parent then @target else undefined

		# The original element is being moved
		@dragify.emit 'move', @node, @node.parentNode, @data.source, replaced


	getIndex: (node) ->

		(return index if child is node) for child, index in node.parentNode.childNodes

		null


	transfer: ->

		# Store lowest y distance to child from mouse pointer
		lowest = null

		# Loop over all children
		for child, index in @target.childNodes

			# Get the lowest distance between child y-line segments and mouse cursor
			[val, lower] = @distance
				top    : child.offsetTop
				bottom : child.offsetTop + child.clientHeight

			# Set lowest if not defined or if the calculated distance is lower than the existing one
			if not lowest or val < lowest
				lowest = val
				target = child
				below = lower

		# Add to bottom of parent if the distance between the mouse and the closest child is bigger than the offset
		target = null if @target.childNodes[@target.childNodes.length-1] is target and below

		# Insert after the target
		@insert @target, @node, target


	distance: (pos) ->

		# Pointer is not below this element
		below = false

		# The offset position of the mouse in the parent element
		y = @e.offsetY

		# Set distance value
		val = Math.abs(y-pos.top)

		# Check if bottom value is lower
		val = bottom if val > bottom = Math.abs(y-pos.bottom)

		# Return value and if the cursor was lower than the div
		[val, y>pos.bottom]


	create: ->

		# Create the div containing a mirror of the node to be dragged and dropped
		@mirror = document.createElement 'div'

		# Set tabindex of element so it can be focused
		@mirror.tabIndex = 0

		# Set className
		@mirror.className = 'dragify--mirror'


	set: ->

		# Act as if the node's parent was the previous valid target to prevent the switch from triggering on this parent on drag start
		@previous.valid = @node.parentNode

		# Start the dragging
		@dragify.emit 'drag', @node, @node.parentNode

		# Create a copy of the node to-be-dragged
		@mirror.appendChild clone = @node.cloneNode true

		# Explicitly set the clone's width because of a possible width 100%
		clone.style.width = "#{@node.offsetWidth}px"

		# Explicitly set the clone's height because of a possible height 100%
		clone.style.height = "#{@node.offsetHeight}px"

		# Add the mirror to the DOM
		document.body.appendChild @mirror

		# Focus the mirror so the @node is unfocused and doesn't trigger event's anymore like hover
		@mirror.focus()

		# Prevent the document from selecting while dragging
		@addClass document.body, 'dragify--body'

		# Allow for a transition in opacity
		@addClass @node, 'dragify--transition' if @dragify.options.transition

		# Make the original node opague
		@addClass @node, 'dragify--opaque'


	reset: ->

		# Reset active state
		@active = false

		# Empty the mirror by removing all it's children (which should usually only be one)
		@mirror.removeChild @mirror.firstChild while @mirror.firstChild

		# Remove the mirror from the DOM
		document.body.removeChild @mirror

		# Remove all extra styling (positioning) so it's reset to default
		@mirror.removeAttribute 'style'

		# Remove preventing selection while dragging
		@removeClass document.body, 'dragify--body'

		# Remove node transfer style
		@removeClass @node, 'dragify--opaque'

		# Maintain the 'old' reference to the node
		remove = (node) =>

			# Remove the transition class with a delay so the transition is fully finished
			setTimeout(=>
				@removeClass node, 'dragify--transition'
			,500)

		# Remove using the reference to the 'old' node in case someone starts dragging a new node within the setTimeout time limit of 500ms
		remove @node if @dragify.options.transition

		# Check if the node didn't actually change position
		if @data.source is @node.parentNode and @data.index is @getIndex @node

			# Node ended up at the place where it came from
			@dragify.emit 'cancel', @node, @node.parentNode

		else

			# End of the dragging to a new position
			@dragify.emit 'drop', @node, @node.parentNode, @data.source

		# Indicate end of a drag (which may have resulted in a drop or cancel)
		@dragify.emit 'end', @node

		# Empty node reference
		@node = null

		# Empty previous target
		@target = null

		# Reset the data storage var
		@setData()


	addClass: (node, className) ->

		# Empty className will create an empty array value in the split
		classes = []

		# Split classes by space
		classes = node.className.split ' ' if node.className

		# Add class to the list
		classes.push className

		# Turn the list back to a class names string
		node.className = classes.join ' '


	removeClass: (node, className) ->

		# Retrieve classes used on the body
		classes = node.className.split ' '

		# Remove the dragify--body class from the list
		classes.splice classes.indexOf(className), 1

		# Check if the class should be reset or removed
		if classes.length is 0

			# Remove the class attribute to prevent an empty class attribute
			node.removeAttribute 'class'

		else

			# Restore the old className
			node.className = classes.join ' '



module.exports = Handler
